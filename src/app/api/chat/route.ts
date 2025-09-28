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
    let user: { id: string } | null = null
    try {
      const userResult = await db.query.profiles.findFirst({
        where: eq(profiles.clerkId, userId),
      })
      user = userResult || null
    } catch (dbError) {
      console.error('Database error fetching user:', dbError)
      // Continue without user for now - this allows chat to work even if DB isn't set up
    }

    // Check rate limiting only if user exists
    if (user) {
      try {
        const canMakeRequest = await canMakeAIRequest(user.id)
        if (!canMakeRequest) {
          return new Response('Daily AI usage limit reached. Please try again tomorrow.', { 
            status: 429,
            headers: {
              'Retry-After': '86400', // 24 hours in seconds
            }
          })
        }
      } catch (rateLimitError) {
        console.error('Rate limiting error:', rateLimitError)
        // Continue without rate limiting if there's an error
      }
    }

    const { messages, conversationId } = await req.json()

    // Convert UI messages to model messages
    const modelMessages = messages.map((msg: { role: string; content?: string; parts?: Array<{ type: string; text?: string }> }) => {
      if (msg.role === 'user') {
        const content = msg.content || msg.parts?.[0]?.text || ''
        return { role: 'user' as const, content }
      } else if (msg.role === 'assistant') {
        const content = msg.content || msg.parts?.[0]?.text || ''
        return { role: 'assistant' as const, content }
      }
      return msg
    })

    // Get or create conversation (only if user exists)
    let convId = conversationId
    if (user) {
      try {
        convId = await getOrCreateConversation(user.id, conversationId)
      } catch (convError) {
        console.error('Conversation error:', convError)
        // Continue without conversation tracking
      }
    }

    // Save user message to database (only if user exists)
    if (user && convId) {
      try {
        const lastUserMessage = messages[messages.length - 1]
        if (lastUserMessage?.role === 'user') {
          const content = lastUserMessage.content || lastUserMessage.parts?.[0]?.text || ''
          await addMessage(convId, 'user', content)
        }
      } catch (messageError) {
        console.error('Message saving error:', messageError)
        // Continue without saving message
      }
    }

    const result = streamText({
      model: 'openai/gpt-oss-120b',
      messages: modelMessages,
      system: `You are a knowledgeable assistant specializing in Hindu philosophy, culture, and traditions. You help users understand Hindu concepts, festivals, scriptures, and spiritual practices. Provide accurate, respectful, and insightful responses about Hindu philosophy and knowledge.`,
      onFinish: async (result) => {
        // Save assistant response to database (only if user exists)
        if (user && convId && result.text) {
          try {
            await addMessage(convId, 'assistant', result.text)
          } catch (messageError) {
            console.error('Assistant message saving error:', messageError)
          }
        }
        
        // Record usage (only if user exists)
        if (user) {
          try {
            const estimatedTokens = Math.ceil(result.text.length / 4) // Rough estimate: 4 chars per token
            await recordAIUsage(user.id, 1, estimatedTokens)
          } catch (usageError) {
            console.error('Usage tracking error:', usageError)
          }
        }
      }
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Internal server error', { status: 500 })
  }
}