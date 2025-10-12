import { db } from '@/lib/drizzle'
import { isPremium } from '@/lib/premium'
import { chatConversations, chatMessages } from '@/lib/drizzle/schema'
import { and, count, eq, gte, lt, sql } from 'drizzle-orm'

export type ModelName = 'openai/gpt-5-mini' | 'openai/gpt-oss-120b'

export interface PlanConfig {
  name: 'free' | 'premium'
  models: Array<{ model: ModelName; dailyLimit: number }>
  contextTokens: number
  retentionDays: number | null // null means permanent
  overallDailyLimit: number
}

export const FREE_PLAN: PlanConfig = {
  name: 'free',
  models: [
    { model: 'openai/gpt-oss-120b', dailyLimit: 20 },
  ],
  contextTokens: 4000,
  retentionDays: 7,
  overallDailyLimit: 20,
}

export const PREMIUM_PLAN: PlanConfig = {
  name: 'premium',
  models: [
    { model: 'openai/gpt-oss-120b', dailyLimit: 15 },
    { model: 'openai/gpt-oss-120b', dailyLimit: 30 },
  ],
  contextTokens: 32000,
  retentionDays: null,
  overallDailyLimit: 45, // 15 + 30
}

export async function getUserPlan(clerkUserId: string): Promise<PlanConfig> {
  const premium = await isPremium(clerkUserId)
  return premium ? PREMIUM_PLAN : FREE_PLAN
}

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

/**
 * Count today's assistant messages for a user for a specific model.
 * We rely on chat_messages.metadata.model being set when writing assistant responses.
 */
export async function getTodayAssistantCountByModel(userId: string, model: ModelName): Promise<number> {
    const { start, end } = getTodayRange()

    try {
        const result = await db
            .select({ count: count() })
            .from(chatMessages)
            .innerJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
            .where(
                and(
                    eq(chatConversations.userId, userId),
                    eq(chatMessages.role, 'assistant'),
                    gte(chatMessages.createdAt, start),
                    lt(chatMessages.createdAt, end),
                    eq(sql`(${chatMessages.metadata}->>'model')`, model)
                )
            )

        return result[0]?.count || 0
    } catch (e) {
        console.error('Model usage count error', e)
        return 0
    }
}

/**
 * Pick the best model for the user today based on plan and per-model caps.
 * - For premium: try gpt-5-mini up to 15, else gpt-oss-120b up to 30.
 * - For free: gpt-oss-120b up to 20.
 */
export async function chooseModelForUser(userId: string, clerkUserId: string): Promise<ModelName | null> {
  const plan = await getUserPlan(clerkUserId)

  for (const { model, dailyLimit } of plan.models) {
    const used = await getTodayAssistantCountByModel(userId, model)
    if (used < dailyLimit) {
      return model
    }
  }

  // All models exhausted
  return null
}
