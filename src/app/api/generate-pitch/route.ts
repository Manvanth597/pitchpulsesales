import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productDescription, targetCustomer, pricingModel, coreValueProposition, additionalContext } = body

    if (!productDescription || !targetCustomer || !pricingModel || !coreValueProposition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    })

    const prompt = `
You are an elite B2B sales strategist helping sales representatives prepare for real customer conversations.

Your job is NOT to generate marketing copy.

Your job is to generate:
- operational sales messaging
- conversational talking points
- discovery questions
- objection handling
- positioning language

The output must feel:
- concise
- natural
- practical
- conversational
- tactical

Avoid:
- buzzwords
- hype
- exaggerated claims
- robotic language
- corporate jargon
- generic startup phrasing

Focus on:
- clarity
- buyer psychology
- conversational flow
- sales practicality

Always optimize for:
- cold calls
- demos
- outbound conversations
- founder-led sales
- SMB and enterprise sales conversations

Return only valid JSON.

Generate a structured sales pitch framework using the company information below.

Company Information:

Product Description:
${productDescription}

Target Customer:
${targetCustomer}

Pricing Model:
${pricingModel}

Core Value Proposition:
${coreValueProposition}

${additionalContext ? `Additional Context from Uploaded Files:\n${additionalContext}\n` : ""}

Generate the following:

1. Cold Call Opener
- short
- conversational
- personalized to the target customer

2. Discovery Questions
- 5 practical qualification questions
- designed to uncover pain points

3. Core Narrative
- concise positioning explanation
- explain value clearly
- avoid sounding scripted

4. Common Objections
- realistic objections this buyer may raise
- concise phrasing

5. Value Positioning
- 3 concise positioning bullets
- focused on business outcomes

IMPORTANT RULES:
- Be concise
- Sound human
- Avoid generic AI tone
- Avoid long paragraphs
- Avoid marketing fluff
- Optimize for real sales conversations

Return ONLY valid JSON in this exact format:

{
  "coldCallOpener": "",
  "discoveryQuestions": [],
  "coreNarrative": "",
  "commonObjections": [],
  "valuePositioning": []
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
            coldCallOpener: {
              type: Type.STRING,
            },
            discoveryQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreNarrative: {
              type: Type.STRING,
            },
            commonObjections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            valuePositioning: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["coldCallOpener", "discoveryQuestions", "coreNarrative", "commonObjections", "valuePositioning"],
        },
      },
    })

    const text = response.text
    
    if (!text) {
      throw new Error("No response text generated from Gemini.")
    }

    const data = JSON.parse(text)

    // Save to DB
    const { saveClient } = await import("@/lib/db")
    const clientId = crypto.randomUUID()
    
    await saveClient({
      id: clientId,
      companyName: targetCustomer,
      stage: "awareness",
      pulsePlans: [],
      debriefs: [],
      evolvingPitch: data,
      evolutionHistory: [],
      customerContext: additionalContext || "",
      objectionHistory: [],
      confidenceTrend: [],
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ ...data, clientId })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return NextResponse.json(
      { error: "Failed to generate pitch. Please try again." },
      { status: 500 }
    )
  }
}
