'use client';

import Link from 'next/link';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import { observabilityConfig } from '../../config/observability';

const highlightStats = [
  { label: 'OPEN INCIDENTS', value: '5', helper: '2 CRITICAL', color: 'text-red-400' },
  { label: 'ACTIVE MODERATORS', value: '7', helper: '2 ON DUTY', color: 'text-emerald-400' },
  { label: 'ACCESS REQUESTS', value: '12', helper: 'AWAITING REVIEW', color: 'text-blue-400' },
];

const quickActions = [
  {
    title: 'Review Access Logs',
    description: 'Verify recent sign-ins and confirm policy compliance.',
    href: '/auth/login',
    cta: 'OPEN AUTH TOOLS',
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
    timestamp: '5m ago',
  },
  {
    title: 'Moderator role updated',
    detail: 'grapefruit promoted to senior reviewer',
    timestamp: '32m ago',
  },
  {
    title: 'Account flagged for abuse',
    detail: 'auto-detected high rejection ratio',
    timestamp: '1h ago',
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-white/20">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeItem={activeNav} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-12">

              {/* Editorial Header */}
              <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-6">
                <div>
                  <h2 className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/40 uppercase mb-3">Server Administration</h2>
                  <h1 className="text-3xl md:text-5xl font-serif font-light text-[var(--foreground)] tracking-tight">
                    Windeath44 <span className="italic text-[var(--foreground)]/30">Overview</span>
                  </h1>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-medium tracking-widest text-[var(--foreground)]/30 uppercase mb-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-sm font-serif text-[var(--foreground)]/60">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Hero Section */}
              <div className="relative h-[360px] overflow-hidden group rounded-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
                  style={{ backgroundImage: 'var(--bg-hero)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-[var(--background)]/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-transparent to-[var(--background)]/60" />

                <div className="relative h-full flex flex-col justify-end pb-10 px-4 z-10">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-medium tracking-[0.2em] text-[var(--foreground)]/60 uppercase">System Operational</span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-light text-[var(--foreground)] mb-4 tracking-tighter font-serif max-w-3xl">
                    Command Center <span className="block text-lg md:text-xl font-sans font-light text-[var(--foreground)]/50 mt-2 tracking-normal">Real-time monitoring and administration interface.</span>
                  </h1>
                </div>
              </div>

              {/* Stats Grid */}
              <section className="relative overflow-hidden rounded-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-15 grayscale"
                  style={{ backgroundImage: 'var(--bg-stats)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/95 to-[var(--background)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/90 via-transparent to-[var(--background)]/90" />

                <div className="relative grid gap-px bg-[var(--border-color)] border border-[var(--border-color)] overflow-hidden">
                  {highlightStats.map((stat) => (
                    <div key={stat.label} className="bg-[var(--background)] p-8 group hover:bg-[var(--foreground)]/5 transition-colors">
                      <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--foreground)]/30 mb-4 uppercase">{stat.label}</p>
                      <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-light text-[var(--foreground)] tracking-tighter">{stat.value}</p>
                        <p className={`text-[10px] font-bold tracking-widest uppercase ${stat.color === 'text-red-400' ? 'text-red-500/70' : 'text-[var(--foreground)]/40'}`}>{stat.helper}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-12 lg:grid-cols-2">
                {/* Quick Actions */}
                <section>
                  <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
                    <h2 className="text-sm font-medium tracking-widest text-[var(--foreground)]/60 uppercase">Quick Actions</h2>
                  </div>
                  <div className="space-y-1">
                    {quickActions.map((action) => (
                      <Link key={action.title} href={action.href} className="group block p-4 -mx-4 hover:bg-[var(--foreground)]/5 transition-colors rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-light text-[var(--foreground)] mb-1 group-hover:underline decoration-[var(--foreground)]/30 underline-offset-4 transition-all">{action.title}</p>
                            <p className="text-xs text-[var(--foreground)]/30 font-light">{action.description}</p>
                          </div>
                          <svg className="w-4 h-4 text-[var(--foreground)]/20 group-hover:text-[var(--foreground)]/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Recent Activity */}
                <section>
                  <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
                    <h2 className="text-sm font-medium tracking-widest text-[var(--foreground)]/60 uppercase">Audit Log</h2>
                  </div>
                  <div className="space-y-6">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex gap-4 items-baseline group">
                        <span className="text-[10px] font-mono text-[var(--foreground)]/20 w-16 text-right">{activity.timestamp}</span>
                        <div className="flex-1 border-l border-[var(--border-color)] pl-4 pb-2">
                          <p className="text-sm font-medium text-[var(--foreground)]/80 mb-1">{activity.title}</p>
                          <p className="text-xs text-[var(--foreground)]/30 font-light">{activity.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Observability */}
              <section className="relative overflow-hidden rounded-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-12 grayscale"
                  style={{ backgroundImage: 'var(--bg-infra)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/95 to-[var(--background)]/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-transparent to-[var(--background)]/80" />

                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
                    <h2 className="text-sm font-medium tracking-widest text-[var(--foreground)]/60 uppercase">Infrastructure</h2>
                    <Link href="/observability" className="text-[10px] font-bold text-[var(--foreground)]/30 hover:text-[var(--foreground)] tracking-[0.2em] uppercase transition-colors">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[var(--border-color)] border border-[var(--border-color)]">
                    {observabilityLinks.map((tool) => (
                      <a
                        key={tool.title}
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[var(--background)] p-6 hover:bg-[var(--foreground)]/5 transition-colors aspect-square flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm text-[var(--foreground)]/70 group-hover:text-[var(--foreground)] transition-colors">{tool.title}</p>
                          <svg className="w-3 h-3 text-[var(--foreground)]/10 group-hover:text-[var(--foreground)]/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                          </svg>
                        </div>
                        <p className="text-[10px] text-[var(--foreground)]/20 group-hover:text-[var(--foreground)]/40 transition-colors leading-relaxed">{tool.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
