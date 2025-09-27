import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { chatConversations, profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

// Cache user's chat conversations for 2 minutes
const getCachedChatConversations = unstable_cache(
  async (userId: string) => {
    console.log('Cache miss - loading chat conversations for user:', userId)
    
    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get chat conversations
    const conversations = await db.query.chatConversations.findMany({
      where: eq(chatConversations.userId, user.id),
      orderBy: (chatConversations, { desc }) => [desc(chatConversations.updatedAt)],
    })

    return conversations
  },
  ['chat-conversations'],
  {
    revalidate: 120, // 2 minutes
    tags: ['chat-conversations'],
  }
)

// GET /api/chat/conversations - Get user's chat conversations
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await getCachedChatConversations(userId)
    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching chat conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
