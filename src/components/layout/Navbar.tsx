import Link from "next/link"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left Side */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-foreground tracking-tight hidden sm:inline-block">PitchPulseSales</span>
        </Link>

        {/* Right Side */}
        <div className="ml-auto flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>

          {/* Workspaces Dropdown */}
          <div className="relative group">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-2">
              Workspaces
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full pt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="rounded-md border bg-popover text-popover-foreground shadow-md p-1 flex flex-col">
                <Link href="/rep" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                  Sales Workspace
                </Link>
                <Link href="/manager" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                  Team Workspace
                </Link>
                <Link href="/executive" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                  Executive Boardroom
                </Link>
              </div>
            </div>
          </div>

          <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">
            Settings
          </Link>
          <div className="h-8 w-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center overflow-hidden">
            <svg className="h-4 w-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  )
}
