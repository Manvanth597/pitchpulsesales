import { calculateForecast } from "./calculate-forecast";
import { QuarterForecast } from "./types";

/**
 * Generates executive forecasting scenarios for the current quarter.
 * Evaluates the spread between best and worst-case scenarios to determine overall predictability.
 */
export async function predictQuarter(): Promise<QuarterForecast> {
    // 1. Retrieve the aggregated pipeline forecast metrics
    const pipeline = await calculateForecast();

    // 2. Expected Case (Most Likely)
    // Directly uses the strict, probability-weighted revenue calculation
    const expectedCase = pipeline.weightedRevenue;

    // 3. Worst Case (Commit)
    // The baseline assumption where only the highest-confidence deals successfully close
    const worstCase = pipeline.highConfidenceRevenue;

    // 4. Best Case (Upside)
    // The optimistic assumption where both high and medium confidence deals successfully close
    const bestCase = pipeline.highConfidenceRevenue + pipeline.mediumConfidenceRevenue;

    // 5. Generate Forecast Confidence based on Variance
    // A tight spread between best/worst indicates high predictability.
    // A massive spread indicates a volatile, unpredictable pipeline.
    let forecastConfidence: "low" | "medium" | "high" = "medium";
    
    if (expectedCase > 0) {
        // Calculate the percentage variance relative to the expected case
        const variance = (bestCase - worstCase) / expectedCase;
        
        if (variance <= 0.25) {
            forecastConfidence = "high"; // Tight grouping = Predictable
        } else if (variance >= 0.60) {
            forecastConfidence = "low";  // Massive spread = Volatile
        } else {
            forecastConfidence = "medium";
        }
    } else {
        // Fallback for empty pipelines
        forecastConfidence = "low";
    }

    return {
        bestCase,
        expectedCase,
        worstCase,
        forecastConfidence
    };
}
