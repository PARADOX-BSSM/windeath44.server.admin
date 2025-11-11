import { NextRequest, NextResponse } from 'next/server';
import { k8sClient } from '../../../lib/k8sClient';

export async function GET(request: NextRequest) {
  try {
    const clusterInfo = await k8sClient.getClusterInfo();
    
    return NextResponse.json({
      success: true,
      data: clusterInfo,
    });
  } catch (error) {
    console.error('Error fetching cluster info:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cluster information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, namespace, resourceType } = body;

    switch (action) {
      case 'refreshMetrics':
        const nodeMetrics = await k8sClient.getNodeMetrics();
        const podMetrics = namespace 
          ? await k8sClient.getPodMetrics(namespace)
          : await k8sClient.getPodMetrics();
        
        return NextResponse.json({
          success: true,
          data: {
            nodes: nodeMetrics,
            pods: podMetrics,
          },
        });

      case 'healthCheck':
        if (!namespace || !resourceType) {
          return NextResponse.json(
            { success: false, error: 'Missing required parameters' },
            { status: 400 }
          );
        }
        
        const isHealthy = await k8sClient.checkServiceHealth(resourceType, namespace);
        
        return NextResponse.json({
          success: true,
          data: { healthy: isHealthy },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing cluster request:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cluster request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}