import { Suspense } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  MoreHorizontal,
  ArrowUpRight,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  Brain
} from "lucide-react"

// Updated Mock Data aligned with AI-native requirements
const MOCK_DATA = {
  isManager: true, // Toggle this to test
  user: { name: "Alex" },
  aiBrief: {
    pipelineHealth: { score: 82, status: "Healthy", trend: "+5%", action: "Maintain current velocity on enterprise deals." },
    activeRisks: { count: 3, label: "High Priority Risks", action: "Review Stark Industries competitor presence." },
    teamConfidence: { score: "78/100", trend: "+12%", action: "Coach Sarah on pricing objections to boost further." },
    topAction: { title: "Join Global Tech Demo", reason: "Critical health score (35/100) and low rep confidence." }
  },
  myDeals: [
    { 
      id: 1, 
      name: "Acme Corp Expansion", 
      value: "$120k", 
      health: 88, 
      healthStatus: "Healthy",
      confidenceTrend: "up",
      nextAction: "Send revised ROI calculator to economic buyer." 
    },
    { 
      id: 2, 
      name: "Stark Industries", 
      value: "$250k", 
      health: 45, 
      healthStatus: "At Risk",
      confidenceTrend: "down",
      nextAction: "Schedule technical review to address security concerns." 
    },
    { 
      id: 3, 
      name: "Global Tech Inc", 
      value: "$85k", 
      health: 72, 
      healthStatus: "Needs Attention",
      confidenceTrend: "flat",
      nextAction: "Follow up on proposal sent last week." 
    },
  ],
  myTasks: [
    { id: 1, title: "Prep for Stark Industries demo", priority: "critical", action: "Review latest competitor battlecard." },
    { id: 2, title: "Follow up with Acme Corp", priority: "high", action: "Draft email highlighting cost savings." },
    { id: 3, title: "Update CRM for Wayne Ent", priority: "medium", action: "Log notes from yesterday's discovery." },
  ],
  actionCenter: [
    { 
      id: 1, 
      priority: "critical", 
      action: "Join Stark Industries call", 
      reason: "Critical health score (45/100) - Competitor XYZ in evaluation",
      relatedDeal: "Stark Industries"
    },
    { 
      id: 2, 
      priority: "high", 
      action: "Coach Sarah J. on Pricing", 
      reason: "Low confidence score (4/10) on recent Global Tech call",
      relatedDeal: "Global Tech Inc"
    },
    { 
      id: 3, 
      priority: "medium", 
      action: "Train team on ROI comparisons", 
      reason: "High effectiveness (89%) for pricing objections recently",
    }
  ]
}

async function getDashboardData() {
  await new Promise(resolve => setTimeout(resolve, 800))
  return MOCK_DATA
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "critical") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800"><ShieldAlert className="w-3 h-3"/> Critical</span>
  if (priority === "high") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3"/> High</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800"><Zap className="w-3 h-3"/> Medium</span>
}

function HealthBadge({ score, status }: { score: number, status: string }) {
  let colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200"
  if (status === "At Risk" || score < 50) colorClass = "bg-rose-100 text-rose-800 border-rose-200"
  else if (status === "Needs Attention" || score < 80) colorClass = "bg-amber-100 text-amber-800 border-amber-200"

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${colorClass}`}>
      <Activity className="w-3 h-3 mr-1" />
      {score}/100 • {status}
    </div>
  )
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-500" />
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-rose-500" />
  return <MoreHorizontal className="w-4 h-4 text-zinc-400" />
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Good morning, {data.user.name}</h1>
            <p className="text-zinc-500 mt-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Here is your intelligent briefing for today.
            </p>
          </div>
        </div>

        {/* AI Executive Brief (Replaces Vanity Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pipeline Health */}
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-zinc-500">Pipeline Health</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold text-zinc-900">{data.aiBrief.pipelineHealth.score}</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center">{data.aiBrief.pipelineHealth.trend} <ArrowUpRight className="w-3 h-3"/></span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-600 flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{data.aiBrief.pipelineHealth.action}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Risks */}
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-zinc-500">Active Risks</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold text-zinc-900">{data.aiBrief.activeRisks.count}</span>
                <span className="text-sm font-medium text-rose-600 mb-1">Critical</span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-600 flex items-start gap-1.5 cursor-pointer hover:text-rose-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="font-medium">Action: {data.aiBrief.activeRisks.action}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Confidence */}
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-zinc-500">Team Confidence</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold text-zinc-900">{data.aiBrief.teamConfidence.score}</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center">{data.aiBrief.teamConfidence.trend} <ArrowUpRight className="w-3 h-3"/></span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-600 flex items-start gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{data.aiBrief.teamConfidence.action}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top Priority Action */}
          <Card className="border-none shadow-sm bg-zinc-900 text-white hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Top Priority</p>
                </div>
                <h3 className="text-lg font-semibold">{data.aiBrief.topAction.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{data.aiBrief.topAction.reason}</p>
              </div>
              <Button size="sm" className="w-full mt-4 bg-white text-zinc-900 hover:bg-zinc-100">Take Action</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Active Pipeline */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Active Pipeline</h2>
              </div>
              <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {data.myDeals.map((deal) => (
                    <div key={deal.id} className="p-5 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      
                      {/* Deal Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-zinc-900 text-base">{deal.name}</h3>
                          <HealthBadge score={deal.health} status={deal.healthStatus} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="font-medium text-zinc-700">{deal.value}</span>
                          <span className="flex items-center gap-1.5">
                            Confidence Trend: <TrendIcon trend={deal.confidenceTrend} />
                          </span>
                        </div>
                      </div>

                      {/* Next Recommended Action */}
                      <div className="sm:max-w-xs w-full bg-zinc-50 border border-zinc-100 rounded-lg p-3 group-hover:bg-white group-hover:border-zinc-200 transition-colors">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Recommended Action</p>
                        <p className="text-sm text-zinc-800">{deal.nextAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Manager Action Center */}
            {data.isManager && (
              <section className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-indigo-100 rounded-md">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Intelligence Action Center</h2>
                    <p className="text-sm text-zinc-500">AI-driven recommendations for your team.</p>
                  </div>
                </div>
                
                <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                  <div className="divide-y divide-zinc-100">
                    {data.actionCenter.map(ac => (
                      <div key={ac.id} className="p-5 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <PriorityBadge priority={ac.priority} />
                            {ac.relatedDeal && (
                              <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                                {ac.relatedDeal}
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-zinc-900 text-base mt-2">{ac.action}</h3>
                          <p className="text-sm text-zinc-500 mt-1">{ac.reason}</p>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 bg-white shadow-sm">
                          Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* My Prioritized Tasks */}
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-4">Prioritized Tasks</h2>
              <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {data.myTasks.map(task => (
                    <div key={task.id} className="p-4 flex gap-3 hover:bg-zinc-50 transition-colors group">
                      <div className="mt-1">
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500 cursor-pointer transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-zinc-900">{task.title}</p>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100/50 rounded p-2 mt-2">
                          <p className="text-xs font-semibold text-zinc-500 mb-0.5">Next Step:</p>
                          <p className="text-xs text-zinc-700">{task.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
                  <Button variant="ghost" className="w-full text-sm font-medium text-zinc-600 hover:text-zinc-900">Add Task</Button>
                </div>
              </Card>
            </section>
          </div>

        </div>
      </main>
    </div>
  )
}
