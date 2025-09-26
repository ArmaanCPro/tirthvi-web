'use client';

import { useState } from 'react';
import { Event } from '@/lib/events';
import { formatEventDate } from '@/lib/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  const [selectedYear, setSelectedYear] = useState(
    Object.keys(event.occurrences).sort((a, b) => parseInt(b) - parseInt(a))[0]
  );
  
  const availableYears = Object.keys(event.occurrences).sort((a, b) => parseInt(b) - parseInt(a));
  const currentOccurrences = event.occurrences[selectedYear] || [];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <label className="text-lg font-medium">View year:</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={event.image.url}
              alt={event.image.alt}
              fill
              className="object-cover"
            />
          </div>
          <p className="text-sm text-gray-600 italic">{event.image.caption}</p>
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Occurrences in {selectedYear}:</h4>
                {currentOccurrences.map((occurrence, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {formatEventDate(
                        occurrence.date,
                        occurrence.startTime,
                        occurrence.endTime
                      )}
                    </p>
                    {occurrence.significance && (
                      <p className="text-sm text-gray-600 mt-1">
                        {occurrence.significance}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Category:</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {event.category}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Regions:</h4>
                <div className="flex flex-wrap gap-2">
                  {event.regions.map(region => (
                    <span 
                      key={region}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {event.externalLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>External Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.externalLinks.map((link, index) => (
                    <div key={index}>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title}
                        </Link>
                      </Button>
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
