import { auth } from "./auth-config"
import { db } from "./drizzle"
import { profiles } from "./drizzle/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

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

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
  
  return user?.isAdmin ?? false
}

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (!session?.user?.id) {
    redirect('/')
  }
  
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  if (!user?.isAdmin) {
    redirect('/')
  }

  return { session, user }
}
