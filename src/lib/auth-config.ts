import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/drizzle"
import { profiles, accounts, sessions, verificationTokens } from "@/lib/drizzle/schema"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: profiles,
      account: accounts,
      session: sessions,
      verification: verificationTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production" 
      ? process.env.NEXT_PUBLIC_SITE_URL! 
      : "http://localhost:3000"
  ],
  callbacks: {
    session: {
      async create({ user, session }: { user: { id: string; email: string; name?: string }; session: { user: { id: string; email: string; name?: string } } }) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
          },
        }
      },
    },
  },
})

// Export the auth function for server components
export const authHandler = auth

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user