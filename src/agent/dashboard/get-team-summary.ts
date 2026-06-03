import { getAllClients } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { TeamSummary } from "@/types/dashboard";

export async function getTeamSummary(): Promise<TeamSummary> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    let healthyDeals = 0;
    let watchDeals = 0;
    let atRiskDeals = 0;
    
    let totalHealth = 0;
    let totalConfidence = 0;
    
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
            
        totalConfidence += latestConfidence;
    });

    const avgPipelineHealth = activeDeals.length > 0 ? Math.round(totalHealth / activeDeals.length) : 0;
    const avgConfidence = activeDeals.length > 0 ? Math.round((totalConfidence / activeDeals.length) * 10) / 10 : 0;
    
    // We don't have explicit rep-level assignments in the DB schema right now
    // So we use mock names for the top performer and rep needing attention.
    return {
        activeDeals: activeDeals.length,
        healthyDeals,
        watchDeals,
        atRiskDeals,
        avgPipelineHealth,
        avgConfidence,
        topPerformer: "Sarah Jenkins",
        needsAttention: "Alex Mercer"
    };
}
