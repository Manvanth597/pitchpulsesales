import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { getClient, saveClient } from "@/lib/db"
import { loadSkillContext } from "@/agent/tools/load-skill-context"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, pulsePlan, debriefAnalysis } = body

    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 })

    const client = await getClient(clientId)
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    // Save newly provided data to the client memory before generating pitch
    if (pulsePlan) {
      client.pulsePlans.push({
        id: crypto.randomUUID(),
        ...pulsePlan,
        createdAt: new Date().toISOString()
      })
      // Update basic context from pulse plan
      client.companyName = pulsePlan.companyName
      client.customerContext = pulsePlan.customerContext
      client.confidenceTrend.push(pulsePlan.confidenceLevel)
    }

    if (debriefAnalysis) {
      client.debriefs.push({
        id: crypto.randomUUID(),
        ...debriefAnalysis.raw,
        analysis: debriefAnalysis.analysis,
        createdAt: new Date().toISOString()
      })
      // Update objections list
      if (debriefAnalysis.raw.objectionFaced) {
        client.objectionHistory.push(debriefAnalysis.raw.objectionFaced)
      }
      client.confidenceTrend.push(debriefAnalysis.raw.selfScore)
    }

    const latestDebrief = client.debriefs.length > 0 ? client.debriefs[client.debriefs.length - 1] : null
    const latestObjection = debriefAnalysis?.raw?.objectionFaced || pulsePlan?.predictedObjection || latestDebrief?.objectionFaced || ""
    const skillContext = loadSkillContext(client.stage, latestObjection)

    const clientMemory = `
Company Name: ${client.companyName}
Current Sales Stage: ${client.stage}
Customer Context: ${client.customerContext}

Current Evolving Pitch:
${JSON.stringify(client.evolvingPitch, null, 2)}

Latest Update Context:
${pulsePlan ? `The rep is preparing for a call. Predicted Objection: ${pulsePlan.predictedObjection}. Planned Response: ${pulsePlan.plannedResponse}.` : ""}
${debriefAnalysis ? `The rep just finished a call. Summary: ${debriefAnalysis.raw.summary}. Objection Faced: ${debriefAnalysis.raw.objectionFaced}. Outcome: ${debriefAnalysis.raw.outcome}. AI Analysis: ${JSON.stringify(debriefAnalysis.analysis)}` : ""}
`

    const prompt = `
==============================
ACTIVE SALES SKILLS
==============================

${skillContext}

==============================
CLIENT MEMORY
==============================

${clientMemory}

==============================
TASK
==============================

You are an elite B2B sales strategist. You are iteratively improving an existing sales pitch for the client.
Do NOT rewrite the entire pitch from scratch. Evolve it gradually based on new context. Preserve tone continuity.
Use this new information and the active sales skills to make strategic adjustments to the pitch.
Ensure the output follows the exact same JSON schema as the original pitch, but with the necessary improvements integrated.
If you add new objections, keep them concise and tactical.

Return ONLY valid JSON in this exact format:
{
  "coldCallOpener": "",
  "discoveryQuestions": [],
  "coreNarrative": "",
  "commonObjections": [],
  "valuePositioning": []
}
`

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coldCallOpener: { type: Type.STRING },
            discoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            coreNarrative: { type: Type.STRING },
            commonObjections: { type: Type.ARRAY, items: { type: Type.STRING } },
            valuePositioning: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["coldCallOpener", "discoveryQuestions", "coreNarrative", "commonObjections", "valuePositioning"]
        }
      }
    })

    const text = response.text
    if (!text) throw new Error("No text generated")

    const improvedPitch = JSON.parse(text)

    // Update evolving pitch
    client.evolvingPitch = improvedPitch
    client.updatedAt = new Date().toISOString()
    
    // Progress stage logic if closed won etc.
    if (debriefAnalysis && debriefAnalysis.raw.outcome === "Closed Won") {
      client.stage = "action"
    }

    await saveClient(client)

    return NextResponse.json({ success: true, pitch: improvedPitch })
  } catch (error) {
    console.error("Improve Pitch Error:", error)
    return NextResponse.json({ error: "Failed to improve pitch" }, { status: 500 })
  }
}
