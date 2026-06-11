/** 
 * @deprecated LEGACY UNIFIED DASHBOARD
 * This UI is being replaced by the Workspace Architecture (/rep, /manager, /executive).
 * Scheduled for future removal. Retained temporarily for safe rollback.
 */
import { Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDashboardData } from "@/agent/dashboard/get-dashboard-data"
import { DashboardData } from "@/agent/dashboard/types"
import { 
  ShieldAlert, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Minus,
  Activity, DollarSign, Target, ArrowRight, Clock, Building, Briefcase, Zap, AlertTriangle
} from "lucide-react"

export const dynamic = 'force-dynamic'

// Visual Priority Indicators
function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "critical") return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500 text-white shadow-sm"><ShieldAlert className="w-3 h-3 mr-1"/> CRITICAL</span>
  if (priority === "high") return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white shadow-sm"><AlertCircle className="w-3 h-3 mr-1"/> HIGH</span>
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500 text-white shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1"/> MEDIUM</span>
}

function RiskBadge({ level }: { level: string }) {
  if (level === "high") return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">High Risk</span>
  if (level === "medium") return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Medium Risk</span>
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Low Risk</span>
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving") return <span className="flex items-center text-emerald-600 text-sm font-medium"><TrendingUp className="w-4 h-4 mr-1" /> Improving</span>
  if (trend === "declining") return <span className="flex items-center text-rose-600 text-sm font-medium"><TrendingDown className="w-4 h-4 mr-1" /> Declining</span>
  return <span className="flex items-center text-zinc-500 text-sm font-medium"><Minus className="w-4 h-4 mr-1" /> Stable</span>
}

async function DashboardContent() {
  // Using direct internal service call since fetching absolute URL in server component is fragile on Vercel
  const data: DashboardData = await getDashboardData("user-1", "sales_rep")
  const { executiveSummary, myTasks, myRisks, myDeals } = data

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Dashboard Empty</h2>
        <p className="text-zinc-500 mt-2">No deals or intelligence available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      
      {/* 1. Executive Summary */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-zinc-200">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">Pipeline Health</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900 flex items-baseline gap-2">
                  {executiveSummary.pipelineHealthScore}
                  <span className="text-sm font-normal text-zinc-400">/ 100</span>
                </div>
                <div className="mt-2"><TrendIcon trend={executiveSummary.healthTrend} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">Expected Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">
                  ${executiveSummary.expectedRevenue.toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-500">
                  From {executiveSummary.totalDeals} active engagements
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">Active Deals</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900">{executiveSummary.healthyDeals}</div>
                    <div className="text-xs text-emerald-600 font-medium">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900">{executiveSummary.watchDeals}</div>
                    <div className="text-xs text-amber-600 font-medium">Watch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900">{executiveSummary.atRiskDeals}</div>
                    <div className="text-xs text-rose-600 font-medium">At Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">Avg Confidence</span>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900 flex items-baseline gap-2">
                  {executiveSummary.avgConfidence}
                  <span className="text-sm font-normal text-zinc-400">/ 10</span>
                </div>
                <div className="mt-2 text-sm text-zinc-500">Overall seller sentiment</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. My Tasks (Most Prominent) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Action Center: What to do today
          </h2>
        </div>
        <Card className="shadow-md border-zinc-200 overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">You are all caught up!</div>
            ) : myTasks.map((task, i) => (
              <div key={i} className="p-5 bg-white hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4" style={{
                borderLeftColor: task.priority === 'critical' ? '#f43f5e' : task.priority === 'high' ? '#f59e0b' : '#3b82f6'
              }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <PriorityBadge priority={task.priority} />
                    {task.relatedDeal && (
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                        {task.relatedDeal}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">{task.task}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {task.clientId ? (
                    <Link href={`/templates/${task.clientId}`}>
                      <Button variant="default" className="w-full sm:w-auto shadow-sm font-medium">Execute Action</Button>
                    </Link>
                  ) : (
                    <Link href={`/templates`}>
                      <Button variant="default" className="w-full sm:w-auto shadow-sm font-medium">Execute Action</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3. My Risks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Opportunities in Danger
            </h2>
          </div>
          <div className="space-y-4">
            {myRisks.length === 0 ? (
              <Card className="p-8 text-center text-zinc-500 bg-white border-dashed">No critical risks detected.</Card>
            ) : myRisks.map((risk, i) => (
              <Card key={i} className="shadow-sm border-zinc-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 w-full bg-rose-500" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-zinc-900">{risk.company}</h3>
                    <RiskBadge level={risk.riskLevel} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Risk Factors</p>
                      <ul className="text-sm text-zinc-700 space-y-1 list-disc list-inside">
                        {risk.riskFactors.slice(0,2).map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Recommended Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {risk.recommendedActions.slice(0,2).map((action, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-medium">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. My Deals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              Active Deals Priority
            </h2>
          </div>
          <Card className="shadow-sm border-zinc-200 overflow-hidden">
            <div className="divide-y divide-zinc-100">
              {myDeals.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No active deals found.</div>
              ) : myDeals.map((deal, i) => (
                <div key={i} className="p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{deal.company}</h3>
                      <p className="text-xs text-zinc-500 font-medium capitalize mt-0.5">{deal.stage.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">${deal.value.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Last Activity: {new Date(deal.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100">
                    <RiskBadge level={deal.riskLevel} />
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Health: {deal.healthScore}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Confidence: {deal.confidence}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col">
      <Navbar />
      
      {/* Dashboard Header */}
      <header className="bg-white border-b border-zinc-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sales Workspace</h1>
          <p className="text-sm text-zinc-500 mt-1">Intelligent aggregation of your pipeline, risks, and next steps.</p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
