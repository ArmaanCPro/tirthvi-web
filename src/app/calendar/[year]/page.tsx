import { getEventsForYear } from '@/lib/events';
import { CalendarView } from '@/components/calendar-view';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

interface CalendarYearPageProps {
  params: {
    year: string;
  };
}

// Cache events by year for 1 hour
const getCachedEventsForYear = unstable_cache(
  async (year: string) => {
    console.log(`Cache miss - fetching events for year: ${year}`);
    return await getEventsForYear(year);
  },
  ['events-by-year'],
  {
    revalidate: 3600,
    tags: ['events', 'events-by-year'],
  }
);

export default async function CalendarYearPage({ params }: CalendarYearPageProps) {
  const { year } = await params;
  const events = await getCachedEventsForYear(year);
  
  if (events.length === 0) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hindu Calendar - {year}</h1>
      <CalendarView events={events} defaultYear={year} />
    </div>
  );
}

// Enable ISR - regenerate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  // Generate static params for the next 10 years
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { year: year.toString() };
  });
  
  return years;
}
