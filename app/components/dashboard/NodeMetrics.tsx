import React, { useEffect, useState } from 'react';

interface NodeMetric {
  nodeName: string;
  cpuUsage: number;
  memoryUsage: number; // percentage
  memoryUsageBytes: number;
  memoryAllocatableBytes: number;
  status: 'Ready' | 'NotReady' | 'Unknown';
  role: string[];
  podCount: number;
}

interface NodeMetricsProps {
  onNodeClick?: (nodeName: string) => void;
}

export default function NodeMetrics({ onNodeClick }: NodeMetricsProps) {
  const [nodes, setNodes] = useState<NodeMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodeMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch node metrics from API
      const response = await fetch('/admin/api/k8s/nodes');
      if (!response.ok) {
        throw new Error('Failed to fetch node metrics');
      }
      
      const result = await response.json();
      const data = result.success ? result.data : result;
      setNodes(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching node metrics:', err);
      
      // Mock data for development/fallback
      setNodes([
        {
          nodeName: 'master-node',
          cpuUsage: 45,
          memoryUsage: 52,
          memoryUsageBytes: 4469497856,
          memoryAllocatableBytes: 8589934592,
          status: 'Ready',
          role: ['control-plane', 'master'],
          podCount: 15
        },
        {
          nodeName: 'worker-node-1',
          cpuUsage: 32,
          memoryUsage: 70,
          memoryUsageBytes: 2998927360,
          memoryAllocatableBytes: 4294967296,
          status: 'Ready',
          role: ['worker'],
          podCount: 28
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNodeMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'NotReady':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getUsageColor = (usage: number, threshold1: number = 70, threshold2: number = 90) => {
    if (usage >= threshold2) return 'text-red-600 dark:text-red-400';
    if (usage >= threshold1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Node Metrics</h3>
        <button
          onClick={fetchNodeMetrics}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {nodes.map((node) => (
          <div
            key={node.nodeName}
            onClick={() => onNodeClick?.(node.nodeName)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-foreground">{node.nodeName}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                  {node.status}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {node.role.join(', ')}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {node.podCount} pods
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">CPU</div>
                <div className={`font-medium ${getUsageColor(node.cpuUsage || 0)}`}>
                  {Math.round(node.cpuUsage || 0)}%
                </div>
              </div>
              
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">Memory</div>
                <div className={`font-medium ${getUsageColor(node.memoryUsage || 0)}`}>
                  {((node.memoryUsageBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)} / {((node.memoryAllocatableBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}