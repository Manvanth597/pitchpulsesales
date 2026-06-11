/**
 * Represents a discrete risk to existing pipeline revenue.
 */
export interface RevenueRisk {
  title: string;
  impact: number;
  severity: "low" | "medium" | "high";
  description: string;
}

/**
 * Represents an actionable opportunity to expand revenue.
 */
export interface GrowthOpportunity {
  title: string;
  potentialImpact: number;
  recommendation: string;
}

/**
 * Represents a macro trend occurring within the pipeline.
 */
export interface PipelineTrend {
  title: string;
  direction: "up" | "down" | "stable";
  changePercentage: number;
  description: string;
}

/**
 * The final aggregated Revenue Intelligence report.
 */
export interface RevenueIntelligence {
  revenueAtRisk: number;
  topRevenueRisks: RevenueRisk[];
  growthOpportunities: GrowthOpportunity[];
  pipelineTrends: PipelineTrend[];
  executiveSummary: string;
  generatedAt: string;
}
