/**
 * Defines the final coaching report generated for a sales representative.
 */
export interface CoachingReport {
  repId: string;
  strengths: string[];
  weaknesses: string[];
  recommendedSkills: string[];
  coachingPlan: string[];
  performanceScore: number;
  generatedAt: string;
}

/**
 * Represents a specific skill gap identified during rep performance analysis.
 */
export interface SkillGap {
  skill: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendation: string;
}

/**
 * Detailed performance analysis for a single sales representative.
 */
export interface RepPerformanceAnalysis {
  repId: string;
  winRate: number;
  avgDealHealth: number;
  avgConfidence: number;
  strengths: string[];
  weaknesses: string[];
  skillGaps: SkillGap[];
}
