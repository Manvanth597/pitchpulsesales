# Walkthrough: Sales Skill System Integration

We have successfully integrated the **Sales Skill System** into both the Next.js API content generation routes and the Google ADK Agent reasoning flow. Relevant sales guides (such as Discovery, Qualification, Negotiations, and Pricing Objections) are now dynamically loaded and injected into Gemini prompts before reasoning begins, influencing all outputs.

---

## 1. Core Architecture Updates

### A. Stage Normalization
To bridge database sales stages with the registry categories, we updated `loadSkills` inside [load-skills.ts](file:///c:/Users/vmman/pitchpulsesales/src/agent/tools/load-skills.ts) to normalize the inputs:
- `awareness` / `discovery` $\rightarrow$ `discovery` (matches *Discovery Calls* skill)
- `interest` / `qualification` $\rightarrow$ `qualification` (matches *Qualification* skill)
- `desire` / `proposal` $\rightarrow$ `proposal` (matches *Proposal* skill)
- `action` / `negotiation` $\rightarrow$ `negotiation` (matches *Negotiation* skill)

### B. Dynamic Prompt Structuring
All updated generation flows now restructure the Gemini prompts strictly around the required architecture:
```text
==============================
ACTIVE SALES SKILLS
==============================
[Dynamic Markdown Guide Content]

==============================
CLIENT MEMORY
==============================
[Client pipeline state, context, objection history, and debriefs]

==============================
TASK
==============================
[Structured task instructions and JSON schema requirements]
```

---

## 2. Integrated Components Summary

| Component Path | Integration Detail |
| :--- | :--- |
| [load-skills.ts](file:///c:/Users/vmman/pitchpulsesales/src/agent/tools/load-skills.ts) | Normalizes database stages to match skill stages and objection triggers. |
| [generate-pulse-plan (API)](file:///c:/Users/vmman/pitchpulsesales/src/app/api/generate-pulse-plan/route.ts) | Loads skill context dynamically and structures the Gemini 2.5 prompt. |
| [improve-pitch (API)](file:///c:/Users/vmman/pitchpulsesales/src/app/api/improve-pitch/route.ts) | Retreives latest transaction objection to dynamically inject skills. |
| [generate-improvement (API)](file:///c:/Users/vmman/pitchpulsesales/src/app/api/generate-improvement/route.ts) | Employs active sales skills to iteratively optimize the sales pitch. |
| [generate-pulse-plan (ADK Tool)](file:///c:/Users/vmman/pitchpulsesales/src/agent/tools/generate-pulse-plan.ts) | Feeds active skills into `instructionsForAgent` so the ADK agent receives it. |
| [load-client-memory (ADK Tool)](file:///c:/Users/vmman/pitchpulsesales/src/agent/tools/load-client-memory.ts) | Returns `activeSalesSkills` alongside historical data when memory is loaded. |
| [root-agent.ts](file:///c:/Users/vmman/pitchpulsesales/src/agent/root-agent.ts) | Directs the agent to prioritize and apply active skills during chats. |

---

## 3. Verification & Validation Results

### A. Unit Tests (Test A, B, and C)
We created and ran a verification script inside the deep brain workspace to execute the standard matching criteria:

```bash
npx tsx C:\Users\vmman\.gemini\antigravity-ide\brain\edb8d4d4-0808-46b3-9623-6da35a0ae0c7\scratch\verify-skills.ts
```

#### Test Execution Console Log:
```text
=== RUNNING SKILLS SYSTEM VALIDATION ===

[Test A] Input: { stage: 'discovery', objection: 'pricing too expensive' }
Matched Skills: [ 'Pricing Objection', 'Discovery Calls' ]
Status: PASSED ✅

[Test B] Input: { stage: 'qualification', objection: '' }
Matched Skills: [ 'Qualification' ]
Status: PASSED ✅

[Test C] Input: { stage: 'negotiation', objection: 'budget constraints' }
Matched Skills: [ 'Pricing Objection', 'Negotiation' ]
Status: PASSED ✅

========================================
ALL TESTS PASSED SUCCESSFULLY! 🌟
```

### B. TypeScript Compilation Check
We verified the complete codebase using the TypeScript compiler:
```bash
npx tsc --noEmit
```
- **Result**: `0` errors! Type integrity and module imports are fully intact and compiled successfully.
