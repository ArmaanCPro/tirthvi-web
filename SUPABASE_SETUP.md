# Supabase Database Setup for Tirthvi

## 🗄️ Database Schema Created

I've set up a complete database schema for your Tirthvi application with the following tables:

### **Core Tables:**
- **`profiles`** - User profiles synced with Clerk
- **`event_subscriptions`** - User event subscriptions
- **`saved_events`** - User saved events
- **`chat_conversations`** - AI chat sessions
- **`chat_messages`** - Individual chat messages
- **`donations`** - User donations
- **`user_preferences`** - User settings

## 🚀 Setup Instructions

### 1. **Run the SQL Migration**
Copy and run the SQL from `src/lib/supabase-migrations/001_initial_schema.sql` in your Supabase SQL editor.

### 2. **Set Environment Variables**
Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Webhook (for user sync)
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### 3. **Set up Clerk Webhook**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

### 4. **Install Dependencies**
```bash
pnpm install
```

### 5. **Database Commands**
```bash
# Generate migrations
pnpm run db:generate

# Run migrations (if using Drizzle)
pnpm run db:migrate

# Open Drizzle Studio
pnpm run db:studio
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Admin permissions** - `is_admin` flag for special access
- **Clerk integration** - automatic user sync

## 📊 Database Features

- **Vector search** ready for AI chat
- **Real-time subscriptions** for live features
- **Optimized indexes** for performance
- **JSONB metadata** for flexible data storage

## 🎯 Next Steps

1. Run the SQL migration in Supabase
2. Set up Clerk webhook
3. Test user registration/login
4. Start building user-specific features!

Your database is now ready for the Tirthvi application! 🕉️
