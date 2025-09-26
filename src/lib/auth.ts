import { auth } from '@clerk/nextjs/server'
import { db } from './drizzle'
import { profiles } from './drizzle/schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  // Get user from our database
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.clerkId, userId),
  })

  return user
}

export async function createUserProfile(clerkId: string, userData: {
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}) {
  const [profile] = await db.insert(profiles).values({
    id: crypto.randomUUID(),
    clerkId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    avatarUrl: userData.avatarUrl,
  }).returning()

  return profile
}

export async function isAdmin(userId: string) {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.clerkId, userId),
    columns: { isAdmin: true },
  })

  return user?.isAdmin || false
}
