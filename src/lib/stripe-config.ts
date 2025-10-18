/**
 * Stripe Configuration for Tirthvi
 * 
 * This file contains the Stripe client configuration and subscription plans
 * for future implementation of payment functionality.
 * 
 * To enable Stripe integration:
 * 1. Install required packages: pnpm add @better-auth/stripe stripe
 * 2. Add Stripe environment variables to .env.local
 * 3. Uncomment the imports and configuration below
 * 4. Add the stripe plugin to src/lib/auth-config.ts
 */

// Uncomment when ready to implement Stripe
// import Stripe from "stripe"

/**
 * Stripe client instance
 * 
 * Environment variables required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret from Stripe dashboard
 */
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-02-24.acacia",
// })

/**
 * Subscription plans configuration
 * 
 * Define your subscription tiers and their Stripe price IDs here.
 * This will be used by the Better Auth Stripe plugin.
 */
export const subscriptionPlans = [
  {
    name: "basic",
    displayName: "Basic Plan",
    description: "Perfect for individuals starting their spiritual journey",
    priceId: "price_basic_monthly", // Replace with actual Stripe price ID
    annualDiscountPriceId: "price_basic_yearly", // Optional: annual discount
    limits: {
      savedEvents: 50,
      subscribedEvents: 10,
      aiQueries: 100,
    },
    features: [
      "Access to Hindu calendar",
      "Save up to 50 events",
      "Subscribe to 10 events",
      "100 AI wisdom queries per month",
      "Basic scripture access"
    ]
  },
  {
    name: "premium",
    displayName: "Premium Plan", 
    description: "For dedicated practitioners seeking deeper knowledge",
    priceId: "price_premium_monthly", // Replace with actual Stripe price ID
    annualDiscountPriceId: "price_premium_yearly", // Optional: annual discount
    limits: {
      savedEvents: 200,
      subscribedEvents: 50,
      aiQueries: 500,
    },
    features: [
      "Everything in Basic",
      "Save up to 200 events",
      "Subscribe to 50 events", 
      "500 AI wisdom queries per month",
      "Full scripture library access",
      "Advanced AI features",
      "Priority support"
    ],
    freeTrial: {
      days: 14,
    }
  },
  {
    name: "family",
    displayName: "Family Plan",
    description: "Share the wisdom with your entire family",
    priceId: "price_family_monthly", // Replace with actual Stripe price ID
    annualDiscountPriceId: "price_family_yearly", // Optional: annual discount
    limits: {
      savedEvents: 1000,
      subscribedEvents: 200,
      aiQueries: 2000,
      familyMembers: 6,
    },
    features: [
      "Everything in Premium",
      "Up to 6 family members",
      "Save up to 1000 events",
      "Subscribe to 200 events",
      "2000 AI wisdom queries per month",
      "Family event sharing",
      "Child-friendly content filters"
    ],
    freeTrial: {
      days: 7,
    }
  }
]

/**
 * Stripe webhook events to handle
 * 
 * Configure these events in your Stripe dashboard webhook settings:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export const stripeWebhookEvents = [
  "checkout.session.completed",
  "customer.subscription.created", 
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
]

/**
 * Stripe configuration for Better Auth plugin
 * 
 * Uncomment and add this to your auth-config.ts plugins array:
 * 
 * stripe({
 *   stripeClient: stripe,
 *   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
 *   createCustomerOnSignUp: true,
 *   subscription: {
 *     enabled: true,
 *     plans: subscriptionPlans,
 *     requireEmailVerification: true,
 *   }
 * })
 */

/**
 * Helper function to get plan by name
 */
export function getPlanByName(planName: string) {
  return subscriptionPlans.find(plan => plan.name === planName)
}

/**
 * Helper function to get plan limits
 */
export function getPlanLimits(planName: string) {
  const plan = getPlanByName(planName)
  return plan?.limits || null
}

/**
 * Helper function to check if user has access to feature
 */
export function hasFeatureAccess(userPlan: string, feature: string): boolean {
  const plan = getPlanByName(userPlan)
  if (!plan) return false
  
  // Add feature access logic here based on plan limits
  switch (feature) {
    case 'ai_queries':
      return plan.limits.aiQueries > 0
    case 'saved_events':
      return plan.limits.savedEvents > 0
    case 'subscribed_events':
      return plan.limits.subscribedEvents > 0
    case 'family_sharing':
      return plan.name === 'family'
    default:
      return false
  }
}
