import { NextRequest, NextResponse } from 'next/server';
import { k8sClient } from '../../../lib/k8sClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching node data...');
    
    // Get real node metrics and info from k8s client
    const [nodeMetrics, clusterInfo, nodeList] = await Promise.all([
      k8sClient.getNodeMetrics(),
      k8sClient.getClusterInfo(),
      k8sClient.getNodes()
    ]);
    
    console.log('Raw nodeMetrics:', nodeMetrics);
    console.log('Raw nodeList length:', Array.isArray(nodeList) ? nodeList.length : 'not array');
    
    // Process real node data
    const validNodeList = Array.isArray(nodeList) ? nodeList : [];
    console.log('Valid nodeList length:', validNodeList.length);
    
    // Handle metrics API response - could be null or have different structure
    let validNodeMetrics: any[] = [];
    if (nodeMetrics && nodeMetrics.items) {
      validNodeMetrics = nodeMetrics.items;
    } else if (Array.isArray(nodeMetrics)) {
      validNodeMetrics = nodeMetrics;
    }
    console.log('Valid nodeMetrics length:', validNodeMetrics.length);
    
    const nodes = validNodeList.map((node: any) => {
      const nodeMetric = validNodeMetrics.find((metric: any) => metric.metadata?.name === node.metadata?.name);
      
      // Extract CPU and memory usage from metrics
      let cpuUsage = 0;
      let memoryUsageBytes = 0;
      let memoryUsagePercent = 0;
      
      if (nodeMetric && nodeMetric.usage) {
        // Parse CPU usage (e.g., "1035m" -> 1.035 cores, then convert to percentage)
        const cpuStr = nodeMetric.usage.cpu || '0';
        if (cpuStr.endsWith('m')) {
          cpuUsage = parseInt(cpuStr.slice(0, -1)) / 10; // Convert millicores to percentage approximation
        } else if (cpuStr.endsWith('n')) {
          cpuUsage = parseInt(cpuStr.slice(0, -1)) / 1000000000 * 100;
        } else {
          cpuUsage = parseFloat(cpuStr) * 100; // Convert cores to percentage
        }
        
        // Parse memory usage (e.g., "6031Mi" -> bytes)
        const memoryStr = nodeMetric.usage.memory || '0';
        if (memoryStr.endsWith('Mi')) {
          memoryUsageBytes = parseInt(memoryStr.slice(0, -2)) * 1024 * 1024;
        } else if (memoryStr.endsWith('Ki')) {
          memoryUsageBytes = parseInt(memoryStr.slice(0, -2)) * 1024;
        } else if (memoryStr.endsWith('Gi')) {
          memoryUsageBytes = parseInt(memoryStr.slice(0, -2)) * 1024 * 1024 * 1024;
        }
      }
      
      // Get allocatable memory for percentage calculation
      let memoryAllocatableBytes = 0;
      if (node.status && node.status.allocatable && node.status.allocatable.memory) {
        const allocatableStr = node.status.allocatable.memory;
        if (allocatableStr.endsWith('Ki')) {
          memoryAllocatableBytes = parseInt(allocatableStr.slice(0, -2)) * 1024;
        } else if (allocatableStr.endsWith('Mi')) {
          memoryAllocatableBytes = parseInt(allocatableStr.slice(0, -2)) * 1024 * 1024;
        } else if (allocatableStr.endsWith('Gi')) {
          memoryAllocatableBytes = parseInt(allocatableStr.slice(0, -2)) * 1024 * 1024 * 1024;
        }
      }
      
      if (memoryAllocatableBytes > 0) {
        memoryUsagePercent = Math.round((memoryUsageBytes / memoryAllocatableBytes) * 100);
      }
      
      // Determine node role
      const roles = [];
      if (node.metadata.labels) {
        if (node.metadata.labels['node-role.kubernetes.io/control-plane'] !== undefined ||
            node.metadata.labels['node-role.kubernetes.io/master'] !== undefined) {
          roles.push('control-plane', 'master');
        }
        if (node.metadata.labels['node-role.kubernetes.io/worker'] !== undefined) {
          roles.push('worker');
        }
      }
      if (roles.length === 0) {
        roles.push('worker'); // Default to worker if no role labels
      }
      
      // Get node status
      let status = 'NotReady';
      if (node.status && node.status.conditions) {
        const readyCondition = node.status.conditions.find((condition: any) => condition.type === 'Ready');
        if (readyCondition && readyCondition.status === 'True') {
          status = 'Ready';
        }
      }
      
      return {
        nodeName: node.metadata.name,
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: memoryUsagePercent,
        memoryUsageBytes: memoryUsageBytes,
        memoryAllocatableBytes: memoryAllocatableBytes,
        usage: {
          cpu: cpuUsage,
          memory: memoryUsagePercent,
          memoryBytes: memoryUsageBytes
        },
        allocatable: {
          memory: memoryAllocatableBytes
        },
        status: status,
        role: roles,
        podCount: 0 // Will be calculated separately if needed
      };
    });

    return NextResponse.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    console.error('Error fetching node metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch node metrics', success: false },
      { status: 500 }
    );
  }
}