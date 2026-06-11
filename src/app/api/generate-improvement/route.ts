import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { getClient } from "@/lib/db"
import { loadSkillContext } from "@/agent/tools/load-skill-context"

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json()
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 })

    const client = await getClient(clientId)
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    const latestDebrief = client.debriefs[client.debriefs.length - 1]
    if (!latestDebrief) return NextResponse.json({ error: "No debriefs found" }, { status: 400 })

    const latestObjection = latestDebrief?.objectionFaced || ""
    const skillContext = loadSkillContext(client.stage, latestObjection)

    const clientMemory = `
Company Name: ${client.companyName}
Current Sales Stage: ${client.stage}
Customer Context: ${client.customerContext}

Current Pitch:
${JSON.stringify(client.evolvingPitch, null, 2)}

Latest Call Debrief:
Summary: ${latestDebrief.summary}
Objection Faced: ${latestDebrief.objectionFaced || "None"}
Rep's Response: ${latestDebrief.yourResponse || "N/A"}
Outcome: ${latestDebrief.outcome}
Self Score: ${latestDebrief.selfScore}/10
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

You are an elite B2B sales coach analyzing a recent sales call debrief to evolve the salesperson's pitch.
Do NOT dramatically rewrite the entire pitch. Evolve it iteratively based on the debrief and the active sales skills. Maintain tone continuity.
Your goal is to optimize the pitch for real conversations, live sales calls, and objection resistance.

Return ONLY valid JSON with this exact structure:
{
  "previousResponse": "The specific snippet of the original pitch that failed or needed improvement",
  "improvedResponse": "The specifically improved wording for that snippet",
  "reasonForChange": "Brief explanation of why this change makes the pitch stronger",
  "toneAdjustments": ["List of tone adjustments"],
  "newDiscoveryQuestions": ["List of new discovery questions"],
  "additionalSuggestions": [
    {
      "title": "Short title",
      "description": "Concise explanation of a tactical adjustment",
      "actionType": "Apply to Pitch or Add to Qs"
    }
  ],
  "fullImprovedPitch": {
    "coldCallOpener": "...",
    "discoveryQuestions": ["..."],
    "coreNarrative": "...",
    "commonObjections": ["..."],
    "valuePositioning": ["..."]
  },
  "aiSummary": {
    "whyChanged": "Why the pitch needed to change",
    "whatImproved": "What specific improvements were made",
    "futureImpact": "How this will help future calls"
  }
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
            previousResponse: { type: Type.STRING },
            improvedResponse: { type: Type.STRING },
            reasonForChange: { type: Type.STRING },
            toneAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
            newDiscoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            additionalSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  actionType: { type: Type.STRING }
                },
                required: ["title", "description", "actionType"]
              }
            },
            fullImprovedPitch: {
              type: Type.OBJECT,
              properties: {
                coldCallOpener: { type: Type.STRING },
                discoveryQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                coreNarrative: { type: Type.STRING },
                commonObjections: { type: Type.ARRAY, items: { type: Type.STRING } },
                valuePositioning: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["coldCallOpener", "discoveryQuestions", "coreNarrative", "commonObjections", "valuePositioning"]
            },
            aiSummary: {
              type: Type.OBJECT,
              properties: {
                whyChanged: { type: Type.STRING },
                whatImproved: { type: Type.STRING },
                futureImpact: { type: Type.STRING }
              },
              required: ["whyChanged", "whatImproved", "futureImpact"]
            }
          },
          required: [
            "previousResponse", 
            "improvedResponse", 
            "reasonForChange", 
            "toneAdjustments", 
            "newDiscoveryQuestions", 
            "additionalSuggestions",
            "fullImprovedPitch",
            "aiSummary"
          ]
        }
      }
    })

    const text = response.text
    if (!text) throw new Error("No text generated")

    // Robustly extract JSON block in case of preamble/postamble or markdown tags
    let jsonString = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }
    
    return NextResponse.json(JSON.parse(jsonString.trim()))
  } catch (error) {
    console.error("Generate Improvement Error:", error)
    return NextResponse.json({ error: "Failed to generate improvement", details: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 })
  }
}
