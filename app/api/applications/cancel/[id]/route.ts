import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetUrl = new URL(`/applications/cancel/${id}`, API_BASE_URL);

    const response = await fetch(targetUrl.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json(
      { 
        message: 'Failed to reject application',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}