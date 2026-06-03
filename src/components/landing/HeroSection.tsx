import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        {/* Minimal logo mark */}
        <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <svg
            className="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Turn Sales Decks Into <br className="hidden sm:block" />
          <span className="text-primary">Client-Ready One-Pagers</span> Instantly
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Upload presentations, PDFs, or URLs and generate structured sales collateral optimized for demos, follow-ups, and outbound.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-8 text-base">
              Start Generating
            </Button>
          </Link>
          <Link href="#preview" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            See Example <span aria-hidden="true">→</span>
          </Link>
        </div>
        
        <div className="mt-14 border-t border-border/50 pt-8">
          <p className="text-sm text-muted-foreground">
            Built for founders, sales teams, and revenue enablement.
          </p>
        </div>
      </div>
    </section>
  )
}
