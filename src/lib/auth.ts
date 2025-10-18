import { auth } from "./auth-config"
import { db } from "./drizzle"
import { profiles } from "./drizzle/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getCurrentUser(): Promise<{ id: string } | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return null
    }

    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
    })

    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper function for API routes
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function createUserProfile(userData: {
  email: string
  name?: string
  image?: string
  password?: string
}) {
  const [profile] = await db.insert(profiles).values({
    id: crypto.randomUUID(),
    name: userData.name || userData.email,
    email: userData.email,
    image: userData.image,
  }).returning()

  return profile
}

export async function isAdmin(userId: string) {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { isAdmin: true },
  })

  return user?.isAdmin || false
}