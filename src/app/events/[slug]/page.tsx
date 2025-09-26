import { getEventBySlug, getAllEvents } from '@/lib/events';
import { EventDetail } from '@/components/event-detail';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

interface EventPageProps {
  params: {
    slug: string;
  };
}

// Cache individual events for 1 hour
const getCachedEvent = unstable_cache(
  async (slug: string) => {
    console.log(`Cache miss - fetching event: ${slug}`);
    return await getEventBySlug(slug);
  },
  ['event-detail'],
  {
    revalidate: 3600,
    tags: ['events', 'event-detail'],
  }
);

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getCachedEvent(slug);
  
  if (!event) {
    notFound();
  }
  
  return <EventDetail event={event} />;
}

// Enable ISR - regenerate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map(event => ({
    slug: event.slug,
  }));
}
