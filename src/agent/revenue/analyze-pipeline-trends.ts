import { getDatabase } from "@/lib/db";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { PipelineTrend } from "./types";

/**
 * Deterministically detects macro pipeline trends without relying on AI.
 * Analyzes health, confidence, objections, and aggregate win/loss data.
 */
export async function analyzePipelineTrends(): Promise<PipelineTrend[]> {
    const db = getDatabase();
    const trends: PipelineTrend[] = [];

    const activeClients = db.clients.filter(c => c.stage !== "closed_won" && c.stage !== "closed_lost");
    
    // 1. Confidence Trend Analysis
    let totalLatestConf = 0;
    let totalPrevConf = 0;
    let confCount = 0;
    
    for (const c of activeClients) {
        // Only evaluate deals that actually have historical confidence shifts
        if (c.confidenceTrend.length > 1) {
            totalLatestConf += c.confidenceTrend[c.confidenceTrend.length - 1];
            totalPrevConf += c.confidenceTrend[c.confidenceTrend.length - 2];
            confCount++;
        }
    }

    if (confCount > 0 && totalPrevConf > 0) {
        const confChange = ((totalLatestConf - totalPrevConf) / totalPrevConf) * 100;
        const absConfChange = Math.abs(Math.round(confChange));
        
        // Only surface statistically meaningful shifts (>= 5%)
        if (absConfChange >= 5) {
            trends.push({
                title: "Rep Confidence",
                direction: confChange > 0 ? "up" : "down",
                changePercentage: absConfChange,
                description: `Overall sales representative confidence is trending ${confChange > 0 ? "upwards" : "downwards"} across active deals.`
            });
        }
    }

    // 2. Deal Health Trend Analysis
    let totalHealth = 0;
    for (const c of activeClients) {
        totalHealth += calculateDealHealthFromClient(c).score;
    }
    const avgHealth = activeClients.length > 0 ? totalHealth / activeClients.length : 50;
    
    // Compare avgHealth against a standard historical baseline of 60
    const healthBaseline = 60;
    const healthChange = ((avgHealth - healthBaseline) / healthBaseline) * 100;
    const absHealthChange = Math.abs(Math.round(healthChange));
    
    if (absHealthChange >= 5) {
        trends.push({
            title: "Pipeline Health",
            direction: healthChange > 0 ? "up" : "down",
            changePercentage: absHealthChange,
            description: `Average pipeline health is ${healthChange > 0 ? "improving" : "declining"} compared to historical baselines.`
        });
    }

    // 3. Objection Trend Analysis
    const patterns = db.salesPatterns || [];
    for (const p of patterns) {
        // Require a minimum sample size
        if (p.uses > 2) {
            const lossRate = p.losses / p.uses;
            const winRate = p.wins / p.uses;
            
            // If the objection is causing disproportionate losses
            if (lossRate > 0.5) {
                const severitySpike = Math.round((lossRate - 0.5) * 100);
                if (severitySpike >= 5) {
                    trends.push({
                        title: `${p.objectionType} Objections`,
                        direction: "up", // The threat itself is trending UP
                        changePercentage: severitySpike,
                        description: `Encounters with ${p.objectionType} objections are resulting in increasingly higher loss rates.`
                    });
                }
            } else if (winRate >= 0.7) {
                // If the objection is being successfully swatted down
                const improvement = Math.round((winRate - 0.7) * 100);
                if (improvement >= 5) {
                    trends.push({
                        title: `${p.objectionType} Resolution`,
                        direction: "up", // Resolution success is trending UP
                        changePercentage: improvement,
                        description: `The team is successfully resolving ${p.objectionType} objections at an increasing rate.`
                    });
                }
            }
        }
    }

    // 4. Global Win/Loss Trend Analysis
    const outcomes = db.dealOutcomes || [];
    if (outcomes.length > 0) {
        const wins = outcomes.filter(o => o.outcome === "won").length;
        const winRate = wins / outcomes.length;
        
        // Evaluate against a systemic target win-rate of 40%
        const winRateChange = ((winRate - 0.40) / 0.40) * 100;
        const absWinRateChange = Math.abs(Math.round(winRateChange));
        
        if (absWinRateChange >= 5) {
            trends.push({
                title: "Overall Win Rate",
                direction: winRateChange > 0 ? "up" : "down",
                changePercentage: absWinRateChange,
                description: `Global deal conversion rates are trending ${winRateChange > 0 ? "higher" : "lower"}.`
            });
        }
    }

    // Sort by highest velocity of change
    trends.sort((a, b) => b.changePercentage - a.changePercentage);

    // Enforce 10 item limit
    return trends.slice(0, 10);
}
