import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getServiceUrls } from '../lib/k8sClient';

// Helper to get monitoring service from DI container
const getMonitoringService = () => {
  return (globalThis as any).__MONITORING_SERVICE__ || {
    getGrafanaHealth: () => ({ status: 'healthy' }),
    getPrometheusHealth: () => ({ status: 'healthy' }),
    getJaegerHealth: () => ({ status: 'healthy' }),
    getKialiHealth: () => ({ status: 'healthy' }),
    getDashboardUrls: () => ({
      grafana: { home: '' },
      prometheus: { home: '' },
      jaeger: { home: '' },
      kiali: { overview: '' },
      argocd: { home: '' }
    })
  };
};

export interface MonitoringTool {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Warning' | 'Error';
  bgColor: string;
  textColor: string;
  letter: string;
  url?: string;
  lastChecked: Date | null;
  metrics?: {
    responseTime?: number;
    uptime?: number;
    errorRate?: number;
  };
}

interface MonitoringState {
  tools: MonitoringTool[];
  isLoading: boolean;
  selectedTool: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // in milliseconds
}

interface MonitoringActions {
  setTools: (tools: MonitoringTool[]) => void;
  updateTool: (id: string, updates: Partial<MonitoringTool>) => void;
  setToolStatus: (id: string, status: MonitoringTool['status']) => void;
  setSelectedTool: (toolId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  refreshToolStatus: (toolId: string) => Promise<void>;
  refreshAllTools: () => Promise<void>;
  openTool: (toolId: string) => void;
}

type MonitoringStore = MonitoringState & MonitoringActions;

const getInitialTools = (): MonitoringTool[] => {
  const serviceUrls = getServiceUrls();
  
  return [
    {
      id: 'grafana',
      name: 'Grafana',
      description: 'Metrics & Dashboards',
      status: 'Active',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      letter: 'G',
      url: serviceUrls.grafana,
      lastChecked: new Date(),
      metrics: {
        responseTime: 0,
        uptime: 0,
        errorRate: 0,
      },
    },
    {
      id: 'kiali',
      name: 'Kiali',
      description: 'Service Mesh Observability',
      status: 'Active',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      letter: 'K',
      url: serviceUrls.kiali,
      lastChecked: new Date(),
      metrics: {
        responseTime: 0,
        uptime: 0,
        errorRate: 0,
      },
    },
    {
      id: 'jaeger',
      name: 'Jaeger',
      description: 'Distributed Tracing',
      status: 'Active',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      letter: 'J',
      url: serviceUrls.jaeger,
      lastChecked: new Date(),
      metrics: {
        responseTime: 0,
        uptime: 0,
        errorRate: 0,
      },
    },
    {
      id: 'argocd',
      name: 'ArgoCD',
      description: 'GitOps Deployment',
      status: 'Active',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      letter: 'A',
      url: serviceUrls.argocd,
      lastChecked: new Date(),
      metrics: {
        responseTime: 0,
        uptime: 0,
        errorRate: 0,
      },
    },
  ];
};

export const useMonitoringStore = create<MonitoringStore>()(
  devtools(
    (set, get) => ({
      // State
      tools: getInitialTools(),
      isLoading: false,
      
      // Initialize real data on store creation
      init: async () => {
        const { refreshAllTools } = get();
        await refreshAllTools();
      },
      
      // Update tools when service configuration changes
      updateToolsFromConfig: () => {
        set(() => ({ tools: getInitialTools() }));
      },
      selectedTool: null,
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds

      // Actions
      setTools: (tools) =>
        set(() => ({ tools })),

      updateTool: (id, updates) =>
        set((state) => ({
          tools: state.tools.map((tool) =>
            tool.id === id ? { ...tool, ...updates, lastChecked: new Date() } : tool
          ),
        })),

      setToolStatus: (id, status) =>
        set((state) => ({
          tools: state.tools.map((tool) =>
            tool.id === id ? { ...tool, status, lastChecked: new Date() } : tool
          ),
        })),

      setSelectedTool: (toolId) =>
        set(() => ({ selectedTool: toolId })),

      setLoading: (loading) =>
        set(() => ({ isLoading: loading })),

      setAutoRefresh: (enabled) =>
        set(() => ({ autoRefresh: enabled })),

      setRefreshInterval: (interval) =>
        set(() => ({ refreshInterval: interval })),

      refreshToolStatus: async (toolId) => {
        const { tools, updateTool, setLoading } = get();
        const tool = tools.find((t) => t.id === toolId);
        
        if (!tool) return;

        setLoading(true);

        try {
          let status: MonitoringTool['status'] = 'Error';
          let realMetrics: MonitoringTool['metrics'] = {
            responseTime: 0,
            uptime: 0,
            errorRate: 100,
          };

          // Use monitoring service from DI container to get real health and metrics data
          const monitoringService = getMonitoringService();
          
          switch (toolId) {
            case 'grafana': {
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'grafana',
                    namespace: 'monitoring'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      responseTime: data.data.metrics.responseTime || 0,
                      uptime: data.data.metrics.uptime || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
              } catch (error) {
                console.error('Failed to check Grafana health:', error);
                status = 'Error';
              }
              break;
            }
            case 'prometheus': {
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'prometheus-server',
                    namespace: 'monitoring'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      responseTime: data.data.metrics.responseTime || 0,
                      uptime: data.data.metrics.uptime || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
              } catch (error) {
                console.error('Failed to check Prometheus health:', error);
                status = 'Error';
              }
              break;
            }
            case 'jaeger': {
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'jaeger-query',
                    namespace: 'istio-system'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      responseTime: data.data.metrics.responseTime || 0,
                      uptime: data.data.metrics.uptime || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
              } catch (error) {
                console.error('Failed to check Jaeger health:', error);
                status = 'Error';
              }
              break;
            }
            case 'kiali': {
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'kiali',
                    namespace: 'istio-system'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      responseTime: data.data.metrics.responseTime || 0,
                      uptime: data.data.metrics.uptime || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
              } catch (error) {
                console.error('Failed to check Kiali health:', error);
                status = 'Error';
              }
              break;
            }
            case 'argocd': {
              try {
                const response = await fetch('/admin/api/k8s/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'healthCheck',
                    serviceName: 'argocd-server',
                    namespace: 'argocd'
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  status = data.success && data.data.healthy ? 'Active' : 'Error';
                  if (status === 'Active' && data.data.metrics) {
                    realMetrics = {
                      responseTime: data.data.metrics.responseTime || 0,
                      uptime: data.data.metrics.uptime || 0,
                      errorRate: data.data.metrics.errorRate || 0,
                    };
                  }
                }
              } catch (error) {
                console.error('Failed to check ArgoCD health:', error);
                status = 'Error';
              }
              break;
            }
          }

          updateTool(toolId, {
            status,
            metrics: realMetrics,
          });
        } catch (error) {
          console.error(`Failed to refresh ${toolId}:`, error);
          updateTool(toolId, { status: 'Error' });
        } finally {
          setLoading(false);
        }
      },

