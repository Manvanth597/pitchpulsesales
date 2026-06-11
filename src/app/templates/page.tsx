import { getAllClients } from "@/lib/db"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { Navbar } from "@/components/layout/Navbar"

export default async function TemplatesPage() {
  const clients = await getAllClients()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto py-10 space-y-6 max-w-6xl flex-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospect Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">View and manage your prospect pitch evolution.</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <h3 className="text-xl font-semibold mb-2">No Prospects Yet</h3>
          <p className="text-muted-foreground mb-6">Start generating pitches to build your knowledge base.</p>
          <Link href="/pitch">
            <Button>Generate First Pitch</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            const version = client.evolutionHistory.length + 1
            const latestConfidence = client.confidenceTrend.length > 0 
              ? client.confidenceTrend[client.confidenceTrend.length - 1] 
              : 'N/A'
            const industry = client.customerContext ? client.customerContext.slice(0, 30) + '...' : 'N/A'

            return (
              <Card key={client.id} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start text-lg">
                    <span className="truncate pr-2" title={client.companyName}>{client.companyName || 'Unknown'}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-semibold uppercase tracking-wider whitespace-nowrap">
                      {client.stage.replace('_', ' ')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Context</p>
                      <p className="font-medium truncate text-sm" title={client.customerContext}>{industry}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Pitch Version</p>
                      <p className="font-medium text-sm">v{version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Confidence</p>
                      <p className="font-medium text-sm">{latestConfidence}/10</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Last Updated</p>
                      <p className="font-medium text-sm truncate">{new Date(client.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-4 border-t bg-muted/20">
                  <Link href={`/templates/${client.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs">View Prospect</Button>
                  </Link>
                  <Link href={`/pulse-plan/${client.id}`} className="flex-1">
                    <Button className="w-full text-xs">Continue</Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
