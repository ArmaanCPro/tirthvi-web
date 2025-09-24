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
- **Config**: Vercel Edge Config (Hindu calendar settings, feature flags)
- **Media**: Vercel Blob (images, documents, audio)
- **Cache**: Upstash Redis (user sessions, AI responses, heavy queries)
- **AI**: RAG + LLM (OpenAI API) with Supabase Vector Store
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
- `/src/types`: TypeScript definitions
- `/src/styles`: Tailwind CSS definitions

## Data Architecture

- **Supabase**: Primary database for users, events, subscriptions, chat history
- **Vercel Edge Config**: Hindu calendar configurations, feature flags, regional settings
- **Vercel Blob**: Event images, user avatars, scripture PDFs, audio files
- **Upstash Redis**: Cache for frequently accessed data (events, user preferences)
- **Supabase Vector Store**: RAG embeddings for AI chat

## Development Environment Tips

- Use `pnpm install` to install dependencies
- To run the development server: `pnpm dev`
- Environment variables needed: Clerk, Supabase, OpenAI, Upstash Redis
- Use Vercel CLI for Edge Config and Blob management

## Coding Conventions & Design Patterns

- **Styling:** Use Tailwind CSS for all styling. Use Tailwind v4 syntax.
- **State Management:** All application state should be managed cleanly using React and Nextjs tools.
- **Architecture:** Follow a layered architecture, separating UI, business logic, and data access. This is necessary when we decide to add a React Native mobile app.
- **Error Handling:** Implement robust error handling with clear logging when necessary. Don't overly log.
- **Caching Strategy:** Use Edge Config for static configs, Redis for dynamic data, Supabase for persistent storage

## Implementation Order

1. **Phase 1**: Supabase + Drizzle + Clerk (core auth and database)
2. **Phase 2**: Vercel Edge Config (Hindu calendar configurations)
3. **Phase 3**: Vercel Blob (media storage)
4. **Phase 4**: Upstash Redis (performance optimization)

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
