import { getAllEvents } from '@/lib/events';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { withCacheHeaders, CACHE_STRATEGIES } from '@/lib/cache-headers';

// Cache the events for 1 hour (3600 seconds)
// You can adjust this based on how often you update events
const getCachedEvents = unstable_cache(
  async () => {
    console.log('Cache miss - fetching events from files');
    return await getAllEvents();
  },
  ['events'], // Cache key
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['events'], // Tag for manual cache invalidation
  }
);

export async function GET() {
  try {
    const events = await getCachedEvents();
    
    if (events.length === 0) {
      const response = NextResponse.json(
        { message: 'No events found', events: [] }, 
        { status: 200 }
      );
      return withCacheHeaders(response, ...Object.values(CACHE_STRATEGIES.EVENTS));
    }
    
    const response = NextResponse.json({ events, count: events.length });
    return withCacheHeaders(response, ...Object.values(CACHE_STRATEGIES.EVENTS));
  } catch (error) {
    console.error('API Error - getAllEvents:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
    return withCacheHeaders(response, ...Object.values(CACHE_STRATEGIES.API));
  }
}
