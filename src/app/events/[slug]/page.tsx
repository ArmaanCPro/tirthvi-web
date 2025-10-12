import { getEventBySlug, getAllEvents } from '@/lib/events';
import { EventDetail } from '@/components/event-detail';
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
  
  return <EventDetail event={event} />;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const event = await getEventBySlug(params.slug);

    if (!event) {
        return {
            title: 'Event Not Found',
            description: 'The event you are looking for does not exist.',
        };
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