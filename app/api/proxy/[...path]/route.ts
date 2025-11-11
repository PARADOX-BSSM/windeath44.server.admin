import { NextRequest, NextResponse } from 'next/server';
import { getServiceUrls } from '../../../lib/k8sClient';

const ALLOWED_SERVICES = ['grafana', 'kiali', 'jaeger', 'argocd', 'prometheus', 'alertmanager'];
const REQUEST_TIMEOUT = 10000; // 10 seconds

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxyRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxyRequest(request, params, 'POST');
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxyRequest(request, params, 'PUT');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxyRequest(request, params, 'DELETE');
}

async function handleProxyRequest(
  request: NextRequest, 
  params: { path: string[] }, 
  method: string
) {
  try {
    const [service, ...pathSegments] = params.path;
    
    // Validate service
    if (!ALLOWED_SERVICES.includes(service)) {
      return NextResponse.json(
        { error: 'Service not allowed' },
        { status: 403 }
      );
    }

    // Get service URLs
    const serviceUrls = getServiceUrls();
    const baseUrl = serviceUrls[service as keyof typeof serviceUrls];
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Service URL not found' },
        { status: 404 }
      );
    }

    // Build target URL
    const targetPath = pathSegments.join('/');
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();
    const targetUrl = `${baseUrl}/${targetPath}${queryString ? `?${queryString}` : ''}`;

    // Prepare headers and pass through authentication
    const headers = new Headers();
    headers.set('User-Agent', 'WindeathAdmin/1.0');
    headers.set('Accept', request.headers.get('accept') || 'application/json');
    
    if (request.headers.get('content-type')) {
      headers.set('Content-Type', request.headers.get('content-type')!);
    }

    // Pass through cookies for authentication
    if (request.headers.get('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    // Pass through authorization header if present
    if (request.headers.get('authorization')) {
      headers.set('Authorization', request.headers.get('authorization')!);
    }

    // Prepare request body for POST/PUT
    let body: string | undefined;
    if (method === 'POST' || method === 'PUT') {
      body = await request.text();
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Make the request
      const response = await fetch(targetUrl, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different content types
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data, { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } else if (contentType?.includes('text/')) {
        const text = await response.text();
        return new NextResponse(text, {
          status: response.status,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } else {
        // Handle binary data
        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
          status: response.status,
          headers: {
            'Content-Type': contentType || 'application/octet-stream',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Proxy request failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        service: params.path[0],
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  try {
    const [service] = params.path;
    
    if (!ALLOWED_SERVICES.includes(service)) {
      return new NextResponse(null, { status: 403 });
    }

    const serviceUrls = getServiceUrls();
    const baseUrl = serviceUrls[service as keyof typeof serviceUrls];
    
    if (!baseUrl) {
      return new NextResponse(null, { status: 404 });
    }

    // Simple connectivity check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      return new NextResponse(null, { 
        status: response.ok ? 200 : response.status,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return new NextResponse(null, { status: 500 });
  }
}