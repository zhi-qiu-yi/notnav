import { Client } from '@notionhq/client';
import { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

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

// 获取数据库信息
export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  try {
    const response = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID!,
    });

    // 处理标题
    const titleProperty = Object.values(response.properties).find(
      (prop: any) => prop.type === 'title'
    );
    const title = titleProperty?.name || 'Notion Nav';

    return {
      title,
      icon: getIconUrl(response),
      cover: getCoverUrl(response),
    };
  } catch (error) {
    console.error('Error in getDatabaseInfo:', error);
    return {
      title: 'Notion Nav',
    };
  }
}

// 辅助函数：获取图标 URL
function getIconUrl(response: GetDatabaseResponse): string | undefined {
  if (!response.icon) return undefined;
  
  if ('type' in response.icon) {
    if (response.icon.type === 'external') {
      return response.icon.external.url;
    } else if (response.icon.type === 'file') {
      return response.icon.file.url;
    }
  }
  return undefined;
}

// 辅助函数：获取封面 URL
function getCoverUrl(response: GetDatabaseResponse): string | undefined {
  if (!response.cover) return undefined;
  
  if ('type' in response.cover) {
    if (response.cover.type === 'external') {
      return response.cover.external.url;
    } else if (response.cover.type === 'file') {
      return response.cover.file.url;
    }
  }
  return undefined;
}

// 获取链接
export async function getLinks(): Promise<Link[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    });

    return response.results.map((item: any) => ({
      id: item.id,
      title: item.properties.title?.title[0]?.plain_text || '',
      description: item.properties.desp?.rich_text[0]?.plain_text || '',
      category: item.properties.cat?.select?.name || '未分类',
      icon: item.properties.icon?.files[0]?.file?.url || item.properties.icon?.files[0]?.external?.url || '',
      link: item.properties.link?.url || '',
      lanlink: item.properties.lanlink?.url || '',
      createdTime: item.created_time
    }));

  } catch (error) {
    console.error('Error in getLinks:', error);
    throw error;
  }
} 