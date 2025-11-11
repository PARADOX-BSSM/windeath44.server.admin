'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // localStorage를 우선으로 확인
      let token = null;
      
      try {
        token = localStorage.getItem('auth_token');
        console.log('localStorage token:', token ? 'Found' : 'Not found');
      } catch (e) {
        console.warn('localStorage access failed:', e);
      }
      
      // localStorage에 없으면 쿠키에서 확인
      if (!token) {
        console.log('All cookies:', document.cookie);
        token = getCookieValue('auth_token');
        console.log('Cookie token:', token ? 'Found' : 'Not found');
      }
      
      if (!token) {
        console.log('No auth_token found in localStorage or cookies, redirecting to login');
        router.push('/admin/dashboard/auth/login');
        return;
      }

      // JWT 검증 (디버깅을 위해 주석처리)
      console.log('Skipping JWT verification for debugging');
      setIsAuthenticated(true);
      setUser({ userId: 'debug_user' });
      console.log('Authentication bypassed for debugging');
      
      // TODO: 디버깅 완료 후 아래 코드 주석 해제
      /*
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      
      if (result.valid) {
        setIsAuthenticated(true);
        setUser(result.user);
        console.log('Authentication successful');
      } else {
        console.log('Token verification failed:', result.message);
        console.log('Clearing invalid token from cookies and localStorage');
        // 유효하지 않은 토큰이면 쿠키와 localStorage에서 제거
        const domain = window.location.hostname;
        const basePath = '/admin/dashboard';
        // basePath와 루트 경로 모두에서 삭제
        document.cookie = `auth_token=; path=${basePath}; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `auth_token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        try {
          localStorage.removeItem('auth_token');
        } catch (e) {
          console.warn('Failed to remove from localStorage:', e);
        }
        router.push('/admin/dashboard/auth/login');
      }
      */
    } catch (error) {
      console.error('Authentication check failed:', error);
      console.log('Clearing tokens due to error');
      // 에러 발생 시 토큰 제거
      const domain = window.location.hostname;
      const basePath = '/admin/dashboard';
      document.cookie = `auth_token=; path=${basePath}; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `auth_token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      try {
        localStorage.removeItem('auth_token');
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }
      router.push('/admin/dashboard/auth/login');
    }
  };

  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    // 더 강력한 쿠키 파싱
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value || '');
      }
    }
    return null;
  };

  const handleLogout = () => {
    // 쿠키와 localStorage에서 토큰 제거
    const domain = window.location.hostname;
    const basePath = '/admin/dashboard';
    // basePath와 루트 경로 모두에서 삭제
    document.cookie = `auth_token=; path=${basePath}; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `auth_token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    try {
      localStorage.removeItem('auth_token');
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }
    
    router.push('/admin/dashboard/auth/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.userId || user.sub || 'Admin'}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-muted-foreground mb-6">
                You are successfully authenticated and can access admin features.
              </p>
              
              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    User Management
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Manage user accounts and permissions
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    System Monitoring
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Monitor system health and performance
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Configuration
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Configure system settings and parameters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}