import { getDatabase } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { RevenueRisk } from "./types";

/**
 * Identifies and scores threats to future revenue across the active pipeline.
 */
export async function detectRevenueRisks(): Promise<RevenueRisk[]> {
    const db = getDatabase();
    
    // Only analyze active deals for forward-looking revenue risk
    const activeClients = db.clients.filter(c => c.stage !== "closed_won" && c.stage !== "closed_lost");
    
    const risks: RevenueRisk[] = [];

    // Helper to mock deal value deterministically since it's not strictly in ClientMemory
    const getDealValue = (clientId: string) => {
        const hash = clientId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Generates a mock value between $30,000 and $100,000
        return 30000 + (hash % 8) * 10000; 
    };

    for (const client of activeClients) {
        const health = calculateDealHealthFromClient(client);
        const risk = analyzeOpportunityRiskFromClient(client);
        const dealValue = getDealValue(client.id);
        
        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;

        // 1. High-value opportunity at risk
        if (dealValue >= 60000 && (health.score < 50 || risk.riskLevel === "high")) {
            risks.push({
                title: "High-value opportunity at risk",
                impact: dealValue,
                severity: "high",
                description: `Deal with ${client.companyName} ($${dealValue.toLocaleString()}) has critical health and risk flags.`
            });
        }

        // 2. Proposal-stage bottleneck
        const now = Date.now();
        const daysInactive = (now - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if ((client.stage === "action" || client.stage === "desire") && daysInactive > 14) {
            risks.push({
                title: "Large proposal-stage bottleneck",
                impact: dealValue,
                severity: dealValue >= 70000 ? "high" : "medium",
                description: `Proposal/Evaluation phase for ${client.companyName} has been stalled for over 14 days.`
            });
        }

        // 3. Declining pipeline health / confidence
        if (client.confidenceTrend.length > 1) {
            const prevConf = client.confidenceTrend[client.confidenceTrend.length - 2];
            if (latestConfidence < prevConf && latestConfidence <= 4) {
                risks.push({
                    title: "Declining pipeline health",
                    impact: Math.round(dealValue * 0.5), // Estimate 50% revenue at risk
                    severity: "medium",
                    description: `Internal confidence and momentum for ${client.companyName} are dropping rapidly.`
                });
            }
        }
    }

    // Sort: Highest impact first
    risks.sort((a, b) => b.impact - a.impact);

    // Limit: Top 10 risks
    return risks.slice(0, 10);
}
