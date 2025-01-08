import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

export async function POST(request: Request) {
  try {
    const { sourceId, targetId, sourceIndex, targetIndex, category } = await request.json();

    // 获取配置数据库中的排序规则
    const configResponse = await notion.databases.query({
      database_id: process.env.NOTION_CONFIG_DATABASE_ID!,
      filter: {
        and: [
          {
            property: 'type',
            select: {
              equals: 'url_order'
            }
          },
          {
            property: 'title',
            title: {
              equals: category
            }
          }
        ]
      }
    });

    // 如果是按时间排序的分类，不允许手动排序
    if (configResponse.results.length > 0) {
      return NextResponse.json(
        { error: 'Cannot reorder time-based category' },
        { status: 400 }
      );
    }

    // 获取同分类的所有项目
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'cat',
        select: {
          equals: category
        }
      },
      sorts: [
        {
          property: 'order',
          direction: 'ascending'
        }
      ]
    });

    // 计算新的排序值
    const items = response.results;
    const newOrder = items.map((item: any) => {
      const currentOrder = item.properties.order?.number || 0;
      if (sourceIndex < targetIndex) {
        if (currentOrder > sourceIndex && currentOrder <= targetIndex) {
          return currentOrder - 1;
        }
      } else {
        if (currentOrder >= targetIndex && currentOrder < sourceIndex) {
          return currentOrder + 1;
        }
      }
      return currentOrder;
    });

    // 更新排序
    await Promise.all([
      // 更新源项目
      notion.pages.update({
        page_id: sourceId,
        properties: {
          order: {
            number: targetIndex
          }
        }
      }),
      // 更新其他受影响的项目
      ...items.map((item: any, index: number) => {
        if (newOrder[index] !== item.properties.order?.number) {
          return notion.pages.update({
            page_id: item.id,
            properties: {
              order: {
                number: newOrder[index]
              }
            }
          });
        }
        return Promise.resolve();
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering items:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
} 