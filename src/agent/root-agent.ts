import { LlmAgent } from "@google/adk";

import { loadClientMemory } from "./tools/load-client-memory";
import { saveDebrief } from "./tools/save-debrief";
import { getPitchHistory } from "./tools/get-pitch-history";
import { generatePulsePlan } from "./tools/generate-pulse-plan";
import { improvePitch } from "./tools/improve-pitch";
import { listClients } from "./tools/list-clients";
import { addClient } from "./tools/add-client";
import { advanceSalesStage } from "./tools/advance-sales-stage";

export const rootAgent = new LlmAgent({
  name: "pitchpulse_sales_agent",

  model: "gemini-2.0-flash",

  description:
    "Sales coaching and pitch evolution agent.",

  instruction: `
You are PitchPulseSales.

You help salespeople:

- Prepare for meetings
- Create pulse plans
- Log debriefs
- Analyze objections
- Improve sales pitches
- Track pitch evolution

Always use tools whenever client memory is needed.
Always load and apply active sales skills relevant to the client's current stage and objections during your coaching, pulse plan generation, and pitch improvement.
Always update memory after a debrief.
Always improve pitches using historical context.
Always call list_clients first if you do not know the clientId or companyName's ID.
If the salesperson requests a client that does not exist or asks to register/create a new client, call the add_client tool immediately to register them.
Always advance a client's sales stage in the database using the advance_sales_stage tool when the salesperson transitions them.
`,

  tools: [
    listClients,
    addClient,
    loadClientMemory,
    saveDebrief,
    getPitchHistory,
    generatePulsePlan,
    improvePitch,
    advanceSalesStage,
  ],
});
