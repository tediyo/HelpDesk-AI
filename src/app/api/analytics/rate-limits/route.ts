import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    const analytics = rateLimiter.getAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate limit analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch rate limit analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'reset') {
      rateLimiter.resetStats();
      return NextResponse.json({
        success: true,
        message: 'Rate limit statistics reset successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Rate limit reset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset rate limit statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
