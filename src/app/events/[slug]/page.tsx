import { getEventBySlug, getAllEvents } from '@/lib/events';
import { EventDetail } from '@/components/event-detail';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: {
    slug: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  
  if (!event) {
    notFound();
  }
  
  return <EventDetail event={event} />;
}

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map(event => ({
    slug: event.slug,
  }));
}
