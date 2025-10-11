import { embed, embedMany } from 'ai'

/**
 * Generate embedding for text using OpenAI's embedding model
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embed({
      model: 'openai/text-embedding-3-large',
      value: text,
    })
    return result.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate embeddings for multiple texts in batch using the AI SDK's embedMany.
 * This will automatically split requests for provider limits and can be combined with
 * an outer batching strategy if needed for very large corpora.
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const result = await embedMany({
      model: 'openai/text-embedding-3-large',
      values: texts,
    })
    // Embeddings are returned as arrays of numbers already
    return result.embeddings as unknown as number[][]
  } catch (error) {
    console.error('Error generating batch embeddings:', error)
    throw new Error('Failed to generate batch embeddings')
  }
}

/**
 * Generate embeddings in controllable batches to avoid sending very large arrays at once.
 * This function performs sequential calls to embedMany in slices and returns a flat list.
 */
export async function generateEmbeddingsInBatches(
  texts: string[],
  options: { batchSize?: number; maxParallelCalls?: number } = {}
): Promise<number[][]> {
  const { batchSize = 64, maxParallelCalls } = options
  const vectors: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize)
    const result = await embedMany({
      model: 'openai/text-embedding-3-large',
      values: slice,
      ...(typeof maxParallelCalls === 'number' ? { maxParallelCalls } : {}),
    })
    for (const emb of result.embeddings) {
      vectors.push(emb as unknown as number[])
    }
  }

  return vectors
}

/**
 * Store embedding in database
 */
export async function storeEmbedding(
  chunkId: string,
  embedding: number[],
  model: string = 'text-embedding-3-large'
): Promise<void> {
  const { db } = await import('@/lib/drizzle')
  const { embeddings } = await import('@/lib/drizzle/schema')
  
  try {
    await db.insert(embeddings).values({
      id: crypto.randomUUID(),
      chunkId,
      embedding: JSON.stringify(embedding),
      model,
    })
  } catch (error) {
    console.error('Error storing embedding:', error)
    throw new Error('Failed to store embedding')
  }
}
