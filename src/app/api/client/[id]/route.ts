import { NextRequest, NextResponse } from "next/server"
import { getClient } from "@/lib/db"
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await getClient(id)
    
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const dealHealth = calculateDealHealthFromClient(client)
    return NextResponse.json({ ...client, dealHealth })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

