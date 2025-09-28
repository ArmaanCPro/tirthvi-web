import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages } = await req.json()

    const result = streamText({
      model: 'openai/gpt-oss-120b',
      messages,
      system: `You are a knowledgeable assistant specializing in Hindu philosophy, culture, and traditions. You help users understand Hindu concepts, festivals, scriptures, and spiritual practices. Provide accurate, respectful, and insightful responses about Hindu philosophy and knowledge.`
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
