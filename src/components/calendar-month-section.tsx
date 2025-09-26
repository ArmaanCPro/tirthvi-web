'use client';

import { Event } from '@/lib/events';
import { EventCard } from './event-card';
import { EventListSkeleton } from './event-card-skeleton';
import { Suspense } from 'react';

interface CalendarMonthSectionProps {
  month: string;
  events: Event[];
  year: string;
}

function MonthEvents({ events, year }: { events: Event[]; year: string }) {
  if (events.length === 0) return null;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <EventCard key={event.id} event={event} year={year} />
      ))}
    </div>
  );
}

export function CalendarMonthSection({ month, events, year }: CalendarMonthSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{month}</h2>
      <Suspense fallback={<EventListSkeleton count={events.length || 3} />}>
        <MonthEvents events={events} year={year} />
      </Suspense>
    </div>
  );
}
