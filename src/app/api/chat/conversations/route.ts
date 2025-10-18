import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getUserConversations, createConversation, deleteConversation, updateConversationTitle } from '@/lib/chat-db'

export async function GET() {
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

    const conversations = await getUserConversations(user.id)

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const { title } = await req.json()
    const conversationId = await createConversation(user.id, title)

    return NextResponse.json({ id: conversationId })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return new Response('Conversation ID required', { status: 400 })
    }

    await deleteConversation(conversationId, user.id)

    return new Response('Conversation deleted', { status: 200 })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
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

    const { id, title } = await req.json()

    if (!id || !title) {
      return new Response('Conversation ID and title required', { status: 400 })
    }

    await updateConversationTitle(id, user.id, title)

    return new Response('Conversation updated', { status: 200 })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return new Response('Internal server error', { status: 500 })
  }
}