import fs from 'fs';
import path from 'path';
import { Event, validateEventFile } from './schemas/event';

// Re-export types for convenience
export type { Event, EventOccurrence } from './schemas/event';

export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventsDir = path.join(process.cwd(), 'src/data/events');
    
    // Check if directory exists
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

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const events = await getAllEvents();
    return events.find(event => event.slug === slug) || null;
  } catch (error) {
    console.error(`Error finding event with slug: ${slug}`, error);
    return null;
  }
}

export async function getEventsForYear(year: string): Promise<Event[]> {
  try {
    const events = await getAllEvents();
    return events.filter(event => event.occurrences[year]);
  } catch (error) {
    console.error(`Error filtering events for year: ${year}`, error);
    return [];
  }
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
