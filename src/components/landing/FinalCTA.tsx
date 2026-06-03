import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="bg-zinc-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Stop Sending Bloated Decks.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Generate concise, buyer-ready one-pagers your prospects will actually read. Start closing deals faster today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 text-base shadow-sm">
                Generate Your First One-Pager
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
