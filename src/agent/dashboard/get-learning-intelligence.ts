import { getPatternInsights } from "@/agent/learning/pattern-insights";
import { LearningIntelligence } from "@/types/dashboard";

export async function getLearningIntelligence(): Promise<LearningIntelligence> {
    const insights = getPatternInsights();
    
    return {
        topPatterns: insights.topPatterns,
        weakestPatterns: insights.weakestPatterns,
        topObjections: insights.topObjections,
        fastestGrowingPatterns: insights.fastestGrowingPatterns
    };
}
