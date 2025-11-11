// Only import k8s client on server side to avoid browser compatibility issues
let k8s: typeof import('@kubernetes/client-node') | null = null;
let isK8sLoading = false;
let k8sLoadError: Error | null = null;

// Global flag to prevent spam logging across all instances
let hasLoggedGlobalMockWarning = false;

async function loadK8s() {
  if (typeof window === 'undefined' && !k8s && !isK8sLoading) {
    isK8sLoading = true;
    try {
      console.log('Attempting to load @kubernetes/client-node...');
      // Server-side only - use dynamic import for ESM compatibility
      k8s = await import('@kubernetes/client-node');
      console.log('Kubernetes client loaded successfully:', !!k8s);
    } catch (error) {
      k8sLoadError = error instanceof Error ? error : new Error('Failed to load k8s client');
      console.error('Failed to load Kubernetes client:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    } finally {
      isK8sLoading = false;
    }
  }
}

// Initialize k8s on server side
if (typeof window === 'undefined') {
  loadK8s();
}

export interface K8sServiceEndpoint {
  name: string;
  namespace: string;
  port: number;
  protocol: string;
  url: string;
}

export interface K8sClusterInfo {
  nodes: number;
  pods: number;
  services: number;
  deployments: number;
}

class KubernetesClient {
  private kc: import('@kubernetes/client-node').KubeConfig | null = null;
  private coreV1Api: import('@kubernetes/client-node').CoreV1Api | null = null;
  private appsV1Api: import('@kubernetes/client-node').AppsV1Api | null = null;
  private metricsApi: import('@kubernetes/client-node').Metrics | null = null;
  private isServerSide: boolean;
  private initialized: boolean = false;
  private initializationError: Error | null = null;
  private hasLoggedMockWarning: boolean = false;

  constructor() {
    this.isServerSide = typeof window === 'undefined';
    
    if (!this.isServerSide) {
      return;
    }
    
    // Defer initialization until k8s is loaded
    this.initializeWhenReady();
  }

  private async initializeWhenReady() {
    console.log('initializeWhenReady called');
    
    // Wait for k8s to load with proper retry logic
    let attempts = 0;
    while (!k8s && attempts < 100) {
      if (!isK8sLoading) {
        // Start loading if not already in progress
        await loadK8s();
      }
      
      if (!k8s) {
        console.log(`Waiting for k8s to load, attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
    }
    
    console.log('After loadK8s, k8s available:', !!k8s);
    if (!k8s) {
      console.log('k8s not available after retries, error:', k8sLoadError?.message || 'No specific error');
      this.initializationError = k8sLoadError || new Error('Kubernetes client failed to load after retries');
      return;
    }
    
    try {
      this.kc = new k8s.KubeConfig();
      
      // Load configuration based on environment
      // Check if running inside a Kubernetes cluster
      let hasServiceAccountToken = false;
      try {
        // Only check filesystem in server environment
        if (typeof window === 'undefined') {
          const fs = await import('fs');
          hasServiceAccountToken = fs.existsSync('/var/run/secrets/kubernetes.io/serviceaccount/token');
        }
      } catch (error) {
        console.warn('Failed to check service account token:', error);
      }
      
      const isInCluster = process.env.KUBERNETES_SERVICE_HOST || 
                         process.env.NODE_ENV === 'production' ||
                         hasServiceAccountToken;
      
      if (isInCluster) {
        // Running inside cluster
        console.log('Loading Kubernetes config from cluster');
        this.kc.loadFromCluster();
        console.log('Cluster config loaded successfully');
      } else {
        // Development environment
        console.log('Loading Kubernetes config from local kubeconfig');
        this.kc.loadFromDefault();
      }

      console.log('Creating API clients...');
      this.coreV1Api = this.kc.makeApiClient(k8s.CoreV1Api);
      console.log('CoreV1Api created');
      this.appsV1Api = this.kc.makeApiClient(k8s.AppsV1Api);
      console.log('AppsV1Api created');
      this.metricsApi = new k8s.Metrics(this.kc);
      console.log('Metrics API created');
      
      this.initialized = true;
      console.log('Kubernetes client initialized successfully');
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error('Failed to initialize Kubernetes client');
      console.error('Failed to initialize Kubernetes client:', error);
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    console.log('ensureInitialized called, initialized:', this.initialized, 'serverSide:', this.isServerSide);
    
    if (this.initialized) {
      return true;
    }
    
    if (!this.isServerSide) {
      console.log('Not server side, returning false');
      return false;
    }
    
    // Wait a bit for initialization if it's still in progress
    let attempts = 0;
    console.log('Waiting for initialization...');
    while (!this.initialized && !this.initializationError && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`Waiting for init, attempt ${attempts}, initialized: ${this.initialized}, error: ${!!this.initializationError}`);
      }
    }
    
    console.log('ensureInitialized finished, initialized:', this.initialized, 'error:', !!this.initializationError);
    return this.initialized;
  }

  async getServiceEndpoints(): Promise<K8sServiceEndpoint[]> {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return this.getMockEndpoints();
    }
    
    const endpoints: K8sServiceEndpoint[] = [];
    
    const serviceConfigs = [
      { name: 'grafana', namespace: 'monitoring', port: 3000 },
      { name: 'kiali', namespace: 'istio-system', port: 20001 },
      { name: 'jaeger-query', namespace: 'istio-system', port: 16686 },
      { name: 'argocd-server', namespace: 'argocd', port: 80 },
      { name: 'prometheus', namespace: 'monitoring', port: 9090 },
      { name: 'alertmanager', namespace: 'monitoring', port: 9093 },
    ];

    for (const config of serviceConfigs) {
      try {
        const service = await this.coreV1Api.readNamespacedService({
          name: config.name,
          namespace: config.namespace
        });
        
        if (service) {
          const url = `http://${config.name}.${config.namespace}.svc.cluster.local:${config.port}`;
          
          endpoints.push({
            name: config.name,
            namespace: config.namespace,
            port: config.port,
            protocol: 'http',
            url: url,
          });
        }
      } catch (error) {
        console.warn(`Service ${config.name} not found in namespace ${config.namespace}:`, error);
        // Add mock endpoint on error
        const serviceUrls = getServiceUrls();
        const serviceUrl = serviceUrls[config.name as keyof typeof serviceUrls];
        if (serviceUrl) {
          endpoints.push({
            name: config.name,
            namespace: config.namespace,
            port: config.port,
            protocol: 'http',
            url: serviceUrl,
          });
        }
      }
    }

    return endpoints;
  }
  
  private getMockEndpoints(): K8sServiceEndpoint[] {
    const serviceUrls = getServiceUrls();
    return [
      { name: 'grafana', namespace: 'monitoring', port: 3000, protocol: 'http', url: serviceUrls.grafana },
      { name: 'kiali', namespace: 'istio-system', port: 20001, protocol: 'http', url: serviceUrls.kiali },
      { name: 'jaeger-query', namespace: 'istio-system', port: 16686, protocol: 'http', url: serviceUrls.jaeger },
      { name: 'argocd-server', namespace: 'argocd', port: 80, protocol: 'http', url: serviceUrls.argocd },
      { name: 'prometheus', namespace: 'monitoring', port: 9090, protocol: 'http', url: serviceUrls.prometheus },
      { name: 'alertmanager', namespace: 'monitoring', port: 9093, protocol: 'http', url: serviceUrls.alertmanager },
    ];
  }

  async getClusterInfo(): Promise<K8sClusterInfo> {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api || !this.appsV1Api) {
      // Only log the warning once globally to prevent spam across all instances
      if (!hasLoggedGlobalMockWarning) {
        if (this.initializationError) {
          console.warn('Kubernetes client initialization failed:', this.initializationError.message);
        } else {
          console.warn('Kubernetes client not available - returning mock cluster info');
        }
        hasLoggedGlobalMockWarning = true;
      }
      return { nodes: 3, pods: 24, services: 12, deployments: 8 };
    }
    
    try {
      const [nodes, pods, services, deployments] = await Promise.all([
        this.coreV1Api.listNode(),
        this.coreV1Api.listPodForAllNamespaces(),
        this.coreV1Api.listServiceForAllNamespaces(),
        this.appsV1Api.listDeploymentForAllNamespaces(),
      ]);

      // Handle response structure from Kubernetes client
      // In newer versions, the response is direct
      const actualNodesData = nodes;
      const actualPodsData = pods;
      const actualServicesData = services;
      const actualDeploymentsData = deployments;

      return {
        nodes: actualNodesData?.items?.length || 0,
        pods: actualPodsData?.items?.filter((pod: { status?: { phase?: string } }) => pod.status?.phase === 'Running').length || 0,
        services: actualServicesData?.items?.length || 0,
        deployments: actualDeploymentsData?.items?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching cluster info:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { nodes: 0, pods: 0, services: 0, deployments: 0 };
    }
  }

  async getPodMetrics(namespace?: string) {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.metricsApi) {
      return null;
    }
    
    try {
      const metrics = namespace 
        ? await this.metricsApi.getPodMetrics(namespace)
        : await this.metricsApi.getPodMetrics();
      
      return metrics;
    } catch (error) {
      console.error('Error fetching pod metrics:', error);
      return null;
    }
  }

  async getNodeMetrics() {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.metricsApi) {
      return null;
    }
    
    try {
      const metrics = await this.metricsApi.getNodeMetrics();
      return metrics;
    } catch (error) {
      console.error('Error fetching node metrics:', error);
      return null;
    }
  }

  async checkServiceHealth(serviceName: string, namespace: string): Promise<boolean> {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return Math.random() > 0.2; // 80% healthy by default
    }
    
    if (!serviceName || !namespace) {
      console.error('checkServiceHealth called with invalid parameters:', { serviceName, namespace });
      return false;
    }
    
    try {
      // First try to get the service to see if it exists
      const service = await this.coreV1Api.readNamespacedService({
        name: serviceName,
        namespace: namespace
      });
      if (!service) {
        console.warn(`Service ${serviceName} not found in namespace ${namespace}`);
        return false;
      }
      
      // Then check endpoints
      const endpoints = await this.coreV1Api.readNamespacedEndpoints({
        name: serviceName,
        namespace: namespace
      });
      const endpointsData = endpoints;
      
      return endpointsData.subsets?.some((subset: { addresses?: unknown[] }) => 
        subset.addresses && subset.addresses.length > 0
      ) || false;
    } catch (error) {
      // Check if it's a "not found" error vs other errors
      if (error instanceof Error && error.message.includes('404')) {
        console.warn(`Service or endpoints not found: ${serviceName} in ${namespace}`);
      } else {
        console.warn(`Health check failed for ${serviceName}:`, error);
      }
      return false;
    }
  }

  async getNamespacedPods(namespace: string) {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return [];
    }
    
    try {
      const response = await this.coreV1Api.listNamespacedPod({
        namespace: namespace
      });
      return response.items;
    } catch (error) {
      console.error(`Error fetching pods in namespace ${namespace}:`, error);
      return [];
    }
  }

  async getNamespacedServices(namespace: string) {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return [];
    }
    
    try {
      const response = await this.coreV1Api.listNamespacedService({
        namespace: namespace
      });
      return response.items;
    } catch (error) {
      console.error(`Error fetching services in namespace ${namespace}:`, error);
      return [];
    }
  }

  async getNodes() {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return [];
    }
    
    try {
      const response = await this.coreV1Api.listNode();
      
      return response.items || [];
    } catch (error) {
      console.error('Error fetching nodes:', error);
      return [];
    }
  }

  async getVersion() {
    const isReady = await this.ensureInitialized();
    
    if (!isReady || !this.coreV1Api) {
      return { gitVersion: 'Unknown' };
    }
    
    try {
      // Get version from the Kubernetes API server
      if (!k8s) {
        throw new Error('Kubernetes client not loaded');
      }
      const versionApi = this.kc!.makeApiClient(k8s.VersionApi);
      const versionInfo = await versionApi.getCode();
      return versionInfo || { gitVersion: 'Unknown' };
    } catch (error) {
      console.error('Error fetching Kubernetes version:', error);
      // Fallback to getting cluster info
      try {
        const cluster = this.kc?.getCurrentCluster();
        if (cluster?.server) {
          return { 
            gitVersion: 'Unknown',
            serverUrl: cluster.server 
          };
        }
      } catch (fallbackError) {
        console.error('Fallback version check also failed:', fallbackError);
      }
      return { gitVersion: 'Unknown' };
    }
  }
}

