import { Card } from "@/components/ui/card"
import { Upload, Cpu, FileOutput } from "lucide-react"

export function ProcessFlow() {
  const steps = [
    {
      id: "01",
      title: "Upload Materials",
      description: "Upload decks, PDFs, documents, or website links.",
      icon: Upload,
    },
    {
      id: "02",
      title: "AI Structures Content",
      description: "Extract value propositions, benefits, proof, and use cases.",
      icon: Cpu,
    },
    {
      id: "03",
      title: "Export Sales One-Pager",
      description: "Generate clean client-facing collateral in seconds.",
      icon: FileOutput,
    },
  ]

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">How it works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From chaos to clarity in three steps
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Card className="p-8 sm:p-12">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden lg:block absolute top-8 left-[15%] right-[15%] h-px bg-border z-0" />
              
              {steps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary/20 text-primary shadow-sm">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
