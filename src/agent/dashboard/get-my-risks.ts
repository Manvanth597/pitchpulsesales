import { getAllClients } from "@/lib/db";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { MyRisk } from "@/types/dashboard";

export async function getMyRisks(userId: string): Promise<MyRisk[]> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const risks: MyRisk[] = [];
    
    for (const client of activeDeals) {
        const risk = analyzeOpportunityRiskFromClient(client);
        
        // Return only deals that are medium or high risk
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
    
    // Sort by highest risk score first
    return risks.sort((a, b) => b.riskScore - a.riskScore);
}
