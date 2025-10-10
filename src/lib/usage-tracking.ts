import { db } from '@/lib/drizzle'
import { userUsage, profiles } from '@/lib/drizzle/schema'
import { eq, and, gte, lt } from 'drizzle-orm'

// Daily limits for free users
export const DAILY_LIMITS = {
  AI_MESSAGES: 20, // 20 AI messages per day
  AI_TOKENS: 10000, // 10k tokens per day (roughly 7.5k words)
} as const

export interface UsageStats {
  messagesCount: number
  tokensUsed: number
  messagesRemaining: number
  tokensRemaining: number
  isLimitReached: boolean
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get user's usage stats for today
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  const today = getTodayDate()
  
  // Get today's usage
  const usage = await db.query.userUsage.findFirst({
    where: and(
      eq(userUsage.userId, userId),
      gte(userUsage.date, new Date(today)),
      lt(userUsage.date, new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000))
    ),
  })

  const messagesCount = usage?.aiMessagesCount || 0
  const tokensUsed = usage?.aiTokensUsed || 0

  // Admins have no limits
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { isAdmin: true },
  })
  if (profile?.isAdmin) {
    return {
      messagesCount,
      tokensUsed,
      messagesRemaining: Number.MAX_SAFE_INTEGER,
      tokensRemaining: Number.MAX_SAFE_INTEGER,
      isLimitReached: false,
    }
  }
  
  return {
    messagesCount,
    tokensUsed,
    messagesRemaining: Math.max(0, DAILY_LIMITS.AI_MESSAGES - messagesCount),
    tokensRemaining: Math.max(0, DAILY_LIMITS.AI_TOKENS - tokensUsed),
    // Only enforce message count limit to avoid confusing token-based lockouts
    isLimitReached: messagesCount >= DAILY_LIMITS.AI_MESSAGES,
  }
}

/**
 * Check if user can make an AI request
 */
export async function canMakeAIRequest(userId: string): Promise<boolean> {
  const stats = await getUserUsageStats(userId)
  return !stats.isLimitReached
}

/**
 * Record AI usage (message count and tokens)
 */
export async function recordAIUsage(
  userId: string, 
  messageCount: number = 1, 
  tokensUsed: number = 0
): Promise<void> {
  const today = new Date(getTodayDate())
  
  try {
    // Try to update existing record
    const existingUsage = await db.query.userUsage.findFirst({
      where: and(
        eq(userUsage.userId, userId),
        gte(userUsage.date, today),
        lt(userUsage.date, new Date(today.getTime() + 24 * 60 * 60 * 1000))
      ),
    })

    if (existingUsage) {
      await db
        .update(userUsage)
        .set({
          aiMessagesCount: existingUsage.aiMessagesCount + messageCount,
          aiTokensUsed: existingUsage.aiTokensUsed + tokensUsed,
          updatedAt: new Date(),
        })
        .where(eq(userUsage.id, existingUsage.id))
    } else {
      // Create new record
      await db.insert(userUsage).values({
        userId,
        date: today,
        aiMessagesCount: messageCount,
        aiTokensUsed: tokensUsed,
      })
    }
  } catch (error) {
    console.error('Error recording AI usage:', error)
    // Don't throw - we don't want to break the chat if usage tracking fails
  }
}

/**
 * Reset daily usage (for testing or admin purposes)
 */
export async function resetDailyUsage(userId: string): Promise<void> {
  const today = new Date(getTodayDate())
  
  await db
    .delete(userUsage)
    .where(and(
      eq(userUsage.userId, userId),
      gte(userUsage.date, today),
      lt(userUsage.date, new Date(today.getTime() + 24 * 60 * 60 * 1000))
    ))
}

/**
 * Get usage stats for the last 7 days
 */
export async function getWeeklyUsageStats(userId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const usage = await db.query.userUsage.findMany({
    where: and(
      eq(userUsage.userId, userId),
      gte(userUsage.date, sevenDaysAgo)
    ),
    orderBy: (userUsage, { desc }) => [desc(userUsage.date)],
  })

  return usage
}
