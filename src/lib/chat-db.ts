import { db } from '@/lib/drizzle'
import { chatConversations, chatMessages } from '@/lib/drizzle/schema'
import { eq, and, lt } from 'drizzle-orm'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface ChatConversation {
  id: string
  title?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new chat conversation
 */
export async function createConversation(userId: string, title?: string): Promise<string> {
  const [conversation] = await db
    .insert(chatConversations)
    .values({
      userId,
      title: title || 'New Conversation',
    })
    .returning({ id: chatConversations.id })

  return conversation.id
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const [message] = await db
    .insert(chatMessages)
    .values({
      conversationId,
      role,
      content,
      metadata,
    })
    .returning({ id: chatMessages.id })

  // Update conversation's updatedAt timestamp
  await db
    .update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, conversationId))

  return message.id
}

/**
 * Get a conversation with all its messages
 */
export async function getConversation(conversationId: string, userId: string): Promise<ChatConversation | null> {
  const conversation = await db.query.chatConversations.findFirst({
    where: and(
      eq(chatConversations.id, conversationId),
      eq(chatConversations.userId, userId)
    ),
    with: {
      messages: {
        orderBy: (chatMessages, { asc }) => [asc(chatMessages.createdAt)],
      },
    },
  })

  if (!conversation) return null

  return {
    id: conversation.id,
    title: conversation.title || undefined,
    messages: conversation.messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      metadata: msg.metadata as Record<string, unknown> | undefined,
      createdAt: msg.createdAt || new Date(),
    })),
    createdAt: conversation.createdAt || new Date(),
    updatedAt: conversation.updatedAt || new Date(),
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const conversations = await db.query.chatConversations.findMany({
    where: eq(chatConversations.userId, userId),
    orderBy: (chatConversations, { desc }) => [desc(chatConversations.updatedAt)],
    with: {
      messages: {
        orderBy: (chatMessages, { desc }) => [desc(chatMessages.createdAt)],
        limit: 1, // Only get the latest message for preview
      },
    },
  })

  return conversations.map(conv => ({
    id: conv.id,
    title: conv.title || undefined,
    messages: conv.messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      metadata: msg.metadata as Record<string, unknown> | undefined,
      createdAt: msg.createdAt || new Date(),
    })),
    createdAt: conv.createdAt || new Date(),
    updatedAt: conv.updatedAt || new Date(),
  }))
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: string, userId: string, title: string): Promise<void> {
  await db
    .update(chatConversations)
    .set({ 
      title,
      updatedAt: new Date(),
    })
    .where(and(
      eq(chatConversations.id, conversationId),
      eq(chatConversations.userId, userId)
    ))
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  await db
    .delete(chatConversations)
    .where(and(
      eq(chatConversations.id, conversationId),
      eq(chatConversations.userId, userId)
    ))
}

/**
 * Get or create a conversation for a user
 * If no conversationId is provided, creates a new one
 */
export async function getOrCreateConversation(userId: string, conversationId?: string): Promise<string> {
  if (conversationId) {
    // Verify the conversation belongs to the user
    const conversation = await db.query.chatConversations.findFirst({
      where: and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId)
      ),
    })
    
    if (conversation) {
      return conversationId
    }
  }
  
  // Create new conversation
  return await createConversation(userId)
}


/**
 * Prune conversations older than N days for a user (based on updatedAt)
 */
export async function pruneOldConversations(userId: string, days: number): Promise<void> {
  if (!Number.isFinite(days) || days <= 0) return
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  try {
    await db
      .delete(chatConversations)
      .where(and(
        eq(chatConversations.userId, userId),
        lt(chatConversations.updatedAt, cutoff)
      ))
  } catch (err) {
    console.error('Error pruning conversations:', err)
  }
}
