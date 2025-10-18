import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import { db } from "@/lib/drizzle"
import { profiles, accounts, sessions, verificationTokens } from "@/lib/drizzle/schema"
import { sendVerificationOTP, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  baseURL: process.env.NODE_ENV === "production" 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : "http://localhost:3000",
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
    requireEmailVerification: true, // Enable email verification
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url })
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset completed for user: ${user.email}`)
    },
    onUserCreate: async ({ user }: { user: { email: string; name?: string } }) => {
      // Send welcome email when user is created
      try {
        await sendWelcomeEmail({
          userEmail: user.email,
          userName: user.name || user.email.split('@')[0]
        })
        console.log(`Welcome email sent to: ${user.email}`)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
        // Don't throw error to avoid blocking user creation
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline", // Always get refresh token
      prompt: "select_account consent", // Always ask for consent
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production" 
      ? process.env.NEXT_PUBLIC_SITE_URL! 
      : "http://localhost:3000"
  ],
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendVerificationOTP({ email, otp, type })
      },
      overrideDefaultEmailVerification: true, // Use OTP instead of magic links
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 3,
    }),
    nextCookies() // Automatically handle cookies in server actions
  ],
})

// Export the auth function for server components
export const authHandler = auth

// Default export for Better Auth CLI
export default auth

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user