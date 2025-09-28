#!/usr/bin/env tsx

/**
 * Sample data ingestion script for testing the RAG system
 * Run with: pnpm tsx src/scripts/ingest-sample-data.ts
 */

import { processDocument } from '../lib/document-processor'
import { getProcessingStats } from '../lib/batch-processor'

// Sample Bhagavad Gita verses for testing
const sampleBhagavadGitaContent = `
Chapter 2, Verse 47: "You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty."

Chapter 2, Verse 70: "As rivers flow into the ocean, which, though ever being filled, is ever still, so all desires flow into the mind of the seer, who finds peace in the Self."

Chapter 4, Verse 7: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself."

Chapter 4, Verse 8: "To deliver the pious and to annihilate the miscreants, as well as to reestablish the principles of religion, I Myself appear, millennium after millennium."

Chapter 9, Verse 26: "If one offers Me with love and devotion a leaf, a flower, fruit or water, I will accept it."

Chapter 18, Verse 66: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear."
`

const sampleMahabharataContent = `
The Mahabharata is one of the two major Sanskrit epics of ancient India, the other being the Ramayana. It narrates the struggle between two groups of cousins in the Kurukshetra War and the fates of the Kaurava and the Pandava princes and their succession.

The Mahabharata contains philosophical and devotional material, such as a discussion of the four "goals of life" or purusharthas. Among the principal works and stories in the Mahabharata are the Bhagavad Gita, the story of Damayanti, an abbreviated version of the Ramayana, and the Rishyasringa, often considered as works in their own right.

The Mahabharata is the longest known epic poem and has been described as "the longest poem ever written". Its longest version consists of over 100,000 shloka or over 200,000 individual verse lines, and long prose passages.
`

const sampleUpanishadsContent = `
The Upanishads are late Vedic Sanskrit texts of Hindu philosophy which form the theoretical basis for the Hindu religion. They are also known as Vedanta ("the end of the Vedas"). The Upanishads are commonly referred to as Vedānta, variously interpreted to mean either the "last chapters, parts of the Veda" or "the object, the highest purpose of the Veda".

The concepts of Brahman (ultimate reality) and Ātman (soul, self) are central ideas in all the Upanishads, and "know that you are the Ātman" is their thematic focus. Along with the Bhagavad Gita and the Brahmasutra, the mukhya Upanishads (known collectively as the Prasthanatrayi) provide a foundation for the several later schools of Vedanta.

The Upanishads are the foundation of Hindu philosophical thought and its diverse traditions. Of the Vedic corpus, they alone are widely known, and the central ideas of the Upanishads are at the spiritual core of Hindus.
`

async function ingestSampleData() {
  console.log('🚀 Starting sample data ingestion...')

  try {
    // Process sample documents
    const documents = [
      {
        title: 'Bhagavad Gita - Key Verses',
        source: 'Bhagavad Gita',
        content: sampleBhagavadGitaContent,
        metadata: {
          type: 'scripture',
          language: 'english',
          category: 'philosophy',
        },
      },
      {
        title: 'Mahabharata - Introduction',
        source: 'Mahabharata',
        content: sampleMahabharataContent,
        metadata: {
          type: 'epic',
          language: 'english',
          category: 'literature',
        },
      },
      {
        title: 'Upanishads - Overview',
        source: 'Upanishads',
        content: sampleUpanishadsContent,
        metadata: {
          type: 'philosophy',
          language: 'english',
          category: 'spiritual',
        },
      },
    ]

    console.log(`📚 Processing ${documents.length} sample documents...`)

    for (const doc of documents) {
      console.log(`Processing: ${doc.title}`)
      const result = await processDocument(doc.title, doc.source, doc.content, doc.metadata)
      console.log(`✅ Created ${result.chunks.length} chunks for ${doc.title}`)
    }

    // Get processing statistics
    const stats = await getProcessingStats()
    console.log('\n📊 Processing Statistics:')
    console.log(`- Total Documents: ${stats.totalDocuments}`)
    console.log(`- Total Chunks: ${stats.totalChunks}`)
    console.log(`- Chunks with Embeddings: ${stats.chunksWithEmbeddings}`)
    console.log(`- Embedding Progress: ${stats.embeddingProgress.toFixed(1)}%`)
    console.log(`- Sources: ${stats.sources.join(', ')}`)

    console.log('\n🎉 Sample data ingestion completed successfully!')
    console.log('You can now test the RAG system with queries about Hindu philosophy, Bhagavad Gita, Mahabharata, or Upanishads.')

  } catch (error) {
    console.error('❌ Error during sample data ingestion:', error)
    process.exit(1)
  }
}

// Run the ingestion if this script is executed directly
if (require.main === module) {
  ingestSampleData()
}

export { ingestSampleData }
