import { Suspense } from 'react';
import { getLinks, getDatabaseInfo } from '@/lib/notion';
import Navigation from './components/Navigation';
import Loading from './loading';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1小时重新验证

export default async function Home() {
  try {
    const [links, dbInfo] = await Promise.all([
      getLinks(),
      getDatabaseInfo(),
    ]);

    return (
      <Navigation 
        links={links} 
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