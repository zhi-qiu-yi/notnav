/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'notion.so',
      'www.notion.so',
      'prod-files-secure.s3.us-west-2.amazonaws.com',
      's3.us-west-2.amazonaws.com',
      'googleusercontent.com'
    ],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: false
  },
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
  env: {
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_CONFIG_DATABASE_ID: process.env.NOTION_CONFIG_DATABASE_ID,
  }
}

module.exports = nextConfig 