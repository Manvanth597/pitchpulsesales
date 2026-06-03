import { FunctionTool } from "@google/adk";
import { z } from "zod";

import {
    getClient,
    saveClient,
} from "@/lib/db";

export const improvePitch =
    new FunctionTool({
        name: "improve_pitch",

        description:
            "Creates a new pitch version based on debrief insights, objection history, confidence trends and previous pitch evolution.",

        parameters: z.object({
            clientId: z.string(),

            improvedPitch: z.object({
                coldCallOpener: z.string(),

                discoveryQuestions:
                    z.array(z.string()),

                coreNarrative:
                    z.string(),

                commonObjections:
                    z.array(z.string()),

                valuePositioning:
                    z.array(z.string()),
            }),

            triggerEvent:
                z.string(),

            appliedChanges:
                z.array(z.string()),

            aiSummary: z.object({
                whyChanged:
                    z.string(),

                whatImproved:
                    z.string(),

                futureImpact:
                    z.string(),
            }),
        }),

        execute: async ({
            clientId,
            improvedPitch,
            triggerEvent,
            appliedChanges,
            aiSummary,
        }) => {
            try {
                const client =
                    await getClient(clientId);

                if (!client) {
                    return {
                        status: "error",
                        message:
                            "Client not found",
                    };
                }

                const currentVersion =
                    client.evolutionHistory
                        .length > 0
                        ? client.evolutionHistory[
                            client.evolutionHistory
                                .length - 1
                        ].version
                        : 0;

                const evolutionRecord = {
                    id:
                        crypto.randomUUID(),

                    version:
                        currentVersion + 1,

                    timestamp:
                        new Date().toISOString(),

                    previousNarrative:
                        client.evolvingPitch,

                    improvedNarrative:
                        improvedPitch,

                    triggerEvent,

                    appliedChanges,

                    aiSummary,
                };

                client.evolutionHistory.push(
                    evolutionRecord
                );

                client.evolvingPitch =
                    improvedPitch;

                client.updatedAt =
                    new Date().toISOString();

                await saveClient(client);

                return {
                    status: "success",

                    newVersion:
                        currentVersion + 1,

                    evolutionRecord,

                    improvedPitch,
                };
            } catch (error) {
                console.error(
                    "IMPROVE_PITCH_ERROR",
                    error
                );

                return {
                    status: "error",

                    message:
                        "Failed to improve pitch",
                };
            }
        },
    });