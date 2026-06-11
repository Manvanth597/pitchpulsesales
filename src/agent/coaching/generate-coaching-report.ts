import { RepPerformanceAnalysis, SkillGap, CoachingReport } from "./types";

/**
 * Generates an actionable coaching report for a salesperson.
 * Uses strict deterministic logic to prioritize weaknesses and prescribe specific coaching actions.
 */
export function generateCoachingReport(
    analysis: RepPerformanceAnalysis, 
    gaps: SkillGap[]
): CoachingReport {
    
    // 1. Focus strictly on the top 3 weaknesses to prevent overwhelming the rep
    const topWeaknesses = analysis.weaknesses.slice(0, 3);
    
    // 2. Focus on highest severity skill gaps
    const severityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    
    // Sort gaps by severity (descending)
    const sortedGaps = [...gaps].sort((a, b) => {
        return severityWeight[b.severity] - severityWeight[a.severity];
    });
    
    // Take the top 5 highest priority gaps to ensure we don't exceed the 5 action limit
    const priorityGaps = sortedGaps.slice(0, 5); 
    const recommendedSkills = priorityGaps.map(g => g.skill);
    
    // 3. Generate deterministic coaching plan actions
    const coachingPlan: string[] = priorityGaps.map(gap => {
        const readableSkill = gap.skill.replace(/-/g, " ");
        
        if (gap.skill.includes("objection") || gap.skill === "negotiation") {
            return `Review ${readableSkill} skill`;
        } else if (gap.skill.includes("conversations") || gap.skill.includes("discovery") || gap.skill.includes("calls")) {
            return `Practice ${readableSkill}`;
        } else if (gap.skill.includes("procurement") || gap.skill.includes("mapping")) {
            return `Study winning ${readableSkill} patterns`;
        } else {
            return `Complete training module for ${readableSkill}`;
        }
    });

    // 4. Calculate an aggregate performance score (0-100)
    // Formula: 50% Win Rate, 30% Deal Health, 20% Confidence
    const winRateScore = analysis.winRate * 0.5;
    const healthScore = analysis.avgDealHealth * 0.3;
    const confidenceScore = (analysis.avgConfidence * 10) * 0.2;
    
    const performanceScore = Math.round(winRateScore + healthScore + confidenceScore);

    return {
        repId: analysis.repId,
        // Limit strengths to top 3 for a clean, scannable report
        strengths: analysis.strengths.slice(0, 3), 
        weaknesses: topWeaknesses,
        recommendedSkills,
        coachingPlan, // Already bounded to max 5 by the priorityGaps slice
        performanceScore,
        generatedAt: new Date().toISOString()
    };
}
