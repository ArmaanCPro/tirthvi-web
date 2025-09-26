import { getEventBySlug } from '@/lib/events';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

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

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const event = await getCachedEvent(slug);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    const { slug } = await params;
    console.error(`API Error - getEventBySlug(${slug}):`, error);
    return NextResponse.json(
      { error: 'Failed to fetch event', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
