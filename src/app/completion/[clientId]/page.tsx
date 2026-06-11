import { getClient } from "@/lib/db";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  BrainCircuit, 
  ArrowRight, 
  Building2, 
  TrendingUp, 
  Users, 
  PlusCircle,
  Activity,
  ShieldCheck,
  Target
} from "lucide-react";
import Link from "next/link";

export default async function CompletionHubPage({ params }: { params: Promise<{ clientId: string }> }) {
  const resolvedParams = await params;
  const client = await getClient(resolvedParams.clientId);
  
  if (!client) {
    return notFound();
  }

  // Calculate Summary Metrics
  const latestObjection = client.objectionHistory.length > 0 
    ? client.objectionHistory[client.objectionHistory.length - 1] 
    : "None detected";
    
  const latestEvolution = client.evolutionHistory.length > 0 
    ? client.evolutionHistory[client.evolutionHistory.length - 1] 
    : null;
    
  const latestPattern = latestEvolution?.triggerEvent || "Initial baseline established";
  
  let confChange = "Stable";
  if (client.confidenceTrend.length >= 2) {
      const prev = client.confidenceTrend[client.confidenceTrend.length - 2];
      const curr = client.confidenceTrend[client.confidenceTrend.length - 1];
      if (curr > prev) confChange = `+${curr - prev} (Improving)`;
      else if (curr < prev) confChange = `${curr - prev} (Declining)`;
  } else if (client.confidenceTrend.length === 1) {
      confChange = `Initial Score: ${client.confidenceTrend[0]}`;
  }

  const nextAction = latestEvolution?.appliedChanges && latestEvolution.appliedChanges.length > 0
    ? latestEvolution.appliedChanges[0] 
    : "Execute updated pitch strategy";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        
        {/* Success Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Evolution Complete
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            The PitchPulse agent has successfully processed the debrief, updated the client memory, and evolved the sales strategy.
          </p>
        </div>

        {/* Intelligence Summary Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          <Card className="bg-white border-zinc-200 shadow-sm text-center py-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Pitch Updated</p>
            <ShieldCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-900">v{client.evolutionHistory.length + 1}.0 Active</p>
          </Card>
          
          <Card className="bg-white border-zinc-200 shadow-sm text-center py-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Pattern Extracted</p>
            <BrainCircuit className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-900 truncate px-2">{latestPattern}</p>
          </Card>
          
          <Card className="bg-white border-zinc-200 shadow-sm text-center py-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Confidence Shift</p>
            <Activity className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-900">{confChange}</p>
          </Card>
          
          <Card className="bg-white border-zinc-200 shadow-sm text-center py-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Objection Learned</p>
            <Target className="w-6 h-6 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-900 truncate px-2 capitalize">{latestObjection.replace('_', ' ')}</p>
          </Card>
        </div>

        {/* Action Callout */}
        <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-12 flex items-start gap-4">
          <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-indigo-900">Recommended Next Action</h3>
            <p className="text-sm text-indigo-700 mt-1">{nextAction}</p>
          </div>
        </div>

        {/* CTA Routing Hub */}
        <div className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Return to Workspace Intelligence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Primary CTA - Rep Workspace */}
              <Link href="/rep" className="block">
                <Card className="h-full hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer border-indigo-100 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                  <CardContent className="p-6 text-left flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-zinc-900">Sales Workspace</h3>
                    <p className="text-xs text-zinc-500 flex-1">View updated Deal Strategy, Next Actions, and Risk flags.</p>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2">
                      Enter Workspace <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              {/* Secondary CTA - Manager Workspace */}
              <Link href="/manager" className="block">
                <Card className="h-full hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-6 text-left flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-zinc-900">Team Workspace</h3>
                    <p className="text-xs text-zinc-500 flex-1">Review team velocity, coaching gaps, and forecasting impact.</p>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                      Enter Workspace <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              {/* Tertiary CTA - Executive Dashboard */}
              <Link href="/executive" className="block">
                <Card className="h-full hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-6 text-left flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-700 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-zinc-900">Executive Boardroom</h3>
                    <p className="text-xs text-zinc-500 flex-1">Analyze macro pipeline trends and structural growth vectors.</p>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-2">
                      Enter Workspace <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="flex justify-center pt-8 border-t border-zinc-200">
            <Link href="/pitch">
              <Button variant="outline" className="text-zinc-600">
                <PlusCircle className="w-4 h-4 mr-2" /> Start New Prospect
              </Button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
