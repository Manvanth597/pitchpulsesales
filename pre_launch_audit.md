# Pre-Launch Production Audit & Readiness Report

While the current architecture is perfectly suited for local testing and validation of the intelligence models, the following structural components must be addressed before deploying PitchPulse Sales to a live production environment with real sales teams.

---

## 1. Data Storage & Concurrency
*   **Current State:** The application reads and writes to a local, flat JSON file (`data/db.json`) using synchronous filesystem operations.
*   **Production Requirement:** Migrate to a relational database (e.g., PostgreSQL) using an ORM like Prisma or Drizzle. 
*   **Why:** Serverless environments (like Vercel) have ephemeral file systems, meaning the JSON file will constantly reset. Furthermore, a real database is required to handle concurrent read/writes, indexing, and to prevent Out-Of-Memory (OOM) crashes as the data scales.

## 2. Authentication & Authorization (RBAC)
*   **Current State:** API routes (e.g., `app/api/workspaces/sales/route.ts`) currently use a mock user ID (`const userId = "user-1";`) to bypass authentication for rapid development.
*   **Production Requirement:** Integrate a secure authentication provider (like Clerk or NextAuth). 
*   **Why:** We must enforce strict Role-Based Access Control (RBAC). Sales reps should cryptographically only be able to query the `/api/workspaces/sales` endpoint for their own assigned deals, while Managers and Executives need verified organizational roles to access macro data.

## 3. Legacy Technical Debt Cleanup
*   **Current State:** The deprecated Unified Dashboard routes (`/dashboard`) and the monolithic orchestrator (`getDashboardData()`) are still in the codebase, guarded by `@deprecated` comments.
*   **Production Requirement:** Execute Phase 4 of the Migration Report by completely deleting these files and unused types.
*   **Why:** Shipping dead code to production increases bundle size, creates confusion for future developers, and maintains unnecessary attack surfaces.

## 4. LLM Timeout & Background Jobs
*   **Current State:** Generative tasks (like Pitch Evolution or Pulse Plan generation) run synchronously during an API request.
*   **Production Requirement:** Implement a background task queue (e.g., Inngest, Upstash, or Next.js background workers) for LLM generation.
*   **Why:** Vercel serverless functions typically timeout after 10–15 seconds on the hobby tier (and 60s on pro). If the Agent Development Kit (ADK) takes 20 seconds to process a massive debrief context, the API will crash before returning data to the UI.

## 5. Environment Variables & Telemetry
*   **Current State:** Secrets are currently managed locally, and errors are dumped to the terminal via `console.error`.
*   **Production Requirement:** 
    1. Lock down `.env` configurations for LLM endpoints and future database URLs.
    2. Integrate a production monitoring tool (like Sentry or Datadog).
*   **Why:** We need to silently capture backend mathematical engine failures and LLM hallucination drops without leaking trace details or breaking the sleek SaaS UI the user is interacting with.
