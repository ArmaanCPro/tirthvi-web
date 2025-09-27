// API endpoint to check if events occur on a specific date
// This is called by the Supabase Edge Function
import { NextRequest, NextResponse } from 'next/server'
import { getAllEvents } from '@/lib/events'

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Get all events
    const events = await getAllEvents()
    
    // Find events that occur on the specified date
    const eventsOnDate = events.filter(event => {
      // Check all years for this event
      for (const year of Object.keys(event.occurrences)) {
        const occurrences = event.occurrences[year]
        for (const occurrence of occurrences) {
          if (occurrence.date === date) {
            return true
          }
        }
      }
      return false
    })

    // Return simplified event data for notifications
    const eventData = eventsOnDate.map(event => ({
      slug: event.slug,
      name: event.name,
      description: event.description,
      // Find the specific occurrence for this date
      occurrence: (() => {
        for (const year of Object.keys(event.occurrences)) {
          const occurrences = event.occurrences[year]
          const occurrence = occurrences.find(occ => occ.date === date)
          if (occurrence) {
            return {
              ...occurrence,
              year: parseInt(year)
            }
          }
        }
        return null
      })()
    }))

    return NextResponse.json({ 
      date,
      events: eventData,
      count: eventData.length
    })

  } catch (error) {
    console.error('Error checking events for date:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
