import { getDatabase, getAllClients, getAllSalesPatterns } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { RepPerformanceAnalysis, SkillGap } from "./types";

/**
 * Analyzes a salesperson's historical performance.
 * Leverages outcome data, health metrics, and pattern effectiveness.
 * 
 * Note: Skill Gaps and Coaching Recommendations are intentionally bypassed for now 
 * per architectural rules, but the core analysis is fully populated.
 */
export async function analyzeRepPerformance(repId: string): Promise<RepPerformanceAnalysis> {
    const db = getDatabase();
    
    // 1. Fetch Clients (Using deterministic index mapping to match Team Summary since repId isn't on ClientMemory)
    const allClients = await getAllClients();
    let targetClients = allClients.filter((c, i) => `rep-${(i % 3) + 1}` === repId);
    
    // Fallback to all clients if repId mapping yields nothing (e.g. testing)
    if (targetClients.length === 0) {
        targetClients = allClients;
    }

    const targetClientIds = new Set(targetClients.map(c => c.id));
    
    // 2. Fetch Deal Outcomes for this rep
    const allOutcomes = db.dealOutcomes || [];
    const repOutcomes = allOutcomes.filter(o => targetClientIds.has(o.dealId));
    
    let wonDeals = 0;
    let lostDeals = 0;
    
    for (const o of repOutcomes) {
        if (o.outcome === "won") wonDeals++;
        else if (o.outcome === "lost") lostDeals++;
    }
    
    const totalDecided = wonDeals + lostDeals;
    const winRate = totalDecided > 0 ? Math.round((wonDeals / totalDecided) * 100) : 0;
    
    // 3. Health & Confidence Metrics
    let totalHealth = 0;
    let totalConfidence = 0;
    let validDealsForHealth = 0;
    let stalledDeals = 0;
    
    const objectionCounts = new Map<string, number>();
    const now = Date.now();

    for (const client of targetClients) {
        const health = calculateDealHealthFromClient(client);
        totalHealth += health.score;
        
        const latestConf = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
        totalConfidence += latestConf;
        validDealsForHealth++;
        
        // Track recurring objections
        for (const obj of client.objectionHistory) {
            objectionCounts.set(obj.toLowerCase().trim(), (objectionCounts.get(obj.toLowerCase().trim()) || 0) + 1);
        }

        // Track stalled stages
        const daysInactive = (now - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysInactive > 14 && client.stage !== "closed_won" && client.stage !== "closed_lost") {
            stalledDeals++;
        }
    }
    
    const avgDealHealth = validDealsForHealth > 0 ? Math.round(totalHealth / validDealsForHealth) : 0;
    const avgConfidence = validDealsForHealth > 0 ? Math.round((totalConfidence / validDealsForHealth) * 10) / 10 : 0;

    // 4. Determine Strengths and Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    const patterns = await getAllSalesPatterns();
    const patternMap = new Map(patterns.map(p => [p.id, p]));

    // --- Analyze Strengths ---
    // High win-rate patterns & successful objection handling
    let foundWinningPattern = false;
    for (const o of repOutcomes) {
        if (o.outcome === "won") {
            for (const pid of o.patternsUsed) {
                const p = patternMap.get(pid);
                if (p && p.effectivenessScore >= 60 && !foundWinningPattern) {
                    strengths.push(`Highly effective at executing "${p.pattern}" to drive successful closes.`);
                    foundWinningPattern = true; // Avoid spamming
                }
            }
        }
    }

    // Strong stage progression (via Deal Health)
    if (avgDealHealth > 75) {
        strengths.push("Consistently maintains highly healthy pipelines indicating strong stage progression.");
    }
    
    if (winRate >= 50) {
        strengths.push(`Strong closing capability with a ${winRate}% win rate.`);
    }

    // --- Analyze Weaknesses ---
    // Repeated losses
    if (lostDeals >= 3) {
        weaknesses.push(`Demonstrating repeated deal losses (${lostDeals} recently lost).`);
    }

    // Stalled stages
    if (stalledDeals > 2) {
        weaknesses.push(`Struggles with velocity: ${stalledDeals} deals are currently stalled in their stages.`);
    }

    // Recurring objections
    for (const [obj, count] of objectionCounts.entries()) {
        if (count >= 3) {
            weaknesses.push(`Consistently struggles to overcome recurring "${obj}" objections.`);
        }
    }

    // 5. Skill Gaps 
    // Left intentionally empty as requested: "Do not generate coaching recommendations yet."
    const skillGaps: SkillGap[] = [];

    return {
        repId,
        winRate,
        avgDealHealth,
        avgConfidence,
        strengths,
        weaknesses,
        skillGaps
    };
}
