import { db } from '@/lib/drizzle'
import { documents, chunks } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { chunkText, estimateTokenCount, CHUNK_CONFIG } from './rag-utils'
import { generateTextEmbedding, storeEmbedding } from './embeddings'
import { extractTextFromPDF } from './pdf-utils'

export interface ProcessedDocument {
  id: string
  title: string
  source: string
  content: string
  chunks: Array<{
    content: string
    index: number
    tokenCount: number
  }>
}

/**
 * Process and store a document with its chunks and embeddings
 */
export async function processDocument(
  title: string,
  source: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<ProcessedDocument> {
  try {
    // Create document record
    const [newDocument] = await db.insert(documents).values({
      id: crypto.randomUUID(),
      title,
      source,
      content,
      metadata,
    }).returning()

    // Chunk the content
    const textChunks = chunkText(content, CHUNK_CONFIG.MAX_CHUNK_SIZE, CHUNK_CONFIG.OVERLAP_SIZE)
    
    // Create chunk records
    const chunkRecords = await Promise.all(
      textChunks.map(async (chunkContent, index) => {
        const [newChunk] = await db.insert(chunks).values({
          id: crypto.randomUUID(),
          documentId: newDocument.id,
          chunkIndex: index,
          content: chunkContent,
          tokenCount: estimateTokenCount(chunkContent),
          metadata: {
            chunkSize: chunkContent.length,
          },
        }).returning()

        return {
          content: chunkContent,
          index,
          tokenCount: estimateTokenCount(chunkContent),
          id: newChunk.id,
        }
      })
    )

    // Generate and store embeddings for each chunk
    await Promise.all(
      chunkRecords.map(async (chunk) => {
        try {
          const embedding = await generateTextEmbedding(chunk.content)
          await storeEmbedding(chunk.id, embedding)
        } catch (error) {
          console.error(`Error processing chunk ${chunk.index}:`, error)
          // Continue with other chunks even if one fails
        }
      })
    )

    return {
      id: newDocument.id,
      title,
      source,
      content,
      chunks: chunkRecords,
    }
  } catch (error) {
    console.error('Error processing document:', error)
    throw new Error('Failed to process document')
  }
}

/**
 * Process a PDF file
 */
export async function processPDF(
  pdfBuffer: Buffer,
  title: string,
  source: string,
  metadata: Record<string, unknown> = {}
): Promise<ProcessedDocument> {
  try {
    // Extract text from PDF using lazy-loaded parser
    const pdfData = await extractTextFromPDF(pdfBuffer)
    const content = pdfData.text

    if (!content || content.trim().length === 0) {
      throw new Error('No text content found in PDF')
    }

    // Process the extracted text
    return await processDocument(title, source, content, {
      ...metadata,
      pageCount: pdfData.numpages,
      pdfInfo: {
        title: pdfData.info?.Title,
        author: pdfData.info?.Author,
        subject: pdfData.info?.Subject,
        creator: pdfData.info?.Creator,
      },
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}


/**
 * Get all documents with their chunk counts
 */
export async function getDocumentsWithStats() {
  try {
    const docs = await db.query.documents.findMany({
      with: {
        chunks: {
          columns: {
            id: true,
          },
        },
      },
    })

    return docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      source: doc.source,
      chunkCount: doc.chunks.length,
      createdAt: doc.createdAt,
    }))
  } catch (error) {
    console.error('Error getting documents:', error)
    return []
  }
}

/**
 * Delete a document and all its associated data
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    await db.delete(documents).where(eq(documents.id, documentId))
  } catch (error) {
    console.error('Error deleting document:', error)
    throw new Error('Failed to delete document')
  }
}
