import { getEventBySlug } from '@/lib/events';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { withCacheHeaders, CACHE_STRATEGIES } from '@/lib/cache-headers';

// Cache individual events for 1 hour
const getCachedEvent = unstable_cache(
  async (slug: string) => {
    console.log(`Cache miss - fetching event: ${slug}`);
    return await getEventBySlug(slug);
  },
  ['event'], // Cache key prefix
  {
    revalidate: 3600,
    tags: ['events', 'event-detail'],
  }
);

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const event = await getCachedEvent(slug);
    
    if (!event) {
      const response = NextResponse.json({ error: 'Event not found' }, { status: 404 });
      return withCacheHeaders(response, 300, 3600, ['events', 'event-detail']); // 5 min cache for 404s
    }
    
    const response = NextResponse.json(event);
    return withCacheHeaders(response, CACHE_STRATEGIES.EVENTS.maxAge, CACHE_STRATEGIES.EVENTS.staleWhileRevalidate, CACHE_STRATEGIES.EVENTS.tags);
  } catch (error) {
    const { slug } = await params;
    console.error(`API Error - getEventBySlug(${slug}):`, error);
    const response = NextResponse.json(
      { error: 'Failed to fetch event', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
    return withCacheHeaders(response, CACHE_STRATEGIES.API.maxAge, CACHE_STRATEGIES.API.staleWhileRevalidate, CACHE_STRATEGIES.API.tags);
  }
}
