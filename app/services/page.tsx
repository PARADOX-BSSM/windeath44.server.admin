'use client';

import React, { useState, useEffect } from 'react';

interface Service {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  ports: Array<{
    port: number;
    targetPort: number;
    protocol: string;
  }>;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, [selectedNamespace]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedNamespace === 'all' 
        ? '/admin/api/k8s/services' 
        : `/admin/api/k8s/services?namespace=${selectedNamespace}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data.services || []);
      } else {
        setError(data.error || 'Failed to fetch services');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchServices}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Kubernetes services in your cluster
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="namespace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Namespace
        </label>
        <select
          id="namespace"
          value={selectedNamespace}
          onChange={(e) => setSelectedNamespace(e.target.value)}
          className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Namespaces</option>
          <option value="default">default</option>
          <option value="monitoring">monitoring</option>
          <option value="istio-system">istio-system</option>
          <option value="argocd">argocd</option>
          <option value="ingress-nginx">ingress-nginx</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {services.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No services found
            </li>
          ) : (
            services.map((service, index) => (
              <li key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Namespace: {service.namespace}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Type: {service.type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      IP: {service.clusterIP}
                    </p>
                  </div>
                  <div className="ml-6">
                    {service.ports && service.ports.length > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Ports: {service.ports.map(p => `${p.port}:${p.targetPort}`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}