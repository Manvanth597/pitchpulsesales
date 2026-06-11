import fs from 'fs'
import path from 'path'
import { DealOutcome } from '@/agent/learning/types'

export type SalesStage = 'awareness' | 'interest' | 'desire' | 'action' | 'closed_won' | 'closed_lost'

export type ConfidenceScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface PulsePlan {
  id: string
  companyName: string
  customerContext: string
  predictedObjection: string
  plannedResponse: string
  callObjective: string
  confidenceLevel: ConfidenceScore
  recommendedOpener: string
  discoveryQuestions: string[]
  tacticalSuggestions: string[]
  createdAt: string
}

export interface Debrief {
  id: string
  summary: string
  objectionFaced: string
  yourResponse: string
  outcome: string
  selfScore: ConfidenceScore
  analysis: {
    sentiment: string
    missedOpportunities: string[]
    detectedObjections: string[]
    recommendedImprovements: string[]
    confidenceAnalysis: string
  } | null
  createdAt: string
}

export interface GeneratedPitch {
  coldCallOpener: string
  discoveryQuestions: string[]
  coreNarrative: string
  commonObjections: string[]
  valuePositioning: string[]
}

export interface EvolutionHistory {
  id: string
  version: number
  timestamp: string
  previousNarrative: GeneratedPitch
  improvedNarrative: GeneratedPitch
  triggerEvent: string
  appliedChanges: string[]
  aiSummary?: {
    whyChanged: string
    whatImproved: string
    futureImpact: string
  }
}

export interface ClientMemory {
  id: string
  companyName: string
  stage: SalesStage
  pulsePlans: PulsePlan[]
  debriefs: Debrief[]
  evolvingPitch: GeneratedPitch
  evolutionHistory: EvolutionHistory[]
  customerContext: string
  objectionHistory: string[]
  confidenceTrend: ConfidenceScore[]
  updatedAt: string
}

export interface SalesPattern {
  id: string;

  objectionType: string;

  pattern: string;

  effectivenessScore: number;

  wins: number;

  losses: number;

  uses: number;

  examples: string[];

  lastUpdated: string;
}

export interface CachedInsight {
  content: string;
  generatedAt: string;
  sourceVersion: number;
}

export interface DbSchema {
  clients: ClientMemory[]
  salesPatterns: SalesPattern[]
  dealOutcomes?: DealOutcome[]

  teamInsightVersion?: number;
  executiveInsightVersion?: number;
  learningInsightVersion?: number;
  coachingInsightVersion?: number;
  forecastInsightVersion?: number;

  teamSummaryCache?: CachedInsight;
  executiveSummaryCache?: CachedInsight;
  learningSummaryCache?: CachedInsight;
  actionSummaryCache?: CachedInsight;
  coachingSummaryCache?: CachedInsight;
  forecastSummaryCache?: CachedInsight;
}

const dbPath = path.join(process.cwd(), 'data', 'db.json')

function ensureDb() {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ clients: [], salesPatterns: [] }, null, 2))
  } else {
    try {
      const data = fs.readFileSync(dbPath, 'utf8')
      const parsed = JSON.parse(data)
      let modified = false
      if (!parsed.clients) {
        parsed.clients = []
        modified = true
      }
      if (!parsed.salesPatterns) {
        parsed.salesPatterns = []
        modified = true
      } else if (Array.isArray(parsed.salesPatterns)) {
        for (const pattern of parsed.salesPatterns) {
          if (pattern.uses === undefined) {
            pattern.uses = (pattern.wins || 0) + (pattern.losses || 0)
            modified = true
          }
        }
      }
      if (modified) {
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2))
      }
    } catch {
      // Ignore or log error
    }
  }
}

export async function getAllClients(): Promise<ClientMemory[]> {
  ensureDb()
  const data = fs.readFileSync(dbPath, 'utf8')
  const clients: ClientMemory[] = JSON.parse(data).clients || []
  
  // Hydrate missing arrays for backwards compatibility with old records
  return clients.map(client => ({
    ...client,
    pulsePlans: client.pulsePlans || [],
    debriefs: client.debriefs || [],
    evolutionHistory: client.evolutionHistory || [],
    objectionHistory: client.objectionHistory || [],
    confidenceTrend: client.confidenceTrend || []
  }))
}

export async function getClient(id: string): Promise<ClientMemory | null> {
  const clients = await getAllClients()
  return clients.find(c => c.id === id) || null
}

export async function saveClient(client: ClientMemory): Promise<void> {
  ensureDb()
  const data = fs.readFileSync(dbPath, 'utf8')
  const db: DbSchema = JSON.parse(data)
  if (!db.clients) {
    db.clients = []
  }
  const index = db.clients.findIndex(c => c.id === client.id)
  if (index >= 0) {
    db.clients[index] = client
  } else {
    db.clients.push(client)
  }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export async function getAllSalesPatterns(): Promise<SalesPattern[]> {
  ensureDb()
  const data = fs.readFileSync(dbPath, 'utf8')
  return JSON.parse(data).salesPatterns || []
}

export async function getSalesPattern(id: string): Promise<SalesPattern | null> {
  const patterns = await getAllSalesPatterns()
  return patterns.find(p => p.id === id) || null
}

export async function saveSalesPattern(pattern: SalesPattern): Promise<void> {
  ensureDb()
  const data = fs.readFileSync(dbPath, 'utf8')
  const db: DbSchema = JSON.parse(data)
  if (!db.salesPatterns) {
    db.salesPatterns = []
  }
  const index = db.salesPatterns.findIndex(p => p.id === pattern.id)
  if (index >= 0) {
    db.salesPatterns[index] = pattern
  } else {
    db.salesPatterns.push(pattern)
  }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export function getDatabase(): DbSchema {
  ensureDb()
  const data = fs.readFileSync(dbPath, 'utf8')
  return JSON.parse(data)
}

export function saveDatabase(db: DbSchema): void {
  ensureDb()
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export function invalidateDebriefCaches() {
  const db = getDatabase();
  db.learningInsightVersion = (db.learningInsightVersion || 0) + 1;
  db.coachingInsightVersion = (db.coachingInsightVersion || 0) + 1;
  db.teamInsightVersion = (db.teamInsightVersion || 0) + 1;
  saveDatabase(db);
}

export function invalidateEvolutionCaches() {
  const db = getDatabase();
  db.learningInsightVersion = (db.learningInsightVersion || 0) + 1;
  db.coachingInsightVersion = (db.coachingInsightVersion || 0) + 1;
  db.executiveInsightVersion = (db.executiveInsightVersion || 0) + 1;
  saveDatabase(db);
}

export function invalidateSalesStageCaches() {
  const db = getDatabase();
  db.forecastInsightVersion = (db.forecastInsightVersion || 0) + 1;
  db.executiveInsightVersion = (db.executiveInsightVersion || 0) + 1;
  saveDatabase(db);
}

