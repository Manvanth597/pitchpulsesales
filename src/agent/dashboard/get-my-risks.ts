import { getAllClients } from "@/lib/db";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { MyRisk } from "./types";

/**
 * Retrieves and prioritizes active risks for a given user.
 * Connects directly to the Opportunity Risk Engine.
 * Surfaces only deals that are medium or high risk, requiring attention.
 */
export async function getMyRisks(userId: string): Promise<MyRisk[]> {
    const clients = await getAllClients();
    
    // 1 & 2. Retrieve active deals, ignore closed_won and closed_lost
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const risks: MyRisk[] = [];
    
    for (const client of activeDeals) {
        // 3. Calculate risk level using existing engine
        const risk = analyzeOpportunityRiskFromClient(client);
        
        // 4. Return only medium or high risk deals
        if (risk.riskLevel === "high" || risk.riskLevel === "medium") {
            risks.push({
                company: client.companyName,
                riskScore: risk.riskScore,
                riskLevel: risk.riskLevel,
                riskFactors: risk.riskFactors,
                recommendedActions: risk.recommendedActions
            });
        }
    }
    
    // Prioritization / Sorting Logic:
    // 1. High risk before medium risk
    // 2. Highest risk score
    const riskWeight: Record<string, number> = {
        high: 2,
        medium: 1
    };

    risks.sort((a, b) => {
        const riskA = riskWeight[a.riskLevel] || 0;
        const riskB = riskWeight[b.riskLevel] || 0;
        
        if (riskA !== riskB) {
            return riskB - riskA; // Descending (high risk first)
        }
        
        // If levels are the same, sort by highest risk score
        return b.riskScore - a.riskScore;
    });

    return risks;
}
