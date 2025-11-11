'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/>
      </svg>
    ),
  },
  {
    id: 'applications',
    label: 'Memorial Applications',
    href: '/admin/applications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    id: 'grafana',
    label: 'Grafana',
    href: 'https://prod.windeath44.wiki/admin/grafana',
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
      </svg>
    ),
  },
  {
    id: 'kiali',
    label: 'Kiali',
    href: 'https://prod.windeath44.wiki/admin/kiali',
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
    href: 'https://prod.windeath44.wiki/admin/prometheus',
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
    href: 'https://prod.windeath44.wiki/admin/kafka-ui',
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

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              active === item.id
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
