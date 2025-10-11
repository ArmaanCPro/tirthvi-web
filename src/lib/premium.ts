import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'


export async function isPremium(clerkUserId: string): Promise<boolean> {
  try {
   const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, clerkUserId),
      columns: { isPremium: true },
    })
    return Boolean(user?.isPremium) || await isAdmin(clerkUserId)

  } catch {
    return false
  }
}
