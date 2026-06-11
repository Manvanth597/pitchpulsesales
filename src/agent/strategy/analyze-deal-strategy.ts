import { getClient } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { DealStrength, DealWeakness, DealBlocker } from "./types";

/**
 * Deterministically analyzes a specific deal to extract its critical strengths,
 * weaknesses, and blockers without relying on arbitrary AI generation.
 */
export async function analyzeDealStrategy(dealId: string): Promise<{
    strengths: DealStrength[];
    weaknesses: DealWeakness[];
    blockers: DealBlocker[];
}> {
    const client = await getClient(dealId);
    if (!client) {
        throw new Error(`Client ${dealId} not found`);
    }

    const health = calculateDealHealthFromClient(client);
    const risk = analyzeOpportunityRiskFromClient(client);
    
    const strengths: DealStrength[] = [];
    const weaknesses: DealWeakness[] = [];
    const blockers: DealBlocker[] = [];

    // --- Analyze Confidence ---
    const latestConfidence = client.confidenceTrend.length > 0 
        ? client.confidenceTrend[client.confidenceTrend.length - 1] 
        : 5;
    
    let confidenceTrendDesc = "Neutral confidence trend";
    if (client.confidenceTrend.length > 1) {
        const prev = client.confidenceTrend[client.confidenceTrend.length - 2];
        if (latestConfidence > prev) confidenceTrendDesc = "Improving confidence trend";
        else if (latestConfidence < prev) confidenceTrendDesc = "Declining confidence trend";
    }

    if (latestConfidence >= 8) {
        strengths.push({ description: "Exceptionally high rep confidence", score: latestConfidence * 10 });
    } else if (latestConfidence <= 4) {
        weaknesses.push({ description: "Low rep confidence indicating underlying risk", score: (10 - latestConfidence) * 10 });
    }

    if (confidenceTrendDesc === "Improving confidence trend") {
        strengths.push({ description: "Momentum is accelerating (improving confidence)", score: 75 });
    } else if (confidenceTrendDesc === "Declining confidence trend") {
        weaknesses.push({ description: "Momentum is decelerating (declining confidence)", score: 75 });
    }

    // --- Analyze Deal Health ---
    if (health.score >= 75) {
        strengths.push({ description: "Strong overall pipeline health", score: health.score });
    } else if (health.score < 50) {
        weaknesses.push({ description: "Critically low pipeline health", score: 100 - health.score });
    }

    // --- Analyze Opportunity Risk ---
    if (risk.riskScore <= 30) {
        strengths.push({ description: "Minimal identified deal risk factors", score: 100 - risk.riskScore });
    } else if (risk.riskScore >= 70) {
        weaknesses.push({ description: "Elevated opportunity risk detected", score: risk.riskScore });
    }

    // --- Analyze Stage Velocity ---
    const now = Date.now();
    const daysSinceUpdate = (now - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 14 && client.stage !== "closed_won" && client.stage !== "closed_lost") {
        weaknesses.push({ description: "Deal velocity has stalled in current stage", score: 85 });
    } else if (daysSinceUpdate <= 3 && client.stage !== "awareness") {
        strengths.push({ description: "Highly active deal with recent stage momentum", score: 80 });
    }

    // --- Analyze Blockers via Objections and Risk Factors ---
    // Keyword mapper for objections
    const matches = (text: string, keywords: string[]) => {
        const lower = text.toLowerCase();
        return keywords.some(kw => lower.includes(kw));
    };

    for (const obj of client.objectionHistory) {
        if (matches(obj, ["pricing", "cost", "budget", "expensive"])) {
            blockers.push({ type: "commercial", severity: "high", description: `Unresolved commercial objection: ${obj}` });
        } else if (matches(obj, ["procurement", "legal", "security", "contract"])) {
            blockers.push({ type: "legal", severity: "high", description: `Pending enterprise review: ${obj}` });
        } else if (matches(obj, ["stakeholder", "decision maker", "champion", "ghosted"])) {
            blockers.push({ type: "relationship", severity: "high", description: `Stakeholder alignment issue: ${obj}` });
        } else {
            blockers.push({ type: "general", severity: "medium", description: `Unresolved objection: ${obj}` });
        }
    }

    // High risk factors natively become blockers
    if (risk.riskLevel === "high") {
        for (const factor of risk.riskFactors) {
            blockers.push({ type: "risk", severity: "high", description: factor });
        }
    }

    // Sort descending by score/severity to ensure the top items bubble up
    strengths.sort((a, b) => b.score - a.score);
    weaknesses.sort((a, b) => b.score - a.score);
    
    blockers.sort((a, b) => {
        const sevWeight = { high: 3, medium: 2, low: 1 };
        return sevWeight[b.severity] - sevWeight[a.severity];
    });

    // Enforce the strict 5-item limit per category
    return {
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
        blockers: blockers.slice(0, 5)
    };
}
