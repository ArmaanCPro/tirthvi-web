import { Event, EventOccurrence } from './events';

export function getEventsForMonth(events: Event[], year: string, month: number): Event[] {
  return events.filter(event => {
    const occurrences = event.occurrences[year];
    return occurrences?.some(occ => {
      const eventDate = new Date(occ.date);
      return eventDate.getMonth() === month;
    });
  });
}

export function getEventOccurrencesForYear(event: Event, year: string): EventOccurrence[] {
  return event.occurrences[year] || [];
}

export function formatEventDate(date: string, startTime?: string, endTime?: string): string {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (startTime && endTime) {
    return `${formattedDate} from ${startTime} to ${endTime}`;
  } else if (startTime) {
    return `${formattedDate} at ${startTime}`;
  }
  
  return formattedDate;
}

export function getAvailableYears(events: Event[]): string[] {
  const years = new Set<string>();
  events.forEach(event => {
    Object.keys(event.occurrences).forEach(year => years.add(year));
  });
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
}
