import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Middleware: Pathname:', pathname);

  // 정적 자원 및 로그인 페이지는 미들웨어 체크 제외
  // basePath가 설정되어 있어도 pathname은 basePath가 제거된 상태로 들어옵니다(Next.js default).
  // 하지만 확실한 처리를 위해 여러 케이스를 방어적으로 처리합니다.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/auth/login') ||
    pathname === '/auth/login' || // Explicit match
    pathname === '/favicon.ico' ||
    pathname === '/windeath44/windeath44.png'
  ) {
    return NextResponse.next();
  }

  console.log('Middleware: Checking auth for protected route:', pathname);

  // auth_token 쿠키 확인
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log('Middleware: No token found, redirecting to login');
    const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('X-Middleware-Reason', 'missing-token');
    return response;
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
      redirectResponse.headers.set('X-Middleware-Reason', `api-error-${response.status}`);
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
      redirectResponse.headers.set('X-Middleware-Reason', 'role-mismatch');
      return redirectResponse;
    }

    // 유효한 ADMIN 토큰이면 진행
    return NextResponse.next();

  } catch (error) {
    console.error('Token validation error in middleware:', error);
    const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
    redirectResponse.headers.set('X-Middleware-Reason', 'validation-exception');
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