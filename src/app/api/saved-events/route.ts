import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { savedEvents, profiles } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { getEventBySlug } from '@/lib/events'

// GET /api/saved-events - Get user's saved events
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get saved events with event details
    const savedEventsList = await db.query.savedEvents.findMany({
      where: eq(savedEvents.userId, user.id),
      orderBy: (savedEvents, { desc }) => [desc(savedEvents.createdAt)],
    })

    // Enrich with event data
    const enrichedEvents = await Promise.all(
      savedEventsList.map(async (savedEvent) => {
        try {
          const eventData = await getEventBySlug(savedEvent.eventSlug)
          return {
            id: savedEvent.id,
            eventSlug: savedEvent.eventSlug,
            notes: savedEvent.notes,
            savedAt: savedEvent.createdAt,
            event: eventData,
          }
        } catch {
          // Event might be deleted, return partial data
          return {
            id: savedEvent.id,
            eventSlug: savedEvent.eventSlug,
            notes: savedEvent.notes,
            savedAt: savedEvent.createdAt,
            event: null,
          }
        }
      })
    )

    return NextResponse.json({ savedEvents: enrichedEvents })
  } catch (error) {
    console.error('Error fetching saved events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/saved-events - Save an event
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventSlug, notes } = await request.json()

    if (!eventSlug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already saved
    const existing = await db.query.savedEvents.findFirst({
      where: and(
        eq(savedEvents.userId, user.id),
        eq(savedEvents.eventSlug, eventSlug)
      ),
    })

    if (existing) {
      return NextResponse.json({ error: 'Event already saved' }, { status: 409 })
    }

    // Save the event
    const [savedEvent] = await db.insert(savedEvents).values({
      userId: user.id,
      eventSlug,
      notes: notes || null,
    }).returning()

    return NextResponse.json({ savedEvent }, { status: 201 })
  } catch (error) {
    console.error('Error saving event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
