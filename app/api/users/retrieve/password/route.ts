import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required', data: null },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8 || password.length > 20) {
      return NextResponse.json(
        { message: 'Password must be between 8 and 20 characters', data: null },
        { status: 400 }
      );
    }

    const response = await fetch(`${MEMORIAL_API_URL}/users/retrieve/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to reset password: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to reset password', data: null },
      { status: 500 }
    );
  }
}