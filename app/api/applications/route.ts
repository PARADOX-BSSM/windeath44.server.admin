import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Build target URL
    const targetUrl = new URL('/applications', API_BASE_URL);
    
    // Forward query parameters
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any necessary headers
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('user-id') && {
          'user-id': request.headers.get('user-id')!
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch applications',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}