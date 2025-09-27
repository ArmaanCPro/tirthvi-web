import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { chatConversations, profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

// GET /api/chat/conversations - Get user's chat conversations
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.clerkId, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat conversations
    const conversations = await db.query.chatConversations.findMany({
      where: eq(chatConversations.userId, user.id),
      orderBy: (chatConversations, { desc }) => [desc(chatConversations.updatedAt)],
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching chat conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
