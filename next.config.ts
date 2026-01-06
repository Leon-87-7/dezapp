import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // Your Next.js config options here
  turbopack: {
    root: process.cwd(),
  },
};

// Wrap with Sentry
export default withSentryConfig(nextConfig, {
  // Sentry options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress logs during build
  silent: true,

  // Upload source maps for better error tracking
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger
  disableLogger: true,
});
