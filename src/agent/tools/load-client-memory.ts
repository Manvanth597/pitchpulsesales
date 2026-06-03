import { FunctionTool } from "@google/adk";
import { z } from "zod";

import {
  getClient,
} from "../../lib/db";
import { loadSkillContext } from "./load-skill-context";
import { calculateDealHealthFromClient } from "../analytics/calculate-deal-health";

export const loadClientMemory =
  new FunctionTool({
    name: "load_client_memory",

    description:
      "Loads full historical memory for a client including stage, objections, pulse plans, debriefs, confidence trends, evolving pitch, and pitch evolution history.",

    parameters: z.object({
      clientId: z
        .string()
        .describe(
          "The unique client ID whose sales memory should be retrieved."
        ),
    }),

    execute: async ({ clientId }) => {
      try {
        const client =
          await getClient(clientId);

        if (!client) {
          return {
            status: "error",

            message:
              "Client memory not found.",
          };
        }

        const latestDebrief = client.debriefs.length > 0 ? client.debriefs[client.debriefs.length - 1] : null;
        const latestObjection = latestDebrief?.objectionFaced || "";
        const skillContext = loadSkillContext(client.stage, latestObjection);

        return {
          status: "success",

          memory: {
            id: client.id,

            companyName:
              client.companyName,

            currentStage:
              client.stage,

            customerContext:
              client.customerContext,

            objectionHistory:
              client.objectionHistory,

            confidenceTrend:
              client.confidenceTrend,

            evolvingPitch:
              client.evolvingPitch,

            pulsePlans:
              client.pulsePlans,

            debriefs:
              client.debriefs,

            evolutionHistory:
              client.evolutionHistory,

            activeSalesSkills:
              skillContext,

            dealHealth:
              calculateDealHealthFromClient(client),

            updatedAt:
              client.updatedAt,
          },
        };
      } catch (error) {
        console.error(
          "LOAD_CLIENT_MEMORY_ERROR",
          error
        );

        return {
          status: "error",

          message:
            "Failed to load client memory.",
        };
      }
    },
  });
