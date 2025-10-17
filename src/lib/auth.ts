import { auth } from "./auth-config"
import { db } from "./drizzle"
import { profiles } from "./drizzle/schema"
import { eq } from "drizzle-orm"

export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  return user
}

export async function createUserProfile(userData: {
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  password?: string
}) {
  const [profile] = await db.insert(profiles).values({
    id: crypto.randomUUID(),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    avatarUrl: userData.avatarUrl,
    password: userData.password,
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