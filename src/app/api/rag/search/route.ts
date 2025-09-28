import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateTextEmbedding } from '@/lib/embeddings'
import { searchSimilarChunks, createRAGContext } from '@/lib/rag-utils'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { query, threshold = 0.5, limit = 5, maxTokens = 2000 } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    const queryEmbedding = await generateTextEmbedding(query)
    
    // Search for similar chunks
    const searchResult = await searchSimilarChunks(queryEmbedding, threshold, limit)
    
    // Create context from retrieved chunks
    const context = createRAGContext(searchResult.chunks, maxTokens)
    
    return NextResponse.json({
      query,
      context,
      chunks: searchResult.chunks,
      totalFound: searchResult.totalFound,
      contextLength: context.length,
    })
  } catch (error) {
    console.error('Error in RAG search:', error)
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
}
