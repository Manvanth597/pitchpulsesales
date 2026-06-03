import { getExecutiveSummary } from "./get-executive-summary";
import { getMyDeals } from "./get-my-deals";
import { getMyTasks } from "./get-my-tasks";
import { getMyRisks } from "./get-my-risks";
import { getTeamSummary } from "./get-team-summary";
import { getLearningIntelligence } from "./get-learning-intelligence";
import { getActionCenter } from "./get-action-center";
import { DashboardData } from "@/types/dashboard";

export async function getDashboardData(role: "executive" | "manager", userId: string): Promise<DashboardData> {
    const executiveSummary = await getExecutiveSummary(userId);
    const myDeals = await getMyDeals(userId);
    const myTasks = await getMyTasks(userId);
    const myRisks = await getMyRisks(userId);

    if (role === "executive") {
        return {
            role,
            executiveSummary,
            myDeals,
            myTasks,
            myRisks
        };
    } else {
        return {
            role,
            executiveSummary,
            myDeals,
            myTasks,
            myRisks,
            teamSummary: await getTeamSummary(),
            actionCenter: await getActionCenter(),
            learningIntelligence: await getLearningIntelligence()
        };
    }
}
