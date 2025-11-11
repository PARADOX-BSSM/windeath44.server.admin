import { NextResponse } from 'next/server';
import { k8sClient } from '../../lib/k8sClient';

export async function GET() {
  try {
    // Check if we can connect to Kubernetes API
    const clusterInfo = await k8sClient.getClusterInfo();
    
    if (clusterInfo.nodes > 0) {
      return NextResponse.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        kubernetes: {
          connected: true,
          nodes: clusterInfo.nodes,
          pods: clusterInfo.pods,
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'not ready',
        reason: 'No kubernetes nodes found',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Readiness check failed:', error);
    
    return NextResponse.json({
      status: 'not ready',
      reason: 'Kubernetes API not accessible',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}