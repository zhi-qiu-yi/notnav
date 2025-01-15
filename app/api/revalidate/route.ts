import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 重新验证所有路径
    revalidatePath('/', 'layout');
    
    return NextResponse.json({
      revalidated: true,
      now: Date.now()
    });
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      message: 'Error revalidating'
    }, { status: 500 });
  }
} 