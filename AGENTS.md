# Project Overview

This project is the website component of the Tirthvi project. The Tirthvi project is a hub for Hindu philosophy and knowledge. It provides a calendar for Hindu events,
a library of Hindu events and details, a compendium of Hindu scriptures, and an AI tool that uses RAG to answer questions accurately about Hindu philosophy and knowledge.
Users should be able to login and logout, donate to the project, be able to save certain events, be able to subscribe to certain events, and be able to access the chatbot.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Vercel (deployment)
- GitHub
- shadcn/ui and shadcn.io for UI components
- **Database**: Supabase (Postgres) + Drizzle ORM
- **Authentication**: Clerk
- **Event Data**: JSON files (static, version-controlled)
- **Media**: Public folder (static images) → Vercel Blob (future: user uploads)
- **Cache**: Next.js unstable_cache (built-in) → Upstash Redis (future: real-time features)
- **AI**: RAG + LLM (Vercel AI Gateway) with Supabase Vector Store
- **Payments**: Stripe for donations

## Project Structure

- `/src/app`: Next.js App Router
    - `/src/app/api`: API routes (auth, events, chat)
    - `/src/app/(dashboard)`: Protected routes
    - `/src/app/(public)`: Public pages
- `/src/components`: Shared UI components
- `/src/lib`: Utilities and configurations
    - `/src/lib/db.ts`: Supabase client
    - `/src/lib/auth.ts`: Clerk configuration
    - `/src/lib/drizzle`: Database schema
- `/src/data`: Static data files
    - `/src/data/events`: Event JSON files
- `/src/types`: TypeScript definitions
- `/src/styles`: Tailwind CSS definitions

## Data Architecture

- **Supabase**: User data, subscriptions, chat history, user-generated content
- **JSON Files**: Event data (static, version-controlled, fast)
- **Public Folder**: Static images, assets (CDN-optimized)
- **Next.js Cache**: Built-in memory caching for performance
- **Supabase Vector Store**: RAG embeddings for AI chat

## Future Scalability

### **When to Add Vercel Blob:**
- User-uploaded event images
- Large media files (videos, audio)
- Dynamic image generation
- User avatars and profiles

### **When to Add Upstash Redis:**
- Real-time features (live chat, notifications)
- Complex caching requirements
- High-frequency data updates
- User sessions and preferences

### **When to Add Vercel Edge Config:**
- Global feature flags
- Regional settings and configurations
- A/B testing configurations
- Dynamic site-wide settings

## Development Environment Tips

- Use `pnpm install` to install dependencies
- To run the development server: `pnpm dev`
- Environment variables needed: Clerk, Supabase, OpenAI
- After done making significant changes, run `pnpm build` to assert the project is ready for production

## Coding Conventions & Design Patterns

- **Styling:** Use Tailwind CSS for all styling. Use Tailwind v4 syntax.
- **State Management:** All application state should be managed cleanly using React and Nextjs tools.
- **Architecture:** Follow a layered architecture, separating UI, business logic, and data access. This is necessary when we decide to add a React Native mobile app.
- **Error Handling:** Implement robust error handling with clear logging when necessary. Don't overly log.
- **Caching Strategy:** Use Next.js built-in caching for static data, add external services only when needed

## Implementation Order

1. **Phase 1**: Supabase + Drizzle + Clerk (core auth and database) ✅
2. **Phase 2**: Event data system with JSON files ✅
3. **Phase 3**: Static image optimization ✅
4. **Phase 4**: Vercel Blob (when user uploads are needed)
5. **Phase 5**: Upstash Redis (when real-time features are needed)

## Testing Instructions

- **Frontend:** Not yet implemented. For now, use Nextjs testing tools.
- **Backend:** Not yet implemented. For now, use Nextjs or Jest testing tools.
Keep unit tests minimal for now.

## Commit Message Format

Follow the Conventional Commits specification. Examples:
- `feat: Add real-time stock price updates`
- `fix: Correct API endpoint for historical data`
- `docs: Update AGENTS.md with new instructions`

## Security Considerations

- Do not hardcode API keys or sensitive information. Use environment variables.
- Sanitize all user input to prevent injection attacks.
- Use Clerk's built-in security features for authentication.
- Implement proper CORS and rate limiting for API routes.
