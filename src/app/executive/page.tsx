"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExecutiveWorkspace } from "@/agent/workspaces/types";
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  LineChart,
  ShieldAlert,
  Rocket,
  ArrowRight,
  TrendingDown,
  Minus
} from "lucide-react";

export default function ExecutiveWorkspacePage() {
  const [data, setData] = useState<ExecutiveWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspaces/executive");
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
        <Activity className="w-8 h-8 text-slate-800 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Compiling Boardroom Intelligence...</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm">
          Aggregating global revenue risk, pipeline trends, and growth projections.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Workspace Unavailable</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-slate-900 text-white hover:bg-slate-800">
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & High-Level KPIs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-slate-700" /> Executive Boardroom
            </h1>
            <p className="text-slate-500 mt-1">Macro revenue intelligence, systemic risk, and strategic growth.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${data.forecasting.pipelineForecast.totalPipeline.toLocaleString()}
              </p>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-rose-200 shadow-sm min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue at Risk</p>
              <p className="text-2xl font-bold text-rose-600">
                ${data.revenueIntelligence.revenueAtRisk.toLocaleString()}
              </p>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-emerald-200 shadow-sm min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expected Quarter</p>
              <p className="text-2xl font-bold text-emerald-700">
                ${data.forecasting.quarterForecast.expectedCase.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Executive Summary */}
        <Card className="bg-slate-900 text-slate-50 border-slate-800 shadow-lg">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-xs font-bold">
                <Activity className="w-4 h-4 text-emerald-400" /> Revenue Intelligence Synthesis
              </div>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-200">
                {data.revenueIntelligence.executiveSummary}
              </p>
            </div>
            <div className="hidden md:block w-px h-32 bg-slate-800" />
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-xs font-bold">
                <LineChart className="w-4 h-4 text-blue-400" /> Forecast Predictability
              </div>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-200">
                {data.forecasting.forecastSummaryText}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Strategic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Risks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl font-bold text-slate-900">Systemic Revenue Risks</h2>
              </div>
            </div>
            
            {data.revenueRisks.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200">
                <p className="text-slate-500">No macro revenue risks detected.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.revenueRisks.map((risk, idx) => (
                  <Card key={idx} className="shadow-sm border-l-4 overflow-hidden" style={{
                    borderLeftColor: risk.severity === 'high' ? '#e11d48' : risk.severity === 'medium' ? '#d97706' : '#2563eb'
                  }}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900">{risk.title}</h3>
                        <span className="text-rose-600 font-bold text-sm tracking-tight">
                          ${risk.impact.toLocaleString()} Impact
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{risk.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Growth Opportunities */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Strategic Growth Vectors</h2>
              </div>
            </div>
            
            {data.growthOpportunities.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200">
                <p className="text-slate-500">No structural growth opportunities detected.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.growthOpportunities.map((opp, idx) => (
                  <Card key={idx} className="shadow-sm border-l-4 border-emerald-500 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900">{opp.title}</h3>
                        <span className="text-emerald-600 font-bold text-sm tracking-tight">
                          +${opp.potentialImpact.toLocaleString()} Upside
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{opp.recommendation}</p>
                      <Button size="sm" variant="outline" className="w-full text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100">
                        Initiate Strategy <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Pipeline Trends (Full Width) */}
          <section className="lg:col-span-2 space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Macro Pipeline Trends</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.pipelineTrends.length === 0 ? (
                <div className="col-span-3 text-center p-8 border border-dashed rounded-xl border-slate-200">
                  <p className="text-slate-500">Insufficient data to establish macro trends.</p>
                </div>
              ) : (
                data.pipelineTrends.slice(0, 3).map((trend, idx) => (
                  <Card key={idx} className="shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900 leading-tight">{trend.title}</h3>
                        <div className={`p-1.5 rounded-full ${
                          trend.direction === 'up' ? 'bg-emerald-100 text-emerald-600' :
                          trend.direction === 'down' ? 'bg-rose-100 text-rose-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {trend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> :
                           trend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> :
                           <Minus className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-2xl font-bold tracking-tighter ${
                          trend.direction === 'up' ? 'text-emerald-600' :
                          trend.direction === 'down' ? 'text-rose-600' :
                          'text-slate-600'
                        }`}>
                          {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                          {trend.changePercentage}%
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Shift</span>
                      </div>
                      <p className="text-xs text-slate-500">{trend.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
