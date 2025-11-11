import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/dashboard 경로에 대한 인증 확인
  if (pathname.startsWith('/admin/dashboard') && !pathname.startsWith('/admin/dashboard/auth')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/admin/dashboard/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // 토큰이 있으면 클라이언트 측에서 검증하도록 진행
    return NextResponse.next();
  }

  // 기본 /admin 경로는 /admin/dashboard로 리다이렉트
  if (pathname === '/admin') {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};