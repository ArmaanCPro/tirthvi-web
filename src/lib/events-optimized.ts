// Optimized event utilities for large-scale data
import { Event } from './schemas/event';

// Pre-computed indexes for fast lookups
export interface EventIndexes {
  bySlug: Map<string, Event>;
  byYear: Map<string, Event[]>;
  byCategory: Map<string, Event[]>;
  byRegion: Map<string, Event[]>;
}

// Build indexes for fast lookups (useful when you have hundreds of events)
export function buildEventIndexes(events: Event[]): EventIndexes {
  const bySlug = new Map<string, Event>();
  const byYear = new Map<string, Event[]>();
  const byCategory = new Map<string, Event[]>();
  const byRegion = new Map<string, Event[]>();
  
  events.forEach(event => {
    // Index by slug
    bySlug.set(event.slug, event);
    
    // Index by category
    if (!byCategory.has(event.category)) {
      byCategory.set(event.category, []);
    }
    byCategory.get(event.category)!.push(event);
    
    // Index by region
    event.regions.forEach(region => {
      if (!byRegion.has(region)) {
        byRegion.set(region, []);
      }
      byRegion.get(region)!.push(event);
    });
    
    // Index by year
    Object.keys(event.occurrences).forEach(year => {
      if (!byYear.has(year)) {
        byYear.set(year, []);
      }
      byYear.get(year)!.push(event);
    });
  });
  
  return { bySlug, byYear, byCategory, byRegion };
}

// Fast lookup functions using indexes
export function findEventBySlug(events: Event[], slug: string): Event | null {
  return events.find(event => event.slug === slug) || null;
}

export function findEventsByYear(events: Event[], year: string): Event[] {
  return events.filter(event => event.occurrences[year]);
}

export function findEventsByCategory(events: Event[], category: string): Event[] {
  return events.filter(event => event.category === category);
}

export function findEventsByRegion(events: Event[], region: string): Event[] {
  return events.filter(event => event.regions.includes(region));
}

// Pagination helper for large event lists
export function paginateEvents(events: Event[], page: number = 1, limit: number = 20) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    events: events.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: events.length,
      totalPages: Math.ceil(events.length / limit),
      hasNext: endIndex < events.length,
      hasPrev: page > 1,
    }
  };
}

// Search events by name or description
export function searchEvents(events: Event[], query: string): Event[] {
  const searchTerm = query.toLowerCase();
  
  return events.filter(event => 
    event.name.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm) ||
    event.category.toLowerCase().includes(searchTerm) ||
    event.regions.some(region => region.toLowerCase().includes(searchTerm))
  );
}
