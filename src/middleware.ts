import { getSessionCookie } from "better-auth/cookies"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  // SECURITY WARNING: This middleware only checks for the existence of a session cookie
  // It does NOT validate the session. This is intentional for performance reasons.
  // Actual session validation happens in server components using auth.api.getSession()
  // 
  // This approach is recommended by Better Auth for Next.js middleware to avoid
  // blocking requests with database calls in middleware.
  const sessionCookie = getSessionCookie(request)

  // Protect dashboard and upload routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/upload')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
