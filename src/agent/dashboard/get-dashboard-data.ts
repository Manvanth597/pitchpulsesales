/** 
 * @deprecated LEGACY UNIFIED DASHBOARD ORCHESTRATOR
 * This orchestrator is being replaced by the Workspace Architecture (getSalesWorkspace, getManagerWorkspace, getExecutiveWorkspace).
 * Scheduled for future removal. Retained temporarily for safe rollback.
 */
import { DashboardData, UserRole } from "./types";
import { getExecutiveSummary } from "./get-executive-summary";
import { getMyDeals } from "./get-my-deals";
import { getMyTasks } from "./get-my-tasks";
import { getMyRisks } from "./get-my-risks";
import { getTeamSummary } from "./get-team-summary";
import { getLearningIntelligence } from "./get-learning-intelligence";
import { getActionCenter } from "./get-action-center";
import { getRepCoachingSummary } from "./get-rep-coaching-summary";

/**
 * Orchestrates dashboard data fetching.
 * Aggregates responses based on user role.
 */
export async function getDashboardData(
  userId: string,
  role: UserRole
): Promise<DashboardData> {
  const [
    executiveSummary,
    myDeals,
    myTasks,
    myRisks
  ] = await Promise.all([
    getExecutiveSummary(),
    getMyDeals(userId),
    getMyTasks(userId),
    getMyRisks(userId)
  ]);

  if (role === "sales_rep") {
    return {
      role,
      executiveSummary,
      myDeals,
      myTasks,
      myRisks
    };
  }

  // Manager only
  const [
    teamSummary,
    learningIntelligence,
    actionCenter,
    coachingSummary
  ] = await Promise.all([
    getTeamSummary(),
    getLearningIntelligence(),
    getActionCenter(),
    getRepCoachingSummary()
  ]);

  return {
    role,
    executiveSummary,
    myDeals,
    myTasks,
    myRisks,
    teamSummary,
    learningIntelligence,
    actionCenter,
    coachingSummary
  };
}
