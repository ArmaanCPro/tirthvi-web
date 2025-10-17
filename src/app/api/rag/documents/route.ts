import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { processDocument, getDocumentsWithStats, deleteDocument } from '@/lib/document-processor'

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const documents = await getDocumentsWithStats()
    
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { title, source, content, metadata } = await req.json()

    if (!title || !source || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, source, content' },
        { status: 400 }
      )
    }

    const processedDocument = await processDocument(title, source, content, metadata)
    
    return NextResponse.json({ 
      success: true, 
      document: processedDocument 
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    await deleteDocument(documentId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
