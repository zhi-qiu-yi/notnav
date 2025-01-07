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
}

module.exports = nextConfig 