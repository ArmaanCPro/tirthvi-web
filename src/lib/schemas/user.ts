import { z } from 'zod'

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  image: z.string().url().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  isAdmin: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const EventSubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  eventSlug: z.string(),
  notificationEnabled: z.boolean().default(true),
  createdAt: z.date(),
})

export const SavedEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  eventSlug: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
})

export const ChatConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
})

export const DonationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number().int().positive(), // Amount in cents
  currency: z.string().default('usd'),
  stripePaymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'succeeded', 'failed', 'canceled']).default('pending'),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
})

export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
  }).default({ email: true, push: false }),
  calendarView: z.enum(['month', 'week', 'day']).default('month'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type EventSubscription = z.infer<typeof EventSubscriptionSchema>
export type SavedEvent = z.infer<typeof SavedEventSchema>
export type ChatConversation = z.infer<typeof ChatConversationSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type Donation = z.infer<typeof DonationSchema>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
