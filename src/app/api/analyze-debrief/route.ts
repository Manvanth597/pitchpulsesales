import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"

export async function POST(req: NextRequest) {
  try {
    const { summary, objectionFaced, yourResponse, outcome, selfScore } = await req.json()

    if (!summary) return NextResponse.json({ error: "Missing summary" }, { status: 400 })

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `
You are an elite B2B sales coach analyzing a recent sales call debrief.

Rep's Summary: ${summary}
Objection Faced: ${objectionFaced || "None"}
Rep's Response to Objection: ${yourResponse || "N/A"}
Call Outcome: ${outcome}
Rep's Self-Confidence Score (1-10): ${selfScore}

Analyze this interaction. Extract patterns, gauge sentiment, and recommend improvements for the next interaction.

Return ONLY valid JSON in this exact format:
{
  "sentiment": "",
  "missedOpportunities": [],
  "detectedObjections": [],
  "recommendedImprovements": [],
  "confidenceAnalysis": ""
}
`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            missedOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedObjections: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceAnalysis: { type: Type.STRING },
          },
          required: ["sentiment", "missedOpportunities", "detectedObjections", "recommendedImprovements", "confidenceAnalysis"]
        }
      }
    })

    const text = response.text
    if (!text) throw new Error("No text generated")

    return NextResponse.json(JSON.parse(text))
  } catch (error) {
    console.error("Analyze Debrief Error:", error)
    return NextResponse.json({ error: "Failed to analyze debrief" }, { status: 500 })
  }
}
