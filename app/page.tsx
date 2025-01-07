import { Suspense } from 'react';
import { getLinks, getDatabaseInfo, getConfig } from '@/lib/notion';
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

    // 对链接进行排序
    const sortedLinks = [...links].sort((a, b) => {
      // 确保 category 存在且不为空
      const catA = a?.category?.trim() || '';
      const catB = b?.category?.trim() || '';
      
      // 获取分类的排序值，如果没有配置则使用默认值 999
      const orderA = categoryOrder[catA] ?? 999;
      const orderB = categoryOrder[catB] ?? 999;

      // 首先按照分类排序值排序
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 如果分类排序值相同，则按照分类名称字母顺序排序
      return catA.localeCompare(catB);
    });

    return (
      <Navigation 
        links={sortedLinks} 
        icon={dbInfo.icon} 
        cover={dbInfo.cover}
      />
    );
  } catch (error) {
    console.error('Error in Home:', error);
    return <div>Error loading data</div>;
  }
} 