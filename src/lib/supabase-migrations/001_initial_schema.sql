-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_subscriptions table
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_slug TEXT NOT NULL,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_slug)
);

-- Create saved_events table
CREATE TABLE saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_slug TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_slug)
);

-- Create chat_conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  notifications JSONB DEFAULT '{"email": true, "push": false}',
  calendar_view TEXT CHECK (calendar_view IN ('month', 'week', 'day')) DEFAULT 'month',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX idx_event_subscriptions_user_id ON event_subscriptions(user_id);
CREATE INDEX idx_event_subscriptions_event_slug ON event_subscriptions(event_slug);
CREATE INDEX idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX idx_saved_events_event_slug ON saved_events(event_slug);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_stripe_payment_intent_id ON donations(stripe_payment_intent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Event subscriptions: Users can only see and modify their own subscriptions
CREATE POLICY "Users can view own event subscriptions" ON event_subscriptions
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can manage own event subscriptions" ON event_subscriptions
  FOR ALL USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

-- Saved events: Users can only see and modify their own saved events
CREATE POLICY "Users can view own saved events" ON saved_events
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can manage own saved events" ON saved_events
  FOR ALL USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

-- Chat conversations: Users can only see and modify their own conversations
CREATE POLICY "Users can view own chat conversations" ON chat_conversations
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can manage own chat conversations" ON chat_conversations
  FOR ALL USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

-- Chat messages: Users can only see and modify messages in their own conversations
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (conversation_id IN (
    SELECT id FROM chat_conversations WHERE user_id IN (
      SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
    )
  ));

CREATE POLICY "Users can manage own chat messages" ON chat_messages
  FOR ALL USING (conversation_id IN (
    SELECT id FROM chat_conversations WHERE user_id IN (
      SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
    )
  ));

-- Donations: Users can only see their own donations
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can create own donations" ON donations
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

-- User preferences: Users can only see and modify their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = auth.uid()::text
  ));
