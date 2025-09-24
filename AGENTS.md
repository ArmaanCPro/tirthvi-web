# Project Overview

This project is the website component of the Tirthvi project. The Tirthvi project is a hub for Hindu philosophy and knowledge. It provides a calendar for Hindu events,
a library of Hindu events and details, a compendium of Hindu scriptures, and an AI tool that uses RAG to answer questions accurately about Hindu philosophy and knowledge.
The stack is Next.js, Tailwind CSS, and Vercel. Use Drizzle ORM for the database schema.

## Stack

- Next.js
- Tailwind CSS
- Vercel
- GitHub
- shadcn/ui and shadcn.io for UI components
- Drizzle ORM
- RAG + LLM (OpenAI API) with Supabase Vector Store (consider Pinecone in future) as the vector database
- Clerk for authentication
- Supabase/Postgres for user database (Vercel/Supabase)
- Stripe for donations

## Project Structure

- `/src/app`: Contains the Next.js application.
    - `/src/components`: UI components.
    - `/src/styles`: Tailwind CSS definitions.
- `/src/backend`: Contains the Node.js Express API.
    - `/src/routes`: API endpoints.
    - `/src/routes/chat`: OpenAI API chat endpoint.
    - `/src/services`: Business logic and data fetching.

## Development Environment Tips

- Use `pnpm install` to install dependencies in both `/frontend` and `/backend`.
- To run the frontend, navigate to `/frontend` and use `pnpm start`.
- To run the backend, navigate to `/backend` and use `pnpm start`.

## Coding Conventions & Design Patterns

- **Styling:** Use Tailwind CSS for all styling. Use Tailwind v4 syntax.
- **State Management:** All application state should be managed cleanly using React and Nextjs tools.
- **Architecture:** Follow a layered architecture, separating UI, business logic, and data access. This is necessary when we decide to add a React Native mobile app.
- **Error Handling:** Implement robust error handling with clear logging when necessary. Don't overly log.

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
