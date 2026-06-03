"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react"

interface FileUploadZoneProps {
  onExtractionComplete: (text: string) => void
}

export function FileUploadZone({ onExtractionComplete }: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successFiles, setSuccessFiles] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    acceptedFiles.forEach((file) => formData.append("files", file))

    try {
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Failed to extract text from files.")
      }

      const data = await res.json()
      
      setSuccessFiles(prev => [...prev, ...acceptedFiles.map(f => f.name)])
      onExtractionComplete(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during file upload.")
    } finally {
      setIsUploading(false)
    }
  }, [onExtractionComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt']
    }
  })

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm font-medium text-zinc-900">Extracting content...</p>
              <p className="text-xs text-zinc-500">Parsing PDF, DOCX, or PPTX</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm font-medium text-zinc-900">
                {isDragActive ? "Drop the files here" : "Drag & drop files or click to upload"}
              </p>
              <p className="text-xs text-zinc-500">
                Upload PDFs, Word (DOCX), or PowerPoint (PPTX) to provide more context.
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {successFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Attached Context</p>
          {successFiles.map((fileName, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-zinc-700 bg-zinc-100 p-2 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <FileText className="h-4 w-4 text-zinc-400" />
              <span className="truncate">{fileName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
