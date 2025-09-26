'use client';

import { useState } from 'react';
import { Event } from '@/lib/events';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatEventDate } from '@/lib/calendar';
import Link from 'next/link';
import Image from 'next/image';

interface CalendarViewProps {
  events: Event[];
  defaultYear: string;
}

interface EventCardProps {
  event: Event;
  year: string;
}

function EventCard({ event, year }: EventCardProps) {
  const occurrences = event.occurrences[year] || [];
  const firstOccurrence = occurrences[0];
  
  if (!firstOccurrence) return null;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Image
          src={event.image.url}
          alt={event.image.alt}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">
          <Link 
            href={`/events/${event.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {event.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {formatEventDate(
            firstOccurrence.date,
            firstOccurrence.startTime,
            firstOccurrence.endTime
          )}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 line-clamp-3">
          {event.description.replace(/<[^>]*>/g, '')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {event.regions.map(region => (
            <span 
              key={region}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {region}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarView({ events, defaultYear }: CalendarViewProps) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  
  const yearEvents = events.filter(event => event.occurrences[selectedYear]);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <label className="text-lg font-medium">Year:</label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      {months.map(month => {
        const monthEvents = yearEvents.filter(event => {
          const occurrences = event.occurrences[selectedYear];
          return occurrences?.some(occ => {
            const eventDate = new Date(occ.date);
            return eventDate.getMonth() === months.indexOf(month);
          });
        });
        
        if (monthEvents.length === 0) return null;
        
        return (
          <div key={month} className="space-y-4">
            <h2 className="text-2xl font-semibold">{month}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {monthEvents.map(event => (
                <EventCard key={event.id} event={event} year={selectedYear} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
