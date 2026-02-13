const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: '**', pathname: '/**' },
    ],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    // Optional peer: resolve @azuro-org/sdk-social-aa-connector to empty stub (social login disabled)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@azuro-org/sdk-social-aa-connector': path.resolve(__dirname, 'lib/sdk-social-aa-connector-stub.js'),
    };
    return config;
  },
};

module.exports = nextConfig;
