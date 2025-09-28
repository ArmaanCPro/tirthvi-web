import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { canMakeAIRequest, recordAIUsage } from '@/lib/usage-tracking'
import { getOrCreateConversation, addMessage } from '@/lib/chat-db'

export async function POST(req: NextRequest) {
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
      return new Response('User not found', { status: 404 })
    }

    // Check rate limiting
    const canMakeRequest = await canMakeAIRequest(user.id)
    if (!canMakeRequest) {
      return new Response('Daily AI usage limit reached. Please try again tomorrow.', { 
        status: 429,
        headers: {
          'Retry-After': '86400', // 24 hours in seconds
        }
      })
    }

    const { messages, conversationId } = await req.json()

    // Get or create conversation
    const convId = await getOrCreateConversation(user.id, conversationId)

    // Save user message to database
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage?.role === 'user') {
      await addMessage(convId, 'user', lastUserMessage.content || lastUserMessage.parts?.[0]?.text || '')
    }

    const result = streamText({
      model: 'openai/gpt-oss-120b',
      messages,
      system: `You are a knowledgeable assistant specializing in Hindu philosophy, culture, and traditions. You help users understand Hindu concepts, festivals, scriptures, and spiritual practices. Provide accurate, respectful, and insightful responses about Hindu philosophy and knowledge.`,
      onFinish: async (result) => {
        // Save assistant response to database
        if (result.text) {
          await addMessage(convId, 'assistant', result.text)
        }
        
        // Record usage (1 message, estimate tokens)
        const estimatedTokens = Math.ceil(result.text.length / 4) // Rough estimate: 4 chars per token
        await recordAIUsage(user.id, 1, estimatedTokens)
      }
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Internal server error', { status: 500 })
  }
}