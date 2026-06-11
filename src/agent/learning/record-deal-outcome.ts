import { getClient, getAllSalesPatterns, getDatabase, saveDatabase } from "@/lib/db";
import { DealOutcome } from "./types";

/**
 * Records the final outcome of an opportunity for the Learning Engine.
 * Extracts patterns used during the deal but does not update their scores yet.
 */
export async function recordDealOutcome(
    dealId: string, 
    outcome: "won" | "lost", 
    reason: string
): Promise<DealOutcome> {
    // 1. Retrieve opportunity history
    const client = await getClient(dealId);
    if (!client) {
        throw new Error(`Client with ID ${dealId} not found`);
    }

    // 2. Retrieve patterns used throughout the deal
    const allPatterns = await getAllSalesPatterns();
    const patternsUsedIds = new Set<string>();

    // Basic extraction heuristic: cross-reference client's debriefs and analysis
    // against known patterns to determine which ones were utilized.
    for (const debrief of client.debriefs) {
        if (debrief.analysis && debrief.analysis.detectedObjections) {
            for (const detectedObj of debrief.analysis.detectedObjections) {
                // Find patterns that match the detected objection
                const matchingPatterns = allPatterns.filter(
                    p => p.objectionType.toLowerCase().trim() === detectedObj.toLowerCase().trim()
                );
                
                // In a production NLP system, we would perform semantic similarity checks 
                // between debrief.yourResponse and pattern.pattern. Here we associate the standard pattern.
                matchingPatterns.forEach(p => patternsUsedIds.add(p.id));
            }
        }
        
        // Also check raw objection history
        for (const historyObj of client.objectionHistory) {
            const matchingPatterns = allPatterns.filter(
                p => p.objectionType.toLowerCase().trim() === historyObj.toLowerCase().trim()
            );
            matchingPatterns.forEach(p => patternsUsedIds.add(p.id));
        }
    }
    
    // Determine final confidence
    const finalConfidence = client.confidenceTrend.length > 0 
        ? client.confidenceTrend[client.confidenceTrend.length - 1] 
        : 5;

    // 3. Create DealOutcome record
    const record: DealOutcome = {
        dealId,
        outcome,
        reason,
        patternsUsed: Array.from(patternsUsedIds),
        finalConfidence,
        closedAt: new Date().toISOString()
    };

    // 4. Persist outcome
    const db = getDatabase();
    if (!db.dealOutcomes) {
        db.dealOutcomes = [];
    }
    db.dealOutcomes.push(record);
    saveDatabase(db);

    // 5. Return DealOutcome
    return record;
}
