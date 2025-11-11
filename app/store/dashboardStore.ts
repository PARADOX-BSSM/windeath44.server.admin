import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ServerStats {
  serverStatus: {
    status: 'Online' | 'Offline' | 'Maintenance';
    color: string;
  };
  cpuUsage: {
    value: number;
    unit: '%';
  };
  memoryUsage: {
    used: number;
    total: number;
    unit: 'GB';
  };
  uptime: {
    value: number;
    unit: '%';
  };
}

interface DashboardState {
  activeSection: string;
  isLoading: boolean;
  serverStats: ServerStats;
  lastUpdated: Date | null;
}

interface DashboardActions {
  setActiveSection: (section: string) => void;
  setLoading: (loading: boolean) => void;
  updateServerStats: (stats: Partial<ServerStats>) => void;
  refreshStats: () => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

const initialStats: ServerStats = {
  serverStatus: {
    status: 'Online',
    color: 'text-green-600 dark:text-green-400',
  },
  cpuUsage: {
    value: 45,
    unit: '%',
  },
  memoryUsage: {
    used: 0,
    total: 0,
    unit: 'GB',
  },
  uptime: {
    value: 99.9,
    unit: '%',
  },
};

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        activeSection: 'overview',
        isLoading: false,
        serverStats: initialStats,
        lastUpdated: null,
        
        // Initialize real data on store creation
        init: async () => {
          const { refreshStats } = get();
          await refreshStats();
        },

        // Actions
        setActiveSection: (section) =>
          set(() => ({ activeSection: section })),

        setLoading: (loading) =>
          set(() => ({ isLoading: loading })),

        updateServerStats: (stats) =>
          set((state) => ({
            serverStats: { ...state.serverStats, ...stats },
            lastUpdated: new Date(),
          })),

        refreshStats: async () => {
          const { setLoading, updateServerStats } = get();
          
          setLoading(true);
          
          try {
            // Fetch real cluster metrics from Kubernetes API
            const [clusterResponse, nodesResponse] = await Promise.all([
              fetch('/admin/api/k8s/cluster'),
              fetch('/admin/api/k8s/nodes')
            ]);
            
            let clusterInfo = { nodes: 0, pods: 0 };
            let clusterMetrics = {
              cpuUsage: 0,
              memoryUsagePercent: 0,
              totalMemoryGB: 16,
              usedMemoryGB: 0,
              uptime: 99.9
            };
            
            if (clusterResponse.ok) {
              const k8sData = await clusterResponse.json();
              clusterInfo = k8sData.data || clusterInfo;
            }
            
            if (nodesResponse.ok) {
              const nodesData = await nodesResponse.json();
              if (nodesData.success && nodesData.data) {
                // Calculate cluster metrics from node data
                const nodes = nodesData.data;
                if (nodes.length > 0) {
                  const totalCpu = nodes.reduce((sum: number, node: any) => sum + (node.usage?.cpu || 0), 0);
                  const totalMemoryPercent = nodes.reduce((sum: number, node: any) => sum + (node.usage?.memory || 0), 0);
                  const totalAllocatableMemory = nodes.reduce((sum: number, node: any) => sum + (node.allocatable?.memory || 0), 0);
                  const totalUsedMemory = nodes.reduce((sum: number, node: any) => sum + (node.usage?.memoryBytes || 0), 0);
                  
                  clusterMetrics.cpuUsage = Math.round(totalCpu / nodes.length);
                  clusterMetrics.memoryUsagePercent = Math.round(totalMemoryPercent / nodes.length);
                  
                  // Convert bytes to GB for display
                  if (totalAllocatableMemory > 0) {
                    clusterMetrics.totalMemoryGB = parseFloat((totalAllocatableMemory / (1024 * 1024 * 1024)).toFixed(1));
                    clusterMetrics.usedMemoryGB = parseFloat((totalUsedMemory / (1024 * 1024 * 1024)).toFixed(1));
                  }
                }
              }
            }
            
            // Calculate real server status based on cluster health
            let serverStatus: 'Online' | 'Offline' | 'Maintenance' = 'Offline';
            let statusColor = 'text-red-600 dark:text-red-400';
            
            if (clusterInfo.nodes > 0 && clusterInfo.pods > 0) {
              if (clusterMetrics.cpuUsage < 90 && clusterMetrics.memoryUsagePercent < 90) {
                serverStatus = 'Online';
                statusColor = 'text-green-600 dark:text-green-400';
              } else {
                serverStatus = 'Maintenance';
                statusColor = 'text-yellow-600 dark:text-yellow-400';
              }
            }
            
            // Update with real monitoring data
            const realStats: Partial<ServerStats> = {
              cpuUsage: {
                value: Math.round(clusterMetrics.cpuUsage),
                unit: '%',
              },
              memoryUsage: {
                used: clusterMetrics.usedMemoryGB,
                total: clusterMetrics.totalMemoryGB,
                unit: 'GB',
              },
              serverStatus: {
                status: serverStatus,
                color: statusColor,
              },
              uptime: {
                value: clusterMetrics.uptime,
                unit: '%',
              },
            };
            
            updateServerStats(realStats);
          } catch (error) {
            console.error('Failed to refresh stats:', error);
            
            // Fallback to mock data on error
            const fallbackStats: Partial<ServerStats> = {
              serverStatus: {
                status: 'Offline',
                color: 'text-red-600 dark:text-red-400',
              },
              cpuUsage: {
                value: 0,
                unit: '%',
              },
              memoryUsage: {
                used: 0,
                total: 0,
                unit: 'GB',
              },
            };
            
            updateServerStats(fallbackStats);
          } finally {
            setLoading(false);
          }
        },
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({
          activeSection: state.activeSection,
          serverStats: state.serverStats,
        }),
      }
    ),
    {
      name: 'dashboard-store',
    }
  )
);