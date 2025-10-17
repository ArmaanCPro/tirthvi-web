import { NextResponse } from 'next/server'
import { auth } from 'next-auth'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getUserUsageStats } from '@/lib/usage-tracking'
import { unstable_cache } from 'next/cache'

// Cache user usage stats for 1 minute
const getCachedUserUsageStats = unstable_cache(
  async (userId: string) => {
    console.log('Cache miss - loading usage stats for user:', userId)
    
    // Get user from database
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    })

    if (!user) {
      // Return default usage stats if user not found in database
      return {
        messagesCount: 0,
        tokensUsed: 0,
        messagesRemaining: 20,
        tokensRemaining: 10000,
        isLimitReached: false,
      }
    }

    return await getUserUsageStats(user.id)
  },
  ['user-usage-stats'],
  {
    revalidate: 60, // 1 minute
    tags: ['user-usage-stats'],
  }
)

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const usageStats = await getCachedUserUsageStats(session.user.id)
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
