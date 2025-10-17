import { getEventBySlug, getAllEvents } from '@/lib/events';
import { EventDetail } from '@/components/event-detail';
import { StructuredData } from '@/components/structured-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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
  
  return (
    <>
      <StructuredData type="event" data={event} />
      <EventDetail event={event} />
    </>
  );
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    return {
        title: event.name,
        description: event.description,
        alternates: {
            canonical: `/events/${event.slug}`,
        },
        openGraph: {
            title: event.name,
            description: event.description,
            type: 'article',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`,
            images: [ event.image ],
        },
        twitter: {
            card: 'summary_large_image',
            title: event.name,
            description: event.description,
            images: [ event.image ],
        }
    }
}

// Static generation - pages are built at build time with fresh data
export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map(event => ({
    slug: event.slug,
  }));
}