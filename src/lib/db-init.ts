import { db } from './drizzle'
import { documents } from './drizzle/schema'

/**
 * Check if RAG tables exist and are accessible
 */
export async function checkRAGTables(): Promise<boolean> {
  try {
    // Try to query the documents table to see if it exists
    await db.select({ count: documents.id }).from(documents).limit(1)
    return true
  } catch (error) {
    console.error('RAG tables not accessible:', error)
    return false
  }
}

/**
 * Initialize RAG tables if they don't exist
 * This is a fallback for development - in production, use migrations
 */
export async function initializeRAGTables(): Promise<void> {
  try {
    // Check if tables exist
    const tablesExist = await checkRAGTables()
    if (tablesExist) {
      console.log('✅ RAG tables already exist')
      return
    }

    console.log('⚠️ RAG tables not found. Please run the Supabase migration:')
    console.log('   supabase db push')
    console.log('   or apply the migration file: supabase/migrations/008_rag_vector_setup.sql')
    
    throw new Error('RAG tables not initialized. Please run database migrations first.')
  } catch (error) {
    console.error('Failed to initialize RAG tables:', error)
    throw error
  }
}
