import { getAllClients } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { getPatternInsights } from "@/agent/learning/pattern-insights";
import { ManagerAction } from "@/types/dashboard";

export async function getActionCenter(): Promise<{ items: ManagerAction[] }> {
    const clients = await getAllClients();
    const items: ManagerAction[] = [];
    
    // 1. Analyze Deal Health & Risk for Critical and High actions
    for (const client of clients) {
        if (client.stage === "closed_won" || client.stage === "closed_lost") continue;
        
        const health = calculateDealHealthFromClient(client);
        const risk = analyzeOpportunityRiskFromClient(client);
        
        // Critical: Intervention required for high-risk deals
        if (risk.riskLevel === "high" || health.score < 40) {
            items.push({
                priority: "critical",
                action: `Join ${client.companyName} call`,
                reason: risk.riskFactors.length > 0 ? risk.riskFactors[0] : `Critical health score (${health.score}/100)`,
                relatedDeal: client.companyName
            });
        }
        
        // High: Coaching opportunity if rep self-scored low on recent debrief
        const latestDebrief = client.debriefs.length > 0 ? client.debriefs[client.debriefs.length - 1] : null;
        const selfScore = latestDebrief ? (latestDebrief as any).selfScore : null;
        
        if (latestDebrief && selfScore && selfScore <= 5) {
            items.push({
                priority: "high",
                action: `Coach rep on ${latestDebrief.objectionFaced || 'handling objections'}`,
                reason: `Low confidence score (${selfScore}/10) on recent call`,
                relatedDeal: client.companyName
            });
        }
    }
    
    // 2. Analyze Pattern Insights for Medium actions (Training)
    const insights = getPatternInsights();
    
    if (insights.fastestGrowingPatterns.length > 0) {
        const topGrowthPattern = insights.fastestGrowingPatterns[0];
        items.push({
            priority: "medium",
            action: `Train team on ${topGrowthPattern.pattern}`,
            reason: `High effectiveness (${topGrowthPattern.effectivenessScore}%) for ${topGrowthPattern.objectionType} objections`
        });
    }

    if (insights.weakestPatterns.length > 0) {
        const weakestPattern = insights.weakestPatterns[0];
        items.push({
            priority: "medium",
            action: `Review ${weakestPattern.pattern} pattern`,
            reason: `Low effectiveness (${weakestPattern.effectivenessScore}%) causing lost deals`
        });
    }
    
    // Sort items: Critical -> High -> Medium
    const priorityWeight: Record<string, number> = {
        critical: 3,
        high: 2,
        medium: 1
    };
    
    items.sort((a, b) => {
        const pA = priorityWeight[a.priority] || 0;
        const pB = priorityWeight[b.priority] || 0;
        return pB - pA; // Descending order
    });
    
    return { items };
}
