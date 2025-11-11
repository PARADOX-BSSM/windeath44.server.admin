import React, { useEffect, useState } from 'react';

interface IstioService {
  name: string;
  namespace: string;
  requestRate: number;
  errorRate: number;
  p99Latency: number;
  successRate: number;
  version: string;
  uptime: string;
}

interface IstioGateway {
  name: string;
  namespace: string;
  hosts: string[];
  status: 'Active' | 'Error' | 'Warning';
  connections: number;
}

interface IstioMetricsProps {
  onServiceClick?: (serviceName: string, namespace: string) => void;
}

export default function IstioMetrics({ onServiceClick }: IstioMetricsProps) {
  const [services, setServices] = useState<IstioService[]>([]);
  const [gateways, setGateways] = useState<IstioGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIstioMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for Istio metrics
      setServices([
        {
          name: 'admin',
          namespace: 'admin',
          requestRate: 45.2,
          errorRate: 0.1,
          p99Latency: 125,
          successRate: 99.9,
          version: 'prod-arm64',
          uptime: '2d 3h'
        },
        {
          name: 'auth',
          namespace: 'auth',
          requestRate: 12.8,
          errorRate: 2.3,
          p99Latency: 89,
          successRate: 97.7,
          version: 'v1.2.0',
          uptime: '5d 12h'
        },
        {
          name: 'memorial',
          namespace: 'memorial',
          requestRate: 23.1,
          errorRate: 0.05,
          p99Latency: 67,
          successRate: 99.95,
          version: 'v2.1.3',
          uptime: '1d 8h'
        },
        {
          name: 'prometheus-grafana',
          namespace: 'monitoring',
          requestRate: 8.7,
          errorRate: 0.0,
          p99Latency: 234,
          successRate: 100.0,
          version: 'v10.2.0',
          uptime: '7d 2h'
        }
      ]);

      setGateways([
        {
          name: 'gateway',
          namespace: 'istio-ingress',
          hosts: ['prod.windeath44.wiki', '*.windeath44.wiki'],
          status: 'Active',
          connections: 1250
        },
        {
          name: 'admin-gateway',
          namespace: 'istio-ingress',
          hosts: ['admin.windeath44.wiki'],
          status: 'Active',
          connections: 89
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching Istio metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIstioMetrics();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchIstioMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Error':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99.5) return 'text-green-600 dark:text-green-400';
    if (rate >= 99.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 100) return 'text-green-600 dark:text-green-400';
    if (latency <= 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Mesh Overview */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Istio Service Mesh</h3>
          <button
            onClick={fetchIstioMetrics}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        {/* Services */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-foreground mb-3">Services</h4>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={`${service.namespace}-${service.name}`}
                onClick={() => onServiceClick?.(service.name, service.namespace)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {service.namespace}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                      {service.version}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {service.uptime}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">RPS</div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {service.requestRate}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Success Rate</div>
                    <div className={`font-medium ${getSuccessRateColor(service.successRate)}`}>
                      {service.successRate.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">P99 Latency</div>
                    <div className={`font-medium ${getLatencyColor(service.p99Latency)}`}>
                      {service.p99Latency}ms
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Error Rate</div>
                    <div className={`font-medium ${service.errorRate > 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {service.errorRate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gateways */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-3">Gateways</h4>
          <div className="space-y-3">
            {gateways.map((gateway) => (
              <div
                key={`${gateway.namespace}-${gateway.name}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{gateway.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {gateway.namespace}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gateway.status)}`}>
                      {gateway.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {gateway.connections} connections
                  </span>
                </div>
                
                <div className="text-sm">
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Hosts</div>
                  <div className="flex gap-2 flex-wrap">
                    {gateway.hosts.map((host, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {host}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}