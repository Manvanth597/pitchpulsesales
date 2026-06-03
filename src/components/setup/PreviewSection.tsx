import { ReactNode } from "react"

interface PreviewSectionProps {
  title: string
  children: ReactNode
}

export function PreviewSection({ title, children }: PreviewSectionProps) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">
        {title}
      </h3>
      <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </div>
  )
}
