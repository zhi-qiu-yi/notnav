import { Client } from '@notionhq/client';
import { 
  PageObjectResponse,
  DatabaseObjectResponse,
  QueryDatabaseResponse,
  SelectPropertyItemObjectResponse,
  TitlePropertyItemObjectResponse,
  NumberPropertyItemObjectResponse,
  RichTextItemResponse,
  FilesPropertyItemObjectResponse
} from '@notionhq/client/build/src/api-endpoints';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export interface Link {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  lanlink: string;
  created_time: string;
}

export type NotionLink = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  lanlink: string;
  created_time: string;
} | null;

interface NotionConfigProperties {
  type: SelectPropertyItemObjectResponse;
  title: TitlePropertyItemObjectResponse;
  value: NumberPropertyItemObjectResponse;
}

interface ConfigItem {
  type: 'order' | 'url_order';
  title: string;
  value: number;
}

interface NotionLinkProperties {
  title: TitlePropertyItemObjectResponse;
  desp: {
    type: "rich_text";
    rich_text: RichTextItemResponse[];
  };
  cat: SelectPropertyItemObjectResponse;
  icon: FilesPropertyItemObjectResponse;
  link: {
    type: "url";
    url: string | null;
  };
  lanlink: {
    type: "url";
    url: string | null;
  };
}

// 缓存时间（默认1小时）
const REVALIDATE_INTERVAL = parseInt(process.env.REVALIDATE_INTERVAL || '3600', 10);

// 缓存 getLinks 函数
export const getLinks = unstable_cache(
  async () => {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID is not configured');
    }

    try {
      const response = await retryOperation(() => 
        notion.databases.query({
          database_id: process.env.NOTION_DATABASE_ID!,
          sorts: [{ timestamp: "created_time", direction: "ascending" }],
          page_size: 100 // 限制返回数量
        })
      ) as QueryDatabaseResponse;

      return response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page: PageObjectResponse) => {
          try {
            const properties = page.properties as unknown as NotionLinkProperties;

            const fileUrl = properties.icon?.files?.[0];
            const iconUrl = fileUrl?.type === 'file' ? fileUrl.file.url :
                           fileUrl?.type === 'external' ? fileUrl.external.url : '';

            const titleProperty = properties.title?.title;
            const title = Array.isArray(titleProperty) && titleProperty.length > 0 
              ? titleProperty[0].plain_text 
              : '';

            const richTextProperty = properties.desp?.rich_text;
            const description = Array.isArray(richTextProperty) && richTextProperty.length > 0
              ? richTextProperty[0].plain_text
              : '';

            return {
              id: page.id,
              title,
              description,
              category: properties.cat?.select?.name || '',
              icon: iconUrl || '',
              link: properties.link?.url || '',
              lanlink: properties.lanlink?.url || '',
              created_time: page.created_time,
            };
          } catch (error) {
            console.error('Error processing page:', error);
            return null;
          }
        })
        .filter((link): link is Link => link !== null);
    } catch (error) {
      console.error('Error fetching links:', error);
      return [];
    }
  },
  ['links'],
  { revalidate: REVALIDATE_INTERVAL }
);

// 缓存 getConfig 函数
export const getConfig = unstable_cache(
  async () => {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_CONFIG_DATABASE_ID!,
        filter: {
          property: "type",
          select: { equals: "order" }
        },
        page_size: 50 // 限制返回数量
      }) as QueryDatabaseResponse;

      const configs = response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page: PageObjectResponse) => {
          try {
            const properties = page.properties as unknown as NotionConfigProperties;
            
            const type = properties.type?.select?.name;
            const titleProperty = properties.title?.title;
            const title = Array.isArray(titleProperty) && titleProperty.length > 0 
              ? titleProperty[0].plain_text 
              : undefined;
            const value = properties.value?.number;

            if (!type || !title) {
              return null;
            }

            return {
              type: type as 'order' | 'url_order',
              title: title.trim(),
              value: value ?? 999
            };
          } catch (error) {
            console.error('Error processing config:', error);
            return null;
          }
        })
        .filter((item): item is ConfigItem => item !== null);

      return configs;
    } catch (error) {
      console.error('Error fetching config:', error);
      return [];
    }
  },
  ['config'],
  { revalidate: REVALIDATE_INTERVAL }
);

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

interface DatabaseInfo {
  icon: string | undefined;
  cover: string | undefined;
}

// 缓存 getDatabaseInfo 函数
export const getDatabaseInfo = unstable_cache(
  async () => {
    try {
      const response = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID!,
      });
      
      const database = response as DatabaseObjectResponse;
      
      return {
        icon: database.icon?.type === 'external' ? database.icon.external.url : 
              database.icon?.type === 'file' ? database.icon.file.url : undefined,
        cover: database.cover?.type === 'external' ? database.cover.external.url :
               database.cover?.type === 'file' ? database.cover.file.url : undefined
      };
    } catch (error) {
      console.error('Error fetching database info:', error);
      return {
        icon: undefined,
        cover: undefined
      };
    }
  },
  ['database-info'],
  { revalidate: REVALIDATE_INTERVAL }
); 