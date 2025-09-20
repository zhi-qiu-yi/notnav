import { NextResponse } from 'next/server';
import { getLinks } from '@/src/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await getLinks();
    
    return NextResponse.json({
      success: true,
      links,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch links'
    }, { status: 500 });
  }
}
