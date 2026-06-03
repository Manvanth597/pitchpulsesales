import { NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    let extractedText = ""

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'pdf') {
          // Dynamic import inside the function to prevent Next.js build-time static analysis failures
          type PdfParseFn = (buf: Buffer) => Promise<{ text: string }>
          const pdfParse = (await (import("pdf-parse") as unknown as Promise<{ default?: PdfParseFn } & PdfParseFn>)).default || (await (import("pdf-parse") as unknown as Promise<{ default?: PdfParseFn } & PdfParseFn>))
          const pdfData = await pdfParse(buffer)
          extractedText += `\n--- Content from ${file.name} ---\n${pdfData.text}\n`
        } else if (ext === 'docx') {
          const docxData = await mammoth.extractRawText({ buffer })
          extractedText += `\n--- Content from ${file.name} ---\n${docxData.value}\n`
        } else if (ext === 'pptx') {
          // pptx2json requires fs or complex setup sometimes, as a fallback we can just try to extract raw text if possible 
          // or use the library. The prompt asks for pptx2json.
          interface Pptx2jsonParser {
            toJson: (buf: Buffer) => Promise<unknown>
          }
          type Pptx2jsonConstructor = new () => Pptx2jsonParser
          const Pptx2json = (await (import('pptx2json') as unknown as Promise<{ default?: Pptx2jsonConstructor } & Pptx2jsonConstructor>)).default || (await (import('pptx2json') as unknown as Promise<{ default?: Pptx2jsonConstructor } & Pptx2jsonConstructor>))
          const parser = new Pptx2json();
          const json = await parser.toJson(buffer);
          // Stringify the parsed json just to get the raw text out of the slides
          const text = JSON.stringify(json).replace(/["'{}\[\]]/g, ' ');
          extractedText += `\n--- Content from ${file.name} ---\n${text}\n`
        } else if (ext === 'txt') {
          const text = buffer.toString('utf-8')
          extractedText += `\n--- Content from ${file.name} ---\n${text}\n`
        } else {
          extractedText += `\n--- ${file.name} (Unsupported format for text extraction) ---\n`
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        extractedText += `\n--- Error extracting content from ${file.name} ---\n`
      }
    }

    return NextResponse.json({ text: extractedText.trim() })

  } catch (error) {
    console.error("Extraction API Error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from files." },
      { status: 500 }
    )
  }
}
