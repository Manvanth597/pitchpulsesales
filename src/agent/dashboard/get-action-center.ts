import { getAllClients, getDatabase } from "@/lib/db";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { getTeamSummary } from "./get-team-summary";
import { getExecutiveSummary } from "./get-executive-summary";
import { getLearningIntelligence } from "./get-learning-intelligence";
import { ActionCenterData, ManagerAction } from "./types";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";

/**
 * Generates prioritized actions for managers.
 * Orchestrates existing services to tell managers exactly where intervention is needed.
 */
export async function getActionCenter(): Promise<ActionCenterData> {
    const actions: ManagerAction[] = [];
    const now = Date.now();
    
    // 1. Fetch deal data to check deal-specific rules
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    // We use a Map to deduplicate deal-specific actions, keeping only the highest priority.
    const dealActionsMap = new Map<string, ManagerAction>();
    const priorityWeight: Record<string, number> = { critical: 3, high: 2, medium: 1 };

    function addDealAction(dealName: string, action: ManagerAction) {
        const existing = dealActionsMap.get(dealName);
        if (!existing || priorityWeight[action.priority] > priorityWeight[existing.priority]) {
            dealActionsMap.set(dealName, action);
        }
    }

    for (const client of activeDeals) {
        const risk = analyzeOpportunityRiskFromClient(client);
        const daysInactive = (now - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        
        // Rule 1: High Risk Opportunities
        if (risk.riskLevel === "high") {
            addDealAction(client.companyName, {
                priority: "critical",
                action: `Join ${client.companyName} call`,
                reason: "Opportunity risk score exceeds threshold",
                relatedDeal: client.companyName
            });
        } 
        // Rule 2: Inactive Opportunities
        else if (daysInactive > 21) {
            addDealAction(client.companyName, {
                priority: "critical",
                action: `Escalate engagement for ${client.companyName}`,
                reason: "Opportunity has been inactive for over 21 days",
                relatedDeal: client.companyName
            });
        }
    }
    
    // Append deduplicated deal actions to the main array
    actions.push(...Array.from(dealActionsMap.values()));

    // 2. Fetch other organizational metrics
    const [teamSummary, execSummary, learningInt] = await Promise.all([
        getTeamSummary(),
        getExecutiveSummary(),
        getLearningIntelligence()
    ]);

    // Rule 3: Rep Needs Attention (using Team Summary)
    // Checking if a rep was flagged by the team summary engine
    if (teamSummary.needsAttention && teamSummary.needsAttention.userId !== "none") {
        actions.push({
            priority: "high",
            action: `Coach ${teamSummary.needsAttention.name.split(" ")[0]} on qualification process`,
            reason: "Rep performance is significantly below team average"
        });
    }

    // Rule 4: Pipeline Health Decline (using Executive Summary)
    if (execSummary.healthTrend === "declining") {
        actions.push({
            priority: "high",
            action: "Review stalled opportunities",
            reason: "Overall pipeline health score is decreasing"
        });
    }

    // Rule 5: Winning Pattern Available (using Learning Intelligence)
    if (learningInt.topPatterns.length > 0 && learningInt.topPatterns[0].effectivenessScore > 80) {
        const bestPattern = learningInt.topPatterns[0];
        actions.push({
            priority: "medium",
            action: `Train team on ${bestPattern.pattern}`,
            reason: `Pattern effectiveness is exceptionally high (${bestPattern.effectivenessScore}%)`
        });
    }

    // Rule 6: Growing Objection Trend (using Learning Intelligence)
    if (learningInt.topObjections.length > 0 && learningInt.topObjections[0].percentage > 30) {
        const topObjection = learningInt.topObjections[0];
        actions.push({
            priority: "high",
            action: `Run ${topObjection.objectionType} objection workshop`,
            reason: "Objection frequency is increasing and heavily impacting deals"
        });
    }

    // 3. Sorting
    // Sort primarily by priority severity
    actions.sort((a, b) => {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    // 4. Action Limits
    // Maximum 10 actions so managers only see most important recommendations
    const limitedActions = actions.slice(0, 10);
    
    const db = getDatabase();
    // Use executiveInsightVersion as a proxy since Action Center has no specific version, 
    // or we can sum team+exec+learning. We will sum them to be accurate.
    const actionVersion = (db.teamInsightVersion || 0) + (db.executiveInsightVersion || 0) + (db.learningInsightVersion || 0);

    const criticalCount = limitedActions.filter(a => a.priority === "critical").length;

    const { content: actionSummaryText, usedCachedData } = await getCachedInsightText(
        actionVersion,
        "actionSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const prompt = `Write a short 1-sentence action summary for a sales manager. There are ${criticalCount} critical actions. Total actions: ${limitedActions.length}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "Action summary generated.";
        }
    );

    return {
        actions: limitedActions,
        actionSummaryText,
        usedCachedData
    };
}

