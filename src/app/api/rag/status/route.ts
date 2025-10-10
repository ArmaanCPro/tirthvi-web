import { NextResponse } from 'next/server'
import { checkRAGTables } from '@/lib/db-init'
import { getDocumentStats } from '@/lib/rag-utils'

export async function GET() {
  try {
    // Check if RAG tables exist
    const tablesExist = await checkRAGTables()
    
    if (!tablesExist) {
      return NextResponse.json({
        initialized: false,
        error: 'RAG tables not found',
        message: 'Please run database migrations first: supabase db push'
      })
    }

    // Get document statistics
    const stats = await getDocumentStats()

    return NextResponse.json({
      initialized: true,
      tables: {
        documents: true,
        chunks: true,
        embeddings: true
      },
      statistics: stats,
      message: 'RAG system is ready for document uploads'
    })
  } catch (error) {
    console.error('Error checking RAG status:', error)
    return NextResponse.json(
      {
        initialized: false,
        error: 'Failed to check RAG status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
