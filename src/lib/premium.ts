import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import {isAdmin} from "@/lib/auth";

/**
 * Premium scaffold. For now, always returns false unless you later add a flag in DB.
 * Extend this later to integrate with Supabase, Clerk, Stripe, etc.
 */
export async function isPremium(clerkUserId: string): Promise<boolean> {
  try {
    // If you later add a boolean column like profiles.isPremium, uncomment below and use it
    // const user = await db.query.profiles.findFirst({
    //   where: eq(profiles.clerkId, clerkUserId),
    //   columns: { isPremium: true as any }, // replace with real column when added
    // })
    // return Boolean((user as any)?.isPremium)

    // For now, explicitly return false to act as a scaffold unless admin
    return await isAdmin(clerkUserId) || false
  } catch {
    return false
  }
}
