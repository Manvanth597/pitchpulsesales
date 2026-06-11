import { getDatabase, saveDatabase } from "@/lib/db";
import { DealOutcome } from "./types";

/**
 * Updates SalesPattern statistics based on a completed DealOutcome.
 * Dynamically adjusts win/loss rates, usage counts, and the overall effectiveness score.
 */
export async function updatePatternOutcomes(outcome: DealOutcome): Promise<void> {
    const db = getDatabase();

    if (!db.salesPatterns || outcome.patternsUsed.length === 0) {
        return; // Nothing to update
    }

    let modified = false;
    const usedIds = new Set(outcome.patternsUsed);

    for (const pattern of db.salesPatterns) {
        if (usedIds.has(pattern.id)) {
            // 1. Always increment usage
            pattern.uses += 1;

            // 2. Increment specific outcome
            if (outcome.outcome === "won") {
                pattern.wins += 1;
            } else if (outcome.outcome === "lost") {
                pattern.losses += 1;
            }

            // 3. Recalculate effectiveness score (wins / total decided outcomes)
            const totalOutcomes = pattern.wins + pattern.losses;
            if (totalOutcomes > 0) {
                // Stored as an integer percentage (e.g., 85 for 85%)
                pattern.effectivenessScore = Math.round((pattern.wins / totalOutcomes) * 100);
            }

            pattern.lastUpdated = new Date().toISOString();
            modified = true;
        }
    }

    // 4. Persist updates
    if (modified) {
        saveDatabase(db);
    }
}
