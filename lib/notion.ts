import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
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

// 配置类型
interface SortConfig {
  type: 'order';
  value: number;
}

// 获取配置
async function getConfig(): Promise<Record<string, number>> {
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

    return response.results.reduce((acc: Record<string, number>, item: any) => {
      const title = item.properties.title?.title[0]?.plain_text;
      const value = item.properties.value?.number;
      if (title && typeof value === 'number') {
        acc[title] = value;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error in getConfig:', error);
    return {};
  }
}

// 获取链接
export async function getLinks(): Promise<Link[]> {
  try {
    const [response, configs] = await Promise.all([
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
      }),
      getConfig()
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

    // 按配置排序
    return links.sort((a, b) => {
      // 首先按分类排序（使用配置的顺序）
      const orderA = configs[a.category] ?? 999;
      const orderB = configs[b.category] ?? 999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // 同一分类内按标题排序
      return a.title.localeCompare(b.title);
    });

  } catch (error) {
    console.error('Error in getLinks:', error);
    throw error;
  }
}

// 数据库信息接口
interface DatabaseInfo {
  icon: string | undefined;
  cover: string | undefined;
  title: string;
}

// 获取数据库信息
export const getDatabaseInfo = unstable_cache(
  async (): Promise<DatabaseInfo> => {
    try {
      const response = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID!,
      });

      return {
        icon: response.icon?.type === 'external' ? response.icon.external.url : 
              response.icon?.type === 'file' ? response.icon.file.url : undefined,
        cover: response.cover?.type === 'external' ? response.cover.external.url :
               response.cover?.type === 'file' ? response.cover.file.url : undefined,
        title: response.title.map(item => item.plain_text).join(' ').trim() || 'Notion 导航站',
      };
    } catch (error) {
      console.error('Error fetching database info:', error);
      return {
        icon: undefined,
        cover: undefined,
        title: 'Notion 导航站',
      };
    }
  },
  ['database-info'],
  { revalidate: parseInt(process.env.REVALIDATE_INTERVAL || '3600', 10) }
); 