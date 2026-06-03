import { getAllClients } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { ExecutiveSummary } from "@/types/dashboard";

export async function getExecutiveSummary(userId: string): Promise<ExecutiveSummary> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    let totalHealth = 0;
    let healthyDeals = 0;
    let watchDeals = 0;
    let atRiskDeals = 0;
    
    let expectedRevenue = 0;
    let totalConfidence = 0;
    
    let totalPreviousHealth = 0;
    let dealsWithPreviousHealth = 0;

    activeDeals.forEach(client => {
        const health = calculateDealHealthFromClient(client);
        totalHealth += health.score;
        
        // Distribution based on requirement:
        // Healthy >= 75
        // Watch >= 50
        // At Risk < 50
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

        // Mock dealValue (e.g., 50000)
        const mockDealValue = 50000;
        
        // expectedRevenue = dealValue * confidence%
        // confidence is 1-10, so percentage is (confidence * 10) / 100 => confidence / 10
        expectedRevenue += mockDealValue * (latestConfidence / 10);
        
        // Calculate a mock previous health based on previous confidence for trend
        // If confidence dropped, health likely dropped. This is a heuristic since we don't store historical health scores explicitly.
        if (client.confidenceTrend.length > 1) {
            // Rough approximation of previous health score relative to current
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

    return {
        totalDeals: activeDeals.length,
        healthyDeals,
        watchDeals,
        atRiskDeals,
        pipelineHealthScore,
        expectedRevenue,
        avgConfidence,
        healthTrend
    };
}
