"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManagerWorkspace } from "@/agent/workspaces/types";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  LineChart,
  Target,
  BrainCircuit,
  GraduationCap,
  AlertCircle,
  Zap,
  Swords,
  CheckCircle2,
  BookOpen
} from "lucide-react";

export default function ManagerWorkspacePage() {
  const [data, setData] = useState<ManagerWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspaces/manager");
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
        <h2 className="text-xl font-semibold text-zinc-900">Compiling Management Intelligence...</h2>
        <p className="text-zinc-500 mt-2 text-center max-w-sm">
          Aggregating team performance, forecasting models, and coaching insights.
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
        
        {/* Header & Team Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Manager Command Center</h1>
            <p className="text-zinc-500 mt-1">Team velocity, forecasting, and automated coaching.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pipeline Health</p>
              <p className="text-2xl font-bold text-indigo-600">{data.teamSummary.avgPipelineHealth}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">At-Risk Deals</p>
              <p className="text-2xl font-bold text-rose-600">{data.teamSummary.atRiskDeals}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Top Performer</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">{data.teamSummary.topPerformer.name}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Forecasting & Action Center */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Forecasting Block - Highly visible priority */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-zinc-900">Can we hit the number?</h2>
              </div>
              <Card className="border-indigo-100 shadow-md">
                <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4">
                  <CardTitle className="text-lg text-indigo-950">Quarterly Forecast Summary</CardTitle>
                  <CardDescription className="text-indigo-900 font-medium">
                    {data.forecasting.forecastSummaryText}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Expected Case</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      ${data.forecasting.quarterForecast.expectedCase.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Commit (Worst)</p>
                    <p className="text-xl font-bold text-zinc-700">
                      ${data.forecasting.quarterForecast.worstCase.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Upside (Best)</p>
                    <p className="text-xl font-bold text-zinc-700">
                      ${data.forecasting.quarterForecast.bestCase.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Rep Coaching */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-semibold">Rep Coaching & Performance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md">Critical Skill Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.repCoaching.criticalSkillGaps.length === 0 ? (
                      <p className="text-sm text-zinc-500">No team-wide skill gaps detected.</p>
                    ) : (
                      <ul className="space-y-3">
                        {data.repCoaching.criticalSkillGaps.slice(0,3).map((gap, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-zinc-800 capitalize">{gap.skill.replace('-', ' ')}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              gap.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {gap.severity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md">Coaching Interventions Needed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.repCoaching.coachingCandidates.length === 0 ? (
                      <p className="text-sm text-zinc-500">All reps are performing optimally.</p>
                    ) : (
                      <ul className="space-y-3">
                        {data.repCoaching.coachingCandidates.map((candidate, idx) => (
                          <li key={idx} className="text-sm">
                            <div className="flex justify-between font-medium text-zinc-800">
                              <span>{candidate.name}</span>
                              <span className="text-zinc-500">Score: {candidate.performanceScore}</span>
                            </div>
                            <p className="text-xs text-rose-600 mt-1 line-clamp-1 truncate">
                              Needs help with: {candidate.weaknesses.join(", ")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Learning Intelligence */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">What pattern is working?</h2>
              </div>
              
              <Card className="shadow-sm">
                <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
                  <CardTitle className="text-md text-blue-950">Learning Intelligence Summary</CardTitle>
                  <CardDescription className="text-blue-900 font-medium">
                    {data.learningIntelligence.learningSummaryText}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-500" /> Top Performing Patterns
                    </h4>
                    <ul className="space-y-2">
                      {data.learningIntelligence.topPatterns.slice(0,3).map((pattern, idx) => (
                        <li key={idx} className="bg-zinc-50 p-2 rounded border border-zinc-100 text-sm">
                          <p className="font-medium text-zinc-900">{pattern.pattern}</p>
                          <div className="flex justify-between items-center mt-2 text-xs text-zinc-500">
                            <span className="capitalize text-indigo-600">{pattern.objectionType.replace('-', ' ')}</span>
                            <span>{pattern.effectivenessScore}% Win Rate</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1">
                      <Swords className="w-3 h-3 text-rose-500" /> Top Market Objections
                    </h4>
                    <ul className="space-y-2">
                      {data.learningIntelligence.topObjections.slice(0,3).map((obj, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                          <span className="capitalize text-zinc-800">{obj.objectionType.replace('-', ' ')}</span>
                          <span className="font-bold text-zinc-600">{obj.percentage}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column: Action Center */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-semibold">Action Center</h2>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-sm text-amber-900 font-medium">
                {data.actionCenter.actionSummaryText}
              </div>

              {data.actionCenter.actions.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <p className="text-zinc-500 text-sm">No critical manager interventions required.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.actionCenter.actions.map((action, idx) => (
                    <Card key={idx} className="shadow-sm border-l-4" style={{
                      borderLeftColor: action.priority === 'critical' ? '#f43f5e' : action.priority === 'high' ? '#f59e0b' : '#3b82f6'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-zinc-900">{action.action}</h4>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">{action.reason}</p>
                        {action.relatedDeal && (
                          <p className="text-[10px] text-indigo-600 mt-2 font-bold uppercase tracking-wider">
                            Deal: {action.relatedDeal}
                          </p>
                        )}
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
