'use client';

import Link from 'next/link';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import { observabilityConfig } from '../../config/observability';

const highlightStats = [
  { label: 'Open Incidents', value: '5', helper: '2 critical' },
  { label: 'Active Moderators', value: '7', helper: '2 on duty' },
  { label: 'Access Requests', value: '12', helper: 'awaiting review' },
];

const quickActions = [
  {
    title: 'Review Access Logs',
    description: 'Verify recent sign-ins and confirm policy compliance.',
    href: '/admin/dashboard/auth/login',
    cta: 'Open auth tools',
  },
  {
    title: 'Manage Users',
    description: 'View user accounts, roles, and activity status.',
    href: '/admin/dashboard/users',
    cta: 'View users',
  },
  {
    title: 'Create Admin Account',
    description: 'Set up new administrator accounts with proper verification.',
    href: '/admin/dashboard/users/create',
    cta: 'Create admin',
  },
];

const observabilityLinks = [
  {
    title: 'Grafana',
    description: 'Dashboards & unified metrics',
    href: observabilityConfig.grafanaUrl,
  },
  {
    title: 'Argo CD',
    description: 'Deployment pipelines & sync status',
    href: observabilityConfig.argoCdUrl,
  },
  {
    title: 'Kiali',
    description: 'Service mesh topology',
    href: observabilityConfig.kialiUrl,
  },
  {
    title: 'Prometheus',
    description: 'Raw metrics explorer',
    href: observabilityConfig.prometheusUrl,
  },
  {
    title: 'Kafka UI',
    description: 'Event-stream inspection',
    href: observabilityConfig.kafkaUiUrl,
  },
];

const recentActivity = [
  {
    title: 'Access token rotated',
    detail: 'ops-lead rotated admin JWT secret',
    timestamp: '5 minutes ago',
  },
  {
    title: 'Moderator role updated',
    detail: 'grapefruit promoted to senior reviewer',
    timestamp: '32 minutes ago',
  },
  {
    title: 'Account flagged for abuse',
    detail: 'auto-detected high rejection ratio',
    timestamp: '1 hour ago',
  },
  {
    title: 'Observation runbook updated',
    detail: 'hanjin pushed latest incident response notes',
    timestamp: 'Yesterday',
  },
];

interface AdminOverviewProps {
  activeNav?: string;
}

export default function AdminOverview({ activeNav = 'dashboard' }: AdminOverviewProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activeItem={activeNav} />
        <main className="flex-1 p-6 space-y-6">
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-white/70">Admin Control Center</p>
                <h1 className="text-3xl font-semibold mt-1">Keep platform health and member access in check</h1>
                <p className="mt-3 text-white/80">
                  Track what requires moderation today and jump straight into the workflows that need attention.
                </p>
              </div>
              <Link
                href="/admin/dashboard/auth/login"
                className="inline-flex items-center justify-center rounded-xl bg-white/20 px-5 py-3 text-sm font-medium hover:bg-white/30"
              >
                Review credentials
              </Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {highlightStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.helper}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    High-confidence tasks that usually need attention every day.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {quickActions.map((action) => (
                  <div key={action.title} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                    <Link
                      href={action.href}
                      className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                    >
                      {action.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Latest items that may require follow-up.</p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.title} className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.detail}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Overview of platform users and administrative controls.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-medium text-foreground">Total Users</p>
                    <p className="text-2xl font-semibold text-blue-600">1,247</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">+23 this week</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-medium text-foreground">Admin Accounts</p>
                    <p className="text-2xl font-semibold text-purple-600">8</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2 active today</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/admin/users"
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View All Users
                  </Link>
                  <Link
                    href="/admin/users/create"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Create Admin
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Observability shortcuts</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Jump to the external tools that now host cluster dashboards.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {observabilityLinks.slice(0, 4).map((tool) => (
                  <a
                    key={tool.title}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 p-3 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/10 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{tool.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
                <Link
                  href="/admin/observability"
                  className="text-center text-sm text-blue-600 hover:underline py-2"
                >
                  View all tools →
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
