import { NextRequest, NextResponse } from 'next/server';
import { safetyGuard } from '@/lib/safety';

export async function GET(request: NextRequest) {
  try {
    const report = safetyGuard.generateSafetyReport();
    
    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Safety analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch safety analytics',
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
      safetyGuard.resetMetrics();
      return NextResponse.json({
        success: true,
        message: 'Safety metrics reset successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Safety reset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset safety metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
