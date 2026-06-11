import { getClient, getDatabase, getAllSalesPatterns } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { analyzeDealStrategy } from "@/agent/strategy/analyze-deal-strategy";
import { DEFAULT_FORECAST_WEIGHTS } from "./types";

/**
 * Deterministically predicts the exact probability of a deal closing successfully.
 * Uses a fixed, weighted mathematical algorithm based on 6 core revenue pillars.
 */
export async function predictDealClose(dealId: string): Promise<{
    dealId: string;
    company: string;
    dealValue: number;
    probabilityOfClose: number;
    expectedRevenue: number;
    confidenceLevel: "low" | "medium" | "high";
}> {
    const db = getDatabase();
    const client = await getClient(dealId);
    
    if (!client) {
        throw new Error(`Client ${dealId} not found`);
    }

    // 1. Deal Health (30%)
    const health = calculateDealHealthFromClient(client);
    const healthComponent = health.score * (DEFAULT_FORECAST_WEIGHTS.dealHealth / 100);

    // 2. Opportunity Risk (20%)
    const risk = analyzeOpportunityRiskFromClient(client);
    // Invert risk: High risk = Low probability score
    const riskScoreInverted = Math.max(0, 100 - risk.riskScore);
    const riskComponent = riskScoreInverted * (DEFAULT_FORECAST_WEIGHTS.risk / 100);

    // 3. Confidence Trend (15%)
    const latestConfidence = client.confidenceTrend.length > 0 
        ? client.confidenceTrend[client.confidenceTrend.length - 1] 
        : 5;
    // Normalize 0-10 to 0-100
    const confScore = latestConfidence * 10;
    const confComponent = confScore * (DEFAULT_FORECAST_WEIGHTS.confidence / 100);

    // 4. Pattern Effectiveness (10%)
    const allPatterns = await getAllSalesPatterns();
    let patternScoreSum = 0;
    let patternCount = 0;

    for (const obj of client.objectionHistory) {
        const matchingPatterns = allPatterns.filter(p => p.objectionType.toLowerCase() === obj.toLowerCase());
        for (const p of matchingPatterns) {
            patternScoreSum += p.effectivenessScore;
            patternCount++;
        }
    }
    const avgPatternScore = patternCount > 0 ? (patternScoreSum / patternCount) : 50;
    const patternComponent = avgPatternScore * (DEFAULT_FORECAST_WEIGHTS.patternEffectiveness / 100);

    // 5. Strategy Score (15%)
    const strategy = await analyzeDealStrategy(dealId);
    // Baseline 50, +10 per strength, -10 per weakness, -15 per critical blocker
    let rawStrategy = 50 
        + (strategy.strengths.length * 10) 
        - (strategy.weaknesses.length * 10)
        - (strategy.blockers.length * 15);
        
    const strategyScore = Math.min(100, Math.max(0, rawStrategy));
    const strategyComponent = strategyScore * (DEFAULT_FORECAST_WEIGHTS.strategy / 100);

    // 6. Historical Win Rate (10%)
    const outcomes = db.dealOutcomes || [];
    const wins = outcomes.filter(o => o.outcome === "won").length;
    // Assume a baseline 40% win rate if no historical data exists
    const winRate = outcomes.length > 0 ? (wins / outcomes.length) * 100 : 40;
    const winRateComponent = winRate * (DEFAULT_FORECAST_WEIGHTS.historicalWinRate / 100);

    // Aggregate Probability
    const rawProbability = healthComponent + riskComponent + confComponent + patternComponent + strategyComponent + winRateComponent;
    const probabilityOfClose = Math.min(100, Math.max(0, Math.round(rawProbability)));

    // Deterministically mock Deal Value based on ID hashing (Matches Revenue Intelligence logic)
    const hash = client.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dealValue = 30000 + (hash % 8) * 10000;
    
    // Compute Expected Revenue
    const expectedRevenue = Math.round(dealValue * (probabilityOfClose / 100));

    // Determine algorithmic Confidence Level
    let confidenceLevel: "low" | "medium" | "high";
    if (probabilityOfClose <= 40) confidenceLevel = "low";
    else if (probabilityOfClose <= 70) confidenceLevel = "medium";
    else confidenceLevel = "high";

    return {
        dealId: client.id,
        company: client.companyName,
        dealValue,
        probabilityOfClose,
        expectedRevenue,
        confidenceLevel
    };
}
