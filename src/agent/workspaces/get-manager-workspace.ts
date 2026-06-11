import { getTeamSummary } from "@/agent/dashboard/get-team-summary";
import { getForecast } from "@/agent/forecasting/get-forecast";
import { getActionCenter } from "@/agent/dashboard/get-action-center";
import { getRepCoachingSummary } from "@/agent/dashboard/get-rep-coaching-summary";
import { getLearningIntelligence } from "@/agent/dashboard/get-learning-intelligence";
import { ManagerWorkspace } from "./types";

/**
 * Single entry point for compiling the tactical Manager Workspace.
 * Orchestrates team performance metrics, pipeline forecasting, and automated coaching intelligence.
 */
export async function getManagerWorkspace(): Promise<ManagerWorkspace> {
    // Concurrently execute all underlying manager-level intelligence engines
    // By utilizing Promise.all, we guarantee maximum backend efficiency
    const [
        teamSummary,
        forecasting,
        actionCenter,
        repCoaching,
        learningIntelligence
    ] = await Promise.all([
        getTeamSummary(),
        getForecast(),
        getActionCenter(),
        getRepCoachingSummary(),
        getLearningIntelligence()
    ]);

    // Synthesize the strictly typed Manager Workspace payload
    return {
        teamSummary,
        forecasting,
        actionCenter,
        repCoaching,
        learningIntelligence
    };
}
