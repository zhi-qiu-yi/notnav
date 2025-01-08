const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 压缩输出
  compress: true,
  
  // 图片优化
  images: {
    domains: [
      'notion.so',
      'www.notion.so',
      'prod-files-secure.s3.us-west-2.amazonaws.com',
      's3.us-west-2.amazonaws.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
  swcMinify: true,
  
  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
  },
  
  // 缓存优化
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // 禁用 X-Powered-By 头
  poweredByHeader: false,
  
  // webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 优化构建
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      },
    };

    if (!dev && !isServer) {
      // 生产环境优化
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      };
    }

    return config;
  },
}

module.exports = nextConfig 