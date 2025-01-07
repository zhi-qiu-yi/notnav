import { Client } from '@notionhq/client';
import { 
  PageObjectResponse,
  DatabaseObjectResponse,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints';

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
  created_time: string;
}

interface NotionConfigProperties {
  type: {
    type: "select";
    select: { name: string } | null;
  };
  title: {
    type: "title";
    title: Array<{ plain_text: string }>;
  };
  value: {
    type: "number";
    number: number | null;
  };
}

// 配置项类型
interface ConfigItem {
  type: 'order' | 'url_order';
  title: string;
  value: number;  // 对于 order 类型，这是排序值
}

// 获取配置信息
export async function getConfig(): Promise<ConfigItem[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_CONFIG_DATABASE_ID!,
      filter: {
        property: "type",
        select: {
          equals: "order"
        }
      },
      sorts: [
        {
          property: "value",
          direction: "ascending"
        }
      ]
    }) as QueryDatabaseResponse;

    const configs = response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map((page: PageObjectResponse) => {
        const properties = page.properties as NotionConfigProperties;
        
        const type = properties.type?.select?.name;
        const title = properties.title?.title?.[0]?.plain_text;
        const value = properties.value?.number;

        if (!type || !title) {
          return null;
        }

        return {
          type: type as 'order' | 'url_order',
          title: title.trim(),
          value: value ?? 999
        };
      })
      .filter((item): item is ConfigItem => item !== null);

    return configs;
  } catch (error) {
    console.error('Error fetching config:', error);
    return [];
  }
}

// 添加重试函数
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

// 修改 getLinks 函数
export async function getLinks(): Promise<Link[]> {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not configured');
  }

  try {
    const response = await retryOperation(() => 
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        sorts: [
          { timestamp: "created_time", direction: "ascending" }
        ]
      })
    ) as QueryDatabaseResponse;

    const links = response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map((page: PageObjectResponse) => {
        try {
          const properties = page.properties as any;

          return {
            id: page.id,
            title: properties.title?.title?.[0]?.plain_text || '',
            description: properties.desp?.rich_text?.[0]?.plain_text || '',
            category: properties.cat?.select?.name || '',
            icon: properties.icon?.files?.[0]?.file?.url || 
                  properties.icon?.files?.[0]?.external?.url || '',
            link: properties.link?.url || '',
            created_time: page.created_time,
          };
        } catch (error) {
          console.error('Error processing page:', error);
          return null;
        }
      })
      .filter((link): link is Link => link !== null);

    return links;
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

interface DatabaseInfo {
  icon: string | undefined;
  cover: string | undefined;
}

export async function getDatabaseInfo(): Promise<DatabaseInfo> {
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
} 