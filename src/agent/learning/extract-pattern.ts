import { randomUUID } from "crypto";

export function extractPattern({
    objection,
    responseUsed,
}: {
    objection: string;
    responseUsed: string;
}) {

    return {
        id: randomUUID(),

        objectionType:
            objection.toLowerCase(),

        pattern:
            responseUsed.trim(),

        effectivenessScore: 50,

        wins: 0,

        losses: 0,

        uses: 0,

        examples: [responseUsed],

        lastUpdated:
            new Date().toISOString(),
    };
}