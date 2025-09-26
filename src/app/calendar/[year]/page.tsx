import { getEventsForYear } from '@/lib/events';
import { CalendarView } from '@/components/calendar-view';
import { notFound } from 'next/navigation';

interface CalendarYearPageProps {
  params: {
    year: string;
  };
}

export default async function CalendarYearPage({ params }: CalendarYearPageProps) {
  const { year } = await params;
  const events = await getEventsForYear(year);
  
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

// Static generation - pages are built at build time with fresh data
export async function generateStaticParams() {
  // Generate static params for the next 10 years
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { year: year.toString() };
  });
  
  return years;
}