// src/agent/risk/analyze-opportunity-risk.ts

import { getClient, ClientMemory } from "@/lib/db";
import { calculateDealHealthFromClient, calculateDealHealth } from "../analytics/calculate-deal-health";

export interface OpportunityRisk {
    riskScore: number;
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[];
    recommendedActions: string[];
}

export function analyzeOpportunityRiskFromClient(client: ClientMemory): OpportunityRisk {
    const dealHealth = calculateDealHealthFromClient(client);
    
    // Invert the deal health score to get a risk score
    // Max deal health (100) -> 0 Risk. Min deal health (0) -> 100 Risk.
    const riskScore = Math.max(0, Math.min(100, 100 - dealHealth.score));
    
    // Classify risk level
    let riskLevel: "low" | "medium" | "high";
    if (riskScore >= 50) {
        riskLevel = "high";
    } else if (riskScore >= 25) {
        riskLevel = "medium";
    } else {
        riskLevel = "low";
    }

    const riskFactors: string[] = [];
    const recommendedActions: string[] = [];

    /*
     * 1. CONFIDENCE TREND EVALUATION
     */
    const confidenceTrend = client.confidenceTrend || [];
    if (confidenceTrend.length >= 2) {
        const latest = confidenceTrend[confidenceTrend.length - 1];
        const previous = confidenceTrend[confidenceTrend.length - 2];
        if (latest < previous) {
            riskFactors.push("Prospect confidence is declining.");
            recommendedActions.push("Schedule a dedicated check-in to address key objections and rebuild confidence.");
        } else if (latest === previous) {
            // Neutral/stable trend, no severe risk factor added
        }
    } else {
        riskFactors.push("Limited confidence history trend to assess relationship trajectory.");
        recommendedActions.push("Establish a regular confidence rating review at the end of each customer call.");
    }

    /*
     * 2. RECENT ACTIVITY EVALUATION
     */
    const latestDebrief = client.debriefs?.[client.debriefs.length - 1];
    if (latestDebrief) {
        const daysSinceActivity = Math.floor(
            (Date.now() - new Date(latestDebrief.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity > 14) {
            riskFactors.push(`Opportunity is inactive: No activity recorded in the last ${daysSinceActivity} days.`);
            recommendedActions.push("Initiate proactive outreach with valuable insights or a new value hypothesis to re-engage the decision maker.");
        } else if (daysSinceActivity > 7) {
            riskFactors.push(`Moderate activity gap: Last customer touchpoint was ${daysSinceActivity} days ago.`);
            recommendedActions.push("Follow up on pending questions or schedule the next standard sync meeting.");
        }
    } else {
        riskFactors.push("No debrief history or customer activity has been logged for this client.");
        recommendedActions.push("Log your first customer debrief or discovery call to capture initial momentum.");
    }

    /*
     * 3. OBJECTION HISTORY EVALUATION
     */
    const objections = client.objectionHistory || [];
    if (objections.length > 3) {
        riskFactors.push(`High volume of objections: ${objections.length} unresolved concerns recorded.`);
        recommendedActions.push("Conduct a comprehensive objection-handling review and prepare a targeted response document.");
    } else if (objections.length > 0) {
        // Manageable objections
        riskFactors.push(`Active objections raised: ${objections.length} concern(s) pending resolution.`);
        recommendedActions.push("Align the next meeting agenda around addressing the current active objection(s).");
    }

    /*
     * 4. DEAL HEALTH STATUS EVALUATION
     */
    if (dealHealth.status === "at_risk") {
        riskFactors.push("Overall deal health is flagged as AT RISK.");
        recommendedActions.push("Escalate this deal to leadership to introduce executive sponsorship and secure the account.");
    } else if (dealHealth.status === "watch") {
        riskFactors.push("Overall deal health is flagged as WATCH.");
        recommendedActions.push("Closely monitor the upcoming milestones and re-validate buyer commitment.");
    }

    // Default action if everything is healthy
    if (riskLevel === "low" && recommendedActions.length === 0) {
        recommendedActions.push("Continue advancing the deal stage and preparing standard follow-up collaterals.");
    }

    const result = {
        riskScore,
        riskLevel,
        riskFactors,
        recommendedActions,
    };

    // Validation logging
    console.log("[Opportunity Risk]", {
        companyName: client.companyName,
        dealHealthScore: dealHealth.score,
        dealHealthStatus: dealHealth.status,
        ...result
    });

    return result;
}

export async function analyzeOpportunityRisk(clientId: string): Promise<OpportunityRisk> {
    const client = await getClient(clientId);

    if (!client) {
        return {
            riskScore: 100,
            riskLevel: "high",
            riskFactors: ["Client not found in database"],
            recommendedActions: ["Verify the clientId parameter or add the client to the database"],
        };
    }

    return analyzeOpportunityRiskFromClient(client);
}
