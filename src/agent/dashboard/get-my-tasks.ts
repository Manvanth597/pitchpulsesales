import { getAllClients } from "@/lib/db";
import { analyzeOpportunityRiskFromClient } from "@/agent/risk/analyze-opportunity-risk";
import { calculateDealHealthFromClient } from "@/agent/analytics/calculate-deal-health";
import { MyTask } from "@/types/dashboard";

export async function getMyTasks(userId: string): Promise<MyTask[]> {
    const clients = await getAllClients();
    const activeDeals = clients.filter(c => c.stage !== "closed_lost" && c.stage !== "closed_won");
    
    const tasks: MyTask[] = [];
    const now = Date.now();
    
    for (const client of activeDeals) {
        const risk = analyzeOpportunityRiskFromClient(client);
        const health = calculateDealHealthFromClient(client);
        
        let priority: MyTask["priority"] | null = null;
        let taskName = "";
        
        // Use recommended actions or fallbacks
        const recommendedAction = risk.recommendedActions.length > 0 ? risk.recommendedActions[0] : "Review deal strategy";

        if (risk.riskLevel === "high") {
            priority = "critical";
            taskName = recommendedAction;
        } else if (risk.riskLevel === "medium") {
            priority = "high";
            taskName = recommendedAction;
        } else if (health.score < 50) {
            priority = "high";
            taskName = "Re-engage stakeholder";
        } else {
            const timeSinceUpdate = now - new Date(client.updatedAt).getTime();
            const daysSinceUpdate = timeSinceUpdate / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate > 7) {
                priority = "medium";
                taskName = `Follow up with ${client.companyName}`;
            } else if (client.stage === "action") {
                priority = "medium";
                taskName = "Update proposal";
            }
        }
        
        if (priority) {
            // Set due date logic: Critical/High = Today, Medium = Tomorrow, Low = Next Week
            const offsetDays = priority === "critical" || priority === "high" ? 0 : 1;
            const dueDate = new Date(now + offsetDays * 86400000).toISOString();
            
            tasks.push({
                priority,
                task: taskName,
                relatedDeal: client.companyName,
                dueDate
            });
        }
    }
    
    // Sort tasks by priority
    const priorityWeight: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
    };
    
    tasks.sort((a, b) => {
        const pA = priorityWeight[a.priority] || 0;
        const pB = priorityWeight[b.priority] || 0;
        
        if (pA !== pB) {
            return pB - pA; // Descending (Critical first)
        }
        
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB; // Ascending date
    });
    
    return tasks.slice(0, 10);
}
