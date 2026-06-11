"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesWorkspace } from "@/agent/workspaces/types";
import { 
  Briefcase, 
  ListTodo, 
  ShieldAlert, 
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Target,
  Swords,
  Shield,
  Zap,
  Activity
} from "lucide-react";

export default function SalesWorkspacePage() {
  const [data, setData] = useState<SalesWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspaces/sales");
        if (!res.ok) {
          throw new Error("Failed to load workspace data");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900">Compiling Intelligence...</h2>
        <p className="text-zinc-500 mt-2 text-center max-w-sm">
          Analyzing active pipelines and generating strategic win pathways for your top deals.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900">Workspace Unavailable</h2>
        <p className="text-zinc-500 mt-2 text-center max-w-sm">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Executive Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Sales Command Center</h1>
            <p className="text-zinc-500 mt-1">Your tactical execution engine for the quarter.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Expected Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${data.executiveSummary.expectedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pipeline Health</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-indigo-600">{data.executiveSummary.pipelineHealthScore}</p>
                {data.executiveSummary.healthTrend === "improving" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Strategy & Execution */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Deal Strategy - Visually Emphasized */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">How do I win my opportunities?</h2>
              </div>
              
              {!data.dealStrategy || data.dealStrategy.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-zinc-500">No priority deals currently require strategic intervention.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {data.dealStrategy.map((strategy, idx) => {
                    // Match the strategy back to the deal name for UX
                    const deal = data.myDeals.find(d => d.id === strategy.dealId);
                    return (
                      <Card key={idx} className="border-indigo-100 shadow-md overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-indigo-950 flex items-center gap-2">
                                {deal?.company || strategy.dealId}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                  Top Priority
                                </span>
                              </CardTitle>
                              <CardDescription>Probability of Close: {strategy.probabilityOfSuccess}%</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                              Execute Plan <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          {/* Recommended Actions */}
                          {strategy.nextActions.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2 flex items-center gap-1">
                                <Target className="w-3 h-3" /> Next Best Actions
                              </h4>
                              <ul className="space-y-2">
                                {strategy.nextActions.map((action, aIdx) => (
                                  <li key={aIdx} className="flex items-start gap-2 text-sm text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-100">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {strategy.strengths.length > 0 && (
                              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2 flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Key Strengths
                                </h4>
                                <ul className="text-sm text-emerald-900 space-y-1">
                                  {strategy.strengths.slice(0,3).map((s, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-emerald-500">•</span> {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {strategy.blockers.length > 0 && (
                              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-rose-700 mb-2 flex items-center gap-1">
                                  <Swords className="w-3 h-3" /> Critical Blockers
                                </h4>
                                <ul className="text-sm text-rose-900 space-y-1">
                                  {strategy.blockers.slice(0,3).map((b, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-rose-500">•</span> {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Active Deals */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Active Opportunities</h2>
              </div>
              
              {data.myDeals.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-zinc-500">Your pipeline is currently empty.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.myDeals.map((deal, idx) => (
                    <Card key={idx} className="shadow-sm hover:shadow transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-zinc-900 truncate pr-2">{deal.company}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            deal.confidence >= 70 ? 'bg-emerald-100 text-emerald-700' : 
                            deal.confidence >= 40 ? 'bg-amber-100 text-amber-700' : 
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {deal.confidence}% Conf
                          </span>
                        </div>
                        <p className="text-xl font-semibold text-zinc-700 mb-3">${deal.value.toLocaleString()}</p>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span className="capitalize">{deal.stage.replace('_', ' ')}</span>
                          <span className="flex items-center gap-1">
                            Health: {deal.healthScore}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Tactical Execution */}
          <div className="space-y-8">
            
            {/* My Tasks */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ListTodo className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-semibold">What should I do today?</h2>
              </div>
              
              {data.myTasks.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <p className="text-zinc-500 text-sm">Inbox Zero. Great job!</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.myTasks.map((task, idx) => (
                    <Card key={idx} className="shadow-sm">
                      <CardContent className="p-4 flex gap-3">
                        <div className="mt-0.5">
                          {task.priority === "critical" ? (
                            <Zap className="w-4 h-4 text-rose-500" />
                          ) : task.priority === "high" ? (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 leading-tight">{task.task}</p>
                          {task.relatedDeal && (
                            <p className="text-xs text-indigo-600 mt-1 font-medium">{task.relatedDeal}</p>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* My Risks */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl font-semibold">Which deals need attention?</h2>
              </div>
              
              {data.myRisks.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <p className="text-zinc-500 text-sm">No active risks detected in pipeline.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {data.myRisks.map((risk, idx) => (
                    <Card key={idx} className="border-rose-100 shadow-sm">
                      <div className="h-1 w-full bg-rose-500 rounded-t" />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-zinc-900">{risk.company}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            risk.riskLevel === 'high' ? 'bg-rose-100 text-rose-700' :
                            risk.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {risk.riskLevel} Risk
                          </span>
                        </div>
                        <ul className="text-xs text-zinc-600 space-y-1 mb-3 list-disc list-inside">
                          {risk.riskFactors.slice(0, 2).map((factor, i) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1">
                          {risk.recommendedActions.slice(0, 2).map((action, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-medium border border-zinc-200">
                              {action}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
