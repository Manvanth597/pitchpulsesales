import { getExecutiveSummary } from "@/agent/dashboard/get-executive-summary";
import { getMyTasks } from "@/agent/dashboard/get-my-tasks";
import { getMyRisks } from "@/agent/dashboard/get-my-risks";
import { getMyDeals } from "@/agent/dashboard/get-my-deals";
import { getDealStrategy } from "@/agent/strategy/get-deal-strategy";
import { SalesWorkspace } from "./types";

/**
 * Single entry point for compiling the tactical Sales Representative Workspace.
 * Orchestrates personal tasks, risk profiles, active deals, and generates deep strategic
 * intelligence strictly for the rep's highest-value deals.
 */
export async function getSalesWorkspace(userId: string): Promise<SalesWorkspace> {
    
    // 1. Concurrently fetch the rep's foundational dashboard payloads
    const [
        executiveSummary,
        myTasks,
        myRisks,
        myDeals
    ] = await Promise.all([
        getExecutiveSummary(), 
        getMyTasks(userId),
        getMyRisks(userId),
        getMyDeals(userId)
    ]);

    // 2. Identify the user's highest priority active deals by pipeline value
    const sortedDeals = [...myDeals].sort((a, b) => b.value - a.value);
    const topDeals = sortedDeals.slice(0, 5);

    // 3. Autonomously generate Deal Strategy frameworks exclusively for the top 5 deals
    const dealStrategy = await Promise.all(
        topDeals.map(deal => getDealStrategy(deal.id))
    );

    // 4. Synthesize the final, strictly typed Sales Workspace payload
    return {
        executiveSummary,
        myTasks,
        myRisks,
        myDeals,
        dealStrategy
    };
}
