import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    const authorization = request.headers.get('authorization');
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID header is required', data: null },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { message: 'Name is required', data: null },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'user-id': userId,
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(`${MEMORIAL_API_URL}/users/change/name`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update name: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating name:', error);
    return NextResponse.json(
      { message: 'Failed to update name', data: null },
      { status: 500 }
    );
  }
}