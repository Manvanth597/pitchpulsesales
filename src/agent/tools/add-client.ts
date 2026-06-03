import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { saveClient, ClientMemory } from "../../lib/db";

export const addClient = new FunctionTool({
  name: "add_client",

  description:
    "Creates and registers a new client memory in the database. Call this tool when the salesperson asks to create a new client, register a new company, or add a customer that doesn't exist in the list.",

  parameters: z.object({
    companyName: z
      .string()
      .describe(
        "The name of the company or target customer segment to register."
      ),

    customerContext: z
      .string()
      .optional()
      .describe("Initial background context or details about this customer."),

    stage: z
      .enum(["awareness", "interest", "desire", "action"])
      .optional()
      .describe(
        "The initial sales stage of the client. Defaults to 'awareness'."
      ),
  }),

  execute: async ({ companyName, customerContext, stage }) => {
    try {
      const clientId = crypto.randomUUID();

      const newClient: ClientMemory = {
        id: clientId,

        companyName,

        stage: stage || "awareness",

        pulsePlans: [],

        debriefs: [],

        evolvingPitch: {
          coldCallOpener: `Hi, this is [My Name] from NKW Global. I noticed your company ${companyName} and we specialize in helping businesses like yours quickly establish a robust, high-performance digital presence. Do you have a quick minute?`,

          discoveryQuestions: [
            "What is your biggest pain point in scaling your product or service right now?",
            "How are you currently handling your team's digital outreach or brand scaling?",
            "What are your top 1-2 strategic goals over the next 6-12 months?",
            "What resources or expertise do you feel you lack to reach those objectives?",
            "How important is establishing a clean, scalable brand foundation early on?",
          ],

          coreNarrative: `We are a specialized team of engineers, designers, and strategists at NKW Global who partner with companies like ${companyName} to build precise, durable digital infrastructure and brand assets. We deliver high-performing systems that strengthen your business sustainably.`,

          commonObjections: [
            "We already have an internal team handling this.",
            "We are too early-stage and need to keep budget extremely constrained.",
            "We are not ready to commit to a long-term partnership right now.",
          ],

          valuePositioning: [
            `Launch ${companyName} with precision and clean, durable digital assets, avoiding costly reworks later.`,
            "Partner with a dedicated team committed to tangible outcomes, de-risking your investment.",
            "Establish a scalable infrastructure designed to support rapid growth sustainably.",
          ],
        },

        evolutionHistory: [],

        customerContext: customerContext || "",

        objectionHistory: [],

        confidenceTrend: [],

        updatedAt: new Date().toISOString(),
      };

      await saveClient(newClient);

      return {
        status: "success",

        message: `Client "${companyName}" successfully created.`,

        clientId,

        client: newClient,
      };
    } catch (error) {
      console.error("ADD_CLIENT_ERROR", error);

      return {
        status: "error",

        message: "Failed to create new client.",
      };
    }
  },
});
