"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, History, Download, X } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { ClientMemory, EvolutionHistory, GeneratedPitch } from "@/lib/db"

export default function PitchEvolutionHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const [client, setClient] = useState<ClientMemory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Modal state
  const [viewPitchContent, setViewPitchContent] = useState<GeneratedPitch | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/client/${clientId}`)
        if (!res.ok) throw new Error("Failed to fetch client")
        const data = await res.json()
        setClient(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    if (clientId) fetchClient()
  }, [clientId])

  const handleRestore = async (versionId: string) => {
    setIsRestoring(true)
    try {
      const res = await fetch("/api/restore-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, versionId })
      })
      if (!res.ok) throw new Error("Failed to restore")
      
      // Reload page to reflect new state
      window.location.reload()
    } catch (err) {
      console.error(err)
      setIsRestoring(false)
    }
  }

  const handleExport = async () => {
    if (!client || !timelineRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(timelineRef.current, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Pitch_Evolution_${client.companyName}.pdf`)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading || !client) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

  const currentVersionNum = client.evolutionHistory.length + 1

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        <div className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors w-fit" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Pitch Evolution History
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              How your narrative for {client.companyName} has adapted over time.
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={isExporting} className="shrink-0 gap-2">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export History
          </Button>
        </div>

        {/* Timeline Container for PDF Export */}
        <div ref={timelineRef} className="space-y-8 relative pl-4 sm:pl-8 pb-12 bg-zinc-50">
          
          {/* Vertical Timeline Line */}
          <div className="absolute left-[27px] sm:left-[43px] top-6 bottom-0 w-0.5 bg-zinc-200" />

          {/* Current Version Card */}
          <div className="relative">
            <div className="absolute -left-[18px] sm:-left-[18px] top-6 h-5 w-5 rounded-full bg-white border-4 border-zinc-900 z-10" />
            <Card className="ml-8 sm:ml-12 p-6 border-zinc-400 shadow-md bg-white">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold tracking-tight">Version {currentVersionNum}.0</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider">
                      Current
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">Active right now</p>
                </div>
                <Button variant="default" size="sm" onClick={() => setViewPitchContent(client.evolvingPitch)}>
                  View Full Pitch
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Trigger Event</h4>
                  <div className="bg-zinc-100 px-4 py-3 rounded-md text-sm text-zinc-800">
                    {client.evolutionHistory.length > 0 
                      ? client.evolutionHistory[client.evolutionHistory.length - 1].triggerEvent 
                      : "Initial Setup"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Historical Versions */}
          {[...client.evolutionHistory].reverse().map((historyItem: EvolutionHistory) => (
            <div key={historyItem.id} className="relative">
              <div className="absolute -left-[16px] sm:-left-[16px] top-6 h-4 w-4 rounded-full bg-zinc-200 border-2 border-white z-10" />
              <Card className="ml-8 sm:ml-12 p-6 border-zinc-200 shadow-sm bg-white/60 hover:bg-white transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-zinc-700">Version {historyItem.version}.0</h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {new Date(historyItem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewPitchContent(historyItem.improvedNarrative)}>
                      View Full Pitch
                    </Button>
                    <Button variant="secondary" size="sm" disabled={isRestoring} onClick={() => handleRestore(historyItem.id)} className="gap-2">
                      <History className="h-3.5 w-3.5" /> Restore
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Trigger Event</h4>
                    <div className="bg-zinc-100/50 px-4 py-2 rounded-md text-sm text-zinc-700">
                      {historyItem.triggerEvent}
                    </div>
                  </div>
                  
                  {historyItem.appliedChanges && historyItem.appliedChanges.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Key Changes</h4>
                      <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                        {historyItem.appliedChanges.map((change: string, idx: number) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {historyItem.aiSummary && (
                    <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-md mt-4">
                      <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">AI Evolution Summary</h4>
                      <p className="text-sm text-blue-900/80 mb-2"><span className="font-medium text-blue-900">Why changed:</span> {historyItem.aiSummary.whyChanged}</p>
                      <p className="text-sm text-blue-900/80 mb-2"><span className="font-medium text-blue-900">What improved:</span> {historyItem.aiSummary.whatImproved}</p>
                      <p className="text-sm text-blue-900/80"><span className="font-medium text-blue-900">Future Impact:</span> {historyItem.aiSummary.futureImpact}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}

        </div>
      </main>

      {/* Lightweight View Pitch Modal */}
      {viewPitchContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-100">
              <h2 className="text-lg font-semibold tracking-tight">Pitch Snapshot</h2>
              <button onClick={() => setViewPitchContent(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">Cold Call Opener</h3>
                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">{viewPitchContent.coldCallOpener}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">Core Narrative</h3>
                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">{viewPitchContent.coreNarrative}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">Discovery Questions</h3>
                <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                  {viewPitchContent.discoveryQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">Value Positioning</h3>
                <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                  {viewPitchContent.valuePositioning.map((v: string, i: number) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
