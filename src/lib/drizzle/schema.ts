import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Profiles table - syncs with Clerk users
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone').default('UTC'),
  language: text('language').default('en'),
  isAdmin: boolean('is_admin').default(false),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Event subscriptions - users can subscribe to events for notifications
export const eventSubscriptions = pgTable('event_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  eventSlug: text('event_slug').notNull(),
  notificationEnabled: boolean('notification_enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Saved events - users can save events for later reference
export const savedEvents = pgTable('saved_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  eventSlug: text('event_slug').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Chat conversations - AI chat sessions
export const chatConversations = pgTable('chat_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  title: text('title'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Chat messages - individual messages in conversations
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => chatConversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system' ]}).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Donations - track user donations
export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').default('usd'),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  status: text('status', { enum: ['pending', 'succeeded', 'failed', 'canceled' ]}).default('pending'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// User preferences - store user settings
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull().unique(),
  theme: text('theme', { enum: ['light', 'dark', 'system' ]}).default('system'),
  notifications: jsonb('notifications').default('{"email": true, "push": false}'),
  calendarView: text('calendar_view', { enum: ['month', 'week', 'day' ]}).default('month'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// User usage tracking - track daily AI usage for rate limiting
export const userUsage = pgTable('user_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(), // Date without time (YYYY-MM-DD)
  aiMessagesCount: integer('ai_messages_count').default(0).notNull(),
  aiTokensUsed: integer('ai_tokens_used').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Define relations
export const profilesRelations = relations(profiles, ({ many, one }) => ({
  eventSubscriptions: many(eventSubscriptions),
  savedEvents: many(savedEvents),
  chatConversations: many(chatConversations),
  donations: many(donations),
  preferences: one(userPreferences),
  usage: many(userUsage),
}))

export const eventSubscriptionsRelations = relations(eventSubscriptions, ({ one }) => ({
  user: one(profiles, {
    fields: [eventSubscriptions.userId],
    references: [profiles.id],
  }),
}))

export const savedEventsRelations = relations(savedEvents, ({ one }) => ({
  user: one(profiles, {
    fields: [savedEvents.userId],
    references: [profiles.id],
  }),
}))

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(profiles, {
    fields: [chatConversations.userId],
    references: [profiles.id],
  }),
  messages: many(chatMessages),
}))

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}))

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(profiles, {
    fields: [donations.userId],
    references: [profiles.id],
  }),
}))

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(profiles, {
    fields: [userPreferences.userId],
    references: [profiles.id],
  }),
}))

export const userUsageRelations = relations(userUsage, ({ one }) => ({
  user: one(profiles, {
    fields: [userUsage.userId],
    references: [profiles.id],
  }),
}))

// RAG System Tables
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  source: text('source').notNull(), // e.g., 'Bhagavad Gita', 'Mahabharata'
  chapter: integer('chapter'),
  verse: integer('verse'),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(), // Order within document
  content: text('content').notNull(),
  tokenCount: integer('token_count').default(0), // Approximate token count
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  chunkId: uuid('chunk_id').references(() => chunks.id, { onDelete: 'cascade' }).notNull(),
  embedding: text('embedding'), // Will be stored as vector in database
  model: text('model').default('text-embedding-3-small'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// RAG Relations
export const documentsRelations = relations(documents, ({ many }) => ({
  chunks: many(chunks),
}))

export const chunksRelations = relations(chunks, ({ one, many }) => ({
  document: one(documents, {
    fields: [chunks.documentId],
    references: [documents.id],
  }),
  embeddings: many(embeddings),
}))

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  chunk: one(chunks, {
    fields: [embeddings.chunkId],
    references: [chunks.id],
  }),
}))
