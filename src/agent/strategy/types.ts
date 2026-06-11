/**
 * Defines the final strategic report generated for an active deal.
 */
export interface DealStrategyReport {
  dealId: string;
  probabilityOfSuccess: number;
  strengths: string[];
  weaknesses: string[];
  blockers: string[];
  nextActions: string[];
  recommendedSkills: string[];
  generatedAt: string;
}

/**
 * Represents a critical blocker impeding deal velocity or probability of success.
 */
export interface DealBlocker {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
}

/**
 * Represents an identified strength within the deal's lifecycle.
 */
export interface DealStrength {
  description: string;
  score: number;
}

/**
 * Represents an identified weakness or risk within the deal's lifecycle.
 */
export interface DealWeakness {
  description: string;
  score: number;
}
