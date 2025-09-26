'use client';

import { Event } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatEventDate } from '@/lib/calendar';
import Link from 'next/link';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
  year: string;
}

export function EventCard({ event, year }: EventCardProps) {
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
        <p className="text-sm text-muted-foreground">
          {formatEventDate(
            firstOccurrence.date,
            firstOccurrence.startTime,
            firstOccurrence.endTime
          )}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description.replace(/<[^>]*>/g, '')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {event.regions.map(region => (
            <span 
              key={region}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {region}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
