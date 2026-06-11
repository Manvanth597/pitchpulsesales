import { 
  Bot, 
  Brain, 
  Calendar, 
  FileText, 
  Sparkles, 
  Target, 
  TrendingUp, 
  UserPlus, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  ArrowDown,
  Cpu,
  Network,
  CheckCircle2,
  Users,
  MessageSquare,
  BarChart3,
  LineChart,
  Lightbulb
} from "lucide-react"

const agents = [
  { name: "Pitch Generation Agent", id: "agent_pg_01", purpose: "Generate initial sales narratives.", inputs: ["Company Context"], outputs: ["Generated Pitch"], status: "Active", lastActivity: "2 mins ago", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Pulse Planning Agent", id: "agent_pp_02", purpose: "Prepare discovery strategy.", inputs: ["Pitch", "Client Context"], outputs: ["Pulse Plan"], status: "Active", lastActivity: "5 mins ago", icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { name: "Learning Agent", id: "agent_la_03", purpose: "Analyze debriefs and extract patterns.", inputs: ["Debriefs", "Objections", "Outcomes"], outputs: ["Learning Insights"], status: "Active", lastActivity: "Just now", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { name: "Pitch Evolution Agent", id: "agent_pe_04", purpose: "Improve sales messaging.", inputs: ["Debriefs", "Learning Patterns"], outputs: ["Improved Pitch"], status: "Active", lastActivity: "1 hr ago", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Strategy Agent", id: "agent_sa_05", purpose: "Recommend deal strategies.", inputs: ["Deal Data", "Learning Data"], outputs: ["Deal Strategy"], status: "Active", lastActivity: "30 mins ago", icon: Target, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { name: "Forecast Agent", id: "agent_fa_06", purpose: "Predict revenue outcomes.", inputs: ["Pipeline", "Deal Health"], outputs: ["Forecast"], status: "Active", lastActivity: "4 hrs ago", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Coaching Agent", id: "agent_ca_07", purpose: "Identify rep skill gaps.", inputs: ["Performance Data", "Debriefs"], outputs: ["Coaching Recommendations"], status: "Active", lastActivity: "2 hrs ago", icon: UserPlus, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { name: "Revenue Intelligence Agent", id: "agent_ri_08", purpose: "Surface executive insights.", inputs: ["Forecasts", "Pipeline Data"], outputs: ["Revenue Risks", "Growth Opportunities"], status: "Active", lastActivity: "15 mins ago", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
]

const recentActivity = [
  { id: 1, message: "Learning Agent extracted pricing objection pattern from Enterprise debriefs.", time: "10 mins ago" },
  { id: 2, message: "Pitch Evolution Agent created Version 3 of Security pitch.", time: "1 hr ago" },
  { id: 3, message: "Forecast Agent updated quarterly forecast based on recent deal closures.", time: "4 hrs ago" },
  { id: 4, message: "Revenue Intelligence Agent detected pipeline decline in EMEA region.", time: "5 hrs ago" },
  { id: 5, message: "Coaching Agent identified discovery skill gap for Rep A.", time: "1 day ago" },
]

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Network className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Agent Network</h1>
            </div>
            <p className="text-zinc-400">System Intelligence & Revenue Operations Center</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 shadow-inner">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-300">All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 space-y-16">
        
        {/* Agent Registry */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="h-5 w-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">Core Agents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon
              return (
                <div key={agent.id} className={`bg-zinc-900 border ${agent.border} rounded-xl p-5 hover:bg-zinc-800/80 transition-colors flex flex-col h-full shadow-lg`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${agent.bg}`}>
                      <Icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-zinc-300">{agent.status}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{agent.id}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-zinc-100 mb-1">{agent.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4 flex-grow">{agent.purpose}</p>
                  
                  <div className="space-y-3 mt-auto pt-4 border-t border-zinc-800/50">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1 block">Inputs</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.inputs.map(input => (
                          <span key={input} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700">{input}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1 block">Outputs</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.outputs.map(output => (
                          <span key={output} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700">{output}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Communication Map & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Network className="h-5 w-5 text-zinc-400" />
              <h2 className="text-xl font-semibold">Intelligence Flow</h2>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
              
              <div className="max-w-2xl w-full">
                {/* Flow Sequence */}
                <div className="flex flex-col items-center space-y-2">
                  <FlowCard title="Pitch Generation Agent" icon={FileText} color="text-blue-500" />
                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  <FlowCard title="Pulse Planning Agent" icon={Calendar} color="text-indigo-500" />
                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  
                  {/* Branching */}
                  <div className="relative w-full flex justify-center">
                    <FlowCard title="Learning Agent" icon={Brain} color="text-purple-500" />
                    
                    {/* Branching Line Right */}
                    <div className="absolute right-0 top-1/2 w-[calc(50%-100px)] flex items-center hidden sm:flex">
                      <div className="h-px bg-zinc-600 flex-grow" />
                      <ArrowRight className="h-4 w-4 text-zinc-600 -ml-1" />
                      <div className="ml-2">
                         <FlowCard title="Coaching Agent" icon={UserPlus} color="text-orange-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Coaching Agent representation */}
                  <div className="sm:hidden flex flex-col items-center w-full">
                     <ArrowDown className="h-5 w-5 text-zinc-600" />
                     <FlowCard title="Coaching Agent" icon={UserPlus} color="text-orange-500" />
                  </div>

                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  <FlowCard title="Pitch Evolution Agent" icon={Sparkles} color="text-amber-500" />
                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  <FlowCard title="Strategy Agent" icon={Target} color="text-rose-500" />
                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  <FlowCard title="Forecast Agent" icon={TrendingUp} color="text-emerald-500" />
                  <ArrowDown className="h-5 w-5 text-zinc-600" />
                  <FlowCard title="Revenue Intelligence Agent" icon={ShieldAlert} color="text-red-500" />
                </div>
              </div>

            </div>
          </section>

          <section className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-zinc-400" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-[calc(100%-3rem)] flex flex-col">
              <div className="space-y-6 overflow-y-auto pr-2">
                {recentActivity.map((activity, idx) => (
                  <div key={activity.id} className="relative pl-6">
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-zinc-800" />
                    )}
                    <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    <p className="text-sm text-zinc-200 leading-snug">{activity.message}</p>
                    <span className="text-xs text-zinc-500 mt-1 block">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Business Impact */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">Business Impact</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ImpactMetric label="Total Prospects" value="1,248" icon={Users} trend="+12%" />
            <ImpactMetric label="Total Debriefs" value="432" icon={MessageSquare} trend="+5%" />
            <ImpactMetric label="Patterns Learned" value="89" icon={Brain} trend="+24%" />
            <ImpactMetric label="Pitches Evolved" value="14" icon={Sparkles} trend="v4.2" />
            <ImpactMetric label="Forecast Updates" value="56" icon={LineChart} trend="94% Acc" />
            <ImpactMetric label="Coaching Signals" value="128" icon={Lightbulb} trend="+18%" />
          </div>
        </section>

      </div>
    </div>
  )
}

function FlowCard({ title, icon: Icon, color }: { title: string, icon: any, color: string }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-3 w-full sm:w-64 shadow-md z-10">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-medium text-zinc-200">{title}</span>
    </div>
  )
}

function ImpactMetric({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <Icon className="h-5 w-5 text-zinc-500" />
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{trend}</span>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-zinc-100">{value}</h4>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  )
}
