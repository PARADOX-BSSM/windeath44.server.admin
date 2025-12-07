import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 자원 및 로그인 페이지는 미들웨어 체크 제외 (matcher에서도 처리하지만 이중 안전장치)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/auth/login') ||
    pathname === '/favicon.ico' ||
    pathname === '/windeath44/windeath44.png'
  ) {
    return NextResponse.next();
  }

  console.log('Middleware: Checking auth for:', pathname);

  // auth_token 쿠키 확인
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log('Middleware: No token found, redirecting to login');
    const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
    // 로그인 후 원래 페이지로 돌아오기 위해 callbackUrl 추가 가능 (선택 사항)
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 서버 사이드에서 토큰 검증 및 ADMIN 역할 확인
  try {
    const response = await fetch('https://prod.windeath44.wiki/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'windeath44-admin-middleware',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.log('Token validation failed in middleware:', response.status);
      const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
      return redirectResponse;
    }

    const userProfile = await response.json();
    const userRole = userProfile.data?.role;

    if (userRole !== 'ADMIN') {
      console.log('User does not have ADMIN role in middleware:', userRole);
      const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
      loginUrl.searchParams.set('access_denied', 'true');
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
      return redirectResponse;
    }

    // 유효한 ADMIN 토큰이면 진행
    return NextResponse.next();

  } catch (error) {
    console.error('Token validation error in middleware:', error);
    const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
    return redirectResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/login).*)',
  ],
};