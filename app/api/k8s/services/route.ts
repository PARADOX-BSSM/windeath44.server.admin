import { NextRequest, NextResponse } from 'next/server';
import { k8sClient } from '../../../lib/k8sClient';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const namespace = url.searchParams.get('namespace');

    if (namespace) {
      // Get services in specific namespace
      const services = await k8sClient.getNamespacedServices(namespace);
      
      return NextResponse.json({
        success: true,
        data: {
          namespace,
          services: services.map((service: any) => ({
            name: service.metadata?.name,
            namespace: service.metadata?.namespace,
            type: service.spec?.type,
            clusterIP: service.spec?.clusterIP,
            ports: service.spec?.ports,
          })),
        },
      });
    } else {
      // Get service endpoints for all monitoring services
      const endpoints = await k8sClient.getServiceEndpoints();
      
      return NextResponse.json({
        success: true,
        data: endpoints,
      });
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch services',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serviceName, namespace } = body;

    if (action === 'healthCheck') {
      if (!serviceName || !namespace) {
        return NextResponse.json(
          { success: false, error: 'Missing serviceName or namespace' },
          { status: 400 }
        );
      }

      const isHealthy = await k8sClient.checkServiceHealth(serviceName, namespace);
      
      return NextResponse.json({
        success: true,
        data: {
          serviceName,
          namespace,
          healthy: isHealthy,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing service request:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process service request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}