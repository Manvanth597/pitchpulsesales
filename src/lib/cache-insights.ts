import { getDatabase, saveDatabase, DbSchema } from "./db";

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || String(error);
  return msg.includes("429") || msg.includes("Quota") || msg.includes("exhausted") || msg.includes("Resource");
}

export async function getCachedInsightText(
  currentVersion: number,
  cacheKey: 'teamSummaryCache' | 'executiveSummaryCache' | 'learningSummaryCache' | 'actionSummaryCache' | 'coachingSummaryCache' | 'forecastSummaryCache',
  generateFn: () => Promise<string>
): Promise<{ content: string; usedCachedData?: boolean }> {
  
  const db = getDatabase();
  const cached = db[cacheKey];

  if (cached && cached.sourceVersion === currentVersion) {
    return { content: cached.content };
  }

  try {
    const content = await generateFn();
    
    // Save to cache
    const updatedDb = getDatabase();
    updatedDb[cacheKey] = {
      content,
      generatedAt: new Date().toISOString(),
      sourceVersion: currentVersion
    };
    saveDatabase(updatedDb);

    return { content };
  } catch (error) {
    if (isQuotaError(error)) {
      if (cached) {
        return { content: cached.content, usedCachedData: true };
      }
      return { content: "Summary unavailable due to high system load. Please try again later.", usedCachedData: true };
    }
    throw error;
  }
}
