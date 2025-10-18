import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Profiles table - NextAuth users
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  password: text('password'), // For credentials provider
  resetToken: text('reset_token'),
  resetTokenExpires: timestamp('reset_token_expires', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id'),
  timezone: text('timezone').default('UTC'),
  language: text('language').default('en'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Plan Subscriptions
export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => profiles.id),
    plan: text("plan").notNull().default("free"),
    isPremium: boolean("is_premium").default(false),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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

// Scripture downloads tracking - track monthly download usage
export const scriptureDownloads = pgTable('scripture_downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  scriptureSlug: text('scripture_slug').notNull(),
  downloadedAt: timestamp('downloaded_at', { withTimezone: true }).defaultNow(),
  month: text('month').notNull(), // YYYY-MM format for monthly tracking
  year: integer('year').notNull(),
  metadata: jsonb('metadata').default('{}'), // Store additional info like file size, etc.
})

// Define relations
export const profilesRelations = relations(profiles, ({ many, one }) => ({
  eventSubscriptions: many(eventSubscriptions),
  savedEvents: many(savedEvents),
  chatConversations: many(chatConversations),
  donations: many(donations),
  preferences: one(userPreferences),
  usage: many(userUsage),
  scriptureDownloads: many(scriptureDownloads),
  subscription: one(subscriptions, {
      fields: [profiles.id],
      references: [subscriptions.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(profiles, {
    fields: [subscriptions.userId],
    references: [profiles.id],
  }),
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

export const scriptureDownloadsRelations = relations(scriptureDownloads, ({ one }) => ({
  user: one(profiles, {
    fields: [scriptureDownloads.userId],
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

// NextAuth Tables
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  accountId: text('account_id').notNull(), // Better Auth expects this field
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('session_token').unique().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(), // Better Auth requires this field
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // Better Auth expects this field name
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()), // Better Auth requires this field
})

// NextAuth Relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(profiles, {
    fields: [accounts.userId],
    references: [profiles.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id],
  }),
}))
