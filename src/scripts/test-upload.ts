#!/usr/bin/env tsx

/**
 * Test script for uploading documents to the RAG system
 * Usage: pnpm tsx src/scripts/test-upload.ts
 */

import { processDocument } from '../lib/document-processor'
import { processDocumentsBatch } from '../lib/batch-processor'

async function testTextUpload() {
  console.log('🧪 Testing text document upload...')
  
  const sampleText = `
Chapter 1: The Yoga of Arjuna's Dejection

Dhritarashtra said: O Sanjaya, what did my sons and the sons of Pandu do when they had assembled together on the sacred plain of Kurukshetra, eager for battle?

Sanjaya said: O King, having seen the army of the Pandavas drawn up in battle array, King Duryodhana approached his teacher and spoke these words:

"Behold, O Teacher, this mighty army of the sons of Pandu, arrayed by the son of Drupada, your wise disciple. Here are heroes, mighty archers, equal in battle to Bhima and Arjuna, Yuyudhana and Virata, and Drupada of the great chariot.

"Also there are many other heroes who have risked their lives for my sake. They are all well armed and skilled in warfare. Our army, marshaled by Bhishma, is unlimited and insufficient, while their army, marshaled by Bhima, is limited and sufficient.

"Therefore, all of you, stationed in your respective positions in the various divisions of the army, protect Bhishma alone."

Then Bhishma, the grandfather, the oldest of the Kauravas, in order to cheer Duryodhana, blew his conch shell very loudly, making a sound like the roar of a lion.

Thereafter, conch shells and drums, gongs, cymbals, and trumpets were all suddenly sounded, and the combined sound was tumultuous.

On the other side, both Lord Krishna and Arjuna, stationed in a great chariot yoked with white horses, blew their transcendental conch shells.

Krishna blew His conch shell, called Pancajanya; Arjuna blew his, the Devadatta; and Bhima, the voracious eater and performer of Herculean tasks, blew his terrific conch shell called Paundra.

King Yudhisthira, the son of Kunti, blew his conch shell, the Anantavijaya, and Nakula and Sahadeva blew the Sughosa and Manipuspaka. That great archer the King of Kasi, the great fighter Sikhandi, Dhrstadyumna, Virata, the unconquerable Satyaki, Drupada, the sons of Draupadi, and others, O King, such as the mighty-armed son of Subhadra, all blew their respective conch shells.

The blowing of these different conch shells became uproarious. Vibrating both in the sky and on the earth, it shattered the hearts of the sons of Dhritarashtra.

At that time Arjuna, the son of Kunti, seated in the chariot bearing the flag marked with Hanuman, took up his bow and prepared to shoot his arrows. O King, after looking at the sons of Dhritarashtra drawn in military array, Arjuna then spoke to Lord Krishna these words:

Arjuna said: O Krishna, as I see my relatives present here who want to fight, my limbs fail and my mouth becomes dry. My body quivers and my hairs stand on end. The Gandiva bow slips from my hand, and my skin intensely burns. My mind cannot figure out what is right, and I cannot stand here any longer. I am forgetting myself, and my mind is reeling. I see only causes of misfortune, O Krishna, killer of the Keshi demon.

I do not see how any good can come from killing my own kinsmen in this battle, nor can I, my dear Krishna, desire any subsequent victory, kingdom, or happiness.

O Govinda, of what avail to us are a kingdom, happiness or even life itself when all those for whom we may desire them are now arrayed on this battlefield? O Madhusudana, when teachers, fathers, sons, grandfathers, maternal uncles, fathers-in-law, grandsons, brothers-in-law and other relatives are ready to give up their lives and properties and are standing before me, I have no desire to kill them, even for the sake of the three worlds, let alone this earth.

O Janardana, although these men, their hearts overtaken by greed, see no fault in killing one's family or quarreling with friends, why should we, who know the sin of destroying a family, engage in these acts of sin?

With the destruction of a dynasty, the eternal family tradition is vanquished, and thus the rest of the family becomes involved in irreligion.

When irreligion is prominent in the family, O Krishna, the women of the family become corrupt, and from the corruption of women, O descendant of Vrishni, comes unwanted progeny.

An increase of unwanted population certainly causes hellish life both for the family and for those who destroy the family tradition. The ancestors of such corrupt families fall down, because the performances for offering them food and water are entirely stopped.

By the evil deeds of those who destroy the family tradition and who give rise to unwanted children, all kinds of community projects and family welfare activities are devastated.

O Krishna, maintainer of the people, I have heard by disciplic succession that those who destroy family traditions dwell always in hell.

Alas, how strange it is that we are preparing to commit greatly sinful acts. Driven by the desire to enjoy royal happiness, we are intent on killing our own kinsmen.

Better for me if the sons of Dhritarashtra, weapons in hand, were to kill me unarmed and unresisting on the battlefield.

Sanjaya said: Arjuna, having thus spoken on the battlefield, cast aside his bow and arrows and sat down on the chariot, his mind overwhelmed with grief.
`

  try {
    const result = await processDocument(
      'Bhagavad Gita - Chapter 1 (Sample)',
      'Bhagavad Gita',
      sampleText,
      {
        type: 'scripture',
        language: 'english',
        category: 'philosophy',
        author: 'Vyasa',
        chapter: 1
      }
    )

    console.log('✅ Text upload successful!')
    console.log(`📄 Document ID: ${result.id}`)
    console.log(`📝 Title: ${result.title}`)
    console.log(`📚 Source: ${result.source}`)
    console.log(`🔢 Chunks created: ${result.chunks.length}`)
    console.log(`📊 Total tokens: ${result.chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)}`)
    
    return result
  } catch (error) {
    console.error('❌ Text upload failed:', error)
    throw error
  }
}

async function testBatchUpload() {
  console.log('\n🧪 Testing batch document upload...')
  
  const documents = [
    {
      type: 'text' as const,
      content: 'The mind is everything. What you think you become. - Buddha',
      title: 'Buddha Quote 1',
      source: 'Buddhist Teachings',
      metadata: { type: 'quote', author: 'Buddha' }
    },
    {
      type: 'text' as const,
      content: 'Peace comes from within. Do not seek it without. - Buddha',
      title: 'Buddha Quote 2', 
      source: 'Buddhist Teachings',
      metadata: { type: 'quote', author: 'Buddha' }
    },
    {
      type: 'text' as const,
      content: 'Happiness is not something ready made. It comes from your own actions. - Dalai Lama',
      title: 'Dalai Lama Quote',
      source: 'Buddhist Teachings',
      metadata: { type: 'quote', author: 'Dalai Lama' }
    }
  ]

  try {
    const results = await processDocumentsBatch(documents, {
      batchSize: 2,
      delayBetweenBatches: 100,
      onProgress: (processed, total) => {
        console.log(`📈 Progress: ${processed}/${total} documents processed`)
      }
    })

    console.log('✅ Batch upload successful!')
    console.log(`📄 Documents processed: ${results.length}`)
    console.log(`🔢 Total chunks: ${results.reduce((sum, doc) => sum + doc.chunks.length, 0)}`)
    
    return results
  } catch (error) {
    console.error('❌ Batch upload failed:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Starting RAG upload tests...\n')
  
  try {
    // Test single document upload
    await testTextUpload()
    
    // Test batch upload
    await testBatchUpload()
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Visit /upload in your browser to upload PDFs')
    console.log('2. Try uploading a Bhagavad Gita PDF')
    console.log('3. Test the chat with questions about the uploaded content')
    console.log('4. Check /api/rag/status to see document statistics')
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error)
    process.exit(1)
  }
}

// Run the tests
if (require.main === module) {
  main()
}
