import fs from 'fs';
import path from 'path';
import { Event, validateEventFile } from './schemas/event';
import { unstable_cache } from 'next/cache';

// Re-export types for convenience
export type { Event, EventOccurrence } from './schemas/event';

// Cache events in memory for 1 hour - this will scale well with hundreds of events
const getCachedEvents = unstable_cache(
  async () => {
    console.log('Cache miss - loading events from files');
    return await loadEventsFromFiles();
  },
  ['events'],
  {
    revalidate: 3600, // 1 hour
    tags: ['events'],
  }
);

// Cache individual events for 1 hour
const getCachedEventBySlug = unstable_cache(
  async (slug: string) => {
    console.log(`Cache miss - loading event: ${slug}`);
    const events = await loadEventsFromFiles();
    return events.find(event => event.slug === slug) || null;
  },
  ['event-detail'],
  {
    revalidate: 3600,
    tags: ['events', 'event-detail'],
  }
);

// Cache events by year for 1 hour
const getCachedEventsForYear = unstable_cache(
  async (year: string) => {
    console.log(`Cache miss - loading events for year: ${year}`);
    const events = await loadEventsFromFiles();
    return events.filter(event => event.occurrences[year]);
  },
  ['events-by-year'],
  {
    revalidate: 3600,
    tags: ['events', 'events-by-year'],
  }
);

// Raw file loading function (not cached)
async function loadEventsFromFiles(): Promise<Event[]> {
  try {
    const eventsDir = path.join(process.cwd(), 'src/data/events');
    
    if (!fs.existsSync(eventsDir)) {
      console.warn(`Events directory not found: ${eventsDir}`);
      return [];
    }
    
    const files = fs.readdirSync(eventsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in: ${eventsDir}`);
      return [];
    }
    
    const events: Event[] = [];
    const errors: Array<{ file: string; errors: string[] }> = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(eventsDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.trim()) {
          console.warn(`Empty file: ${file}`);
          continue;
        }
        
        const validation = validateEventFile(filePath, content);
        
        if (validation.success) {
          events.push(validation.data);
        } else {
          errors.push({ file, errors: validation.errors });
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push({ file, errors: [`File read error: ${error.message}`] });
        } else {
          errors.push({ file, errors: [`Unknown error: ${error}`] });
        }
      }
    }
    
    if (errors.length > 0) {
      console.error('Validation errors found:');
      errors.forEach(({ file, errors }) => {
        console.error(`\n${file}:`);
        errors.forEach(error => console.error(`  - ${error}`));
      });
    }
    
    console.log(`Successfully loaded ${events.length} events from ${jsonFiles.length} files`);
    return events;
    
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

// Public API functions (cached)
export async function getAllEvents(): Promise<Event[]> {
  return await getCachedEvents();
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return await getCachedEventBySlug(slug);
}

export async function getEventsForYear(year: string): Promise<Event[]> {
  return await getCachedEventsForYear(year);
}

// Utility function to get event statistics
export async function getEventStats(): Promise<{
  totalEvents: number;
  totalYears: number;
  categories: string[];
  regions: string[];
}> {
  try {
    const events = await getAllEvents();
    const allYears = new Set<string>();
    const categories = new Set<string>();
    const regions = new Set<string>();
    
    events.forEach(event => {
      categories.add(event.category);
      event.regions.forEach(region => regions.add(region));
      Object.keys(event.occurrences).forEach(year => allYears.add(year));
    });
    
    return {
      totalEvents: events.length,
      totalYears: allYears.size,
      categories: Array.from(categories).sort(),
      regions: Array.from(regions).sort()
    };
  } catch (error) {
    console.error('Error getting event stats:', error);
    return {
      totalEvents: 0,
      totalYears: 0,
      categories: [],
      regions: []
    };
  }
}