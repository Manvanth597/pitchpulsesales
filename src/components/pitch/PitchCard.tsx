"use client"

import { useState } from "react"
import { Copy, Check, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface PitchCardProps {
  title: string
  initialContent: string | string[]
}

export function PitchCard({ title, initialContent }: PitchCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState<string>(
    Array.isArray(initialContent) ? initialContent.map(item => `• ${item}`).join('\n\n') : initialContent
  )
  const [draftContent, setDraftContent] = useState(content)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
    }
  }

  const handleSave = () => {
    setContent(draftContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftContent(content)
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm group hover:border-zinc-300 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopy}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                title="Copy"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCancel}
                className="h-8 w-8 text-zinc-400 hover:text-red-600"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSave}
                className="h-8 w-8 text-zinc-400 hover:text-green-600"
                title="Save"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        {isEditing ? (
          <Textarea 
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="min-h-[120px] font-sans text-sm text-zinc-700 focus-visible:ring-primary/20"
            autoFocus
          />
        ) : (
          <div className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap font-sans">
            {content}
          </div>
        )}
      </div>
    </div>
  )
}
