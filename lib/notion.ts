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
}

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
}

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
            icon: iconUrl,
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