      refreshAllTools: async () => {
        const { refreshToolStatus } = get();
        
        // Update tools from current configuration first
        // get().updateToolsFromConfig();
        
        // Get updated tools list
        const updatedTools = get().tools;
        
        // Refresh all tools concurrently
        const refreshPromises = updatedTools
          .map((tool) => refreshToolStatus(tool.id));
        await Promise.allSettled(refreshPromises);
      },

      openTool: (toolId) => {
        const { tools, setSelectedTool } = get();
        const tool = tools.find((t) => t.id === toolId);
        
        // Get dashboard URLs from monitoring service via DI
        const monitoringService = getMonitoringService();
        const dashboardUrls = monitoringService.getDashboardUrls();
        
        let targetUrl: string | undefined;
        
        switch (toolId) {
          case 'grafana':
            targetUrl = dashboardUrls.grafana.home;
            break;
          case 'prometheus':
            targetUrl = dashboardUrls.prometheus.home;
            break;
          case 'jaeger':
            targetUrl = dashboardUrls.jaeger.home;
            break;
          case 'kiali':
            targetUrl = dashboardUrls.kiali.overview;
            break;
          case 'argocd':
            targetUrl = tool?.url; // Use service URL for ArgoCD
            break;
        }
        
        if (targetUrl) {
          console.log(`Opening ${tool?.name} dashboard at ${targetUrl}`);
          window.open(targetUrl, '_blank');
        }
        
        setSelectedTool(toolId);
      },
    }),
    {
      name: 'monitoring-store',
    }
  )
);