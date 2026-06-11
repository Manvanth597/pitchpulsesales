import { getAllClients, getDatabase } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { TeamSummary, RepPerformance } from "./types";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";

// Mock Reps since existing ClientMemory doesn't have an ownerId field
const TEAM_REPS = [
    { userId: "rep-1", name: "Sarah Jenkins" },
    { userId: "rep-2", name: "Alex Mercer" },
    { userId: "rep-3", name: "Jordan Lee" }
];

/**
 * Generates a team summary for managers.
 * Connects directly to existing data, Deal Health Engine, and Opportunity Risk Engine.
 */
export async function getTeamSummary(): Promise<TeamSummary> {
    const clients = await getAllClients();
    
    // Ignore closed won/lost
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    let healthyDeals = 0;
    let watchDeals = 0;
    let atRiskDeals = 0;
    let totalHealth = 0;
    let totalConfidence = 0;
    
    // Initialize stats grouping for each rep
    const repStats = new Map<string, {
        healthSum: number, 
        confidenceSum: number, 
        riskExposure: number, 
        dealCount: number 
    }>();
    
    TEAM_REPS.forEach(rep => {
        repStats.set(rep.userId, { healthSum: 0, confidenceSum: 0, riskExposure: 0, dealCount: 0 });
    });

    activeDeals.forEach((client, index) => {
        // Run engines without duplicating logic
        const health = calculateDealHealthFromClient(client);
        const risk = analyzeOpportunityRiskFromClient(client);
        
        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
            
        // Track global metrics
        totalHealth += health.score;
        totalConfidence += latestConfidence;
        
        if (health.score >= 75) {
            healthyDeals++;
        } else if (health.score >= 50) {
            watchDeals++;
        } else {
            atRiskDeals++;
        }
        
        // Track rep-specific metrics (distribute deals deterministically for demonstration)
        const assignedRep = TEAM_REPS[index % TEAM_REPS.length];
        const stats = repStats.get(assignedRep.userId)!;
        
        stats.dealCount += 1;
        stats.healthSum += health.score;
        stats.confidenceSum += latestConfidence;
        
        if (risk.riskLevel === "high") stats.riskExposure += 3;
        else if (risk.riskLevel === "medium") stats.riskExposure += 2;
        else stats.riskExposure += 1;
    });

    const activeDealsCount = activeDeals.length;
    const avgPipelineHealth = activeDealsCount > 0 ? Math.round(totalHealth / activeDealsCount) : 0;
    const avgConfidence = activeDealsCount > 0 ? Math.round((totalConfidence / activeDealsCount) * 10) / 10 : 0;

    // Calculate score for each rep to determine Top Performer vs Needs Attention
    const performances: RepPerformance[] = TEAM_REPS.map(rep => {
        const stats = repStats.get(rep.userId)!;
        if (stats.dealCount === 0) {
            return { userId: rep.userId, name: rep.name, score: 0 };
        }
        
        const repAvgHealth = stats.healthSum / stats.dealCount;
        const repAvgConfidence = stats.confidenceSum / stats.dealCount;
        const repAvgRisk = stats.riskExposure / stats.dealCount; 
        
        // Custom performance algorithm combining average deal health, confidence, and risk exposure penalty
        const score = Math.round(repAvgHealth + (repAvgConfidence * 10) - (repAvgRisk * 10));
        
        return {
            userId: rep.userId,
            name: rep.name,
            score
        };
    });

    // Sort descending by score
    performances.sort((a, b) => b.score - a.score);
    
    // Isolate highest and lowest performers
    const topPerformer = performances[0];
    const needsAttention = performances[performances.length - 1];

    const db = getDatabase();
    const { content: teamSummaryText, usedCachedData } = await getCachedInsightText(
        db.teamInsightVersion || 0,
        "teamSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const prompt = `Write a short 1-sentence sales team summary. Top performer: ${topPerformer.name} (score: ${topPerformer.score}). Needs attention: ${needsAttention.name} (score: ${needsAttention.score}). Active Deals: ${activeDealsCount}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "Team summary generated.";
        }
    );

    return {
        activeDeals: activeDealsCount,
        healthyDeals,
        watchDeals,
        atRiskDeals,
        avgPipelineHealth,
        avgConfidence,
        topPerformer,
        needsAttention,
        teamSummaryText,
        usedCachedData
    };
}

