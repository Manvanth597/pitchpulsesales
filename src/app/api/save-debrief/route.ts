import { NextRequest, NextResponse } from "next/server"
import { getClient, saveClient, invalidateDebriefCaches, invalidateSalesStageCaches } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { clientId, debrief } = await req.json()

    if (!clientId || !debrief) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Push the raw debrief to history. The analysis might be empty initially.
    client.debriefs.push({
      id: crypto.randomUUID(),
      ...debrief,
      analysis: null,
      createdAt: new Date().toISOString()
    })
    
    // Update basic trackers
    if (debrief.objectionFaced) {
      client.objectionHistory.push(debrief.objectionFaced)
    }
    client.confidenceTrend.push(debrief.selfScore)
    
    // Progress stage logic if closed won etc.
    let stageChanged = false;
    if (debrief.outcome === "Closed Won") {
      client.stage = "action"
      stageChanged = true;
    }

    await saveClient(client)
    invalidateDebriefCaches()
    if (stageChanged) invalidateSalesStageCaches()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save Debrief Error:", error)
    return NextResponse.json({ error: "Failed to save debrief" }, { status: 500 })
  }
}
