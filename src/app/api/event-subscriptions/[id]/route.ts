import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { eventSubscriptions, profiles } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'

// DELETE /api/event-subscriptions/[id] - Unsubscribe from event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Delete the subscription
    await db.delete(eventSubscriptions).where(
      and(
        eq(eventSubscriptions.id, id),
        eq(eventSubscriptions.userId, user.id)
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/event-subscriptions/[id] - Update notification settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationEnabled } = await request.json()

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Update the subscription
    const [updatedSubscription] = await db.update(eventSubscriptions)
      .set({ notificationEnabled })
      .where(
        and(
          eq(eventSubscriptions.id, id),
          eq(eventSubscriptions.userId, user.id)
        )
      )
      .returning()

    if (!updatedSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
