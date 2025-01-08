import { cache } from './cache';
import { Client } from '@notionhq/client';
import { DatabaseObjectResponse, GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  timeoutMs: 30000,
});

// 简化 Link 接口
export interface Link {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  lanlink: string;
  createdTime: string;
}

// 数据库信息接口
interface DatabaseInfo {
  icon?: string;
  cover?: string;
  title: string;
}

// 配置类型
interface CategoryOrder {
  [key: string]: number;
}

// 获取分类排序配置
async function getCategoryOrder(): Promise<CategoryOrder> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_CONFIG_DATABASE_ID!,
      filter: {
        property: 'type',
        select: {
          equals: 'order'
        }
      }
    });

    return response.results.reduce((acc: CategoryOrder, item: any) => {
      const title = item.properties.title?.title[0]?.plain_text;
      const value = item.properties.value?.number;
      if (title && typeof value === 'number') {
        acc[title] = value;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching category order:', error);
    return {};
  }
}

// 获取链接（带缓存）
export async function getLinks(): Promise<Link[]> {
  const cacheKey = 'links';
  const cachedData = cache.get<Link[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const [response, categoryOrder] = await Promise.all([
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
      }),
      getCategoryOrder()
    ]);

    const links = response.results.map((item: any) => ({
      id: item.id,
      title: item.properties.title?.title[0]?.plain_text || '',
      description: item.properties.desp?.rich_text[0]?.plain_text || '',
      category: item.properties.cat?.select?.name || '未分类',
      icon: item.properties.icon?.files[0]?.file?.url || item.properties.icon?.files[0]?.external?.url || '',
      link: item.properties.link?.url || '',
      lanlink: item.properties.lanlink?.url || '',
      createdTime: item.created_time
    }));

    const sortedLinks = links.sort((a, b) => {
      const orderA = categoryOrder[a.category] ?? 999;
      const orderB = categoryOrder[b.category] ?? 999;
      
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title, 'zh-CN');
    });

    cache.set(cacheKey, sortedLinks);
    return sortedLinks;
  } catch (error) {
    console.error('Error in getLinks:', error);
    throw error;
  }
}

// 获取数据库信息（带缓存）
export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const cacheKey = 'database_info';
  const cachedData = cache.get<DatabaseInfo>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID!,
    }) as DatabaseObjectResponse;

    const dbInfo = {
      title: response.title?.[0]?.plain_text || 'Notion Nav',
      icon: getIconUrl(response),
      cover: getCoverUrl(response),
    };

    cache.set(cacheKey, dbInfo);
    return dbInfo;
  } catch (error) {
    console.error('Error in getDatabaseInfo:', error);
    return { title: 'Notion Nav' };
  }
}

// 辅助函数：获取图标 URL
function getIconUrl(response: DatabaseObjectResponse): string | undefined {
  if (!response.icon) return undefined;
  
  const icon = response.icon as any;
  if (icon.type === 'external') {
    return icon.external.url;
  } else if (icon.type === 'file') {
    return icon.file.url;
  }
  return undefined;
}

// 辅助函数：获取封面 URL
function getCoverUrl(response: DatabaseObjectResponse): string | undefined {
  if (!response.cover) return undefined;
  
  const cover = response.cover as any;
  if (cover.type === 'external') {
    return cover.external.url;
  } else if (cover.type === 'file') {
    return cover.file.url;
  }
  return undefined;
} 