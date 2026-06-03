import { Card } from "@/components/ui/card"
import { Zap, Target, Users2 } from "lucide-react"

export function BenefitsGrid() {
  const benefits = [
    {
      title: "Faster Follow-Ups",
      description: "Send personalized collateral immediately after the call, while intent is highest.",
      icon: Zap,
    },
    {
      title: "Consistent Messaging",
      description: "Ensure every rep uses the right value props and approved proof points.",
      icon: Target,
    },
    {
      title: "Persona-Optimized",
      description: "Automatically tailor the output for technical buyers, executives, or champions.",
      icon: Users2,
    },
  ]

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Benefits</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Empower your sales team
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <Card key={i} className="p-8 transition-colors hover:border-primary/20 hover:bg-zinc-50/50">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-primary">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
