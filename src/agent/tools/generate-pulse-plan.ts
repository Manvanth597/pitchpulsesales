import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { getClient } from "../../lib/db";
import { loadSkillContext } from "./load-skill-context";
import { retrievePatterns } from "../learning/retrieve-patterns";
import { calculateDealHealthFromClient } from "../analytics/calculate-deal-health";

export const generatePulsePlan = new FunctionTool({
    name: "generate_pulse_plan",

    description:
        "Generates a stage-aware pulse plan using client memory, pitch evolution, objections and previous debriefs.",

    parameters: z.object({
        clientId: z.string(),

        callObjective: z.string().optional(),

        stage: z.enum([
            "awareness",
            "interest",
            "desire",
            "action",
        ]),
    }),

    execute: async ({
        clientId,
        callObjective,
        stage,
    }) => {
        try {
            const client = await getClient(clientId);

            if (!client) {
                return {
                    status: "error",
                    message: "Client not found",
                };
            }

            const recentDebrief =
                client.debriefs.length > 0
                    ? client.debriefs[client.debriefs.length - 1]
                    : null;

            const commonObjections =
                client.objectionHistory.slice(-5);

            const rawObjection =
                recentDebrief?.objectionFaced ||
                (client.objectionHistory.length > 0 ? client.objectionHistory[client.objectionHistory.length - 1] : "") ||
                "";
            const objectionType = rawObjection.toLowerCase().trim();
            const skillContext = loadSkillContext(stage, objectionType);

            const learnedPatterns = objectionType ? retrievePatterns(objectionType) : [];

            console.log(
                "[Learning Engine] Loaded Patterns:",
                learnedPatterns
            );

            const patternContext =
                learnedPatterns.length > 0
                    ? learnedPatterns
                        .map(
                            (pattern, index) => `
${index + 1}. Pattern:
${pattern.pattern}

Effectiveness:
${pattern.effectivenessScore}%

Uses:
${pattern.uses}

Examples:
${pattern.examples.join(", ")}
`
                        )
                        .join("\n")
                    : "No historical patterns available.";

            console.log(
                "[Learning Engine] Pattern Context:",
                patternContext
            );

            const patternsBlock = `
==============================
TOP PERFORMING SALES PATTERNS
==============================

${patternContext}
`;

            return {
                status: "success",

                clientId,

                companyName: client.companyName,

                stage,

                customerContext:
                    client.customerContext,

                evolvingPitch:
                    client.evolvingPitch,

                recentDebrief,

                dealHealth: calculateDealHealthFromClient(client),

                commonObjections,

                confidenceTrend:
                    client.confidenceTrend,

                suggestedCallObjective:
                    callObjective ||
                    `Advance prospect through ${stage} stage.`,

                activeSalesSkills: skillContext,

                instructionsForAgent: `
==============================
ACTIVE SALES SKILLS
==============================

${skillContext}
${patternsBlock}
==============================
CLIENT MEMORY
==============================

Company Name: ${client.companyName}
Current Sales Stage: ${stage}
Customer Context: ${client.customerContext}
Past Objections: ${commonObjections.join(", ") || "None yet."}
Recent Debrief: ${recentDebrief ? recentDebrief.summary : "None"}

==============================
TASK
==============================

Generate:

1. Recommended opener

2. 5 discovery questions

3. Top predicted objection

4. Planned response

5. Tactical reminders

Use:
- customer context
- previous objections
- debrief history
- pitch evolution
- current sales stage
- active sales skills

Return structured output.
`,
            };
        } catch (error) {
            console.error(error);

            return {
                status: "error",
                message: "Failed to generate pulse plan",
            };
        }
    },
});