import { getAllClients } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { MyDeal } from "./types";

/**
 * Retrieves and prioritizes active deals for a given user.
 * Connects directly to the Deal Health and Opportunity Risk engines.
 */
export async function getMyDeals(userId: string): Promise<MyDeal[]> {
    const clients = await getAllClients();
    
    // 1 & 2. Retrieve deals and ignore closed won/lost
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const mappedDeals: MyDeal[] = activeDeals.map(client => {
        // 3. Calculate health score using engine
        const health = calculateDealHealthFromClient(client);
        
        // 4. Calculate risk level using engine
        const risk = analyzeOpportunityRiskFromClient(client);
        
        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
            
        // 5. Return structured format
        return {
            id: client.id,
            company: client.companyName,
            stage: client.stage,
            value: 50000, // Using mock value as schema lacks deal value
            confidence: latestConfidence,
            healthScore: health.score,
            riskLevel: risk.riskLevel,
            lastActivity: client.updatedAt
        };
    });
    
    // Prioritization Logic
    // 1. Highest risk first
    // 2. Lowest confidence
    // 3. Longest inactivity
    const riskWeight: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1
    };

    mappedDeals.sort((a, b) => {
        // 1. Highest risk first
        const riskA = riskWeight[a.riskLevel] || 0;
        const riskB = riskWeight[b.riskLevel] || 0;
        if (riskA !== riskB) {
            return riskB - riskA; // Descending
        }
        
        // 2. Lowest confidence first
        if (a.confidence !== b.confidence) {
            return a.confidence - b.confidence; // Ascending
        }
        
        // 3. Longest inactivity (oldest date first)
        const dateA = new Date(a.lastActivity).getTime();
        const dateB = new Date(b.lastActivity).getTime();
        return dateA - dateB; // Ascending
    });

    return mappedDeals;
}