// Singleton instance
export const k8sClient = new KubernetesClient();

// Environment-based service URLs
export const getServiceUrls = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return {
      grafana: process.env.GRAFANA_SERVICE_URL || 'http://grafana.monitoring.svc.cluster.local:3000',
      kiali: process.env.KIALI_SERVICE_URL || 'http://kiali.istio-system.svc.cluster.local:20001',
      jaeger: process.env.JAEGER_SERVICE_URL || 'http://jaeger-query.istio-system.svc.cluster.local:16686',
      argocd: process.env.ARGOCD_SERVICE_URL || 'http://argocd-server.argocd.svc.cluster.local:80',
      prometheus: process.env.PROMETHEUS_SERVICE_URL || 'http://prometheus.monitoring.svc.cluster.local:9090',
      alertmanager: process.env.ALERTMANAGER_SERVICE_URL || 'http://alertmanager.monitoring.svc.cluster.local:9093',
    };
  } else {
    // Development URLs (port-forwarded)
    return {
      grafana: 'http://localhost:3001',
      kiali: 'http://localhost:20001',
      jaeger: 'http://localhost:16686', 
      argocd: 'http://localhost:8080',
      prometheus: 'http://localhost:9090',
      alertmanager: 'http://localhost:9093',
    };
  }
};

export default k8sClient;