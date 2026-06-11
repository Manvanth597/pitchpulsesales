import { getDatabase } from "@/lib/db";
import { GrowthOpportunity } from "./types";

/**
 * Identifies macro opportunities to scale revenue by analyzing
 * pattern effectiveness, win rates, and team-wide behaviors.
 */
export async function identifyGrowthOpportunities(): Promise<GrowthOpportunity[]> {
    const db = getDatabase();
    const opportunities: GrowthOpportunity[] = [];

    // Helper to calculate a deterministic total active pipeline value
    const activeClients = db.clients.filter(c => c.stage !== "closed_won" && c.stage !== "closed_lost");
    const totalPipeline = activeClients.reduce((acc, c) => {
        const hash = c.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        // Realistic value between $30k and $100k per deal
        return acc + (30000 + (hash % 8) * 10000);
    }, 0);

    const patterns = db.salesPatterns || [];
    
    // 1. Identify highly successful patterns that should be scaled team-wide
    const topPatterns = patterns.filter(p => p.effectivenessScore >= 70 && p.uses > 0);
    
    for (const pattern of topPatterns) {
        let title = "Scale winning strategy";
        const objLower = pattern.objectionType.toLowerCase();
        
        if (objLower.includes("roi") || objLower.includes("value") || objLower.includes("price")) {
            title = "Value & ROI conversations driving win rates";
        } else if (objLower.includes("stakeholder") || objLower.includes("champion")) {
            title = "Strong stakeholder mapping performance";
        } else if (objLower.includes("procurement") || objLower.includes("legal") || objLower.includes("security")) {
            title = "Highly successful enterprise procurement strategies";
        } else {
            title = `High-converting pattern: ${pattern.objectionType}`;
        }

        opportunities.push({
            title,
            // Estimate that scaling a highly effective pattern universally yields a 15% pipeline lift
            potentialImpact: Math.round(totalPipeline * 0.15),
            recommendation: `Mandate the execution of "${pattern.pattern}" for all late-stage ${pattern.objectionType} discussions.`
        });
    }

    // 2. Identify critical pattern weaknesses that represent salvageable revenue leakage
    const weakPatterns = patterns.filter(p => p.effectivenessScore <= 45 && p.losses > 0);
    for (const pattern of weakPatterns) {
        opportunities.push({
            title: `Revenue leakage from ${pattern.objectionType} objections`,
            // Salvaging these lost deals could realistically recover 10% of pipeline
            potentialImpact: Math.round(totalPipeline * 0.10),
            recommendation: `Launch targeted team coaching on ${pattern.objectionType} to prevent further deal losses.`
        });
    }

    // 3. Baseline Win-Rate Lift Opportunity
    const outcomes = db.dealOutcomes || [];
    const wins = outcomes.filter(o => o.outcome === "won").length;
    const totalDecided = outcomes.length;
    const winRate = totalDecided > 0 ? wins / totalDecided : 0;

    if (totalDecided > 0 && winRate < 0.5) {
        opportunities.push({
            title: "Systemic Win-Rate Optimization",
            // A conservative 5% lift in overall pipeline conversion
            potentialImpact: Math.round(totalPipeline * 0.05),
            recommendation: "Increase aggregate win-rate by adopting stricter top-of-funnel MEDDPICC qualification."
        });
    }

    // Sort mathematically by highest potential impact first
    opportunities.sort((a, b) => b.potentialImpact - a.potentialImpact);

    // Deduplicate by title to ensure a clean dashboard view
    const uniqueMap = new Map<string, GrowthOpportunity>();
    for (const opp of opportunities) {
        if (!uniqueMap.has(opp.title)) {
            uniqueMap.set(opp.title, opp);
        }
    }

    // Limit to top 5 opportunities
    return Array.from(uniqueMap.values()).slice(0, 5);
}
