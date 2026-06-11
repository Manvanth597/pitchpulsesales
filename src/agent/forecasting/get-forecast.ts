import { getDatabase } from "@/lib/db";
import { predictDealClose } from "./predict-deal-close";
import { calculateForecast } from "./calculate-forecast";
import { predictQuarter } from "./predict-quarter";
import { ForecastReport } from "./types";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";

/**
 * Single entry point for forecasting intelligence.
 * Orchestrates deal, pipeline, and quarterly projections into a unified executive report.
 */
export async function getForecast(): Promise<ForecastReport> {
    const db = getDatabase();
    
    // Isolate active deals
    const activeClients = db.clients.filter(c => c.stage !== "closed_won" && c.stage !== "closed_lost");

    // Concurrently fetch the granular deal forecasts, the pipeline roll-up, and the quarterly scenario projections.
    // By leveraging Promise.all, we ensure the backend resolves all nested database calls simultaneously.
    const [
        dealForecasts, 
        pipelineForecast, 
        quarterForecast
    ] = await Promise.all([
        Promise.all(activeClients.map(c => predictDealClose(c.id))),
        calculateForecast(),
        predictQuarter()
    ]);

    const { content: forecastSummaryText, usedCachedData } = await getCachedInsightText(
        db.forecastInsightVersion || 0,
        "forecastSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const prompt = `Write a short 1-sentence forecasting summary. Expected pipeline revenue: $${pipelineForecast.expectedRevenue}. Quarter best case: $${quarterForecast.bestCase}. Confidence: ${quarterForecast.forecastConfidence}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "Forecast summary generated.";
        }
    );

    return {
        dealForecasts,
        pipelineForecast,
        quarterForecast,
        forecastSummaryText,
        generatedAt: new Date().toISOString(),
        usedCachedData
    };
}
