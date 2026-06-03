import { NextRequest, NextResponse } from "next/server"
import { getClient, saveClient } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { clientId, improvedPitch, triggerEvent, appliedChanges, aiSummary } = await req.json()

    if (!clientId || !improvedPitch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Push current pitch to history
    const version = client.evolutionHistory.length + 1
    client.evolutionHistory.push({
      id: crypto.randomUUID(),
      version,
      timestamp: new Date().toISOString(),
      previousNarrative: client.evolvingPitch,
      improvedNarrative: improvedPitch,
      triggerEvent: triggerEvent || "Debrief Analysis",
      appliedChanges: appliedChanges || [],
      aiSummary: aiSummary
    })

    // Update current pitch
    client.evolvingPitch = improvedPitch
    client.updatedAt = new Date().toISOString()

    await saveClient(client)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Apply Evolution Error:", error)
    return NextResponse.json({ error: "Failed to apply evolution" }, { status: 500 })
  }
}
