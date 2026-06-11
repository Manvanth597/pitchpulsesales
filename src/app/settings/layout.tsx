"use client";

import { Navbar } from "@/components/layout/Navbar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border p-6 space-y-2 flex-shrink-0 bg-background/50 hidden md:block">
          <h2 className="text-lg font-semibold mb-6 px-2 text-foreground">Settings</h2>
          <nav className="space-y-1">
            <Link 
              href="/settings/context" 
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings/context') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
              Company Context
            </Link>
            <Link 
              href="/settings/agents" 
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings/agents') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
              Agent Registry
            </Link>
            <Link 
              href="/settings/network" 
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings/network') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
              Agent Communication
            </Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
