import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Use basePath so Next.js handles all /admin/dashboard routing internally
  basePath: '/admin/dashboard',
  
  // Force new build ID to bypass cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'windeath44-admin',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGINS || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Redirect configuration
  async redirects() {
    return [
      // No redirects needed for external services
      // Services will be handled directly by the frontend
    ];
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image domains for external images
  images: {
    domains: [
      'localhost',
      'grafana.windeath44.local',
      'kiali.windeath44.local',
      'jaeger.windeath44.local',
      'argocd.windeath44.local',
    ],
  },
};

export default nextConfig;
