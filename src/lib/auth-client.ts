import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

// Export Better Auth types
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.User
