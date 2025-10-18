import { auth } from "./auth-config"
import { db } from "./drizzle"
import { profiles } from "./drizzle/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers()
    })
    
    if (!session?.user?.id) {
      return null
    }

    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
  
  return user?.isAdmin ?? false
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user?.id) {
    redirect('/auth/signin')
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/')
  }

  return user
}
