# PitchPulseSales

Gemini-powered Multi-Agent Revenue Intelligence Operating System.

## Overview

PitchPulseSales is an intelligent operating system designed for sales teams to capture, analyze, and optimize their interactions with prospects. It utilizes the power of Gemini to provide context-aware insights, evolve sales pitches, and surface team-wide patterns.

## Problem

Sales teams often struggle to:
- Maintain consistent messaging across reps.
- Extract actionable insights from daily call debriefs.
- Quickly adapt their approach based on market feedback and new objections.
- Share knowledge effectively between team members and management.

## Solution

PitchPulseSales solves these challenges by acting as a central intelligence hub. It features:
- **Dynamic Pitch Generation:** Creates tailored pitches based on client context and active sales skills.
- **Automated Debrief Analysis:** Processes post-call notes to identify sentiment, objections, and areas for improvement.
- **Continuous Learning:** Evolves pitches based on debrief outcomes, suggesting specific tactical adjustments.
- **Multi-Agent Network:** A collaborative system of specialized AI agents that synthesize insights for different roles (Reps, Managers, Executives).

## Architecture

![Architecture Diagram](public/architecture/cloud-run-deployment.mmd)

The application is built on Next.js and deployed using Google Cloud Run, leveraging Vertex AI (Gemini 2.5 Flash) for core intelligence. 

## Multi-Agent Network

PitchPulseSales utilizes a network of specialized agents:
- **Sales Rep Agents:** Focus on immediate tactical execution, pitch refinement, and daily coaching.
- **Team Manager Agents:** Aggregate data across reps to identify systemic issues and team-wide coaching needs.
- **Executive Agents:** Provide high-level strategic summaries and forecasting insights.

## Prospect Knowledge Base

The system maintains a comprehensive memory for each client, tracking:
- Initial and evolving context.
- Historical debriefs and outcomes.
- Evolving pitch versions and the rationale behind each change.
- Generated Pulse Plans for upcoming interactions.

## Workspaces

Dedicated workspaces for different roles:
- **Sales Rep Workspace:** Individual dashboard, active deals, personalized coaching, and action items.
- **Team Manager Workspace:** Team performance rollups, pattern recognition, and coaching interventions.
- **Executive Workspace:** High-level summaries, strategic insights, and pipeline forecasting.

## Technology Stack

- **Frontend/Backend:** Next.js (React, TypeScript)
- **Styling:** Tailwind CSS, Radix UI
- **AI/ML:** Google Vertex AI (Gemini 2.5 Flash)
- **Deployment:** Google Cloud Run (Target Architecture)

## Demo Video

[Watch the Demo on YouTube](https://youtu.be/sft2CbMcejs?si=9CSWogwZAend3-Lc)

## Local Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/Manvanth597/pitchpulsesales.git
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Variables:**
## Environment Setup

This project requires a Google Gemini API key to enable AI-powered pitch generation, forecasting, coaching recommendations, and revenue intelligence features.

### 1. Create a Gemini API Key

Visit Google AI Studio and generate an API key.

### 2. Create a Local Environment File

Create a `.env.local` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

### Deploying to Vercel

Add the following environment variable in the Vercel Dashboard:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Navigate to:

Project Settings → Environment Variables

Then redeploy the application.

### Security Notice

Do not commit API keys, service account credentials, or `.env` files to GitHub. The repository includes `.env.example` as a template only.

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser:**
   Navigate to \`http://localhost:3000\`

## Future Roadmap

- Integration with popular CRMs (Salesforce, HubSpot).
- Real-time call transcription and analysis.
- Advanced predictive forecasting models.
- Enhanced agent-to-agent communication visualizations.
