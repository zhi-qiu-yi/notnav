import { NextResponse } from 'next/server';
import { cache } from '@/src/lib/cache';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 清除本地缓存
    cache.clear();
    
    return NextResponse.json({
      cleared: true,
      message: 'Local cache cleared successfully',
      now: Date.now()
    });
  } catch (err) {
    return NextResponse.json({
      cleared: false,
      message: 'Error clearing cache'
    }, { status: 500 });
  }
}
