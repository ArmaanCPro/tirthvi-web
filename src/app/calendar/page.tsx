import { getAllEvents } from '@/lib/events';
import { CalendarView } from '@/components/calendar-view';
import { unstable_cache } from 'next/cache';

// Cache events for 1 hour with ISR
const getCachedEvents = unstable_cache(
  async () => {
    console.log('Cache miss - fetching events for calendar');
    return await getAllEvents();
  },
  ['calendar-events'],
  {
    revalidate: 3600, // 1 hour
    tags: ['events'],
  }
);

export default async function CalendarPage() {
  const events = await getCachedEvents();
  const currentYear = new Date().getFullYear().toString();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hindu Calendar</h1>
      <CalendarView events={events} defaultYear={currentYear} />
    </div>
  );
}

// Enable ISR - regenerate every hour
export const revalidate = 3600;
