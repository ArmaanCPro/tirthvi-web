import { auth } from '@/lib/auth-config'
import { db } from '@/lib/drizzle'
import { scriptureDownloads } from '@/lib/drizzle/schema'
import { eq, and, count } from 'drizzle-orm'
import { isAdmin } from '@/lib/auth'

const FREE_DOWNLOAD_LIMIT = 5 // per month
const PREMIUM_DOWNLOAD_LIMIT = 1000 // effectively unlimited

export async function checkDownloadLimit(userIdParam: string): Promise<{
  canDownload: boolean
  remaining: number
  limit: number
  isPremium: boolean
}> {
  // Check if user is admin (bypass all limits)
  const admin = await isAdmin(userIdParam)
  if (admin) {
    return { 
      canDownload: true, 
      remaining: Number.MAX_SAFE_INTEGER, 
      limit: Number.MAX_SAFE_INTEGER,
      isPremium: true
    }
  }

  const session = await auth()
  const userId = session?.user?.id
  
  if (!userId) {
    return { 
      canDownload: false, 
      remaining: 0, 
      limit: FREE_DOWNLOAD_LIMIT,
      isPremium: false
    }
  }

  // Check if user is admin (unlimited downloads)
  const userIsAdmin = await isAdmin(userId)
  if (userIsAdmin) {
    return { 
      canDownload: true, 
      remaining: PREMIUM_DOWNLOAD_LIMIT, 
      limit: PREMIUM_DOWNLOAD_LIMIT,
      isPremium: true
    }
  }

  // Get current month and year
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYear = now.getFullYear()

  // Count downloads for current month
  const result = await db
    .select({ count: count() })
    .from(scriptureDownloads)
    .where(
      and(
        eq(scriptureDownloads.userId, userIdParam),
        eq(scriptureDownloads.month, currentMonth),
        eq(scriptureDownloads.year, currentYear)
      )
    )

  const downloadsThisMonth = result[0]?.count || 0
  const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - downloadsThisMonth)

  return {
    canDownload: remaining > 0,
    remaining,
    limit: FREE_DOWNLOAD_LIMIT,
    isPremium: false
  }
}

export async function recordDownload(
  userId: string, 
  scriptureSlug: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYear = now.getFullYear()

  await db.insert(scriptureDownloads).values({
    userId,
    scriptureSlug,
    month: currentMonth,
    year: currentYear,
    metadata: metadata || {}
  })
}

export async function getUserDownloadStats(userId: string): Promise<{
  downloadsThisMonth: number
  limit: number
  remaining: number
  isPremium: boolean
}> {
  // Check if user is admin (bypass all limits)
  const admin = await isAdmin(userId)
  if (admin) {
    return {
      downloadsThisMonth: 0,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      isPremium: true
    }
  }

  const session = await auth()
  const sessionUserId = session?.user?.id
  
  if (!sessionUserId) {
    return {
      downloadsThisMonth: 0,
      limit: FREE_DOWNLOAD_LIMIT,
      remaining: FREE_DOWNLOAD_LIMIT,
      isPremium: false
    }
  }

  // Check if user is admin (unlimited downloads)
  const userIsAdmin = await isAdmin(sessionUserId)
  if (userIsAdmin) {
    return {
      downloadsThisMonth: 0,
      limit: PREMIUM_DOWNLOAD_LIMIT,
      remaining: PREMIUM_DOWNLOAD_LIMIT,
      isPremium: true
    }
  }

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYear = now.getFullYear()

  const result = await db
    .select({ count: count() })
    .from(scriptureDownloads)
    .where(
      and(
        eq(scriptureDownloads.userId, userId),
        eq(scriptureDownloads.month, currentMonth),
        eq(scriptureDownloads.year, currentYear)
      )
    )

  const downloadsThisMonth = result[0]?.count || 0
  const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - downloadsThisMonth)

  return {
    downloadsThisMonth,
    limit: FREE_DOWNLOAD_LIMIT,
    remaining,
    isPremium: false
  }
}