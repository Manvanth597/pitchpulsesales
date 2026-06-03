import { getDatabase, SalesPattern } from "@/lib/db";

export interface ObjectionSummary {
  objectionType: string;
  uses: number;
  wins: number;
  losses: number;
  effectivenessScore: number;
  patternCount: number;
}

export interface PatternInsights {
  topPatterns: SalesPattern[];
  weakestPatterns: SalesPattern[];
  mostUsedPatterns: SalesPattern[];
  topObjections: ObjectionSummary[];
  fastestGrowingPatterns: SalesPattern[];
}

export function getTopPatterns(patterns: SalesPattern[], limit: number = 5): SalesPattern[] {
  return [...patterns]
    .sort((a, b) => {
      if (b.effectivenessScore !== a.effectivenessScore) {
        return b.effectivenessScore - a.effectivenessScore;
      }
      return b.uses - a.uses;
    })
    .slice(0, limit);
}

export function getWeakestPatterns(patterns: SalesPattern[], limit: number = 5): SalesPattern[] {
  return [...patterns]
    .sort((a, b) => {
      if (a.effectivenessScore !== b.effectivenessScore) {
        return a.effectivenessScore - b.effectivenessScore;
      }
      return b.uses - a.uses;
    })
    .slice(0, limit);
}

export function getMostUsedPatterns(patterns: SalesPattern[], limit: number = 5): SalesPattern[] {
  return [...patterns]
    .sort((a, b) => b.uses - a.uses)
    .slice(0, limit);
}

export function getTopObjections(patterns: SalesPattern[]): ObjectionSummary[] {
  const map = new Map<string, { uses: number; wins: number; losses: number; patternCount: number }>();

  for (const p of patterns) {
    const key = p.objectionType.toLowerCase().trim();
    const existing = map.get(key) || { uses: 0, wins: 0, losses: 0, patternCount: 0 };
    existing.uses += p.uses;
    existing.wins += p.wins;
    existing.losses += p.losses;
    existing.patternCount += 1;
    map.set(key, existing);
  }

  const summaries: ObjectionSummary[] = [];
  for (const [objectionType, stats] of map.entries()) {
    const total = stats.wins + stats.losses;
    const effectivenessScore = total > 0 ? Math.round((stats.wins / total) * 100) : 50;
    summaries.push({
      objectionType,
      uses: stats.uses,
      wins: stats.wins,
      losses: stats.losses,
      effectivenessScore,
      patternCount: stats.patternCount,
    });
  }

  return summaries.sort((a, b) => b.uses - a.uses);
}

export function getFastestGrowingPatterns(patterns: SalesPattern[], limit: number = 5): SalesPattern[] {
  return [...patterns]
    .sort((a, b) => {
      const timeA = new Date(a.lastUpdated).getTime();
      const timeB = new Date(b.lastUpdated).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.uses - a.uses;
    })
    .slice(0, limit);
}

export function getPatternInsights(): PatternInsights {
  const db = getDatabase();
  const patterns = db.salesPatterns || [];

  const topPatterns = getTopPatterns(patterns);
  const weakestPatterns = getWeakestPatterns(patterns);
  const mostUsedPatterns = getMostUsedPatterns(patterns);
  const topObjections = getTopObjections(patterns);
  const fastestGrowingPatterns = getFastestGrowingPatterns(patterns);

  return {
    topPatterns,
    weakestPatterns,
    mostUsedPatterns,
    topObjections,
    fastestGrowingPatterns,
  };
}

// Validation logging
console.log(
  "[Pattern Insights]",
  getPatternInsights()
);
