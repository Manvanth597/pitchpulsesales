# Cloud Run Production Deployment Architecture

## Executive Summary
PitchPulseSales is transitioning from a local MVP into an enterprise-ready Multi-Agent Revenue Intelligence Platform. This document outlines the target production architecture, leveraging Google Cloud Run for serverless container deployment, Vertex AI for the Gemini intelligence layer, and Cloud Firestore for persistent memory and scalable data management.

## Architecture Components

### Users
The platform serves three primary user personas:
- **Sales Reps**: Utilizing tactical tools for deal execution.
- **Managers**: Focusing on team coaching and forecasting.
- **Executives**: Driving revenue strategy and overseeing pipelines.
Users interface with the platform via the **PitchPulseSales Web Application** (Next.js Frontend).

### Google Cloud Services
- **Cloud Run**: Serverless Application Runtime hosting the Next.js frontend, API Layer, Workspace Orchestrator, and Multi-Agent Runtime.
- **Vertex AI**: Gemini LLM integration serving as the cognitive engine for all intelligent reasoning.
- **Cloud Firestore**: Highly scalable NoSQL persistent memory (future state).
- **Cloud Logging & Monitoring**: For system-wide observability.

## Agent Runtime
The Multi-Agent Runtime comprises specialized agents working in concert to deliver actionable intelligence.

**Agents:**
- Pitch Generation Agent
- Pulse Planning Agent
- Learning Agent
- Pitch Evolution Agent
- Strategy Agent
- Forecast Agent
- Revenue Intelligence Agent
- Coaching Agent
- Workspace Orchestrator

Agents collaborate through:
- **Shared Memory**
- **Business Events**
- **Agent Registry** (Agent Discovery and Event Exchange)

**Agent Communication Examples:**
- `Learning Agent` → `Strategy Agent`
- `Strategy Agent` → `Forecast Agent`
- `Forecast Agent` → `Revenue Intelligence Agent`
- `Revenue Intelligence Agent` → `Executive Workspace`
- `Learning Agent` → `Coaching Agent`

## Memory Architecture

**Current State:**
- Local filesystem (`db.json`) for MVP persistence.

**Future State (Cloud Firestore):**
Stores the complete state and memory footprint of the system:
- Company Profiles
- Pitch Versions
- Pulse Plans
- Debriefs
- Objection History
- Confidence Trends
- Evolution History
- Forecast Data
- Revenue Intelligence
- Coaching Insights
- Agent Recommendations

## Workspace Architecture
The Workspace Delivery layer tailors platform outputs to specific user roles.

**Sales Workspace**
- Outputs: Deal Strategy, Next Best Actions, Risk Monitoring

**Manager Workspace**
- Outputs: Rep Coaching, Learning Intelligence, Forecast Monitoring

**Executive Workspace**
- Outputs: Revenue Intelligence, Growth Opportunities, Executive Visibility, Pipeline Forecasting

## Current MVP State
```text
Current:
Next.js
Vertex AI
Local db.json

Future:
Cloud Run
Vertex AI
Firestore
Cloud Monitoring
```

## Production Migration Path
The transition to production follows a structured path to ensure stability and continuity of intelligence flows.

```text
Local Development
→ Cloud Run
→ Firestore
→ Enterprise Scale
```

1. **Local Development (Current)**: Validating agent behaviors, Next.js UI, and API orchestration using local `db.json` and Vertex AI.
2. **→ Cloud Run**: Containerizing the application. PitchPulseSales is deployed to Google Cloud Run to provide a serverless, horizontally scalable runtime environment.
3. **→ Firestore**: Migrating persistent data from `db.json` into Google Cloud Firestore. This provides durable, globally distributed memory for agent coordination, history, and user profiles.
4. **→ Enterprise Scale**: Enabling Cloud Run Auto Scaling, multiple instances, global load balancing, comprehensive observability (Cloud Logging/Monitoring), and audit trails for production availability.

## Future Scaling & Observability
- **Auto Scaling**: Cloud Run Auto Scaling to dynamically handle unpredictable user loads and asynchronous agent event processing.
- **Global Availability**: Load balancing and multiple instances to serve users securely worldwide.
- **Observability Layer**: 
  - Cloud Logging
  - Cloud Monitoring
  - Audit Trail
  - Agent Activity Logs
  - System Metrics
