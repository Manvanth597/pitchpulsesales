/**
 * Represents the final outcome of a sales opportunity.
 * Used by the Learning Engine to evaluate and adjust pattern effectiveness scores.
 */
export interface DealOutcome {
  dealId: string;
  outcome: "won" | "lost";
  reason: string;
  patternsUsed: string[];
  finalConfidence: number;
  closedAt: string;
}

/**
 * Analysis of a closed deal to extract actionable learning insights.
 */
export interface DealOutcomeAnalysis {
  outcome: "won" | "lost";
  winningPatterns: string[];
  losingPatterns: string[];
  lessonsLearned: string[];
}
