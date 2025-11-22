import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    const authorization = request.headers.get('authorization');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID header is required', data: null },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const profile = formData.get('profile');
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile image is required', data: null },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'user-id': userId,
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(`${MEMORIAL_API_URL}/users/change/profile`, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Failed to update profile', data: null },
      { status: 500 }
    );
  }
}