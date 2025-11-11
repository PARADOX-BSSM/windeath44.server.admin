import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface InfrastructureItem {
  id: string;
  name: string;
  type: 'kubernetes' | 'database' | 'loadbalancer' | 'storage' | 'network' | 'service';
  status: 'Healthy' | 'Connected' | 'Active' | 'Warning' | 'Error' | 'Maintenance';
  details: string;
  metrics: {
    uptime?: number;
    responseTime?: number;
    throughput?: number;
    errorRate?: number;
    capacity?: {
      used: number;
      total: number;
      unit: string;
    };
  };
  lastChecked: Date;
  endpoint?: string;
  region?: string;
  version?: string;
  dependencies?: string[];
}

interface InfrastructureState {
  items: InfrastructureItem[];
  isLoading: boolean;
  selectedItem: string | null;
  healthOverview: {
    healthy: number;
    warning: number;
    error: number;
    total: number;
  };
  autoRefresh: boolean;
  refreshInterval: number;
}

interface InfrastructureActions {
  setItems: (items: InfrastructureItem[]) => void;
  updateItem: (id: string, updates: Partial<InfrastructureItem>) => void;
  setItemStatus: (id: string, status: InfrastructureItem['status']) => void;
  setSelectedItem: (itemId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  refreshItem: (itemId: string) => Promise<void>;
  refreshAllItems: () => Promise<void>;
  calculateHealthOverview: () => void;
  getItemsByType: (type: InfrastructureItem['type']) => InfrastructureItem[];
  getItemsByStatus: (status: InfrastructureItem['status']) => InfrastructureItem[];
  toggleMaintenance: (itemId: string) => void;
}

type InfrastructureStore = InfrastructureState & InfrastructureActions;

const initialItems: InfrastructureItem[] = [
  {
    id: 'k8s-cluster',
    name: 'Kubernetes Cluster',
    type: 'kubernetes',
    status: 'Healthy',
    details: '3 nodes, 24 pods running',
    metrics: {
      uptime: 99.8,
      responseTime: 45,
      capacity: {
        used: 65,
        total: 100,
        unit: '%',
      },
    },
    lastChecked: new Date(),
    endpoint: 'https://k8s.windeath44.local',
    region: 'us-west-1',
    version: 'v1.28.3',
    dependencies: ['etcd', 'kube-apiserver'],
  },
  {
    id: 'postgres-db',
    name: 'PostgreSQL Database',
    type: 'database',
    status: 'Connected',
    details: 'PostgreSQL 14.2, 5ms latency',
    metrics: {
      uptime: 99.9,
      responseTime: 5,
      throughput: 1250,
      capacity: {
        used: 45.2,
        total: 100,
        unit: 'GB',
      },
    },
    lastChecked: new Date(),
    endpoint: 'postgresql://postgres.windeath44.local:5432',
    region: 'us-west-1',
    version: '14.2',
    dependencies: [],
  },
  {
    id: 'nginx-lb',
    name: 'Nginx Load Balancer',
    type: 'loadbalancer',
    status: 'Active',
    details: 'Nginx, 1.2k req/min',
    metrics: {
      uptime: 99.7,
      responseTime: 12,
      throughput: 1200,
      errorRate: 0.1,
    },
    lastChecked: new Date(),
    endpoint: 'https://lb.windeath44.local',
    region: 'us-west-1',
    version: '1.21.6',
    dependencies: ['upstream-servers'],
  },
];

export const useInfrastructureStore = create<InfrastructureStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        items: initialItems,
        isLoading: false,
        
        // Initialize real data on store creation
        init: async () => {
          const { refreshAllItems } = get();
          await refreshAllItems();
        },
        selectedItem: null,
        healthOverview: {
          healthy: 3,
          warning: 0,
          error: 0,
          total: 3,
        },
        autoRefresh: true,
        refreshInterval: process.env.NODE_ENV === 'development' ? 300000 : 60000, // 5 minutes in dev, 1 minute in prod

        // Actions
        setItems: (items) => {
          set(() => ({ items }));
          get().calculateHealthOverview();
        },

