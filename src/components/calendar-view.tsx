'use client';

import { useState } from 'react';
import { Event } from '@/lib/events';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarMonthSection } from './calendar-month-section';

interface CalendarViewProps {
  events: Event[];
  defaultYear: string;
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
          <CalendarMonthSection 
            key={month} 
            month={month} 
            events={monthEvents} 
            year={selectedYear} 
          />
        );
      })}
    </div>
  );
}
