import { getDatabase, saveDatabase } from "@/lib/db";

export function updatePatternScore(
    patternId: string,
    outcome: "positive" | "negative" | "neutral"
) {
    const db = getDatabase();

    const pattern = db.salesPatterns.find(
        (p) => p.id === patternId
    );

    if (!pattern) {
        return;
    }

    pattern.uses += 1;

    switch (outcome) {
        case "positive":
            pattern.wins += 1;
            break;

        case "negative":
            pattern.losses += 1;
            break;

        case "neutral":
            break;
    }

    const total =
        pattern.wins + pattern.losses;

    if (total > 0) {
        pattern.effectivenessScore =
            Math.round(
                (pattern.wins / total) * 100
            );
    }

    pattern.lastUpdated =
        new Date().toISOString();

    saveDatabase(db);

    return pattern;
}