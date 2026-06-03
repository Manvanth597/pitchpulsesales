import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { getAllClients } from "../../lib/db";
import { calculateDealHealthFromClient } from "../analytics/calculate-deal-health";

export const listClients = new FunctionTool({
  name: "list_clients",

  description:
    "Lists all available clients in the database with their unique IDs, company names, and sales stages. Call this tool first when you need to find a client's ID or find out which clients exist.",

  parameters: z.object({}),

  execute: async () => {
    try {
      const clients = await getAllClients();
      return {
        status: "success",
        clients: clients.map((c) => ({
          id: c.id,
          companyName: c.companyName,
          stage: c.stage,
          dealHealth: calculateDealHealthFromClient(c),
        })),
      };
    } catch (error) {
      console.error("LIST_CLIENTS_ERROR", error);
      return {
        status: "error",
        message: "Failed to list clients",
      };
    }
  },
});
