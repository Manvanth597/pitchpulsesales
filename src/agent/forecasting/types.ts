/**
 * Represents the forecasted outcome for a specific individual deal.
 */
export interface DealForecast {
  dealId: string;
  company: string;
  dealValue: number;
  probabilityOfClose: number;
  expectedRevenue: number;
  confidenceLevel: "low" | "medium" | "high";
}

/**
 * Represents the aggregate forecasted revenue across the entire active pipeline.
 */
export interface PipelineForecast {
  totalPipeline: number;
  expectedRevenue: number;
  weightedRevenue: number;
  averageProbability: number;
  highConfidenceRevenue: number;
  mediumConfidenceRevenue: number;
  lowConfidenceRevenue: number;
}

/**
 * Represents the strategic macro forecast scenarios for the current quarter.
 */
export interface QuarterForecast {
  bestCase: number;
  expectedCase: number;
  worstCase: number;
  forecastConfidence: "low" | "medium" | "high";
}

/**
 * The final orchestrated Forecasting Report aggregating all deal and pipeline projections.
 */
export interface ForecastReport {
  dealForecasts: DealForecast[];
  pipelineForecast: PipelineForecast;
  quarterForecast: QuarterForecast;
  forecastSummaryText?: string;
  generatedAt: string;
  usedCachedData?: boolean;
}

/**
 * Represents the deterministic inputs utilized when mathematically calculating probability of close.
 */
export interface ForecastFactors {
  dealHealth: number;
  riskScore: number;
  confidenceScore: number;
  patternEffectiveness: number;
  strategyScore: number;
  historicalWinRate: number;
}

/**
 * Configurable matrix weights for tuning the forecasting algorithm.
 */
export interface ForecastWeights {
  dealHealth: number;
  risk: number;
  confidence: number;
  patternEffectiveness: number;
  strategy: number;
  historicalWinRate: number;
}

/**
 * Default algorithmic weights for the Forecasting Engine.
 * Total baseline configuration equals 100.
 */
export const DEFAULT_FORECAST_WEIGHTS: Readonly<ForecastWeights> = Object.freeze({
  dealHealth: 30,
  risk: 20,
  confidence: 15,
  patternEffectiveness: 10,
  strategy: 15,
  historicalWinRate: 10
});
