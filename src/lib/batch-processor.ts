import { processDocument, processPDF, ProcessedDocument } from './document-processor'
import { generateBatchEmbeddings } from './embeddings'
import { db } from '@/lib/drizzle'
import { embeddings as embeddingsTable } from '@/lib/drizzle/schema'

export interface BatchProcessingOptions {
  batchSize?: number
  delayBetweenBatches?: number
  onProgress?: (processed: number, total: number) => void
  onError?: (error: Error, document: string) => void
}

export interface DocumentInput {
  id: string
  type: 'text' | 'pdf'
  title: string
  source: string
  content?: string
  pdfBuffer?: Buffer
  metadata?: Record<string, unknown>
}

/**
 * Process multiple documents in batches
 */
export async function processDocumentsBatch(
  documents: DocumentInput[],
  options: BatchProcessingOptions = {}
): Promise<ProcessedDocument[]> {
  const {
    batchSize = 5,
    delayBetweenBatches = 1000,
    onProgress,
    onError,
  } = options

  const results: ProcessedDocument[] = []
  const total = documents.length

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize)
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map(async (doc) => {
          if (doc.content) {
            return await processDocument(doc.title, doc.source, doc.content, doc.metadata)
          } else if (doc.pdfBuffer) {
            return await processPDF(doc.pdfBuffer, doc.title, doc.source, doc.metadata)
          } else {
            throw new Error('No content or PDF buffer provided')
          }
        })
      )

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          const error = result.reason
          const doc = batch[index]
          console.error(`Error processing document ${doc.title}:`, error)
          onError?.(error, doc.title)
        }
      })

      // Report progress
      onProgress?.(results.length, total)

      // Delay between batches to avoid rate limiting
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    } catch (error) {
      console.error('Batch processing error:', error)
      onError?.(error as Error, `Batch ${i}-${i + batchSize}`)
    }
  }

  return results
}

/**
 * Optimize embeddings for a batch of chunks
 */
export async function optimizeEmbeddingsForChunks(chunkIds: string[]): Promise<void> {
  try {
    // Get chunks that need embeddings
    const chunksNeedingEmbeddings = await db.query.chunks.findMany({
      where: (chunks, { inArray }) => inArray(chunks.id, chunkIds),
      with: {
        embeddings: true,
      },
    })

    const chunksToProcess = chunksNeedingEmbeddings.filter(chunk => chunk.embeddings.length === 0)
    
    if (chunksToProcess.length === 0) {
      return
    }

    // Generate embeddings in batches
    const batchSize = 10
    for (let i = 0; i < chunksToProcess.length; i += batchSize) {
      const batch = chunksToProcess.slice(i, i + batchSize)
      const contents = batch.map(chunk => chunk.content)
      
      try {
        const embeddings = await generateBatchEmbeddings(contents)
        
        // Store embeddings
        await Promise.all(
          embeddings.map(async (embedding, index) => {
            await db.insert(embeddingsTable).values({
              id: crypto.randomUUID(),
              chunkId: batch[index].id,
              embedding: JSON.stringify(embedding),
              model: 'text-embedding-3-small',
            })
          })
        )
      } catch (error) {
        console.error(`Error processing embedding batch ${i}-${i + batchSize}:`, error)
      }
    }
  } catch (error) {
    console.error('Error optimizing embeddings:', error)
  }
}

/**
 * Get processing statistics
 */
export async function getProcessingStats() {
  try {
    const [documents, chunks, embeddings] = await Promise.all([
      db.query.documents.findMany(),
      db.query.chunks.findMany(),
      db.query.embeddings.findMany(),
    ])

    const totalChunks = chunks.length
    const chunksWithEmbeddings = chunks.filter(chunk => 
      embeddings.some(emb => emb.chunkId === chunk.id)
    ).length

    return {
      totalDocuments: documents.length,
      totalChunks,
      chunksWithEmbeddings,
      embeddingProgress: totalChunks > 0 ? (chunksWithEmbeddings / totalChunks) * 100 : 0,
      sources: [...new Set(documents.map(doc => doc.source))],
    }
  } catch (error) {
    console.error('Error getting processing stats:', error)
    return {
      totalDocuments: 0,
      totalChunks: 0,
      chunksWithEmbeddings: 0,
      embeddingProgress: 0,
      sources: [],
    }
  }
}
