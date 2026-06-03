import { NextRequest, NextResponse } from "next/server"
import { getClient, saveClient } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { clientId, versionId } = await req.json()

    if (!clientId || !versionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const versionToRestore = client.evolutionHistory.find(v => v.id === versionId)
    if (!versionToRestore) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Push current pitch to history before restoring
    const newVersionNum = client.evolutionHistory.length + 1
    client.evolutionHistory.push({
      id: crypto.randomUUID(),
      version: newVersionNum,
      timestamp: new Date().toISOString(),
      previousNarrative: client.evolvingPitch,
      improvedNarrative: versionToRestore.improvedNarrative,
      triggerEvent: `Restored Version ${versionToRestore.version}`,
      appliedChanges: ["Restored to previous state"]
    })

    // Update current pitch
    client.evolvingPitch = versionToRestore.improvedNarrative
    client.updatedAt = new Date().toISOString()

    await saveClient(client)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Restore Version Error:", error)
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 })
  }
}
