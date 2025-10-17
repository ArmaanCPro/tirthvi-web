-- Add performance indexes for common queries

-- Index for user lookups by clerk_id (used in auth flows)
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- Index for user preferences lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Index for donation lookups by user
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Index for chat conversations by user
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at);

-- Index for chat messages by conversation
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Index for saved events by user
CREATE INDEX IF NOT EXISTS idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_event_slug ON saved_events(event_slug);
CREATE INDEX IF NOT EXISTS idx_saved_events_created_at ON saved_events(created_at);

-- Index for event subscriptions by user
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_id ON event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_slug ON event_subscriptions(event_slug);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_created_at ON event_subscriptions(created_at);

-- Index for scripture downloads by user and month
CREATE INDEX IF NOT EXISTS idx_scripture_downloads_user_month ON scripture_downloads(user_id, month, year);
CREATE INDEX IF NOT EXISTS idx_scripture_downloads_scripture_slug ON scripture_downloads(scripture_slug);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_saved_events_user_created ON saved_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_created ON event_subscriptions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated ON chat_conversations(user_id, updated_at DESC);

-- Index for RAG document lookups
CREATE INDEX IF NOT EXISTS idx_documents_source_title ON documents(source, title);
CREATE INDEX IF NOT EXISTS idx_chunks_document_chunk_index ON chunks(document_id, chunk_index);

-- Optimize vector search performance
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON embeddings(model);
CREATE INDEX IF NOT EXISTS idx_embeddings_created_at ON embeddings(created_at);

-- Add partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_donations_active ON donations(user_id, status) WHERE status IN ('completed', 'pending');
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_active ON event_subscriptions(user_id, notification_enabled) WHERE notification_enabled = true;
