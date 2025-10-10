'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [metadata, setMetadata] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; document?: { id: string; chunks: { length: number } } } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill title from filename
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !source) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('source', source)
      if (metadata) {
        formData.append('metadata', metadata)
      }

      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          document: data.document,
        })
        // Reset form
        setFile(null)
        setTitle('')
        setSource('')
        setMetadata('')
        ;(document.getElementById('file-input') as HTMLInputElement).value = ''
      } else {
        setResult({
          success: false,
          message: data.error || 'Upload failed',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setUploading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please sign in to upload documents to the RAG system.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document to RAG System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload PDF, Word documents, or text files to add them to the knowledge base.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file-input">File</Label>
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: PDF, Text (.txt)
              </p>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bhagavad Gita - Chapter 1"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Bhagavad Gita, Mahabharata, Upanishads"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
              <Textarea
                id="metadata"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='{"type": "scripture", "language": "english", "category": "philosophy"}'
                className="mt-1 font-mono text-sm"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={uploading || !file} className="w-full">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload & Process Document
                </>
              )}
            </Button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {result.success ? 'Success!' : 'Error'}
                </span>
              </div>
              <p className="mt-1 text-sm">{result.message}</p>
              {result.document && (
                <div className="mt-2 text-xs">
                  <p>Document ID: {result.document.id}</p>
                  <p>Chunks created: {result.document.chunks.length}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Upload Bhagavad Gita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1.</strong> Find a PDF of the Bhagavad Gita (many free versions available online)</p>
            <p><strong>2.</strong> Set the title: &quot;Bhagavad Gita - Complete Text&quot;</p>
            <p><strong>3.</strong> Set the source: &quot;Bhagavad Gita&quot;</p>
            <p><strong>4.</strong> Add metadata (optional):</p>
            <pre className="bg-muted p-2 rounded text-xs mt-2">
{`{
  "type": "scripture",
  "language": "english",
  "category": "philosophy",
  "author": "Vyasa"
}`}
            </pre>
            <p><strong>5.</strong> Click &quot;Upload & Process Document&quot;</p>
            <p className="text-muted-foreground mt-2">
              The system will automatically chunk the text and generate embeddings for RAG search.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
