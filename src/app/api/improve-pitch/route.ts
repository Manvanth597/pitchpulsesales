import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { getClient, saveClient, invalidateEvolutionCaches, invalidateDebriefCaches, invalidateSalesStageCaches } from "@/lib/db"
import { loadSkillContext } from "@/agent/tools/load-skill-context"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[DIAGNOSTIC] /api/improve-pitch - Received body:", JSON.stringify(body, null, 2))
    const { clientId, pulsePlan, debriefAnalysis } = body

    if (!clientId) {
      console.log("[DIAGNOSTIC] /api/improve-pitch - Missing clientId")
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 })
    }

    const client = await getClient(clientId)
    if (!client) {
      console.log(`[DIAGNOSTIC] /api/improve-pitch - Client not found for ID: ${clientId}`)
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    
    console.log(`[DIAGNOSTIC] /api/improve-pitch - Client found. Debrief count: ${client.debriefs?.length}, Evolution history count: ${client.evolutionHistory?.length}`);

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

    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    })

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
    console.log("[DIAGNOSTIC] /api/improve-pitch - Generated text:", text);
    if (!text) {
      console.log("[DIAGNOSTIC] /api/improve-pitch - No text generated by AI");
      throw new Error("No text generated")
    }

    // Robust JSON extraction
    let jsonString = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }
    const improvedPitch = JSON.parse(jsonString.trim())
    console.log("[DIAGNOSTIC] /api/improve-pitch - Parsed improved pitch successfully");

    // Update evolving pitch
    client.evolvingPitch = improvedPitch
    client.updatedAt = new Date().toISOString()
    
    // Progress stage logic if closed won etc.
    let stageChanged = false;
    if (debriefAnalysis && debriefAnalysis.raw.outcome === "Closed Won") {
      client.stage = "action"
      stageChanged = true;
    }

    await saveClient(client)
    
    // Invalidate caches based on what happened
    invalidateEvolutionCaches();
    if (debriefAnalysis) invalidateDebriefCaches();
    if (stageChanged) invalidateSalesStageCaches();

    console.log("[DIAGNOSTIC] /api/improve-pitch - Success");
    return NextResponse.json({ success: true, pitch: improvedPitch })
  } catch (error) {
    console.error("[DIAGNOSTIC ERROR] Improve Pitch Error:", error)
    if (error instanceof Error) {
      console.error("[DIAGNOSTIC ERROR STACK]:", error.stack);
    }
    return NextResponse.json({ error: "Failed to improve pitch", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
