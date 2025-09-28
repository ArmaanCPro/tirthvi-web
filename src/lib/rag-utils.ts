import { db } from '@/lib/drizzle'
import { documents, chunks, embeddings } from '@/lib/drizzle/schema'

// Types for RAG system
export interface DocumentChunk {
  id: string
  content: string
  similarity: number
  documentTitle: string
  documentSource: string
  metadata: Record<string, unknown>
}

export interface RAGSearchResult {
  chunks: DocumentChunk[]
  totalFound: number
}

// Fixed-size chunking configuration
export const CHUNK_CONFIG = {
  MAX_CHUNK_SIZE: 500, // characters per chunk
  OVERLAP_SIZE: 50, // overlap between chunks
  MAX_TOKENS: 125, // approximate tokens per chunk (for GPT-4 context)
}

/**
 * Split text into fixed-size chunks with overlap
 */
export function chunkText(text: string, maxSize: number = CHUNK_CONFIG.MAX_CHUNK_SIZE, overlap: number = CHUNK_CONFIG.OVERLAP_SIZE): string[] {
  if (text.length <= maxSize) {
    return [text]
  }

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + maxSize, text.length)
    let chunk = text.slice(start, end)

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentenceEnd = chunk.lastIndexOf('.')
      const lastQuestionEnd = chunk.lastIndexOf('?')
      const lastExclamationEnd = chunk.lastIndexOf('!')
      
      const lastBreak = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd)
      
      if (lastBreak > start + maxSize * 0.5) { // Only break if we're not too far back
        chunk = text.slice(start, start + lastBreak + 1)
      }
    }

    chunks.push(chunk.trim())
    start = start + chunk.length - overlap
  }

  return chunks.filter(chunk => chunk.length > 0)
}

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

/**
 * Search for similar chunks using vector similarity
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  threshold: number = 0.5,
  limit: number = 5
): Promise<RAGSearchResult> {
  try {
    // Use raw SQL for vector similarity search
    const result = await db.$client<{
        chunk_id: string
        content: string
        similarity: number | number
        document_title: string
        document_source: string
        chunk_metadata: Record<string, unknown>
    }[]>`
      SELECT 
        c.id as chunk_id,
        c.content,
        1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
        d.title as document_title,
        d.source as document_source,
        c.metadata as chunk_metadata
      FROM embeddings e
      JOIN chunks c ON e.chunk_id = c.id
      JOIN documents d ON c.document_id = d.id
      WHERE 1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${threshold}
      ORDER BY e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
    `

    const chunks: DocumentChunk[] = result.map(row => ({
      id: row.chunk_id,
      content: row.content,
      similarity: typeof row.similarity === 'number' ? row.similarity : parseFloat(row.similarity as string),
      documentTitle: row.document_title,
      documentSource: row.document_source,
      metadata: row.chunk_metadata ?? {},
    }))

    return {
      chunks,
      totalFound: chunks.length,
    }
  } catch (error) {
    console.error('Error searching similar chunks:', error)
    return { chunks: [], totalFound: 0 }
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats() {
  try {
    const [docCount, chunkCount, embeddingCount] = await Promise.all([
      db.select({ count: documents.id }).from(documents),
      db.select({ count: chunks.id }).from(chunks),
      db.select({ count: embeddings.id }).from(embeddings),
    ])

    return {
      totalDocuments: docCount.length,
      totalChunks: chunkCount.length,
      totalEmbeddings: embeddingCount.length,
    }
  } catch (error) {
    console.error('Error getting document stats:', error)
    return {
      totalDocuments: 0,
      totalChunks: 0,
      totalEmbeddings: 0,
    }
  }
}

/**
 * Create context from retrieved chunks for AI prompt
 */
export function createRAGContext(chunks: DocumentChunk[], maxTokens: number = 2000): string {
  let context = ''
  let tokenCount = 0

  for (const chunk of chunks) {
    const chunkTokens = estimateTokenCount(chunk.content)
    
    if (tokenCount + chunkTokens > maxTokens) {
      break
    }

    context += `\n\n**Source: ${chunk.documentSource} - ${chunk.documentTitle}**\n${chunk.content}`
    tokenCount += chunkTokens
  }

  return context.trim()
}
