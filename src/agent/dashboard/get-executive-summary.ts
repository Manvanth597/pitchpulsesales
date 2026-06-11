import { getAllClients, getDatabase } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { ExecutiveSummary } from "./types";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";

export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    let healthyDeals = 0;
    let watchDeals = 0;
    let atRiskDeals = 0;
    let totalHealth = 0;
    let totalConfidence = 0;
    let expectedRevenue = 0;
    
    let totalPreviousHealth = 0;
    let dealsWithPreviousHealth = 0;

    activeDeals.forEach(client => {
        const health = calculateDealHealthFromClient(client);
        totalHealth += health.score;
        
        if (health.score >= 75) {
            healthyDeals++;
        } else if (health.score >= 50) {
            watchDeals++;
        } else {
            atRiskDeals++;
        }

        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
            
        const previousConfidence = client.confidenceTrend.length > 1
            ? client.confidenceTrend[client.confidenceTrend.length - 2]
            : latestConfidence;
            
        totalConfidence += latestConfidence;

        // Using a mock deal value as it's not present in ClientMemory schema
        const dealValue = 50000;
        
        // Sum: deal.value * (latestConfidence / 100)
        // Note: latestConfidence is 1-10 in schema, but applying exact requested formula
        expectedRevenue += dealValue * (latestConfidence / 100);
        
        // Mocking previous health to calculate a trend
        if (client.confidenceTrend.length > 1) {
            const healthDiff = (latestConfidence - previousConfidence) * 5; 
            totalPreviousHealth += (health.score - healthDiff);
            dealsWithPreviousHealth++;
        }
    });

    const pipelineHealthScore = activeDeals.length > 0 ? Math.round(totalHealth / activeDeals.length) : 0;
    const avgConfidence = activeDeals.length > 0 ? Math.round((totalConfidence / activeDeals.length) * 10) / 10 : 0;
    
    let healthTrend: "improving" | "stable" | "declining" = "stable";
    if (dealsWithPreviousHealth > 0) {
        const previousPipelineHealth = totalPreviousHealth / dealsWithPreviousHealth;
        if (pipelineHealthScore > previousPipelineHealth + 2) {
            healthTrend = "improving";
        } else if (pipelineHealthScore < previousPipelineHealth - 2) {
            healthTrend = "declining";
        }
    }

    const db = getDatabase();
    const { content: executiveSummaryText, usedCachedData } = await getCachedInsightText(
        db.executiveInsightVersion || 0,
        "executiveSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const prompt = `Write a short 1-sentence executive summary. Pipeline health is ${pipelineHealthScore} and ${healthTrend}. Total deals: ${activeDeals.length}. Revenue expected: $${expectedRevenue}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "Executive summary generated.";
        }
    );

    return {
        totalDeals: activeDeals.length,
        healthyDeals,
        watchDeals,
        atRiskDeals,
        pipelineHealthScore,
        expectedRevenue,
        avgConfidence,
        healthTrend,
        executiveSummaryText,
        usedCachedData
    };
}

