/**
 * PDF processing utilities with lazy loading to avoid build-time issues
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParse: any = null

async function getPdfParser() {
  if (!pdfParse) {
    // Use eval to import to avoid bundler/static analysis side-effects that can trigger
    // library test/debug modes trying to access local fixture files.
    const pdfModule = await (eval('import("pdf-parse")') as Promise<any>)
    pdfParse = pdfModule.default || pdfModule
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
