/**
 * PDF processing utilities with lazy loading to avoid build-time issues
 */

type PdfMetadata = {
  Title?: string
  Author?: string
  Subject?: string
  Creator?: string
}

type PdfParseResult = {
  text: string
  numpages: number
  info?: PdfMetadata | Record<string, unknown>
}

type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>

let pdfParse: PdfParseFn | null = null

async function getPdfParser(): Promise<PdfParseFn> {
  if (!pdfParse) {
    // Use a dynamic import so Next/Vercel can statically detect the dependency and include it in the deployment bundle.
    const mod = (await import('pdf-parse')) as { default: PdfParseFn }
    pdfParse = mod.default
  }
  return pdfParse
}

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
  const pdf = await getPdfParser()
  const data: { text: string, numpages: number, info?: { Title?: string, Author?: string, Subject?: string, Creator?: string } } = await pdf(buffer)
  return data
}
