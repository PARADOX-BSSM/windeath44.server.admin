'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { observabilityConfig } from '../../config/observability';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  href: string;
  external?: boolean;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin/dashboard/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: 'create-admin',
    label: 'Create Admin',
    href: '/admin/dashboard/users/create',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    id: 'grafana',
    label: 'Grafana',
    href: observabilityConfig.grafanaUrl,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    ),
  },
  {
    id: 'argo-cd',
    label: 'Argo CD',
    href: observabilityConfig.argoCdUrl,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m9-9H3" />
      </svg>
    ),
  },
  {
    id: 'kiali',
    label: 'Kiali',
    href: observabilityConfig.kialiUrl,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m0-18a9 9 0 00-9 9m18 0H3" />
      </svg>
    ),
  },
  {
    id: 'prometheus',
    label: 'Prometheus',
    href: observabilityConfig.prometheusUrl,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'kafka-ui',
    label: 'Kafka UI',
    href: observabilityConfig.kafkaUiUrl,
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {
  const [active, setActive] = useState(activeItem);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleItemClick = (item: NavItem) => {
    setActive(item.id);
    onItemClick?.(item.id);

    if (!item.href) return;

    if (item.external || item.href.startsWith('http')) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    router.push(item.href);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`relative z-20 h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCollapsed ? 'w-20' : 'w-80'}`}
    >
      <div className="h-full flex flex-col bg-[var(--background)]/40 backdrop-blur-xl border-r border-[var(--border-color)]">
        <div className="flex items-center justify-between px-8 py-8">
          {!isCollapsed && (
            <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--foreground)]/40 uppercase font-sans">
              Menu
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 -mr-2 rounded-full text-[var(--foreground)]/20 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all duration-300"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center px-4 py-4 text-sm font-medium rounded-lg transition-all duration-300 group relative overflow-hidden ${isCollapsed ? 'justify-center' : 'gap-5'
                  } ${isActive
                    ? 'text-[var(--foreground)] bg-[var(--foreground)]/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02]'
                  }`}
              >
                <span className={`relative z-10 transition-all duration-300 ${isActive ? 'text-[var(--foreground)] scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'group-hover:text-[var(--foreground)] group-hover:scale-105'}`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { strokeWidth: isActive ? 2 : 1.5 })}
                </span>
                {!isCollapsed && (
                  <span className={`relative z-10 tracking-wide transition-all duration-300 ${isActive ? 'text-[var(--foreground)] font-medium' : 'font-light'}`}>
                    {item.label}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--foreground)] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
                {isCollapsed && <span className="sr-only">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className={`relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--foreground)]/[0.02] p-5 transition-all duration-500 ${isCollapsed ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/30 uppercase">Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-500/80 tracking-wider">LIVE</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-px w-full bg-gradient-to-r from-[var(--foreground)]/10 to-transparent" />
              <p className="text-xs font-light text-[var(--foreground)]/60 pt-2 leading-relaxed">
                System operational.
                <br />
                No active incidents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
