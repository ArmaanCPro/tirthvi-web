import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "production" 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : "http://localhost:3000",
  plugins: [
    emailOTPClient()
  ]
})

// Export Better Auth types
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
