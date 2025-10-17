// API endpoint to check if events occur on a specific date
// This is called by the Supabase Edge Function
import { NextRequest, NextResponse } from 'next/server'
import { getAllEvents } from '@/lib/events'
import { unstable_cache } from 'next/cache'

// Cache events for a specific date for 5 minutes
const getCachedEventsForDate = unstable_cache(
  async (date: string) => {
    console.log('Cache miss - loading events for date:', date)
    
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
    return eventsOnDate.map(event => ({
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
  },
  ['events-for-date'],
  {
    revalidate: 300, // 5 minutes
    tags: ['events', 'events-for-date'],
  }
)

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify this request is from Supabase Edge Function
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    const eventData = await getCachedEventsForDate(date)

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