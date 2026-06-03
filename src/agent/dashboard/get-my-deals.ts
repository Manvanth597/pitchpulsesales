import { getAllClients } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { MyDeal } from "@/types/dashboard";

export async function getMyDeals(userId: string): Promise<MyDeal[]> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const mappedDeals: MyDeal[] = activeDeals.map(client => {
        const health = calculateDealHealthFromClient(client);
        const risk = analyzeOpportunityRiskFromClient(client);
        
        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
            
        return {
            id: client.id,
            company: client.companyName,
            stage: client.stage,
            value: 50000, // Mocked monetary value
            confidence: latestConfidence,
            healthScore: health.score,
            riskLevel: risk.riskLevel,
            lastActivity: client.updatedAt
        };
    });
    
    // 1. Highest risk first
    // 2. Lowest confidence
    // 3. Longest inactivity
    const riskWeight: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1
    };

    mappedDeals.sort((a, b) => {
        // Highest risk first
        const riskA = riskWeight[a.riskLevel] || 0;
        const riskB = riskWeight[b.riskLevel] || 0;
        if (riskA !== riskB) {
            return riskB - riskA; // Descending
        }
        
        // Lowest confidence first
        if (a.confidence !== b.confidence) {
            return a.confidence - b.confidence; // Ascending
        }
        
        // Longest inactivity (oldest date first)
        const dateA = new Date(a.lastActivity).getTime();
        const dateB = new Date(b.lastActivity).getTime();
        return dateA - dateB; // Ascending (older dates have smaller timestamp)
    });

    // Limit to top 5 most relevant deals requiring attention
    return mappedDeals.slice(0, 5);
}
