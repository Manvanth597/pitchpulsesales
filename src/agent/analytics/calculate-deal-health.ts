// src/agent/analytics/calculate-deal-health.ts

import { getClient, ClientMemory } from "@/lib/db";
import { getPatternInsights } from "@/agent/learning/pattern-insights";

export interface DealHealth {
    score: number;
    status: "healthy" | "watch" | "at_risk";
    reasons: string[];
}

export function calculateDealHealthFromClient(client: ClientMemory): DealHealth {
    let score = 0;
    const reasons: string[] = [];

    /*
     * CONFIDENCE TREND
     * Max 30 Points
     */
    const confidenceTrend = client.confidenceTrend || [];

    if (confidenceTrend.length >= 2) {
        const latest = confidenceTrend[confidenceTrend.length - 1];
        const previous = confidenceTrend[confidenceTrend.length - 2];

        if (latest > previous) {
            score += 30;
            reasons.push("Confidence trend improving");
        } else if (latest === previous) {
            score += 20;
            reasons.push("Confidence trend stable");
        } else {
            score += 5;
            reasons.push("Confidence trend declining");
        }
    } else {
        score += 15;
        reasons.push("Limited confidence history");
    }

    /*
     * SALES STAGE
     * Max 25 Points
     */
    switch (client.stage) {
        case "action":
        case "closed_won":
            score += 25;
            reasons.push("Late-stage opportunity");
            break;

        case "desire":
            score += 20;
            reasons.push("Proposal stage reached");
            break;

        case "interest":
            score += 15;
            reasons.push("Qualified opportunity");
            break;

        default:
            score += 10;
            reasons.push("Early-stage opportunity");
    }

    /*
     * RECENT ACTIVITY
     * Max 20 Points
     */
    const latestDebrief = client.debriefs?.[client.debriefs.length - 1];

    if (latestDebrief) {
        const daysSinceActivity = Math.floor(
            (Date.now() - new Date(latestDebrief.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity <= 7) {
            score += 20;
            reasons.push("Recent customer activity");
        } else if (daysSinceActivity <= 14) {
            score += 10;
            reasons.push("Moderately active opportunity");
        } else {
            reasons.push("Opportunity inactive");
        }
    }

    /*
     * PATTERN QUALITY
     * Max 15 Points
     */
    const insights = getPatternInsights();
    const bestPattern = insights.topPatterns?.[0];

    if (bestPattern) {
        const effectiveness = bestPattern.effectivenessScore;

        if (effectiveness >= 80) {
            score += 15;
            reasons.push("Strong historical sales patterns");
        } else if (effectiveness >= 60) {
            score += 10;
            reasons.push("Moderately effective patterns");
        } else {
            score += 5;
            reasons.push("Weak pattern performance");
        }
    }

    /*
     * OBJECTION HISTORY
     * Max 10 Points
     */
    const objections = client.objectionHistory || [];

    if (objections.length === 0) {
        score += 10;
        reasons.push("No objections recorded");
    } else if (objections.length <= 3) {
        score += 5;
        reasons.push("Manageable objections");
    } else {
        reasons.push("Multiple unresolved objections");
    }

    /*
     * STATUS
     */
    let status: "healthy" | "watch" | "at_risk";

    if (score >= 75) {
        status = "healthy";
    } else if (score >= 50) {
        status = "watch";
    } else {
        status = "at_risk";
    }

    return {
        score,
        status,
        reasons,
    };
}

export async function calculateDealHealth(
    clientId: string
): Promise<DealHealth> {
    const client = await getClient(clientId);

    if (!client) {
        return {
            score: 0,
            status: "at_risk",
            reasons: ["Client not found"],
        };
    }

    return calculateDealHealthFromClient(client);
}