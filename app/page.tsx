import { Suspense } from 'react';
import { getLinks, getDatabaseInfo, getConfig } from '@/lib/notion';
import Navigation from './components/Navigation';
import Loading from './loading';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1小时重新验证

export default async function Home() {
  try {
    // 并行请求数据
    const [links, dbInfo, config] = await Promise.all([
      getLinks().catch(() => []),
      getDatabaseInfo().catch(() => ({ icon: undefined, cover: undefined })),
      getConfig().catch(() => [])
    ]);

    // 创建分类排序映射
    const categoryOrder = config.reduce<Record<string, number>>((acc, item) => {
      if (item.type === 'order') {
        acc[item.title] = item.value;
      }
      return acc;
    }, {});

    // 对链接进行排序
    const sortedLinks = [...links].sort((a, b) => {
      const catA = a.category.trim();
      const catB = b.category.trim();
      
      // 获取分类的排序值
      const orderA = categoryOrder[catA];
      const orderB = categoryOrder[catB];

      // 如果两个分类都有排序值
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      // 如果只有一个分类有排序值
      if (orderA !== undefined) return -1;  // A 有排序值，排在前面
      if (orderB !== undefined) return 1;   // B 有排序值，排在前面
      
      // 如果都没有排序值，按时间排序
      const timeA = new Date(a.created_time).getTime();
      const timeB = new Date(b.created_time).getTime();
      return timeA - timeB;
    });

    return (
      <Suspense fallback={<Loading />}>
        <main>
          <Navigation 
            links={sortedLinks} 
            icon={dbInfo.icon} 
            cover={dbInfo.cover} 
          />
        </main>
      </Suspense>
    );
  } catch (error) {
    console.error('❌ 错误:', error);
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">加载失败</h1>
          <p className="text-gray-600">请检查环境变量配置是否正确</p>
        </div>
      </main>
    );
  }
} 