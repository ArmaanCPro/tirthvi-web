import { auth } from "@/lib/auth-config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session?.user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
    }

    // Protect upload routes (admin only)
    if (request.nextUrl.pathname.startsWith('/upload')) {
      if (!session?.user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
