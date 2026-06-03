import { FunctionTool } from "@google/adk";
import { z } from "zod";

import {
    getDatabase,
    saveDatabase,
    Debrief,
    SalesPattern,
} from "../../lib/db";
import { extractPattern } from "../learning/extract-pattern";
import { updatePatternScore } from "../learning/update-pattern-score";

export const saveDebrief =
    new FunctionTool({
        name: "save_debrief",

        description:
            "Stores a completed sales debrief into client memory and updates confidence and objection history.",

        parameters: z.object({
            clientId: z.string(),

            summary: z.string(),

            objectionFaced: z.string(),

            yourResponse: z.string(),

            outcome: z.string(),

            selfScore: z.number().min(1).max(10),
        }),

        execute: async ({
            clientId,
            summary,
            objectionFaced,
            yourResponse,
            outcome,
            selfScore,
        }) => {
            try {
                const db = getDatabase();
                const client = db.clients.find(c => c.id === clientId);

                if (!client) {
                    return {
                        status: "error",
                        message:
                            "Client not found.",
                    };
                }

                const newDebrief: Debrief = {
                    id: crypto.randomUUID(),

                    summary,

                    objectionFaced,

                    yourResponse,

                    outcome,

                    selfScore:
                        selfScore as Debrief["selfScore"],

                    analysis: null,

                    createdAt:
                        new Date().toISOString(),
                };

                client.debriefs.push(
                    newDebrief
                );

                client.objectionHistory.push(
                    objectionFaced
                );

                client.confidenceTrend.push(
                    selfScore as Debrief["selfScore"]
                );

                client.updatedAt =
                    new Date().toISOString();

                // Extract pattern using extractPattern
                const pattern = extractPattern({
                    objection: objectionFaced,
                    responseUsed: yourResponse,
                });

                const existingPattern = db.salesPatterns.find(
                    (p) => p.objectionType === pattern.objectionType && p.pattern === pattern.pattern
                );

                let activePattern: SalesPattern = pattern;

                if (existingPattern) {
                    if (!existingPattern.examples.includes(yourResponse)) {
                        existingPattern.examples.push(yourResponse);
                    }
                    existingPattern.lastUpdated = new Date().toISOString();
                    activePattern = existingPattern;
                } else {
                    db.salesPatterns.push(pattern);
                }

                console.log(
                    "[Learning Engine] Pattern Updated:",
                    activePattern
                );

                saveDatabase(db);

                // Map outcomes
                let scoreOutcome: "positive" | "negative" | "neutral" = "neutral";
                const normOutcome = outcome.toLowerCase();
                if (normOutcome.includes("won") || normOutcome.includes("positive")) {
                    scoreOutcome = "positive";
                } else if (normOutcome.includes("lost") || normOutcome.includes("negative")) {
                    scoreOutcome = "negative";
                }

                updatePatternScore(
                    activePattern.id,
                    scoreOutcome
                );

                return {
                    status: "success",

                    message:
                        "Debrief saved successfully.",

                    debrief:
                        newDebrief,
                };
            } catch (error) {
                console.error(
                    "SAVE_DEBRIEF_ERROR",
                    error
                );

                return {
                    status: "error",

                    message:
                        "Failed to save debrief.",
                };
            }
        },
    });