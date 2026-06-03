import { Card } from "@/components/ui/card"
import { Building2, CheckCircle2, TrendingUp, Users } from "lucide-react"

export function ProductPreview() {
  return (
    <section id="preview" className="bg-zinc-50/50 py-16 sm:py-24 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Output</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Enterprise-ready collateral
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Clean, structured, and designed to convert.
          </p>
        </div>

        <div className="mx-auto max-w-4xl relative">
          {/* Decorative background elements */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-50" />
          
          <Card className="relative overflow-hidden bg-white shadow-xl shadow-zinc-200/50 rounded-xl border-zinc-200">
            {/* Factsheet Header */}
            <div className="border-b border-zinc-100 p-8 sm:px-12 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Acme Intelligence</h3>
                  <p className="text-sm text-zinc-500 font-medium">Predictive Analytics Platform</p>
                </div>
              </div>
              <div className="text-sm text-zinc-400 font-mono">CONFIDENTIAL</div>
            </div>

            <div className="p-8 sm:p-12 space-y-12">
              {/* Value Prop */}
              <div className="max-w-2xl">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Value Proposition</h4>
                <p className="text-xl text-zinc-800 leading-snug font-medium">
                  We help revenue operations teams forecast with 98% accuracy by unifying CRM data with real-time market signals.
                </p>
              </div>

              {/* Grid Section */}
              <div className="grid sm:grid-cols-2 gap-10">
                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Key Benefits
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Reduce pipeline churn by identifying at-risk deals early.",
                      "Automate territory planning with AI-driven insights.",
                      "Integrates natively with Salesforce and HubSpot in minutes."
                    ].map((benefit, i) => (
                      <li key={i} className="flex gap-3 text-zinc-600">
                        <CheckCircle2 className="h-5 w-5 text-zinc-300 shrink-0" />
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Persona / Use Case */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Ideal For
                  </h4>
                  <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-100">
                    <p className="text-sm font-medium text-zinc-900 mb-2">VP of Revenue Operations</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Struggling with fragmented data silos and manual spreadsheet forecasting. Needs a unified source of truth to present to the board.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="pt-8 border-t border-zinc-100">
                <div className="flex items-center gap-8 opacity-60 grayscale">
                  <div className="flex items-center gap-2 font-bold text-zinc-800"><Building2 className="h-5 w-5"/> GLOBEX</div>
                  <div className="flex items-center gap-2 font-bold text-zinc-800"><Building2 className="h-5 w-5"/> INITECH</div>
                  <div className="flex items-center gap-2 font-bold text-zinc-800"><Building2 className="h-5 w-5"/> SOYUZ</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
