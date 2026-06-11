import { getRepCoaching } from "@/agent/coaching/get-rep-coaching";
import { analyzeRepPerformance } from "@/agent/coaching/analyze-rep-performance";
import { identifySkillGaps } from "@/agent/coaching/identify-skill-gaps";
import { 
    RepCoachingSummary, 
    TopPerformer, 
    CoachingCandidate, 
    AggregatedSkillGap 
} from "./types";
import { GoogleGenAI } from "@google/genai";
import { getCachedInsightText } from "@/lib/cache-insights";
import { getDatabase } from "@/lib/db";

// Mock Reps matching the team structure
const TEAM_REPS = [
    { userId: "rep-1", name: "Sarah Jenkins" },
    { userId: "rep-2", name: "Alex Mercer" },
    { userId: "rep-3", name: "Jordan Lee" },
    { userId: "rep-4", name: "Taylor Swift" },
    { userId: "rep-5", name: "Chris Evans" }
];

/**
 * Creates the dashboard aggregation layer for coaching intelligence.
 * Allows managers to immediately answer who needs coaching and what skills are missing.
 */
export async function getRepCoachingSummary(): Promise<RepCoachingSummary> {
    
    // 1. Fetch coaching reports via the mandated service for every rep
    const coachingPromises = TEAM_REPS.map(rep => getRepCoaching(rep.userId));
    const rawReports = await Promise.all(coachingPromises);
    
    // Fetch base performance and explicit skill gaps to satisfy advanced sorting metrics
    // without duplicating business logic.
    const performancePromises = TEAM_REPS.map(rep => analyzeRepPerformance(rep.userId));
    const rawPerformances = await Promise.all(performancePromises);
    
    const combinedData = TEAM_REPS.map((rep, i) => {
        const perf = rawPerformances[i];
        // Inject identified skill gaps to grab severities
        const gaps = identifySkillGaps(perf);
        perf.skillGaps = gaps;

        return {
            rep,
            report: rawReports[i],
            performance: perf,
            gaps
        };
    });

    // 2. Top Performers
    // Sort by: Performance Score > Win Rate > Average Deal Health
    const sortedPerformers = [...combinedData].sort((a, b) => {
        if (b.report.performanceScore !== a.report.performanceScore) {
            return b.report.performanceScore - a.report.performanceScore;
        }
        if (b.performance.winRate !== a.performance.winRate) {
            return b.performance.winRate - a.performance.winRate;
        }
        return b.performance.avgDealHealth - a.performance.avgDealHealth;
    });

    const topPerformers: TopPerformer[] = sortedPerformers.slice(0, 5).map(data => ({
        repId: data.rep.userId,
        name: data.rep.name,
        performanceScore: data.report.performanceScore,
        strengths: data.report.strengths
    }));

    // 3. Coaching Candidates
    // Sort by: Lowest Performance Score > Highest Severity Skill Gaps > Lowest Win Rate
    const sortedCandidates = [...combinedData].sort((a, b) => {
        if (a.report.performanceScore !== b.report.performanceScore) {
            return a.report.performanceScore - b.report.performanceScore;
        }
        
        const aHighGaps = a.gaps.filter(g => g.severity === "high").length;
        const bHighGaps = b.gaps.filter(g => g.severity === "high").length;
        if (bHighGaps !== aHighGaps) {
            return bHighGaps - aHighGaps;
        }
        
        return a.performance.winRate - b.performance.winRate;
    });

    const coachingCandidates: CoachingCandidate[] = sortedCandidates.slice(0, 5).map(data => ({
        repId: data.rep.userId,
        name: data.rep.name,
        performanceScore: data.report.performanceScore,
        weaknesses: data.report.weaknesses,
        recommendedSkills: data.report.recommendedSkills
    }));

    // 4. Critical Skill Gaps
    const gapMap = new Map<string, { frequency: number, highCount: number, mediumCount: number, affectedReps: Set<string> }>();
    
    for (const data of combinedData) {
        for (const gap of data.gaps) {
            const entry = gapMap.get(gap.skill) || { frequency: 0, highCount: 0, mediumCount: 0, affectedReps: new Set() };
            
            entry.frequency += 1;
            entry.affectedReps.add(data.rep.name);
            
            if (gap.severity === "high") entry.highCount += 1;
            else if (gap.severity === "medium") entry.mediumCount += 1;
            
            gapMap.set(gap.skill, entry);
        }
    }

    const criticalSkillGaps: AggregatedSkillGap[] = Array.from(gapMap.entries()).map(([skill, data]) => {
        // Calculate dynamic average severity
        let avgSeverity: "high" | "medium" | "low" = "low";
        if (data.highCount > 0) avgSeverity = "high";
        else if (data.mediumCount > 0) avgSeverity = "medium";

        return {
            skill,
            frequency: data.frequency,
            severity: avgSeverity,
            affectedReps: Array.from(data.affectedReps)
        };
    });

    // Sort: Highest impact first
    criticalSkillGaps.sort((a, b) => {
        const sevMap = { high: 3, medium: 2, low: 1 };
        if (sevMap[b.severity] !== sevMap[a.severity]) {
            return sevMap[b.severity] - sevMap[a.severity];
        }
        return b.frequency - a.frequency;
    });

    // 5. Coaching Reports
    // Top 5 highest priority reports (using the candidates sorting since they need it most)
    const coachingReports = sortedCandidates.slice(0, 5).map(data => data.report);

    const db = getDatabase();
    const { content: coachingSummaryText, usedCachedData } = await getCachedInsightText(
        db.coachingInsightVersion || 0,
        "coachingSummaryCache",
        async () => {
            const ai = new GoogleGenAI({
      vertexai: true,
      project: 'agent-project-496514',
      location: 'us-central1'
    });
            const gapStr = criticalSkillGaps.length > 0 ? criticalSkillGaps[0].skill : "none";
            const candidateStr = coachingCandidates.length > 0 ? coachingCandidates[0].name : "none";
            const prompt = `Write a short 1-sentence sales coaching summary. Top skill gap: ${gapStr}. Top coaching candidate: ${candidateStr}.`;
            const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return res.text || "No coaching interventions are currently required.";
        }
    );

    return {
        topPerformers,
        coachingCandidates,
        criticalSkillGaps: criticalSkillGaps.slice(0, 10),
        coachingReports,
        coachingSummaryText,
        usedCachedData
    };
}

