import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { getClient } from "@/lib/db"
import { loadSkillContext } from "@/agent/tools/load-skill-context"
import { retrievePatterns } from "@/agent/learning/retrieve-patterns"
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health"
import { isQuotaError } from "@/lib/cache-insights"

export async function POST(req: NextRequest) {
  let clientId: string | undefined;
  try {
    const json = await req.json()
    clientId = json.clientId
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 })

    const client = await getClient(clientId)
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    const latestDebrief = client.debriefs.length > 0 ? client.debriefs[client.debriefs.length - 1] : null
    const rawObjection = latestDebrief?.objectionFaced || (client.objectionHistory.length > 0 ? client.objectionHistory[client.objectionHistory.length - 1] : "") || ""
    const objectionType = rawObjection.toLowerCase().trim()
    const skillContext = loadSkillContext(client.stage, objectionType)

    const learnedPatterns = objectionType ? retrievePatterns(objectionType) : []

    console.log(
      "[Learning Engine] Loaded Patterns:",
      learnedPatterns
    )

    const patternContext =
      learnedPatterns.length > 0
        ? learnedPatterns
            .map(
              (pattern, index) => `
${index + 1}. Pattern:
${pattern.pattern}

Effectiveness:
${pattern.effectivenessScore}%

Uses:
${pattern.uses}

Examples:
${pattern.examples.join(", ")}
`
            )
            .join("\n")
        : "No historical patterns available."

    console.log(
      "[Learning Engine] Pattern Context:",
      patternContext
    )

    const patternsBlock = `
==============================
TOP PERFORMING SALES PATTERNS
==============================

${patternContext}
`


    const clientMemory = `
Company Name: ${client.companyName}
Current Sales Stage: ${client.stage}
Customer Context: ${client.customerContext}

Past Objections Faced:
${client.objectionHistory.length > 0 ? client.objectionHistory.map(o => "- " + o).join('\n') : "None yet."}

Past Debrief Summaries:
${client.debriefs.length > 0 ? client.debriefs.map(d => "- " + d.summary).join('\n') : "No past debriefs."}
`

    const prompt = `
==============================
ACTIVE SALES SKILLS
==============================

${skillContext}
${patternsBlock}
==============================
CLIENT MEMORY
==============================

${clientMemory}

==============================
TASK
==============================

You are an elite B2B sales strategist. A sales rep is preparing for their next interaction with the client.
Generate a suggested Pulse Plan to help the rep prepare. Provide highly tactical, situational advice based on their history and the active sales skills. If history is empty, rely on the base context.

Return ONLY valid JSON in this exact format:
{
  "recommendedOpener": "",
  "discoveryQuestions": [],
  "predictedObjections": [],
  "plannedResponses": [],
  "confidenceInsights": [],
  "tacticalSuggestions": []
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
            recommendedOpener: { type: Type.STRING },
            discoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedObjections: { type: Type.ARRAY, items: { type: Type.STRING } },
            plannedResponses: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            tacticalSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["recommendedOpener", "discoveryQuestions", "predictedObjections", "plannedResponses", "confidenceInsights", "tacticalSuggestions"]
        }
      }
    })

    const text = response.text
    if (!text) throw new Error("No text generated")

    const parsed = JSON.parse(text)
    const dealHealth = calculateDealHealthFromClient(client)

    return NextResponse.json({ ...parsed, dealHealth })
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn("Pulse Plan fallback triggered due to Gemini 429 Quota Error.");
      const clientFallback = clientId ? await getClient(clientId).catch(() => null) : null;
      return NextResponse.json({
        recommendedOpener: "Focus on active listening and addressing the immediate customer context.",
        discoveryQuestions: ["What are your primary goals for this quarter?", "How does our solution align with your timeline?"],
        predictedObjections: ["Budget constraints", "Timing is not right"],
        plannedResponses: ["Highlight ROI", "Focus on immediate value"],
        confidenceInsights: ["Show empathy and expertise"],
        tacticalSuggestions: ["Keep the conversation focused on value and next steps"],
        dealHealth: clientFallback ? calculateDealHealthFromClient(clientFallback) : 50,
        isFallback: true
      });
    }
    console.error("Generate Pulse Plan Error:", error)
    return NextResponse.json({ error: "Failed to generate pulse plan", details: error instanceof Error ? error.message : String(error), isQuota: isQuotaError(error) }, { status: 500 })
  }
}
