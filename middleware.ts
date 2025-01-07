import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 静态资源缓存
  if (request.url.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // API 路由缓存
  if (request.url.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  // 其他路由
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 