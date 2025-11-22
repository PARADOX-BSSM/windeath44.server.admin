import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(`${MEMORIAL_API_URL}/users/profile`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user profile', data: null },
      { status: 500 }
    );
  }
}