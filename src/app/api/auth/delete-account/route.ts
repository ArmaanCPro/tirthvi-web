import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function DELETE() {
  try {
    const session = await getSession()
    
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

    // Cancel Stripe subscription if exists
    if (user.stripeCustomerId) {
      try {
        const { stripe } = await import('@/lib/stripe')
        
        // Get all active subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
        })

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id)
        }
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError)
        // Continue with account deletion even if Stripe cancellation fails
      }
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
