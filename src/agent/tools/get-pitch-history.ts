import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { getClient } from "../../lib/db";

export const getPitchHistory = new FunctionTool({
    name: "get_pitch_history",

    description:
        "Returns all pitch evolution history for a specific client including version changes, trigger events and AI summaries.",

    parameters: z.object({
        clientId: z.string(),
    }),

    execute: async ({ clientId }) => {
        try {
            const client = await getClient(clientId);

            if (!client) {
                return {
                    status: "error",
                    message: "Client not found",
                };
            }

            const history = client.evolutionHistory || [];

            return {
                status: "success",

                clientId,

                companyName: client.companyName,

                currentVersion:
                    history.length > 0
                        ? history[history.length - 1].version
                        : 1,

                totalVersions: history.length,

                history,
            };
        } catch (error) {
            console.error(error);

            return {
                status: "error",
                message: "Failed to retrieve pitch history",
            };
        }
    },
});