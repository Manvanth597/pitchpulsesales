import { getDatabase } from "@/lib/db";
import { predictDealClose } from "./predict-deal-close";
import { PipelineForecast } from "./types";

/**
 * Deterministically aggregates individual deal forecasts into a macro pipeline forecast.
 */
export async function calculateForecast(): Promise<PipelineForecast> {
    const db = getDatabase();
    
    // Isolate only active opportunities
    const activeClients = db.clients.filter(c => c.stage !== "closed_won" && c.stage !== "closed_lost");

    // Process all active deal probabilities concurrently
    const dealForecasts = await Promise.all(
        activeClients.map(client => predictDealClose(client.id))
    );

    let totalPipeline = 0;
    let expectedRevenue = 0;
    let totalProbability = 0;
    
    let highConfidenceRevenue = 0;
    let mediumConfidenceRevenue = 0;
    let lowConfidenceRevenue = 0;

    for (const forecast of dealForecasts) {
        totalPipeline += forecast.dealValue;
        expectedRevenue += forecast.expectedRevenue;
        totalProbability += forecast.probabilityOfClose;

        // Group the expected revenue by mathematically calculated confidence buckets
        if (forecast.confidenceLevel === "high") {
            highConfidenceRevenue += forecast.expectedRevenue;
        } else if (forecast.confidenceLevel === "medium") {
            mediumConfidenceRevenue += forecast.expectedRevenue;
        } else {
            lowConfidenceRevenue += forecast.expectedRevenue;
        }
    }

    const averageProbability = dealForecasts.length > 0 
        ? Math.round(totalProbability / dealForecasts.length) 
        : 0;

    return {
        totalPipeline,
        expectedRevenue,
        weightedRevenue: expectedRevenue, // In this probabilistic model, expected equates to probability-weighted
        averageProbability,
        highConfidenceRevenue,
        mediumConfidenceRevenue,
        lowConfidenceRevenue
    };
}
