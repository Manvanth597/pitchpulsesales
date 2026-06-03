import { getDatabase } from "@/lib/db";

export function retrievePatterns(
    objectionType: string
) {
    const db = getDatabase();

    return db.salesPatterns
        .filter(
            (pattern) =>
                pattern.objectionType === objectionType
        )
        .sort(
            (a, b) =>
                b.effectivenessScore -
                a.effectivenessScore
        )
        .slice(0, 5);
}