import { getRevenueIntelligence } from "@/agent/revenue/get-revenue-intelligence";
import { getForecast } from "@/agent/forecasting/get-forecast";
import { ExecutiveWorkspace } from "./types";

/**
 * Single entry point for compiling the macro-level Executive Workspace.
 * Orchestrates macro revenue trends, systemic pipeline risk, and strategic growth opportunities.
 */
export async function getExecutiveWorkspace(): Promise<ExecutiveWorkspace> {
    
    // Concurrently fetch the massive underlying data aggregation layers.
    // By utilizing Promise.all, we guarantee maximum backend efficiency across the engines.
    const [
        revenueIntelligence,
        forecasting
    ] = await Promise.all([
        getRevenueIntelligence(),
        getForecast()
    ]);

    // Extract specific drill-down modules directly from the primary revenue payload 
    // to strictly adhere to the UI interface without triggering duplicated calculations.
    const { topRevenueRisks, growthOpportunities, pipelineTrends } = revenueIntelligence;

    // Synthesize the strictly typed Executive Workspace payload
    return {
        revenueIntelligence,
        forecasting,
        revenueRisks: topRevenueRisks,
        growthOpportunities,
        pipelineTrends
    };
}
