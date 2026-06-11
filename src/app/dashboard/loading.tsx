/** 
 * @deprecated LEGACY UNIFIED DASHBOARD
 * This UI is being replaced by the Workspace Architecture (/rep, /manager, /executive).
 * Scheduled for future removal. Retained temporarily for safe rollback.
 */
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-zinc-200 rounded-md mb-2"></div>
            <div className="h-4 w-48 bg-zinc-200 rounded-md"></div>
          </div>
        </div>

        {/* AI Executive Brief Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5">
                <div className="h-4 w-24 bg-zinc-200 rounded-md mb-3"></div>
                <div className="flex items-end gap-2 mb-4">
                  <div className="h-8 w-16 bg-zinc-200 rounded-md"></div>
                  <div className="h-4 w-12 bg-zinc-100 rounded-md mb-1"></div>
                </div>
                <div className="pt-3 border-t border-zinc-100">
                  <div className="h-3 w-full bg-zinc-200 rounded-md"></div>
                  <div className="h-3 w-2/3 bg-zinc-200 rounded-md mt-1"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Active Pipeline Skeleton */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-zinc-200 rounded-md"></div>
              </div>
              <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-40 bg-zinc-200 rounded-md"></div>
                          <div className="h-5 w-20 bg-zinc-100 rounded-md"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-4 w-16 bg-zinc-200 rounded-md"></div>
                          <div className="h-4 w-24 bg-zinc-200 rounded-md"></div>
                        </div>
                      </div>
                      <div className="sm:max-w-xs w-full h-16 bg-zinc-50 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <section>
              <div className="h-6 w-32 bg-zinc-200 rounded-md mb-4"></div>
              <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-zinc-200 mt-1 shrink-0"></div>
                      <div className="space-y-3 w-full">
                        <div className="h-4 w-3/4 bg-zinc-200 rounded-md"></div>
                        <div className="h-12 w-full bg-zinc-50 rounded-md"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
