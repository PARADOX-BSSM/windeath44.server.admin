import { NextRequest, NextResponse } from 'next/server';

const MEMORIAL_API_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';
    const keyword = searchParams.get('keyword');
    const createdFrom = searchParams.get('createdFrom');
    const createdTo = searchParams.get('createdTo');
    const sort = searchParams.get('sort') || 'createdAt,desc';
    const roleFilter = searchParams.get('roleFilter');
    
    const role = request.headers.get('role') || 'ADMIN';
    const authorization = request.headers.get('authorization');
    
    const url = new URL(`${MEMORIAL_API_URL}/users`);
    url.searchParams.set('page', page);
    url.searchParams.set('size', size);
    url.searchParams.set('sort', sort);
    
    if (keyword) url.searchParams.set('keyword', keyword);
    if (createdFrom) url.searchParams.set('createdFrom', createdFrom);
    if (createdTo) url.searchParams.set('createdTo', createdTo);
    if (roleFilter) url.searchParams.set('roleFilter', roleFilter);

    const headers: Record<string, string> = {
      'role': role,
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.json();
    
    if (!body.userId) {
      return NextResponse.json(
        { message: 'User ID is required', data: null },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(`${MEMORIAL_API_URL}/users`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user', data: null },
      { status: 500 }
    );
  }
}