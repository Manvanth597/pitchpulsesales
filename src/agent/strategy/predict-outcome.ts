import { getClient, getAllSalesPatterns } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";

/**
 * Deterministically estimates the probability of success for a specific deal.
 * Leverages multi-engine insights without relying on unpredictable AI generation.
 */
export async function predictOutcome(dealId: string): Promise<{ probabilityOfSuccess: number }> {
    const client = await getClient(dealId);
    if (!client) {
        throw new Error(`Client ${dealId} not found`);
    }

    // 1. Deal Health (40% Weight)
    // Directly accesses the health score (0-100)
    const health = calculateDealHealthFromClient(client);
    const healthComponent = health.score * 0.40;

    // 2. Confidence (30% Weight)
    // Converts 0-10 scale into a 0-100 scale
    const latestConfidence = client.confidenceTrend.length > 0 
        ? client.confidenceTrend[client.confidenceTrend.length - 1] 
        : 5;
    const confidenceComponent = (latestConfidence * 10) * 0.30;

    // 3. Risk (20% Weight)
    // Inverts the risk score (where higher means riskier) to fit probability
    const risk = analyzeOpportunityRiskFromClient(client);
    const riskInverted = Math.max(0, 100 - risk.riskScore);
    const riskComponent = riskInverted * 0.20;

    // 4. Pattern Success (10% Weight)
    // Evaluates historically used patterns and their effectiveness
    const allPatterns = await getAllSalesPatterns();
    let patternScoreSum = 0;
    let patternCount = 0;

    // Extract patterns from debrief objections
    for (const debrief of client.debriefs) {
        if (debrief.analysis && debrief.analysis.detectedObjections) {
            for (const detectedObj of debrief.analysis.detectedObjections) {
                const matchingPatterns = allPatterns.filter(
                    p => p.objectionType.toLowerCase().trim() === detectedObj.toLowerCase().trim()
                );
                for (const p of matchingPatterns) {
                    patternScoreSum += p.effectivenessScore;
                    patternCount++;
                }
            }
        }
    }
    
    // Extract patterns from explicit objection history
    for (const historyObj of client.objectionHistory) {
        const matchingPatterns = allPatterns.filter(
            p => p.objectionType.toLowerCase().trim() === historyObj.toLowerCase().trim()
        );
        for (const p of matchingPatterns) {
            patternScoreSum += p.effectivenessScore;
            patternCount++;
        }
    }

    // Default to neutral 50% if no specific historical patterns were triggered yet
    const avgPatternSuccess = patternCount > 0 ? (patternScoreSum / patternCount) : 50;
    const patternComponent = avgPatternSuccess * 0.10;

    // 5. Aggregate and normalize
    const rawProbability = healthComponent + confidenceComponent + riskComponent + patternComponent;
    const probabilityOfSuccess = Math.min(100, Math.max(0, Math.round(rawProbability)));

    return { probabilityOfSuccess };
}
