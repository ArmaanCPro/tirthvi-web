// Utility functions for event date calculations
import { Event, EventOccurrence } from './schemas/event'

// Simplified event type for saved/subscribed events
interface SimplifiedEvent {
  occurrences: Record<string, Array<{
    date: string
    startTime?: string
    endTime?: string
    timezone: string
    significance?: string
  }>>
}

/**
 * Calculate the next occurrence of an event
 * Returns the next upcoming date, or null if no future occurrences
 */
export function getNextOccurrence(event: Event | SimplifiedEvent): EventOccurrence | null {
  if (!event.occurrences) {
    return null
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Get all occurrences from current year onwards
  const futureOccurrences: Array<{ occurrence: EventOccurrence; year: number }> = []
  
  for (const [year, occurrences] of Object.entries(event.occurrences)) {
    const yearNum = parseInt(year)
    if (yearNum >= currentYear) {
      for (const occurrence of occurrences) {
        futureOccurrences.push({ occurrence, year: yearNum })
      }
    }
  }
  
  if (futureOccurrences.length === 0) {
    return null
  }
  
  // Sort by date and find the next occurrence
  futureOccurrences.sort((a, b) => {
    const dateA = new Date(a.occurrence.date)
    const dateB = new Date(b.occurrence.date)
    return dateA.getTime() - dateB.getTime()
  })
  
  // Find the first occurrence that hasn't passed yet
  for (const { occurrence } of futureOccurrences) {
    const occurrenceDate = new Date(occurrence.date)
    if (occurrenceDate >= today) {
      return occurrence
    }
  }
  
  // If all occurrences have passed, return the last one
  return futureOccurrences[futureOccurrences.length - 1].occurrence
}

/**
 * Format a date for display
 */
export function formatEventDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Check if an event has any future occurrences
 */
export function hasFutureOccurrences(event: Event | SimplifiedEvent): boolean {
  const nextOccurrence = getNextOccurrence(event)
  if (!nextOccurrence) {
    return false
  }
  
  const today = new Date()
  const occurrenceDate = new Date(nextOccurrence.date)
  
  return occurrenceDate >= today
}

/**
 * Get all future occurrences of an event
 */
export function getFutureOccurrences(event: Event | SimplifiedEvent): Array<{ occurrence: EventOccurrence; year: number }> {
  if (!event.occurrences) {
    return []
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const futureOccurrences: Array<{ occurrence: EventOccurrence; year: number }> = []
  
  for (const [year, occurrences] of Object.entries(event.occurrences)) {
    const yearNum = parseInt(year)
    if (yearNum >= currentYear) {
      for (const occurrence of occurrences) {
        const occurrenceDate = new Date(occurrence.date)
        if (occurrenceDate >= today) {
          futureOccurrences.push({ occurrence, year: yearNum })
        }
      }
    }
  }
  
  // Sort by date
  futureOccurrences.sort((a, b) => {
    const dateA = new Date(a.occurrence.date)
    const dateB = new Date(b.occurrence.date)
    return dateA.getTime() - dateB.getTime()
  })
  
  return futureOccurrences
}
