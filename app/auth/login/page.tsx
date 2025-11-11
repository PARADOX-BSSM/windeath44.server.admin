'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://prod.windeath44.wiki/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키/인증 정보 포함
        body: JSON.stringify({ userId, password }),
      });

      if (response.ok) {
        // JWT 토큰을 여러 곳에서 찾기
        let token = response.headers.get('Authorization') || 
                   response.headers.get('authorization') ||
                   response.headers.get('x-auth-token') ||
                   response.headers.get('access-token');
        
        // 응답 본문에서도 토큰 찾기
        if (!token) {
          try {
            const data = await response.json();
            token = data.token || data.accessToken || data.access_token || data.authToken;
            console.log('Response data:', data);
          } catch (e) {
            console.error('Failed to parse response JSON:', e);
          }
        }
        
        // Authorization 헤더에서 Bearer 접두사 제거
        if (token && token.startsWith('Bearer ')) {
          token = token.substring(7);
        }
        
        console.log('Received token:', token ? 'Token found' : 'No token found');
        console.log('All headers:', [...response.headers.entries()]);
        
        if (token) {
          // JWT를 쿠키에 저장 (basePath를 고려한 경로 설정)
          const isSecure = window.location.protocol === 'https:';
          const secureFlag = isSecure ? '; secure' : '';
          
          // 쿠키 만료 시간 설정 (15분)
          const maxAge = 15 * 60; // 15 minutes in seconds
          
          // 만료 날짜를 명시적으로 설정 (15분 후)
          const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
          const expires = expirationDate.toUTCString();
          
          console.log('Setting persistent cookies with expiration:', expires);
          
          // basePath를 고려한 쿠키 설정  
          const domain = window.location.hostname;
          const basePath = '/admin/dashboard'; // Next.js basePath와 일치
          console.log('Setting cookie for domain:', domain, 'basePath:', basePath);
          
          // basePath에 맞춘 쿠키 설정
          document.cookie = `auth_token=${token}; path=${basePath}; domain=${domain}; expires=${expires}; max-age=${maxAge}${secureFlag}; samesite=lax`;
          // 상위 경로에도 설정 (API 접근을 위해)
          document.cookie = `auth_token=${token}; path=/; domain=${domain}; expires=${expires}; max-age=${maxAge}${secureFlag}; samesite=lax`;
          
          // 추가로 localStorage에도 저장 (백업)
          try {
            localStorage.setItem('auth_token', token);
            console.log('Token also saved to localStorage');
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }
          
          console.log('Token saved to cookie with multiple paths');
          console.log('Cookies after save:', document.cookie);
          
          // admin 대시보드로 리다이렉트
          window.location.href = '/admin/dashboard';
        } else {
          setError('No token received from server');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-foreground mb-2">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-foreground"
                placeholder="Enter user ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-foreground"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}