import { getAllEvents } from '@/lib/events';
import { CalendarView } from '@/components/calendar-view';

export default async function CalendarPage() {
  const events = await getAllEvents();
  const currentYear = new Date().getFullYear().toString();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Events Calendar</h1>
      <CalendarView events={events} defaultYear={currentYear} />
    </div>
  );
}

// Static generation - page is built at build time with fresh data