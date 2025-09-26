import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Invalidate all event-related caches
    revalidateTag('events');
    revalidateTag('event-detail');
    revalidateTag('events-by-year');
    
    return NextResponse.json({ 
      message: 'Cache invalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' }, 
      { status: 500 }
    );
  }
}
