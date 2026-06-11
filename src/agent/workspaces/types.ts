import { 
  ExecutiveSummary, 
  MyTask, 
  MyRisk, 
  MyDeal, 
  TeamSummary, 
  ActionCenterData, 
  LearningIntelligence, 
  RepCoachingSummary 
} from "../dashboard/types";

import { DealStrategyReport } from "../strategy/types";
import { ForecastReport } from "../forecasting/types";

import { 
  RevenueIntelligence, 
  RevenueRisk, 
  GrowthOpportunity, 
  PipelineTrend 
} from "../revenue/types";

/**
 * Defines the contract for the Sales Representative Workspace.
 * Focuses strictly on tactical execution and individual pipeline velocity.
 */
export interface SalesWorkspace {
  executiveSummary: ExecutiveSummary;
  myTasks: MyTask[];
  myRisks: MyRisk[];
  myDeals: MyDeal[];
  dealStrategy?: DealStrategyReport[];
}

/**
 * Defines the contract for the Sales Manager Workspace.
 * Focuses strictly on team orchestration, coaching, and immediate forecasting.
 */
export interface ManagerWorkspace {
  teamSummary: TeamSummary;
  forecasting: ForecastReport;
  actionCenter: ActionCenterData;
  repCoaching: RepCoachingSummary;
  learningIntelligence: LearningIntelligence;
}

/**
 * Defines the contract for the Executive/VP Workspace.
 * Focuses strictly on macro revenue trends, systemic pipeline risk, and strategic growth.
 */
export interface ExecutiveWorkspace {
  revenueIntelligence: RevenueIntelligence;
  forecasting: ForecastReport;
  revenueRisks: RevenueRisk[];
  growthOpportunities: GrowthOpportunity[];
  pipelineTrends: PipelineTrend[];
}
