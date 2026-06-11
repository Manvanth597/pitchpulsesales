import { RevenueRisk, GrowthOpportunity, PipelineTrend } from "./types";

/**
 * Deterministically generates an executive-level summary of the pipeline
 * without relying on LLM text generation.
 */
export function generateRevenueInsights(
    risks: RevenueRisk[],
    opportunities: GrowthOpportunity[],
    trends: PipelineTrend[]
): { executiveSummary: string, revenueAtRisk: number } {
    
    let summary = "";
    let sentenceCount = 0;
    
    // 1. Calculate Aggregate Revenue at Risk
    let revenueAtRisk = 0;
    for (const risk of risks) {
        revenueAtRisk += risk.impact;
    }
    
    // 2. Synthesize Risk Insight
    if (risks.length > 0) {
        const topRisk = risks[0];
        summary += `$${revenueAtRisk.toLocaleString()} of revenue is currently at risk, primarily driven by ${topRisk.title.toLowerCase()}. `;
        sentenceCount++;
    } else {
        summary += "The current active pipeline is stable with zero critical revenue risks detected. ";
        sentenceCount++;
    }
    
    // 3. Synthesize Growth Insight
    if (opportunities.length > 0 && sentenceCount < 5) {
        const topOpp = opportunities[0];
        summary += `${topOpp.title} represents the strongest strategic growth opportunity. `;
        sentenceCount++;
    }

    // 4. Synthesize Macro Trends Insight
    if (trends.length > 0 && sentenceCount < 5) {
        const topTrend = trends[0];
        
        // Dynamically assign grammatically correct phrasing
        let directionPhrase = topTrend.direction === "up" ? "increasing" : "decreasing";
        const titleLower = topTrend.title.toLowerCase();
        
        if (titleLower.includes("health") || titleLower.includes("confidence") || titleLower.includes("rate") || titleLower.includes("resolution")) {
            directionPhrase = topTrend.direction === "up" ? "improving" : "declining";
        }
        
        summary += `${topTrend.title} is currently ${directionPhrase} across the pipeline. `;
        sentenceCount++;
        
        // Add a secondary trend if we have space and it exists
        if (trends.length > 1 && sentenceCount < 5) {
            const secondTrend = trends[1];
            let dirPhrase2 = secondTrend.direction === "up" ? "trending upwards" : "trending downwards";
            summary += `Additionally, ${secondTrend.title.toLowerCase()} is ${dirPhrase2}. `;
            sentenceCount++;
        }
    }
    
    // Fallback failsafe
    if (sentenceCount === 0) {
        summary = "Insufficient data to generate robust executive pipeline insights.";
    }

    return { 
        executiveSummary: summary.trim(),
        revenueAtRisk
    };
}
