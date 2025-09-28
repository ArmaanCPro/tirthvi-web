import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { processPDF, processWordDocument, processDocument } from '@/lib/document-processor'
import { processDocumentsBatch } from '@/lib/batch-processor'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const source = formData.get('source') as string
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {}

    if (!file || !title || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, source' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    let processedDocument

    switch (fileExtension) {
      case 'pdf':
        processedDocument = await processPDF(buffer, title, source, metadata)
        break
      case 'docx':
        processedDocument = await processWordDocument(buffer, title, source, metadata)
        break
      case 'txt':
        const content = buffer.toString('utf-8')
        processedDocument = await processDocument(title, source, content, metadata)
        break
      default:
        return NextResponse.json(
          { error: `Unsupported file type: ${fileExtension}. Supported types: pdf, docx, txt` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      document: processedDocument,
      message: `Successfully processed ${processedDocument.chunks.length} chunks from ${file.name}`,
    })
  } catch (error) {
    console.error('Error processing uploaded document:', error)
    return NextResponse.json(
      { error: `Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { documents, options } = await req.json()

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Documents array is required' },
        { status: 400 }
      )
    }

    const processedDocuments = await processDocumentsBatch(documents, options)

    return NextResponse.json({
      success: true,
      documents: processedDocuments,
      message: `Successfully processed ${processedDocuments.length} documents`,
    })
  } catch (error) {
    console.error('Error processing document batch:', error)
    return NextResponse.json(
      { error: `Failed to process document batch: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
