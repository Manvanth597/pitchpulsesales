"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate auth, then redirect to setup
    router.push("/setup")
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
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
          <span className="font-semibold text-foreground tracking-tight">PitchPulseSales</span>
        </Link>
      </div>
      
      <Card className="border-border/60 shadow-sm p-8 sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-2">Continue generating sales-ready one-pagers.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="name@company.com" required />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="remember" 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none text-muted-foreground cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full mt-2" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-border after:mt-0.5 after:flex-1 after:border-t after:border-border">
          <p className="mx-4 mb-0 text-center text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Or continue with
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button type="button" onClick={() => router.push("/setup")} variant="outline" className="w-full text-zinc-600">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Google
          </Button>
          <Button type="button" onClick={() => router.push("/setup")} variant="outline" className="w-full text-zinc-600">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 21 21">
              <path d="M10 0H0V10H10V0Z" fill="#f35325"/>
              <path d="M21 0H11V10H21V0Z" fill="#81bc06"/>
              <path d="M10 11H0V21H10V11Z" fill="#05a6f0"/>
              <path d="M21 11H11V21H21V11Z" fill="#ffba08"/>
            </svg>
            Microsoft
          </Button>
        </div>
      </Card>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:text-primary transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
