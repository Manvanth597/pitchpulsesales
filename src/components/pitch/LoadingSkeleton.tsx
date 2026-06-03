export function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-48 bg-zinc-200 rounded-md" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-zinc-100 rounded-md" />
              <div className="h-8 w-8 bg-zinc-100 rounded-md" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-zinc-100 rounded-md" />
            <div className="h-3 w-[90%] bg-zinc-100 rounded-md" />
            <div className="h-3 w-[80%] bg-zinc-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
