import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized images and fonts
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Image optimization configuration
  images: {
    // Allow images from your domain and common image hosts
    domains: ['localhost', 'your-domain.com'],
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Cache images for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables that should be available on client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Build optimization
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/dashboard/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Webpack configuration for better bundling
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Build output configuration
  output: 'standalone',
  
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable SWC minifier for faster builds
  swcMinify: true,

  // PoweredBy header removal for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    // Faster refresh in development
    webpack: (config, { dev }) => {
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;