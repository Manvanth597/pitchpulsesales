import { SalesPattern } from "@/lib/db";
import { ObjectionSummary } from "@/agent/learning/pattern-insights";

export interface ExecutiveSummary {
    totalDeals: number;
    healthyDeals: number;
    watchDeals: number;
    atRiskDeals: number;
    pipelineHealthScore: number;
    expectedRevenue: number;
    avgConfidence: number;
    healthTrend: "improving" | "stable" | "declining";
}

export interface MyDeal {
    id: string;
    company: string;
    stage: string;
    value: number;
    confidence: number;
    healthScore: number;
    riskLevel: string;
    lastActivity: string;
}

export interface MyTask {
    priority: "critical" | "high" | "medium" | "low";
    task: string;
    relatedDeal: string;
    dueDate: string;
}

export interface MyRisk {
    company: string;
    riskScore: number;
    riskLevel: string;
    riskFactors: string[];
    recommendedActions: string[];
}

export interface TeamSummary {
    activeDeals: number;
    healthyDeals: number;
    watchDeals: number;
    atRiskDeals: number;
    avgPipelineHealth: number;
    avgConfidence: number;
    topPerformer: string;
    needsAttention: string;
}

export interface LearningIntelligence {
    topPatterns: SalesPattern[];
    weakestPatterns: SalesPattern[];
    topObjections: ObjectionSummary[];
    fastestGrowingPatterns: SalesPattern[];
}

export interface ManagerAction {
    priority: "critical" | "high" | "medium";
    action: string;
    reason: string;
    relatedDeal?: string;
}

export interface DashboardData {
    role: "executive" | "manager";
    executiveSummary?: ExecutiveSummary;
    myDeals?: MyDeal[];
    myTasks?: MyTask[];
    myRisks?: MyRisk[];
    teamSummary?: TeamSummary;
    learningIntelligence?: LearningIntelligence;
    actionCenter?: {
        items: ManagerAction[];
    };
}
