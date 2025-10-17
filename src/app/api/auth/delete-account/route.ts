import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id)
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // TODO: Cancel Stripe subscription if exists
    // This will be implemented in Phase 5 (Stripe Integration)
    if (user.stripeCustomerId) {
      console.log('TODO: Cancel Stripe subscription for customer:', user.stripeCustomerId)
    }

    // Delete user from database (cascade will handle related records)
    await db.delete(profiles).where(eq(profiles.id, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
