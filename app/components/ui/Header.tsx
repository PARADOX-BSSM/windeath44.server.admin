'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--background)]/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
        <span className="text-xs font-bold tracking-[0.2em] text-[var(--foreground)]/60 uppercase">Live Connection</span>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => {
            const nextTheme =
              theme === 'new-york' ? 'san-francisco' :
                theme === 'san-francisco' ? 'windeath44' :
                  theme === 'windeath44' ? 'light' :
                    'new-york';
            setTheme(nextTheme);
          }}
          className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/40 hover:text-[var(--foreground)] uppercase transition-colors flex items-center gap-2"
        >
          <span>
            {theme === 'new-york' ? 'NYC' :
              theme === 'san-francisco' ? 'SF' :
                theme === 'windeath44' ? 'W44' :
                  'LIGHT'}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${theme === 'new-york' ? 'bg-blue-500' :
            theme === 'san-francisco' ? 'bg-orange-500' :
              theme === 'windeath44' ? 'bg-purple-500' :
                'bg-[var(--foreground)]'
            }`} />
        </button>

        <div className="h-4 w-px bg-[var(--foreground)]/10" />

        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'auth_token=; path=/admin/dashboard; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/admin/dashboard/auth/login';
          }}
          className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/40 hover:text-red-400 uppercase transition-colors"
        >
          Disconnect
        </button>
      </div>
    </header>
  );
}
