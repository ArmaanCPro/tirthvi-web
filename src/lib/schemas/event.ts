import { z } from 'zod';

export const EventOccurrenceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  significance: z.string().optional(),
});

export const EventSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  name: z.string().min(1, 'Event name is required'),
  description: z.string().min(1, 'Event description is required'),
  image: z.object({
    url: z.string().min(1, 'Image URL is required'),
    caption: z.string().min(1, 'Image caption is required'),
    alt: z.string().min(1, 'Image alt text is required'),
  }),
  externalLinks: z.array(z.object({
    title: z.string().min(1, 'Link title is required'),
    url: z.string().url('Link URL must be valid'),
    description: z.string().min(1, 'Link description is required'),
  })).default([]),
  category: z.string().min(1, 'Category is required'),
  regions: z.array(z.string().min(1, 'Region cannot be empty')).min(1, 'At least one region is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  occurrences: z.record(z.string().regex(/^\d{4}$/, 'Year must be 4 digits'), z.array(EventOccurrenceSchema)),
});

export type EventOccurrence = z.infer<typeof EventOccurrenceSchema>;
export type Event = z.infer<typeof EventSchema>;

// Validation function with detailed error reporting
export function validateEvent(data: unknown): { success: true; data: Event } | { success: false; errors: string[] } {
  try {
    const event = EventSchema.parse(data);
    return { success: true, data: event };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Batch validation for multiple events
export function validateEvents(data: unknown[]): { 
  valid: Event[]; 
  invalid: Array<{ index: number; errors: string[] }> 
} {
  const valid: Event[] = [];
  const invalid: Array<{ index: number; errors: string[] }> = [];
  
  data.forEach((item, index) => {
    const result = validateEvent(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, errors: result.errors });
    }
  });
  
  return { valid, invalid };
}

// Utility function to validate a single event file
export function validateEventFile(filePath: string, content: string): { success: true; data: Event } | { success: false; errors: string[] } {
  try {
    const parsed = JSON.parse(content);
    return validateEvent(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, errors: [`JSON syntax error: ${error.message}`] };
    }
    return { success: false, errors: [`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }
}
