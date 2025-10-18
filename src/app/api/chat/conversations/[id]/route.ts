import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getConversation } from '@/lib/chat-db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.user?.id
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get user from database
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    const { id } = await params
    const conversation = await getConversation(id, user.id)

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
