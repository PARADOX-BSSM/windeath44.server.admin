'use client';

import Link from 'next/link';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';

const highlightStats = [
  { label: 'Pending Memorials', value: '18', helper: '+3 today' },
  { label: 'Active Moderators', value: '7', helper: '2 on duty' },
  { label: 'Flagged Accounts', value: '4', helper: 'needs review' },
];

const quickActions = [
  {
    title: 'Review Memorial Applications',
    description: 'Approve or reject new submissions from the community.',
    href: '/admin/applications',
    cta: 'Go to applications',
  },
  {
    title: 'Sync Moderator Access',
    description: 'Audit who can log in and reset credentials when needed.',
    href: '/admin/dashboard/auth/login',
    cta: 'Manage access',
  },
];

const observabilityLinks = [
  {
    title: 'Grafana',
    description: 'Dashboards & unified metrics',
    href: 'https://prod.windeath44.wiki/admin/grafana',
  },
  {
    title: 'Kiali',
    description: 'Service mesh topology',
    href: 'https://prod.windeath44.wiki/admin/kiali',
  },
  {
    title: 'Prometheus',
    description: 'Raw metrics explorer',
    href: 'https://prod.windeath44.wiki/admin/prometheus',
  },
  {
    title: 'Kafka UI',
    description: 'Event-stream inspection',
    href: 'https://prod.windeath44.wiki/admin/kafka-ui',
  },
];

const recentActivity = [
  {
    title: 'New memorial submitted',
    detail: 'Character #442 from user miumi21',
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
    title: 'Memorial published to production',
    detail: 'Request #1082 approved by hanjin',
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
                <h1 className="text-3xl font-semibold mt-1">Keep memorial content and member access healthy</h1>
                <p className="mt-3 text-white/80">
                  Track what requires moderation today and jump straight into the workflows that need attention.
                </p>
              </div>
              <Link
                href="/admin/applications"
                className="inline-flex items-center justify-center rounded-xl bg-white/20 px-5 py-3 text-sm font-medium hover:bg-white/30"
              >
                View pending submissions
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

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Observability shortcuts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Jump to the external tools that now host cluster dashboards.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {observabilityLinks.map((tool) => (
                <a
                  key={tool.title}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/10"
                >
                  <p className="font-medium text-foreground">{tool.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
