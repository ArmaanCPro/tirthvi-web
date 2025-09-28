import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getUserUsageStats } from '@/lib/usage-tracking'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get user from database
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      // Return default usage stats if user not found in database
      return NextResponse.json({
        messagesCount: 0,
        tokensUsed: 0,
        messagesRemaining: 20,
        tokensRemaining: 10000,
        isLimitReached: false,
      })
    }

    const usageStats = await getUserUsageStats(user.id)

    return NextResponse.json(usageStats)
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    // Return default usage stats on error
    return NextResponse.json({
      messagesCount: 0,
      tokensUsed: 0,
      messagesRemaining: 20,
      tokensRemaining: 10000,
      isLimitReached: false,
    })
  }
}
