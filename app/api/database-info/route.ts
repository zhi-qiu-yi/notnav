import { NextResponse } from 'next/server';
import { getDatabaseInfo } from '@/src/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const databaseInfo = await getDatabaseInfo();
    
    return NextResponse.json({
      success: true,
      databaseInfo,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching database info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch database info'
    }, { status: 500 });
  }
}
