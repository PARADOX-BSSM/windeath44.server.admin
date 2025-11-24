import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for all routes and assets
  basePath: '/admin/dashboard',

  // Output configuration for Docker builds
  output: 'standalone',

  // Fix multiple lockfiles warning
  outputFileTracingRoot: __dirname,

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'windeath44-admin',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // Image domains for external images
  images: {
    domains: [
      'localhost',
      'img.freepik.com',
    ],
  },
};

export default nextConfig;
