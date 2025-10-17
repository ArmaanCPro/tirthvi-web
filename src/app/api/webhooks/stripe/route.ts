import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/drizzle'
import { subscriptions } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          await handleSubscriptionCreated(session)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) {
    console.error('Missing userId or subscriptionId in checkout session')
    return
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  // Update user's subscription in database
  await db.insert(subscriptions).values({
    userId,
    plan: 'premium',
    isPremium: true,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  }).onConflictDoUpdate({
    target: subscriptions.userId,
    set: {
      plan: 'premium',
      isPremium: true,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      updatedAt: new Date(),
    }
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id
  const priceId = subscription.items.data[0]?.price.id

  // Update subscription in database
  await db.update(subscriptions)
    .set({
      plan: subscription.status === 'active' ? 'premium' : 'free',
      isPremium: subscription.status === 'active',
      stripePriceId: priceId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  // Cancel subscription in database
  await db.update(subscriptions)
    .set({
      plan: 'free',
      isPremium: false,
      currentPeriodEnd: null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string

  if (subscriptionId) {
    // Mark subscription as past due
    await db.update(subscriptions)
      .set({
        isPremium: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
  }
}
