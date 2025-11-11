'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { useEventsStore } from '../store/events/optimized-events-store';
import { useDashboardStore } from '../store/dashboardStore';
import { useMonitoringStore } from '../store/monitoringStore';
import { useInfrastructureStore } from '../store/infrastructureStore';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import MonitoringTools from '../components/dashboard/MonitoringTools';
import RecentEvents from '../components/dashboard/RecentEvents';
import InfrastructureStatus from '../components/dashboard/InfrastructureStatus';
import NodeMetrics from '../components/dashboard/NodeMetrics';
import IstioMetrics from '../components/dashboard/IstioMetrics';

// Main dashboard component
function DashboardContent() {
  const { 
    activeSection, 
    serverStats, 
    setActiveSection,
    refreshStats
  } = useDashboardStore();

  const { autoRefresh: monitoringAutoRefresh, refreshInterval: monitoringInterval } = useMonitoringStore();
  const { refreshEvents } = useEventsStore();
  const { autoRefresh: infraAutoRefresh, refreshInterval: infraInterval } = useInfrastructureStore();
  
  // Initialize monitoring data on component mount
  useEffect(() => {
    Promise.allSettled([
      refreshStats(),
      useMonitoringStore.getState().refreshAllTools(),
      useInfrastructureStore.getState().refreshAllItems(),
      useEventsStore.getState().refreshEvents()
    ]).catch(console.error);
  }, [refreshStats]);

  // Auto-refresh intervals
  useEffect(() => {
    if (monitoringAutoRefresh) {
      const interval = setInterval(() => {
        useMonitoringStore.getState().refreshAllTools();
      }, monitoringInterval);
      return () => clearInterval(interval);
    }
  }, [monitoringAutoRefresh, monitoringInterval]);

  useEffect(() => {
    if (infraAutoRefresh) {
      const interval = setInterval(() => {
        useInfrastructureStore.getState().refreshAllItems();
      }, infraInterval);
      return () => clearInterval(interval);
    }
  }, [infraAutoRefresh, infraInterval]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshEvents();
    }, 30000); // 30 seconds for events
    return () => clearInterval(interval);
  }, [refreshEvents]);

  // Refresh dashboard stats every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const handleToolClick = (toolId: string) => {
    console.log(`Opening ${toolId} tool...`);
  };

  const handleEventClick = (eventId: string) => {
    console.log(`Viewing event ${eventId}...`);
    // useEventsStore.getState().setSelectedEvent(eventId);
  };

  const handleInfraClick = (itemId: string) => {
    console.log(`Checking ${itemId} details...`);
    useInfrastructureStore.getState().setSelectedItem(itemId);
  };

  const handleNodeClick = (nodeName: string) => {
    console.log(`Viewing node ${nodeName} details...`);
  };

  const handleServiceClick = (serviceName: string, namespace: string) => {
    console.log(`Opening service ${serviceName} in namespace ${namespace}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar 
          activeItem={activeSection} 
          onItemClick={handleSidebarItemClick} 
        />

        <main className="flex-1 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Server Status"
              value={serverStats.serverStatus.status}
              valueColor={serverStats.serverStatus.status === 'Online' ? 'text-green-600 dark:text-green-400' : 
                        serverStats.serverStatus.status === 'Maintenance' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'}
              bgColor={serverStats.serverStatus.status === 'Online' ? 'bg-green-100 dark:bg-green-900/20' : 
                        serverStats.serverStatus.status === 'Maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20'}
              iconColor={serverStats.serverStatus.status === 'Online' ? 'text-green-600 dark:text-green-400' : 
                        serverStats.serverStatus.status === 'Maintenance' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              }
            />

            <StatsCard
              title="CPU Usage"
              value={`${serverStats.cpuUsage.value}${serverStats.cpuUsage.unit}`}
              valueColor={serverStats.cpuUsage.value > 80 ? 'text-red-600 dark:text-red-400' : 
                         serverStats.cpuUsage.value > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                         'text-foreground'}
              bgColor="bg-blue-100 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              }
            />

            <StatsCard
              title="Memory"
              value={`${serverStats.memoryUsage.used}/${serverStats.memoryUsage.total} ${serverStats.memoryUsage.unit}`}
              valueColor={serverStats.memoryUsage.used / serverStats.memoryUsage.total > 0.8 ? 'text-red-600 dark:text-red-400' : 
                         serverStats.memoryUsage.used / serverStats.memoryUsage.total > 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                         'text-foreground'}
              bgColor="bg-purple-100 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              }
            />

            <StatsCard
              title="Uptime"
              value={`${serverStats.uptime.value}${serverStats.uptime.unit}`}
              valueColor={serverStats.uptime.value < 95 ? 'text-red-600 dark:text-red-400' : 
                         serverStats.uptime.value < 99 ? 'text-yellow-600 dark:text-yellow-400' :
                         'text-green-600 dark:text-green-400'}
              bgColor="bg-orange-100 dark:bg-orange-900/20"
              iconColor="text-orange-600 dark:text-orange-400"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
          </div>

          {/* Monitoring Tools and Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonitoringTools onToolClick={handleToolClick} />
            <RecentEvents onEventClick={handleEventClick} />
          </div>

          {/* Node Metrics and Istio Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <NodeMetrics onNodeClick={handleNodeClick} />
            <IstioMetrics onServiceClick={handleServiceClick} />
          </div>

          {/* Infrastructure Status */}
          <InfrastructureStatus onItemClick={handleInfraClick} />
        </main>
      </div>
    </div>
  );
}

// Auth-protected dashboard page
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const authToken = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
      
      // 임시: 인증 체크 우회 (개발용)
      console.log('Auth token found:', authToken);
      if (authToken && authToken.split('=')[1]) {
        setIsAuthenticated(true);
      } else {
        // 임시로 인증된 것으로 처리 (개발용)
        console.log('No auth token found, but allowing access for development');
        setIsAuthenticated(true);
        // TODO: 운영 환경에서는 아래 라인 활성화
        // window.location.href = '/admin/dashboard/auth/login';
        // return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}