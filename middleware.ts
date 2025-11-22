import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/dashboard 경로에 대한 인증 확인
  if (pathname.startsWith('/admin/dashboard') && !pathname.startsWith('/admin/dashboard/auth')) {
    console.log('Middleware: Checking auth for:', pathname);
    
    // 모든 쿠키 로그
    const allCookies = request.cookies.getAll();
    console.log('Middleware: All cookies:', allCookies);
    
    // 여러 방법으로 토큰 읽기 시도
    const token = request.cookies.get('auth_token')?.value;
    const cookieHeader = request.headers.get('cookie');
    console.log('Middleware: Raw cookie header:', cookieHeader);
    console.log('Middleware: auth_token value:', token ? `Found token (${token.length} chars)` : 'No token');
    
    if (!token) {
      console.log('Middleware: No token found, redirecting to login');
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
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
        // Edge Runtime에서는 cache 옵션 사용
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.log('Token validation failed in middleware:', response.status);
        // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트하고 토큰 삭제
        const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
        return redirectResponse;
      }
      
      const userProfile = await response.json();
      console.log('Middleware: API response:', JSON.stringify(userProfile, null, 2));
      
      // role은 data 객체 안에 중첩되어 있음
      const userRole = userProfile.data?.role;
      console.log('Middleware: User role found:', userRole);
      
      if (userRole !== 'ADMIN') {
        console.log('User does not have ADMIN role in middleware:', userRole);
        // ADMIN 역할이 아니면 로그인 페이지로 리다이렉트하고 토큰 삭제
        const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
        loginUrl.searchParams.set('access_denied', 'true');
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
        return redirectResponse;
      }
      
      // 유효한 ADMIN 토큰이면 진행
      console.log('Valid ADMIN token verified in middleware');
      return NextResponse.next();
      
    } catch (error) {
      console.error('Token validation error in middleware:', error);
      // 에러 발생 시 로그인 페이지로 리다이렉트하고 토큰 삭제
      const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('auth_token', '', { expires: new Date(0) });
      return redirectResponse;
    }
  }

  // 루트 경로를 /admin/dashboard로 리다이렉트
  if (pathname === '/') {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/dashboard/:path*',
  ],
};