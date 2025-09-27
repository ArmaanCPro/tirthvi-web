import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { savedEvents, profiles } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

// DELETE /api/saved-events/[id] - Remove saved event
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
    
    // Delete the saved event
    await db.delete(savedEvents).where(
      and(
        eq(savedEvents.id, id),
        eq(savedEvents.userId, user.id)
      )
    )

    // Invalidate cache so fresh data is fetched
    revalidateTag('saved-events')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing saved event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/saved-events/[id] - Update saved event notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notes } = await request.json()

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params
    
    // Update the saved event
    const [updatedEvent] = await db.update(savedEvents)
      .set({ notes })
      .where(
        and(
          eq(savedEvents.id, id),
          eq(savedEvents.userId, user.id)
        )
      )
      .returning()

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Saved event not found' }, { status: 404 })
    }

    // Invalidate cache so fresh data is fetched
    revalidateTag('saved-events')

    return NextResponse.json({ savedEvent: updatedEvent })
  } catch (error) {
    console.error('Error updating saved event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
