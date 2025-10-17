import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/drizzle'
import { eventSubscriptions, profiles } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { getEventBySlug } from '@/lib/events'
import { unstable_cache } from 'next/cache'

// Cache user's event subscriptions for 5 minutes
const getCachedEventSubscriptions = unstable_cache(
  async (userId: string) => {
    console.log('Cache miss - loading event subscriptions for user:', userId)
    
    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get event subscriptions with event details
    const subscriptions = await db.query.eventSubscriptions.findMany({
      where: eq(eventSubscriptions.userId, user.id),
      orderBy: (eventSubscriptions, { desc }) => [desc(eventSubscriptions.createdAt)],
    })

    // Enrich with event data
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const eventData = await getEventBySlug(subscription.eventSlug)
          return {
            id: subscription.id,
            eventSlug: subscription.eventSlug,
            notificationEnabled: subscription.notificationEnabled,
            subscribedAt: subscription.createdAt,
            event: eventData,
          }
        } catch {
          // Event might be deleted, return partial data
          return {
            id: subscription.id,
            eventSlug: subscription.eventSlug,
            notificationEnabled: subscription.notificationEnabled,
            subscribedAt: subscription.createdAt,
            event: null,
          }
        }
      })
    )

    return enrichedSubscriptions
  },
  ['event-subscriptions'],
  {
    revalidate: 300, // 5 minutes
    tags: ['event-subscriptions'],
  }
)

// GET /api/event-subscriptions - Get user's event subscriptions
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enrichedSubscriptions = await getCachedEventSubscriptions(userId)
    return NextResponse.json({ subscriptions: enrichedSubscriptions })
  } catch (error) {
    console.error('Error fetching event subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/event-subscriptions - Subscribe to an event
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventSlug, notificationEnabled = true } = await request.json()

    if (!eventSlug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already subscribed
    const existing = await db.query.eventSubscriptions.findFirst({
      where: and(
        eq(eventSubscriptions.userId, user.id),
        eq(eventSubscriptions.eventSlug, eventSlug)
      ),
    })

    if (existing) {
      return NextResponse.json({ error: 'Already subscribed to this event' }, { status: 409 })
    }

    // Subscribe to the event
    const [subscription] = await db.insert(eventSubscriptions).values({
      userId: user.id,
      eventSlug,
      notificationEnabled,
    }).returning()

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
