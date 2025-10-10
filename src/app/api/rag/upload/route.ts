import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { processPDF, processDocument } from '@/lib/document-processor'
import { processDocumentsBatch } from '@/lib/batch-processor'
import { checkRAGTables } from '@/lib/db-init'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

// Ensure Node.js runtime for pdf-parse compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const admin = await isAdmin(userId)
    if (!admin) {
      return new Response('Forbidden', { status: 403 })
    }

    // Check if RAG tables are initialized
    const tablesExist = await checkRAGTables()
    if (!tablesExist) {
      return NextResponse.json(
        { 
          error: 'RAG system not initialized. Please run database migrations first.',
          details: 'Run: supabase db push or apply migration 008_rag_vector_setup.sql'
        },
        { status: 503 }
      )
    }

    const formData = await req.formData()

    // Required fields
    const title = formData.get('title') as string
    const source = formData.get('source') as string

    // Metadata is optional, but must be valid JSON when provided
    let metadata: Record<string, unknown> = {}
    const metadataRaw = formData.get('metadata')
    if (typeof metadataRaw === 'string') {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch (e) {
        console.error('Invalid metadata JSON parse error:', e)
        return NextResponse.json(
          { error: 'Invalid metadata JSON' },
          { status: 400 }
        )
      }
    }

    // Prefer direct file uploads, but also support URL uploads to avoid 413s in serverless environments
    const fileInput = formData.get('file')
    let fileUrl = formData.get('fileUrl') as string | null

    // Optional provider-based resolution for remote files
    const provider = (formData.get('provider') as string | null)?.toLowerCase() || null
    if (!fileInput && !fileUrl && provider === 'supabase') {
      const bucket = formData.get('bucket') as string | null
      const path = formData.get('path') as string | null
      const expiresIn = parseInt(String(formData.get('expiresIn') ?? '600'), 10)

      if (!bucket || !path) {
        return NextResponse.json(
          { error: 'For provider "supabase", bucket and path are required.' },
          { status: 400 }
        )
      }

      try {
        const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn)
        if (error || !data?.signedUrl) {
          return NextResponse.json(
            { error: `Failed to create signed URL: ${error?.message || 'Unknown error'}` },
            { status: 400 }
          )
        }
        fileUrl = data.signedUrl
      } catch (e) {
        console.error('Error creating signed URL for Supabase Storage:', e)
        return NextResponse.json(
          { error: 'Could not create signed URL for Supabase Storage' },
          { status: 400 }
        )
      }
    }

    if (!fileInput && !fileUrl) {
      return NextResponse.json(
        { error: 'Missing file. Provide either a file or fileUrl.' },
        { status: 400 }
      )
    }

    if (!title || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: title, source' },
        { status: 400 }
      )
    }

    // Detect if an upstream 413 error was posted as a string field instead of a File
    if (fileInput && !(fileInput instanceof File)) {
      const text = String(fileInput)
      if (text.startsWith('Request Entity Too Large')) {
        return NextResponse.json(
          { error: 'Upload too large for serverless function. Use fileUrl to upload large files, or reduce file size.' },
          { status: 413 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid file field' },
        { status: 400 }
      )
    }

    // Load file buffer from either direct upload or URL fetch
    let buffer: Buffer
    let filename = 'upload'

    if (fileInput && fileInput instanceof File) {
      const file = fileInput as File
      buffer = Buffer.from(await file.arrayBuffer())
      filename = file.name || 'upload'
    } else {
      // Fetch from URL (must be publicly accessible or signed)
      try {
        const res = await fetch(fileUrl as string, { cache: 'no-store' })
        if (!res.ok) {
          return NextResponse.json(
            { error: `Failed to fetch file from URL: ${res.status} ${res.statusText}` },
            { status: 400 }
          )
        }
        const ab = await res.arrayBuffer()
        buffer = Buffer.from(ab)
        filename = (fileUrl as string).split('?')[0].split('#')[0].split('/').pop() || 'upload'
      } catch (err) {
        console.error('Error fetching file from URL:', err)
        return NextResponse.json(
          { error: 'Could not download file from provided URL' },
          { status: 400 }
        )
      }
    }

    // Optional safeguard to avoid processing extremely large files
    const isDirectUpload = !!(fileInput && fileInput instanceof File)
    const MAX_BYTES_DIRECT = 25 * 1024 * 1024 // 25 MB for direct uploads to avoid serverless 413
    const MAX_BYTES_URL = 250 * 1024 * 1024 // 250 MB for remote URLs (Supabase/Vercel Blob)
    const LIMIT = isDirectUpload ? MAX_BYTES_DIRECT : MAX_BYTES_URL

    if (buffer.byteLength > LIMIT) {
      const maxMb = (LIMIT / (1024 * 1024)).toFixed(0)
      return NextResponse.json(
        { error: `File too large (${(buffer.byteLength / (1024*1024)).toFixed(1)} MB). Max allowed is ${maxMb} MB${isDirectUpload ? ' for direct uploads. Try using a fileUrl or provider-based URL for larger files.' : ''}.` },
        { status: 413 }
      )
    }

    const fileExtension = filename.split('.').pop()?.toLowerCase()

    let processedDocument

    switch (fileExtension) {
      case 'pdf':
        processedDocument = await processPDF(buffer, title, source, metadata)
        break
      case 'txt':
        const content = buffer.toString('utf-8')
        processedDocument = await processDocument(title, source, content, metadata)
        break
      default:
        return NextResponse.json(
          { error: `Unsupported file type: ${fileExtension}. Supported types: pdf, txt` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      document: processedDocument,
      message: `Successfully processed ${processedDocument.chunks.length} chunks from ${filename}`,
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

    const admin = await isAdmin(userId)
    if (!admin) {
      return new Response('Forbidden', { status: 403 })
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
