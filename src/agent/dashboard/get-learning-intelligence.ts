import { getPatternInsights } from "@/agent/learning/pattern-insights";
import { LearningIntelligence, PatternInsight, ObjectionInsight } from "./types";
import { SalesPattern, getDatabase } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";

// Helper to map SalesPattern to PatternInsight
function mapPattern(p: SalesPattern): PatternInsight {
    return {
        id: p.id,
        objectionType: p.objectionType,
        pattern: p.pattern,
        effectivenessScore: p.effectivenessScore,
        wins: p.wins,
        losses: p.losses,
        uses: p.uses,
        lastUpdated: p.lastUpdated
    };
}

/**
 * Exposes organizational learning to managers.
 * Directly integrates with the existing Pattern Insights Engine.
 */
export async function getLearningIntelligence(): Promise<LearningIntelligence> {
    // 1. Retrieve data using a single engine call
    const insights = getPatternInsights();
    
    // 2. Map Patterns
    const topPatterns = insights.topPatterns.map(mapPattern);
    const weakestPatterns = insights.weakestPatterns.map(mapPattern);
    const fastestGrowingPatterns = insights.fastestGrowingPatterns.map(mapPattern);
    
    // 3. Map Objections & calculate percentages
    const totalObjections = insights.topObjections.reduce((sum, obj) => sum + obj.uses, 0);
    const topObjections: ObjectionInsight[] = insights.topObjections.map(obj => ({
        objectionType: obj.objectionType,
        count: obj.uses,
        percentage: totalObjections > 0 ? Math.round((obj.uses / totalObjections) * 100) : 0
    }));

    const db = getDatabase();
    const { content: learningSummaryText, usedCachedData } = await getCachedInsightText(
        db.learningInsightVersion || 0,
        "learningSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const bestPatternStr = topPatterns.length > 0 ? topPatterns[0].pattern : "none";
            const topObjStr = topObjections.length > 0 ? topObjections[0].objectionType : "none";
            const prompt = `Write a short 1-sentence learning summary. Best pattern: ${bestPatternStr}. Top objection: ${topObjStr}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "Insufficient data to generate learning insights.";
        }
    );

    return {
        topPatterns,
        weakestPatterns,
        topObjections,
        fastestGrowingPatterns,
        learningSummaryText,
        usedCachedData
    };
}

