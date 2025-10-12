import { db } from '@/lib/drizzle'

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
  // Basic input sanity checks
  if (!text) return []
  if (maxSize <= 0 || !Number.isFinite(maxSize)) maxSize = 500
  if (overlap < 0 || !Number.isFinite(overlap)) overlap = 0
  if (overlap >= maxSize) {
    // keep some forward progress even for small trailing chunks
    overlap = Math.floor(maxSize / 4)
  }

  if (text.length <= maxSize) {
    return [text.trim()]
  }

  const chunks: string[] = []
  let start = 0
  const totalLen = text.length

  while (start < totalLen) {
    const windowEnd = Math.min(start + maxSize, totalLen)
    let chunk = text.slice(start, windowEnd)

    // Try to break at sentence boundaries within the window
    if (windowEnd < totalLen) {
      const lastSentenceEnd = chunk.lastIndexOf('.')
      const lastQuestionEnd = chunk.lastIndexOf('?')
      const lastExclamationEnd = chunk.lastIndexOf('!')
      const lastBreak = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd)

      if (lastBreak >= Math.floor(maxSize * 0.5)) {
        chunk = chunk.slice(0, lastBreak + 1)
      }
    }

    const trimmed = chunk.trim()
    if (trimmed.length > 0) {
      chunks.push(trimmed)
    }

    if (windowEnd >= totalLen) {
      break
    }

    // Ensure forward progress: when chunk is shorter than overlap, still advance
    const advanceBy = Math.max(1, chunk.length - overlap)
    const nextStart = start + advanceBy

    if (nextStart <= start) {
      // Fallback to avoid infinite loops
      start = Math.min(start + Math.max(1, maxSize - overlap), totalLen)
    } else {
      start = nextStart
    }
  }

  return chunks
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
    // Normalize embedding length to match DB dimension (1536 by default)
    const TARGET_DIM = 1536
    let embed = Array.isArray(queryEmbedding) ? queryEmbedding.slice(0, TARGET_DIM) : []
    if (embed.length < TARGET_DIM) {
      embed = embed.concat(Array(TARGET_DIM - embed.length).fill(0))
    }

    // Prefer calling the Supabase SQL function for optimized vector search.
    // This works whether the embeddings column is native vector or stored as text (the function uses the proper type).
    const result = await db.$client<{
      chunk_id: string
      content: string
      similarity: number
      document_title: string
      document_source: string
      chunk_metadata: Record<string, unknown>
    }[]>`
      SELECT *
      FROM search_similar_chunks(
        ${JSON.stringify(embed)}::vector,
        ${threshold},
        ${limit}
      )
    `

    const chunks: DocumentChunk[] = result.map(row => ({
      id: row.chunk_id,
      content: row.content,
      similarity: typeof row.similarity === 'number' ? row.similarity : parseFloat(String(row.similarity)),
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
    const [row] = await db.$client<{
      total_documents: number
      total_chunks: number
      total_embeddings: number
      sources: string[]
    }[]>`SELECT * FROM get_document_stats()`

    return {
      totalDocuments: row?.total_documents ?? 0,
      totalChunks: row?.total_chunks ?? 0,
      totalEmbeddings: row?.total_embeddings ?? 0,
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
