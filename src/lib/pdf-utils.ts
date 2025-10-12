/**
 * PDF processing utilities with lazy loading to avoid build-time issues
 */

export async function extractTextFromPDF(buffer: Buffer): Promise<{
  text: string
  numpages: number
  info?: {
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
  }
}> {
  if (!buffer || buffer.byteLength === 0) {
    throw new Error('Uploaded file buffer is empty')
  }

  // @ts-expect-error - pdf-parse is not typed
  const { PDFParse } = import('pdf-parse');
  const pdf = new PDFParse({ data: buffer });

  const data: { text: string, numpages: number, info?: { Title?: string, Author?: string, Subject?: string, Creator?: string } } = await pdf
  return data
}
