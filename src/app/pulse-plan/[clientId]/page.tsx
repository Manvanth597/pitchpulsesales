"use client"

import { useEffect, useState } from "react"
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

const pulseSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  customerContext: z.string().min(1, "Context is required"),
  predictedObjection: z.string().min(1, "Predicted objection is required"),
  plannedResponse: z.string().min(1, "Planned response is required"),
  callObjective: z.string().min(1, "Call objective is required"),
  confidenceLevel: z.number().min(1).max(10)
})

type PulseFormValues = z.infer<typeof pulseSchema>

interface PulsePlanSuggestions {
  recommendedOpener?: string
  discoveryQuestions?: string[]
  tacticalSuggestions?: string[]
  predictedObjections?: string[]
  plannedResponses?: string[]
}

export default function PulsePlanPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestions, setSuggestions] = useState<PulsePlanSuggestions | null>(null)

  const form = useForm<PulseFormValues>({
    resolver: zodResolver(pulseSchema),
    defaultValues: {
      companyName: "",
      customerContext: "",
      predictedObjection: "",
      plannedResponse: "",
      callObjective: "",
      confidenceLevel: 5
    }
  })

  useEffect(() => {
    const init = async () => {
      try {
        const clientRes = await fetch(`/api/client/${clientId}`)
        if (!clientRes.ok) throw new Error("Client not found")
        const client = await clientRes.json()

        form.reset({
          companyName: client.companyName,
          customerContext: client.customerContext,
          predictedObjection: "",
          plannedResponse: "",
          callObjective: "",
          confidenceLevel: 5
        })
        setIsLoading(false)

        const planRes = await fetch("/api/generate-pulse-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId })
        })
        
        if (planRes.ok) {
          const aiPlan = await planRes.json()
          setSuggestions(aiPlan)
          // Auto-populate based on AI suggestions if empty
          form.setValue("predictedObjection", aiPlan.predictedObjections?.[0] || "")
          form.setValue("plannedResponse", aiPlan.plannedResponses?.[0] || "")
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
    }
    
    if (clientId) init()
  }, [clientId, form])

  const onSubmit = async (data: PulseFormValues) => {
    setIsSubmitting(true)
    try {
      // API call to save pulse plan and improve pitch
      const res = await fetch("/api/improve-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, pulsePlan: data, type: "pulse_plan" })
      })

      if (!res.ok) throw new Error("Failed to improve pitch")
      
      router.push(`/pitch`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[60%]">
          <Card className="p-6 sm:p-8 border-border/60 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight mb-8">Prepare Pulse Plan</h1>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company / Prospect Name</label>
                <Input {...form.register("companyName")} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Context</label>
                <Textarea {...form.register("customerContext")} rows={4} />
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Anticipated Challenges</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Predicted Objection</label>
                  <Input {...form.register("predictedObjection")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Planned Response</label>
                  <Textarea {...form.register("plannedResponse")} rows={3} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Call Objective</label>
                  <Input {...form.register("callObjective")} placeholder="e.g. Schedule technical deep dive" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Confidence Level</label>
                    <span className="text-sm font-semibold bg-zinc-100 px-2 py-1 rounded-md">{form.watch("confidenceLevel")}/10</span>
                  </div>
                  <Slider 
                    min={1} max={10} step={1} 
                    {...form.register("confidenceLevel", { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Improving Pitch..." : "Improve Pitch"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: AI Suggestions */}
        <div className="w-full lg:w-[40%] space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Suggested Snippets</h2>
          
          {isGenerating ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-zinc-200 rounded-xl" />
              <div className="h-48 bg-zinc-200 rounded-xl" />
            </div>
          ) : suggestions ? (
            <>
              <Card className="p-5 border-border/60 shadow-sm bg-zinc-50">
                <h4 className="text-sm font-semibold mb-2">Recommended Opener</h4>
                <p className="text-sm text-zinc-700">{suggestions.recommendedOpener}</p>
              </Card>

              <Card className="p-5 border-border/60 shadow-sm bg-zinc-50">
                <h4 className="text-sm font-semibold mb-2">Discovery Questions</h4>
                <ul className="text-sm text-zinc-700 space-y-2 list-disc pl-4">
                  {suggestions.discoveryQuestions?.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5 border-border/60 shadow-sm bg-zinc-50">
                <h4 className="text-sm font-semibold mb-2">Tactical Suggestions</h4>
                <ul className="text-sm text-zinc-700 space-y-2 list-disc pl-4">
                  {suggestions.tacticalSuggestions?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Failed to load suggestions.</p>
          )}
        </div>

      </main>
    </div>
  )
}
