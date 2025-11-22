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
    href: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/>
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>
    ),
  },
  {
    id: 'create-admin',
    label: 'Create Admin',
    href: '/admin/users/create',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m9-9H3"/>
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m0-18a9 9 0 00-9 9m18 0H3"/>
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
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
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-73px)] transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        {!isCollapsed && <span className="text-sm font-semibold text-foreground">Navigation</span>}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              active === item.id
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
            {isCollapsed && <span className="sr-only">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
