import Link from "next/link"
import { ReactNode } from "react"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hidden on mobile */}
      <div className="hidden w-1/2 bg-zinc-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
              <svg
                className="h-4 w-4 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">PitchPulseSales</span>
          </Link>
          
          <h1 className="text-4xl font-semibold tracking-tight text-white mt-12 mb-6">
            Sales Collateral,<br />Generated Instantly.
          </h1>
          <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
            Transform decks, PDFs, and URLs into structured one-pagers optimized for real sales conversations.
          </p>
        </div>

        {/* Abstract UI Illustration / Mockup */}
        <div className="relative z-10 mt-12 flex-1 w-full max-w-lg">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-3/4 rounded bg-zinc-800" />
              <div className="h-4 w-1/2 rounded bg-zinc-800" />
              <div className="mt-8 space-y-2">
                <div className="h-2 w-full rounded bg-zinc-800/50" />
                <div className="h-2 w-full rounded bg-zinc-800/50" />
                <div className="h-2 w-4/5 rounded bg-zinc-800/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
