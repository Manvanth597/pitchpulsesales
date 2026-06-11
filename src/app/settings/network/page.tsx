import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Network, ArrowRight, BrainCircuit, Target, LineChart, CheckCircle2, Workflow, MessageSquareText, Lightbulb, Zap, TrendingUp, AlertTriangle, BadgeCheck } from 'lucide-react';

interface AgentMessage {
  id: string;
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  intent: string;
  payloadSummary: string;
  outcome: string;
}

const synthesizedMessages: AgentMessage[] = [
  {
    id: "msg-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    fromAgent: "Learning Agent",
    toAgent: "Strategy Agent",
    intent: "objection_pattern_detected",
    payloadSummary: "Pricing concerns increasing in enterprise segment.",
    outcome: "Strategy updated"
  },
  {
    id: "msg-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    fromAgent: "Strategy Agent",
    toAgent: "Forecast Agent",
    intent: "confidence_adjustment",
    payloadSummary: "Multiple deals stalled in negotiation.",
    outcome: "Deal confidence reduced"
  },
  {
    id: "msg-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    fromAgent: "Forecast Agent",
    toAgent: "Revenue Intelligence Agent",
    intent: "pipeline_risk_detected",
    payloadSummary: "Q4 Commit at risk of missing by 12%.",
    outcome: "Revenue risk created"
  },
  {
    id: "msg-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    fromAgent: "Learning Agent",
    toAgent: "Coaching Agent",
    intent: "skill_gap_detected",
    payloadSummary: "Frequent hesitation on ROI questions.",
    outcome: "Coaching recommendation created"
  }
];

export default function AgentNetworkPage() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Network className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Communication Center</h1>
            <p className="text-muted-foreground mt-1">
              Visualizing the intelligent nervous system of PitchPulseSales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* Visual Flow */}
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-500" />
                Multi-Agent Architecture Flow
              </CardTitle>
              <CardDescription>Real-time topology of specialized agent collaboration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                {/* Flow Diagram UI */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl justify-between relative">
                  
                  {/* Learning Agent */}
                  <div className="flex flex-col gap-8 w-full md:w-auto relative z-10">
                    <div className="bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg p-4 shadow-lg text-center w-48 relative">
                      <BrainCircuit className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Learning Agent</div>
                      
                      {/* Arrows out */}
                      <div className="hidden md:block absolute -right-8 top-1/2 w-8 border-t-2 border-dashed border-indigo-400"></div>
                      <div className="hidden md:block absolute -right-8 -bottom-4 w-8 border-t-2 border-r-2 rounded-tr-lg border-dashed border-indigo-400 h-10"></div>
                    </div>
                  </div>

                  {/* Coaching / Strategy */}
                  <div className="flex flex-col gap-6 w-full md:w-auto relative z-10">
                    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-lg p-4 shadow-lg text-center w-48 relative">
                      <Lightbulb className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Coaching Agent</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg p-4 shadow-lg text-center w-48 relative">
                      <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Strategy Agent</div>
                      {/* Arrow out */}
                      <div className="hidden md:block absolute -right-8 top-1/2 w-8 border-t-2 border-dashed border-blue-400"></div>
                    </div>
                  </div>

                  {/* Forecast Agent */}
                  <div className="flex flex-col w-full md:w-auto relative z-10">
                    <div className="bg-white dark:bg-slate-800 border-2 border-amber-500 rounded-lg p-4 shadow-lg text-center w-48 relative">
                      <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Forecast Agent</div>
                      {/* Arrow out */}
                      <div className="hidden md:block absolute -right-8 top-1/2 w-8 border-t-2 border-dashed border-amber-400"></div>
                    </div>
                  </div>

                  {/* Revenue Intelligence */}
                  <div className="flex flex-col gap-6 w-full md:w-auto relative z-10">
                    <div className="bg-white dark:bg-slate-800 border-2 border-rose-500 rounded-lg p-4 shadow-lg text-center w-48">
                      <LineChart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Revenue Intel Agent</div>
                      {/* Arrow out to exec */}
                      <div className="hidden md:block absolute -right-8 top-1/2 w-8 border-t-2 border-rose-400"></div>
                    </div>
                  </div>
                  
                  {/* Executive Workspace */}
                  <div className="hidden md:flex flex-col w-full md:w-auto relative z-10">
                    <div className="bg-slate-900 text-white border-2 border-slate-700 rounded-lg p-4 shadow-lg text-center w-40">
                      <div className="font-semibold text-sm">Executive<br/>Workspace</div>
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center justify-center">
              <MessageSquareText className="w-8 h-8 text-slate-400 mb-2" />
              <div className="text-3xl font-bold">1,248</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Messages Processed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center justify-center">
              <BrainCircuit className="w-8 h-8 text-indigo-400 mb-2" />
              <div className="text-3xl font-bold">342</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Patterns Learned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center justify-center">
              <TrendingUp className="w-8 h-8 text-amber-400 mb-2" />
              <div className="text-3xl font-bold">89</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Forecast Updates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center justify-center">
              <Zap className="w-8 h-8 text-emerald-400 mb-2" />
              <div className="text-3xl font-bold">156</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Coaching Signals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
              <div className="text-3xl font-bold">12</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Revenue Alerts</div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Timeline */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Agent Communications</CardTitle>
            <CardDescription>Live intelligence compounding across the system based on debriefs and objection history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Time</div>
                <div className="col-span-3">Source &rarr; Destination</div>
                <div className="col-span-3">Intent</div>
                <div className="col-span-4">Business Outcome</div>
              </div>
              <div className="divide-y">
                {synthesizedMessages.map((msg) => (
                  <div key={msg.id} className="grid grid-cols-12 items-center p-4 text-sm hover:bg-muted/30 transition-colors">
                    <div className="col-span-2 text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="font-semibold">{msg.fromAgent}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{msg.toAgent}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                        {msg.intent}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground truncate pr-4" title={msg.payloadSummary}>{msg.payloadSummary}</p>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{msg.outcome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
