import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// 强制使用动态路由
export const dynamic = 'force-dynamic';
// 跳过 body 解析
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // 重新验证首页
    revalidatePath('/', 'layout');  // 添加 'layout' 参数

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: 'Revalidation successful'
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({
      revalidated: false,
      error: err,
      message: 'Revalidation failed'
    });
  }
} 