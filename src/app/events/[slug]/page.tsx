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

// Simple revalidation - once per hour
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map(event => ({
    slug: event.slug,
  }));
}