import { FunctionTool } from "@google/adk";
import { z } from "zod";

import {
  getClient,
  saveClient,
  SalesStage,
  invalidateSalesStageCaches
} from "../../lib/db";

export const advanceSalesStage = new FunctionTool({
  name: "advance_sales_stage",

  description:
    "Analyzes latest debrief and advances the client through the sales pipeline.",

  parameters: z.object({
    clientId: z.string(),
  }),

  execute: async ({ clientId }) => {
    const client = await getClient(clientId);

    if (!client) {
      return {
        status: "error",
        message: "Client not found",
      };
    }

    const previousStage = client.stage;

    const latestDebrief =
      client.debriefs[
      client.debriefs.length - 1
      ];

    if (!latestDebrief) {
      return {
        status: "error",
        message: "No debrief available",
      };
    }

    const text = `
      ${latestDebrief.summary}
      ${latestDebrief.objectionFaced}
      ${latestDebrief.outcome}
    `.toLowerCase();

    let nextStage: SalesStage = client.stage;
    let confidence = 50;
    let reason = "";
    let recommendedAction = "";

    if (
      text.includes("interested") ||
      text.includes("follow up")
    ) {
      nextStage = "interest";
      confidence = 70;
      reason =
        "Prospect showed engagement and agreed to continue conversation.";
      recommendedAction =
        "Prepare discovery-focused pulse plan.";
    }

    if (
      text.includes("proposal") ||
      text.includes("pricing") ||
      text.includes("budget")
    ) {
      nextStage = "desire";
      confidence = 85;
      reason =
        "Prospect discussed implementation or pricing.";
      recommendedAction =
        "Prepare ROI and objection handling.";
    }

    if (
      text.includes("contract") ||
      text.includes("purchase") ||
      text.includes("approved")
    ) {
      nextStage = "action";
      confidence = 95;
      reason =
        "Buying intent detected.";
      recommendedAction =
        "Move toward closing workflow.";
    }

    if (
      text.includes("signed") ||
      text.includes("closed won")
    ) {
      nextStage = "closed_won";
      confidence = 100;
      reason =
        "Deal won.";
      recommendedAction =
        "Begin onboarding.";
    }

    if (
      text.includes("not interested") ||
      text.includes("closed lost")
    ) {
      nextStage = "closed_lost";
      confidence = 100;
      reason =
        "Opportunity lost.";
      recommendedAction =
        "Archive opportunity.";
    }

    client.stage = nextStage;
    client.updatedAt = new Date().toISOString();

    await saveClient(client);

    if (previousStage !== nextStage) {
      invalidateSalesStageCaches();
    }

    return {
      status: "success",

      previousStage,

      currentStage: nextStage,

      confidence,

      reason,

      recommendedAction,
    };
  },
});