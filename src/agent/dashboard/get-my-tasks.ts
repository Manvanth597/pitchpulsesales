import { getAllClients } from "@/lib/db";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { MyTask } from "./types";

/**
 * Dynamically generates tasks based on deal intelligence signals.
 * Connects directly to the Opportunity Risk Engine and activity history.
 */
export async function getMyTasks(userId: string): Promise<MyTask[]> {
    const clients = await getAllClients();
    
    // Ignore closed won/lost deals
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const tasks: (MyTask & { _lastActivityMs: number })[] = [];
    const now = Date.now();
    
    for (const client of activeDeals) {
        const risk = analyzeOpportunityRiskFromClient(client);
        
        const latestConfidence = client.confidenceTrend.length > 0 
            ? client.confidenceTrend[client.confidenceTrend.length - 1] 
            : 5;
            
        // Confidence is stored as 1-10. Multiply by 10 to check against the < 50 threshold rule.
        const confidencePercent = latestConfidence * 10;
        
        const timeSinceActivity = now - new Date(client.updatedAt).getTime();
        const daysInactive = timeSinceActivity / (1000 * 60 * 60 * 24);
        
        let priority: MyTask["priority"] | null = null;
        let taskName = "";
        
        // We evaluate rules in descending order of priority severity.
        // This implicitly deduplicates tasks for the same deal by keeping the highest priority one.
        
        // --- Critical Rules ---
        if (risk.riskLevel === "high") {
            priority = "critical";
            taskName = `Re-engage ${client.companyName} opportunity`;
        } else if (daysInactive > 14) {
            priority = "critical";
            taskName = "Contact client immediately";
        } else if ((client.stage as string) === "negotiation" && daysInactive > 5) {
            priority = "critical";
            taskName = "Schedule negotiation meeting";
        } 
        // --- High Rules ---
        else if (risk.riskLevel === "medium") {
            priority = "high";
            taskName = "Review stakeholder engagement";
        } else if (confidencePercent < 50) {
            priority = "high";
            taskName = "Schedule qualification follow-up";
        } else if ((client.stage as string) === "proposal" && daysInactive > 7) {
            priority = "high";
            taskName = "Follow up on proposal review";
        }
        // No explicitly defined medium rules in the current requirements, but leaving room for expansion
        
        if (priority) {
            // Due date generation logic (critical = today, high = tomorrow, medium = in 2 days)
            const offsetDays = priority === "critical" ? 0 : (priority === "high" ? 1 : 2);
            const dueDate = new Date(now + offsetDays * 86400000).toISOString();
            
            tasks.push({
                priority,
                task: taskName,
                relatedDeal: client.companyName,
                clientId: client.id,
                dueDate,
                _lastActivityMs: new Date(client.updatedAt).getTime()
            });
        }
    }
    
    // Sort tasks
    const priorityWeight: Record<string, number> = {
        critical: 3,
        high: 2,
        medium: 1
    };
    
    tasks.sort((a, b) => {
        const pA = priorityWeight[a.priority] || 0;
        const pB = priorityWeight[b.priority] || 0;
        
        // 1. Critical first, then high, then medium
        if (pA !== pB) {
            return pB - pA; // Descending
        }
        
        // 2. Within each group: oldest activity first
        return a._lastActivityMs - b._lastActivityMs; // Ascending
    });
    
    // Clean up temporary sorting property
    return tasks.map(t => {
        const { _lastActivityMs, ...cleanTask } = t;
        return cleanTask;
    });
}
