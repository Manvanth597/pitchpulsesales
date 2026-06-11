import { analyzeRepPerformance } from "./analyze-rep-performance";
import { identifySkillGaps } from "./identify-skill-gaps";
import { generateCoachingReport } from "./generate-coaching-report";
import { CoachingReport } from "./types";

/**
 * Provides a single entry point for comprehensive rep coaching insights.
 * Orchestrates the flow: Performance Analysis -> Skill Gap Identification -> Report Generation.
 * 
 * @param repId The unique identifier of the salesperson
 * @returns A fully populated CoachingReport containing strengths, weaknesses, and actionable plans
 */
export async function getRepCoaching(repId: string): Promise<CoachingReport> {
    // 1. Analyze historical performance metrics and outcomes
    const performanceAnalysis = await analyzeRepPerformance(repId);
    
    // 2. Map identified weaknesses to specific sales skill gaps
    // This securely uses deterministic NLP mappings rather than LLMs
    const skillGaps = identifySkillGaps(performanceAnalysis);
    
    // Optional: Attach skill gaps to the analysis payload if downstream systems expect it
    performanceAnalysis.skillGaps = skillGaps;
    
    // 3. Generate a prioritized and actionable coaching report
    const coachingReport = generateCoachingReport(performanceAnalysis, skillGaps);
    
    return coachingReport;
}
