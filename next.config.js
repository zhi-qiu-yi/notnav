/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出独立应用
  output: 'standalone',
  
  // 图片优化
  images: {
    domains: [
      'notion.so',
      'www.notion.so',
      'prod-files-secure.s3.us-west-2.amazonaws.com',
      's3.us-west-2.amazonaws.com',
    ],
    minimumCacheTTL: 60,
  },
  
  // 生产环境优化
  swcMinify: true,
  
  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 禁用 X-Powered-By 头
  poweredByHeader: false,

  // 禁用 punycode 警告
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 