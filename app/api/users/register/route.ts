import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { userId, email, name, password } = body;
    if (!userId || !email || !name || !password) {
      return NextResponse.json(
        { message: 'All fields (userId, email, name, password) are required', data: null },
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

    const response = await fetch(`${MEMORIAL_API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to register user: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to register user', data: null },
      { status: 500 }
    );
  }
}