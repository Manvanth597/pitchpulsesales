import { getClient } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";

import { predictOutcome } from "./predict-outcome";
import { analyzeDealStrategy } from "./analyze-deal-strategy";
import { generateNextActions } from "./generate-next-actions";
import { DealStrategyReport } from "./types";

/**
 * Single entry point for deal strategy intelligence.
 * Orchestrates multi-engine data into a cohesive strategic report.
 */
export async function getDealStrategy(dealId: string): Promise<DealStrategyReport> {
    // Retrieve base client context required for downstream engines
    const client = await getClient(dealId);
    if (!client) {
        throw new Error(`Client ${dealId} not found`);
    }

    // 1. Predict overall outcome and probability of success
    const outcome = await predictOutcome(dealId);

    // 2. Analyze deal-specific strengths, weaknesses, and blockers
    const strategyAnalysis = await analyzeDealStrategy(dealId);

    // 3. Evaluate health and risk to generate deterministic next actions
    const health = calculateDealHealthFromClient(client);
    const risk = analyzeOpportunityRiskFromClient(client);
    const { nextActions, recommendedSkills } = generateNextActions(health, risk, strategyAnalysis);

    // 4. Assemble and return the Deal Strategy Report
    return {
        dealId,
        probabilityOfSuccess: outcome.probabilityOfSuccess,
        // Extract the raw string descriptions for the final payload
        strengths: strategyAnalysis.strengths.map(s => s.description),
        weaknesses: strategyAnalysis.weaknesses.map(w => w.description),
        blockers: strategyAnalysis.blockers.map(b => b.description),
        nextActions,
        recommendedSkills,
        generatedAt: new Date().toISOString()
    };
}
