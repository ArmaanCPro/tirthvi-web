import { embed } from 'ai'

/**
 * Generate embedding for text using OpenAI's embedding model
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embed({
      model: 'openai/text-embedding-3-small',
      value: text,
    })
    return result.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateTextEmbedding(text))
    )
    
    return embeddings
  } catch (error) {
    console.error('Error generating batch embeddings:', error)
    throw new Error('Failed to generate batch embeddings')
  }
}

/**
 * Store embedding in database
 */
export async function storeEmbedding(
  chunkId: string,
  embedding: number[],
  model: string = 'text-embedding-3-small'
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
