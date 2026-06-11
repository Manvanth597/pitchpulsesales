import { detectRevenueRisks } from "./detect-revenue-risks";
import { identifyGrowthOpportunities } from "./identify-growth-opportunities";
import { analyzePipelineTrends } from "./analyze-pipeline-trends";
import { generateRevenueInsights } from "./generate-revenue-insights";
import { RevenueIntelligence } from "./types";

/**
 * Single entry point for executive revenue insights.
 * Orchestrates multiple analytical engines concurrently to map pipeline risks and growth.
 */
export async function getRevenueIntelligence(): Promise<RevenueIntelligence> {
    
    // Concurrently fetch foundational revenue metrics
    const [
        topRevenueRisks, 
        growthOpportunities, 
        pipelineTrends
    ] = await Promise.all([
        detectRevenueRisks(),
        identifyGrowthOpportunities(),
        analyzePipelineTrends()
    ]);

    // Synthesize the data into a high-level executive summary and aggregate risk values
    const { executiveSummary, revenueAtRisk } = generateRevenueInsights(
        topRevenueRisks,
        growthOpportunities,
        pipelineTrends
    );

    // Return the strictly-typed Revenue Intelligence payload
    return {
        revenueAtRisk,
        topRevenueRisks,
        growthOpportunities,
        pipelineTrends,
        executiveSummary,
        generatedAt: new Date().toISOString()
    };
}
