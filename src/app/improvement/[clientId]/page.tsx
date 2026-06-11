"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, XCircle, CheckCircle2, Copy, Pencil } from "lucide-react"
import type { GeneratedPitch } from "@/lib/db"

interface Suggestion {
  title: string
  description: string
  actionType?: string
}

interface ImprovementData {
  reasonForChange: string
  aiSummary?: {
    whyChanged: string;
    whatImproved: string;
    futureImpact: string;
  }
  previousResponse: string
  improvedResponse: string
  newDiscoveryQuestions: string[]
  additionalSuggestions: Suggestion[]
  fullImprovedPitch: GeneratedPitch
}

export default function ImprovementPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [data, setData] = useState<ImprovementData | null>(null)
  const [finalPitch, setFinalPitch] = useState<GeneratedPitch | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImprovement = async () => {
      try {
        const res = await fetch("/api/generate-improvement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId })
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.details || errData.error || "Failed to generate improvement")
        }
        const payload = await res.json()
        setData(payload)
        setFinalPitch(payload.fullImprovedPitch)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (clientId) fetchImprovement()
  }, [clientId])

  const handleApplyQuestion = (idx: number, q: string) => {
    if (appliedSuggestions.has(idx)) return
    
    setFinalPitch((prev) => {
      if (!prev) return null
      return {
        ...prev,
        discoveryQuestions: [...prev.discoveryQuestions, q]
      }
    })
    
    setAppliedSuggestions(new Set(appliedSuggestions.add(idx)))
  }

  const handleApplySuggestion = (idx: number) => {
    if (appliedSuggestions.has(idx)) return
    // Conceptual apply (visual only for abstract suggestions)
    setAppliedSuggestions(new Set(appliedSuggestions.add(idx)))
  }

  const handleUpdatePitch = async () => {
    if (!data) return
    setIsUpdating(true)
    try {
      const res = await fetch("/api/apply-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          improvedPitch: finalPitch,
          triggerEvent: "Debrief Evolution",
          appliedChanges: [data.reasonForChange],
          aiSummary: data.aiSummary
        })
      })
      if (!res.ok) throw new Error("Failed to apply evolution")
      router.push(`/completion/${clientId}`)
    } catch (err) {
      console.error(err)
      setIsUpdating(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-zinc-900">Error Generating Improvement</h2>
            <p className="text-zinc-600">{error}</p>
            <Button onClick={() => router.push(`/completion/${clientId}`)}>Go Back</Button>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-10 animate-pulse">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-zinc-200 rounded-md" />
              <div className="h-4 w-48 bg-zinc-200 rounded-md" />
            </div>
            <div className="h-10 w-32 bg-zinc-200 rounded-md" />
          </div>
          
          <div className="flex items-center gap-6 animate-pulse">
            <div className="flex-1 h-64 bg-zinc-200 rounded-xl" />
            <div className="h-8 w-8 bg-zinc-200 rounded-full shrink-0" />
            <div className="flex-1 h-64 bg-zinc-300 rounded-xl shadow-sm" />
          </div>
          
          <div className="mt-12 space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-zinc-200 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-zinc-200 rounded-xl" />
              <div className="h-32 bg-zinc-200 rounded-xl" />
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-3 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium tracking-wide uppercase">AI is evolving your pitch...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Suggested Pitch Update
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Based on your last call debrief. {data.reasonForChange}
            </p>
          </div>
          <Button size="lg" onClick={handleUpdatePitch} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Update Pitch"}
          </Button>
        </div>

        {/* Side by Side Comparison */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          
          {/* Previous Response */}
          <Card className="flex-1 w-full p-6 sm:p-8 border-dashed border-zinc-300 bg-transparent shadow-none opacity-70">
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Previous Response</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              {data.previousResponse || "Original phrasing not found."}
            </p>
          </Card>

          {/* Arrow */}
          <div className="hidden lg:flex shrink-0 text-zinc-300">
            <ArrowRight className="h-8 w-8" />
          </div>

          {/* Improved Response */}
          <Card className="flex-1 w-full p-6 sm:p-8 border-zinc-300 shadow-md bg-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">Improved Response</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-md border border-zinc-200">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-md border border-zinc-200">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <p className="text-zinc-900 leading-relaxed font-medium">
              {data.improvedResponse}
            </p>
          </Card>
        </div>

        {/* Tactical Suggestions */}
        <div className="mt-16 space-y-6">
          <h3 className="text-lg font-semibold tracking-tight">Additional Suggestions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.newDiscoveryQuestions?.map((q: string, i: number) => {
              const idx = i + 100 // offset id
              const applied = appliedSuggestions.has(idx)
              return (
                <Card key={idx} className="p-5 border-zinc-200 shadow-sm bg-white flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">New Discovery Question</h4>
                    <p className="text-sm text-zinc-600">{q}</p>
                  </div>
                  <div className="flex justify-start">
                    <Button 
                      variant={applied ? "secondary" : "outline"} 
                      size="sm" 
                      onClick={() => handleApplyQuestion(idx, q)}
                      disabled={applied}
                    >
                      {applied ? "Added ✓" : "Add to Qs"}
                    </Button>
                  </div>
                </Card>
              )
            })}

            {data.additionalSuggestions?.map((s, i) => {
              const idx = i + 200
              const applied = appliedSuggestions.has(idx)
              return (
                <Card key={idx} className="p-5 border-zinc-200 shadow-sm bg-white flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{s.title}</h4>
                    <p className="text-sm text-zinc-600">{s.description}</p>
                  </div>
                  <div className="flex justify-start">
                    <Button 
                      variant={applied ? "secondary" : "outline"} 
                      size="sm" 
                      onClick={() => handleApplySuggestion(idx)}
                      disabled={applied}
                    >
                      {applied ? "Applied ✓" : s.actionType || "Apply to Pitch"}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}