        updateItem: (id, updates) => {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id 
                ? { ...item, ...updates, lastChecked: new Date() } 
                : item
            ),
          }));
          get().calculateHealthOverview();
        },

        setItemStatus: (id, status) => {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id 
                ? { ...item, status, lastChecked: new Date() } 
                : item
            ),
          }));
          get().calculateHealthOverview();
        },

        setSelectedItem: (itemId) =>
          set(() => ({ selectedItem: itemId })),

        setLoading: (loading) =>
          set(() => ({ isLoading: loading })),

        setAutoRefresh: (enabled) =>
          set(() => ({ autoRefresh: enabled })),

        setRefreshInterval: (interval) =>
          set(() => ({ refreshInterval: interval })),

        refreshItem: async (itemId) => {
          const { items, updateItem, setLoading } = get();
          const item = items.find((i) => i.id === itemId);
          
          if (!item) return;

          setLoading(true);

          try {
            let status: InfrastructureItem['status'] = 'Error';
            let realMetrics = { ...item.metrics };
            
            if (itemId === 'k8s-cluster') {
              // Get real Kubernetes cluster metrics
              try {
                const [k8sResponse, nodesResponse, versionResponse] = await Promise.all([
                  fetch('/admin/api/k8s/cluster'),
                  fetch('/admin/api/k8s/nodes'),
                  fetch('/admin/api/k8s/version')
                ]);
                
                let clusterInfo = { nodes: 0, pods: 0, namespaces: 0 };
                let nodesInfo = { ready: 0, total: 0, cpuUsage: 0 };
                let clusterVersion = 'Unknown';
                
                if (k8sResponse.ok) {
                  const k8sData = await k8sResponse.json();
                  clusterInfo = k8sData.data || clusterInfo;
                }
                
                if (nodesResponse.ok) {
                  const nodesData = await nodesResponse.json();
                  if (nodesData.success && nodesData.data) {
                    const nodes = nodesData.data;
                    nodesInfo.total = nodes.length;
                    nodesInfo.ready = nodes.filter((node: any) => node.status === 'Ready').length;
                    nodesInfo.cpuUsage = nodes.reduce((sum: number, node: any) => sum + (node.usage?.cpu || 0), 0) / nodes.length;
                  }
                }

                if (versionResponse.ok) {
                  const versionData = await versionResponse.json();
                  if (versionData.success && versionData.data) {
                    clusterVersion = versionData.data.gitVersion || 'Unknown';
                  }
                }
                
                status = clusterInfo.nodes > 0 && nodesInfo.ready > 0 ? 'Healthy' : 'Error';
                realMetrics = {
                  uptime: parseFloat(((nodesInfo.ready / Math.max(nodesInfo.total, 1)) * 100).toFixed(1)),
                  responseTime: 0,
                  capacity: {
                    used: Math.round(nodesInfo.cpuUsage),
                    total: 100,
                    unit: '%',
                  },
                };
                  
                updateItem(itemId, {
                  status,
                  metrics: realMetrics,
                  details: `${clusterInfo.nodes} nodes, ${clusterInfo.pods || 0} pods running`,
                  version: clusterVersion,
                });
              } catch (error) {
                console.error('Failed to get K8s metrics:', error);
                updateItem(itemId, { status: 'Error' });
              }
            } else if (itemId === 'postgres-db') {
              // Check database connectivity via K8s service
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'postgresql',
                    namespace: 'default'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Connected' : 'Error';
                  
                  if (status === 'Connected' && data.data.metrics) {
                    realMetrics = {
                      ...realMetrics,
                      uptime: data.data.metrics.uptime || 0,
                      responseTime: data.data.metrics.responseTime || 0,
                      throughput: data.data.metrics.throughput || 0,
                    };
                  }
                }
                
                updateItem(itemId, {
                  status,
                  metrics: realMetrics,
                });
              } catch (error) {
                console.error('Failed to check database:', error);
                updateItem(itemId, { status: 'Error' });
              }
            } else if (itemId === 'nginx-lb') {
              // Check load balancer health via service discovery
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'nginx',
                    namespace: 'ingress-nginx'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      ...realMetrics,
                      uptime: data.data.metrics.uptime || 0,
                      responseTime: data.data.metrics.responseTime || 0,
                      throughput: data.data.metrics.throughput || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
                
                updateItem(itemId, {
                  status,
                  metrics: realMetrics,
                });
              } catch (error) {
                console.error('Failed to check load balancer:', error);
                updateItem(itemId, { status: 'Error' });
              }
            }
          } catch (error) {
            console.error(`Failed to refresh ${itemId}:`, error);
            updateItem(itemId, { status: 'Error' });
          } finally {
            setLoading(false);
          }
        },

        refreshAllItems: async () => {
          const { items, refreshItem } = get();
          
          // Refresh all items concurrently
          const refreshPromises = items.map((item) => refreshItem(item.id));
          await Promise.allSettled(refreshPromises);
        },

        calculateHealthOverview: () => {
          const { items } = get();
          
          const healthy = items.filter((item) => 
            ['Healthy', 'Connected', 'Active'].includes(item.status)
          ).length;
          
          const warning = items.filter((item) => 
            ['Warning', 'Maintenance'].includes(item.status)
          ).length;
          
          const error = items.filter((item) => 
            ['Error'].includes(item.status)
          ).length;

          set(() => ({
            healthOverview: {
              healthy,
              warning,
              error,
              total: items.length,
            },
          }));
        },

        getItemsByType: (type) => {
          const { items } = get();
          return items.filter((item) => item.type === type);
        },

        getItemsByStatus: (status) => {
          const { items } = get();
          return items.filter((item) => item.status === status);
        },

        toggleMaintenance: (itemId) => {
          const { items, updateItem } = get();
          const item = items.find((i) => i.id === itemId);
          
          if (!item) return;
          
          const newStatus = item.status === 'Maintenance' ? 'Healthy' : 'Maintenance';
          updateItem(itemId, { status: newStatus });
        },
      }),
      {
        name: 'infrastructure-storage',
        partialize: (state) => ({
          items: state.items,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
        }),
      }
    ),
    {
      name: 'infrastructure-store',
    }
  )
);