"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Navbar } from "@/components/layout/Navbar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"

import type { Debrief } from "@/lib/db"

const debriefSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  objectionFaced: z.string().optional(),
  yourResponse: z.string().optional(),
  outcome: z.string().min(1, "Outcome is required"),
  selfScore: z.number().min(1).max(10)
})

type DebriefFormValues = z.infer<typeof debriefSchema>

export default function DebriefPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis] = useState<NonNullable<Debrief["analysis"]> | null>(null)

  const form = useForm<DebriefFormValues>({
    resolver: zodResolver(debriefSchema),
    defaultValues: {
      summary: "",
      objectionFaced: "",
      yourResponse: "",
      outcome: "Neutral",
      selfScore: 5
    }
  })

  const onSubmit = async (data: DebriefFormValues) => {
    setIsSubmitting(true)
    try {
      // 1. Save Debrief
      const saveRes = await fetch("/api/save-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, debrief: data })
      })
      if (!saveRes.ok) throw new Error("Failed to save debrief")
      
      // 2. Redirect to Evolution Improvement screen
      router.push(`/improvement/${clientId}`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[60%]">
          <Card className="p-6 sm:p-8 border-border/60 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Log Debrief</h1>
              <div className="flex bg-zinc-100 rounded-md p-1 border border-zinc-200">
                <button className="px-4 py-1.5 text-sm font-medium bg-white rounded shadow-sm text-zinc-900 border border-zinc-200 cursor-not-allowed">Type</button>
                <button className="px-4 py-1.5 text-sm font-medium text-zinc-500 cursor-not-allowed">Voice</button>
              </div>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What happened?</label>
                <Textarea {...form.register("summary")} rows={4} placeholder="Brief summary of the call..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Objection Faced</label>
                  <Input {...form.register("objectionFaced")} placeholder="What did they push back on?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Response</label>
                  <Input {...form.register("yourResponse")} placeholder="How did you handle it?" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Outcome</label>
                  <select 
                    {...form.register("outcome")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Self-Score (1-10)</label>
                    <span className="text-sm font-semibold bg-zinc-100 px-2 py-1 rounded-md">{form.watch("selfScore")}/10</span>
                  </div>
                  <Slider 
                    min={1} max={10} step={1} 
                    {...form.register("selfScore", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating Improvement...</span>
                  ) : "Generate Improvement"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="w-full lg:w-[40%] space-y-4">
          <Card className="p-5 border-border/60 shadow-sm bg-zinc-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/90 pointer-events-none" />
            <h4 className="text-sm font-semibold mb-2">Transcript Preview</h4>
            <div className="text-xs font-mono text-zinc-500 space-y-1">
              <p>[00:00] You: Hi, is this John?</p>
              <p>[00:03] Prospect: Yes, who is this?</p>
              <p>[00:05] You: I&apos;m calling from...</p>
              <p className="pt-2 text-center border-t border-dashed border-zinc-200 mt-2">...</p>
            </div>
          </Card>

          <Card className="p-5 border-border/60 shadow-sm bg-zinc-50 min-h-[150px]">
            <h4 className="text-sm font-semibold mb-4">Extracted Insights</h4>
            {analysis ? (
              <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center bg-white p-2 rounded border border-zinc-200">
                  <span className="text-xs font-semibold text-zinc-500">Sentiment</span>
                  <span className="text-sm text-zinc-900">{analysis.sentiment}</span>
                </div>
                <div className="flex flex-col bg-white p-2 rounded border border-zinc-200">
                  <span className="text-xs font-semibold text-zinc-500 mb-1">Detected Objections</span>
                  <span className="text-sm text-zinc-900">{analysis.detectedObjections?.join(", ") || "None"}</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground pt-4 pb-8">
                {isSubmitting ? "Analyzing debrief..." : "Submit debrief to view insights."}
              </div>
            )}
          </Card>
        </div>

      </main>
    </div>
  )
}
