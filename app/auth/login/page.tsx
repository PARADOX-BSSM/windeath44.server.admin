'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value || '');
      }
    }
    return null;
  };

  const checkExistingAuth = useCallback(async () => {
    try {
      const token = getCookieValue('auth_token');
      if (token) {
        router.push('/');
      }
    } catch (e) {
      console.log('No valid existing auth found', e);
    }
  }, [router]);

  useEffect(() => {
    checkExistingAuth();
  }, [checkExistingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://prod.windeath44.wiki/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, password }),
      });

      if (response.ok) {
        let token = response.headers.get('Authorization') ||
          response.headers.get('authorization') ||
          response.headers.get('x-auth-token') ||
          response.headers.get('access-token');

        if (!token) {
          try {
            const data = await response.json();
            token = data.token || data.accessToken || data.access_token || data.authToken;
          } catch (e) {
            console.error('Failed to parse response JSON:', e);
          }
        }

        if (token && token.startsWith('Bearer ')) {
          token = token.substring(7);
        }

        if (token) {
          const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
          const expires = expirationDate.toUTCString();
          const domain = window.location.hostname;
          document.cookie = `auth_token=${token}; path=/; domain=${domain}; expires=${expires}; max-age=900; samesite=lax`;

          try {
            localStorage.setItem('auth_token', token);
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }

          setTimeout(() => {
            router.push('/');
          }, 200);
        } else {
          setError('No token received from server');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (e) {
      console.error(e);
      setError('Network error. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-black/70 z-0 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505]/80 z-0" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="glass-panel rounded-3xl p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-black/40">
          <div className="text-center mb-10">
            <div className="w-12 h-12 mx-auto bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6">
              <span className="text-white font-bold text-2xl tracking-tighter">W</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white mb-2 font-serif">Welcome Back</h1>
            <p className="text-sm text-white/60 font-light tracking-wide">Enter your credentials to access the control center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase ml-1">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none border-b focus:border-white/50 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 transition-all duration-300"
                placeholder="ENTER ID"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none border-b focus:border-white/50 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-xs tracking-wide">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black font-bold text-xs tracking-[0.2em] hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase"
            >
              {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center mt-8 text-[10px] text-white/30 font-mono tracking-widest uppercase">
          <span>Secure System Access</span>
          <span>Windeath44.Server</span>
        </div>
      </div>
    </div>
  );
}