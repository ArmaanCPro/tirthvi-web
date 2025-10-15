// Depicts scripture download limits for free and premium users

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { userUsage } from '@/lib/drizzle/schema'
import { eq, and, gte } from 'drizzle-orm'

const FREE_DOWNLOAD_LIMIT = 5 // per month
const PREMIUM_DOWNLOAD_LIMIT = 1000 // effectively unlimited

export async function checkDownloadLimit(userId: string): Promise<{
    canDownload: boolean
    remaining: number
    limit: number
}> {
    const { has } = await auth()
    const hasUnlimited = has({ feature: 'unlimited_scripture_downloads'  })

    if (hasUnlimited) {
        return { canDownload: true, remaining: PREMIUM_DOWNLOAD_LIMIT, limit: PREMIUM_DOWNLOAD_LIMIT }
    }

    // Check current month usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usage = await db.query.userUsage.findFirst({
        where: and(
            eq(userUsage.userId, userId),
            gte(userUsage.date, startOfMonth),
        )
    })

    // TODO: make this an actual DB field
    const downloadsThisMonth = usage?.aiMessagesCount || 0
    const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - downloadsThisMonth)

    return {
        canDownload: remaining > 0,
        remaining,
        limit: FREE_DOWNLOAD_LIMIT,
    }
}

export async function recordDownload(userId: string): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const currentUsage = await db.query.userUsage.findFirst({
        where: and(
            eq(userUsage.userId, userId),
            gte(userUsage.date, today),
        )
    })

    const downloadsThisMonth = currentUsage?.aiMessagesCount || 0

    await db
        .insert(userUsage)
        .values({
            userId,
            date: today,
            aiMessagesCount: 1, // TODO: make this an actual DB field
        })
        .onConflictDoUpdate({
            target: [userUsage.userId, userUsage.date],
            set: {
                aiMessagesCount: downloadsThisMonth + 1,
                updatedAt: new Date(),
            }
        })
}