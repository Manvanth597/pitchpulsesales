import { NextResponse } from "next/server"
import { getAllClients } from "@/lib/db"
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health"

export async function GET() {
  try {
    const clients = await getAllClients()
    const clientsWithHealth = clients.map(client => ({
      ...client,
      dealHealth: calculateDealHealthFromClient(client)
    }))
    return NextResponse.json(clientsWithHealth)
  } catch (error) {
    console.error("Fetch Clients Error:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

