import { getAllSalesPatterns } from "@/lib/db";
import { DealOutcome, DealOutcomeAnalysis } from "./types";

/**
 * Generates actionable learning insights when opportunities close.
 * Acts as the foundation for future coaching recommendations.
 */
export async function analyzeDealOutcome(outcome: DealOutcome): Promise<DealOutcomeAnalysis> {
    const allPatterns = await getAllSalesPatterns();
    const usedPatterns = allPatterns.filter(p => outcome.patternsUsed.includes(p.id));

    const winningPatterns: string[] = [];
    const losingPatterns: string[] = [];
    const lessonsLearned: string[] = [];

    // Analyze the specific patterns utilized during this deal's lifecycle
    for (const pattern of usedPatterns) {
        if (outcome.outcome === "won") {
            winningPatterns.push(pattern.pattern);
            
            // Insight generation for wins
            if (pattern.effectivenessScore >= 60) {
                lessonsLearned.push(`"${pattern.pattern}" significantly contributed to successful close.`);
            } else {
                lessonsLearned.push(`Successfully navigated "${pattern.objectionType}" despite historical pattern weakness.`);
            }
        } else {
            losingPatterns.push(pattern.pattern);
            
            // Insight generation for losses
            if (pattern.effectivenessScore < 50) {
                lessonsLearned.push(`"${pattern.objectionType}" objection remained unresolved, highlighting a need for new messaging.`);
            } else {
                lessonsLearned.push(`Even the highly effective pattern "${pattern.pattern}" failed to secure the deal.`);
            }
        }
    }

    // Inject baseline outcome insights based on confidence and explicit reason
    if (outcome.outcome === "won") {
        if (outcome.finalConfidence >= 8) {
            lessonsLearned.push("High champion engagement consistently increased confidence through the finish line.");
        }
        // Fallback generic insight if no patterns were triggered
        if (lessonsLearned.length === 0) {
            lessonsLearned.push(`Deal closed successfully: ${outcome.reason}`);
        }
    } else {
        if (outcome.finalConfidence <= 4) {
            lessonsLearned.push("Low confidence signals were accurate early indicators of deal failure.");
        }
        // Fallback generic insight if no patterns were triggered
        if (lessonsLearned.length === 0) {
            lessonsLearned.push(`Deal lost due to: ${outcome.reason}`);
        }
    }

    // Deduplicate insights and rigorously enforce the 5-insight limit
    const uniqueLessons = Array.from(new Set(lessonsLearned)).slice(0, 5);

    return {
        outcome: outcome.outcome,
        winningPatterns,
        losingPatterns,
        lessonsLearned: uniqueLessons
    };
}
