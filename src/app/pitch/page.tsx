"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { PitchCard } from "@/components/pitch/PitchCard"
import { LoadingSkeleton } from "@/components/pitch/LoadingSkeleton"

import { ExportPdfButton } from "@/components/pitch/ExportPdfButton"

type GeneratedPitch = {
  coldCallOpener: string
  discoveryQuestions: string[]
  coreNarrative: string
  commonObjections: string[]
  valuePositioning: string[]
}

export default function GeneratedPitchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pitchData, setPitchData] = useState<GeneratedPitch | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    const loadPitch = async () => {
      try {
        const storedClientId = sessionStorage.getItem("clientId")
        
        if (storedClientId) {
          // Fetch existing evolved pitch
          const response = await fetch(`/api/client/${storedClientId}`)
          if (!response.ok) throw new Error("Failed to load client memory.")
          const clientData = await response.json()
          setPitchData(clientData.evolvingPitch)
          setClientId(clientData.id)
        } else {
          // Generate new pitch
          const storedContext = sessionStorage.getItem("pitchContext")
          if (!storedContext) {
            router.push("/settings/context")
            return
          }

          const contextData = JSON.parse(storedContext)
          
          const response = await fetch("/api/generate-pitch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contextData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to generate pitch")
          }

          const data = await response.json()
          setPitchData(data)
          setClientId(data.clientId)
          sessionStorage.setItem("clientId", data.clientId)
          sessionStorage.removeItem("pitchContext") // Clean up
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPitch()
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              2. Your Generated Pitch
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Review and tweak your baseline narrative.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {pitchData && (
              <ExportPdfButton elementId="pitch-container" />
            )}
            <Button 
              size="lg" variant="outline"
              disabled={isLoading || !!error || !clientId}
              onClick={() => router.push(`/debrief/${clientId}`)}
            >
              Log Debrief
            </Button>
            <Button 
              size="lg" 
              disabled={isLoading || !!error || !clientId}
              onClick={() => router.push(`/pulse-plan/${clientId}`)}
            >
              Create Pulse Plan
            </Button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Generation Failed</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/settings/context")} variant="outline">
                Back to Setup
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        ) : isLoading || !pitchData ? (
          <LoadingSkeleton />
        ) : (
          <div id="pitch-container" className="space-y-6 bg-zinc-50 p-4 -mx-4 rounded-xl">
            <PitchCard 
              title="Cold Call Opener" 
              initialContent={pitchData.coldCallOpener} 
            />
            <PitchCard 
              title="Value Positioning" 
              initialContent={pitchData.valuePositioning} 
            />
            <PitchCard 
              title="Discovery Questions" 
              initialContent={pitchData.discoveryQuestions} 
            />
            <PitchCard 
              title="Core Narrative" 
              initialContent={pitchData.coreNarrative} 
            />
            <PitchCard 
              title="Common Objections" 
              initialContent={pitchData.commonObjections} 
            />
          </div>
        )}
      </main>
    </div>
  )
}
