import { Suspense } from 'react';
import { getLinks, getDatabaseInfo, getConfig, Link, NotionLink } from '@/lib/notion';
import Navigation from './components/Navigation';
import Loading from './loading';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1小时重新验证

export default async function Home() {
  try {
    const [links, configs, dbInfo] = await Promise.all([
      getLinks(),
      getConfig(),
      getDatabaseInfo(),
    ]);

    // 创建分类排序映射
    const categoryOrder = configs.reduce((acc, config) => {
      if (config.type === 'order') {
        acc[config.title] = config.value;
      }
      return acc;
    }, {} as Record<string, number>);

    // 确保 links 是非空数组
    const validLinks = links.filter((link): link is NotionLink & Link => 
      link !== null && 
      typeof link.category === 'string' &&
      typeof link.title === 'string'
    );

    // 对链接进行排序
    const sortedLinks = [...validLinks].sort((a, b) => {
      const catA = a.category.trim();
      const catB = b.category.trim();
      
      const orderA = categoryOrder[catA] ?? 999;
      const orderB = categoryOrder[catB] ?? 999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return catA.localeCompare(catB);
    });

    return (
      <Navigation 
        links={sortedLinks} 
        icon={dbInfo.icon} 
        cover={dbInfo.cover}
        title={dbInfo.title}
      />
    );
  } catch (error) {
    console.error('Error in Home:', error);
    return <div>Error loading data</div>;
  }
} 