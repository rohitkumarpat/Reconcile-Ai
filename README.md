# ReconcileAI

**AI-powered personal finance reconciliation agent.** Upload bank/UPI/credit-card statements and receipts — ReconcileAI extracts transactions, categorizes spending, detects duplicates, forgotten subscriptions, and unusual spending, then drafts cancellation/negotiation messages for human review and approval.

---

## Agentic Workflow

```
Detect → Analyze → Decide → Recommend → Human Approval → Act
```

No cancellation or negotiation message is ever sent automatically. Every AI-generated draft requires explicit user approval — approving opens a pre-filled Gmail compose window so the human, not the AI, presses send.

---

## Architecture

```
┌─────────────────────┐
│   React Frontend     │   reconcile-ai-frontend
│  (TypeScript, Vite)  │   Deployed on Vercel
│  Tailwind, shadcn/ui  │
└──────────┬───────────┘
           │  HTTPS (Clerk-authenticated REST calls)
           ▼
┌─────────────────────┐
│  Node.js / Express    │   reconcile-ai-backend
│    TypeScript API     │   Deployed on Render
│  Prisma ORM, Zod       │
└──────────┬───────────┘
           │
   ┌───────┼────────────────┬─────────────────┐
   ▼       ▼                ▼                 ▼
┌──────┐ ┌───────────┐ ┌───────────────┐ ┌────────────┐
│ Neon  │ │ Cloudinary │ │ Python/FastAPI │ │   Clerk     │
│Postgres│ │ (file store)│ │  LangGraph Agent│ │(auth)      │
└──────┘ └───────────┘ └───────┬───────┘ └────────────┘
                                │
                                ▼
                          Gemini API
                    (extraction, categorization,
                     detection explanations,
                     recommendation + draft generation)
```

**Three independently deployable services:**

| Repo | Stack | Responsibility |
|---|---|---|
| `reconcile-ai-frontend` | React, TypeScript, Vite, Tailwind, Clerk React SDK | UI, auth flows, dashboards, approval interface |
| `reconcile-ai-backend` | Node.js, Express, TypeScript, Prisma, Zod | Auth verification, file uploads, OCR/extraction orchestration, database, calls the agent service |
| `reconcile-ai-agent` | Python, FastAPI, LangGraph, LangChain | Categorization, duplicate/subscription/anomaly detection, recommendation + draft generation |

The Node backend is the **single source of truth for the database** — the Python agent is stateless per request and never touches Postgres directly, keeping auth and data isolation centralized in one place.

---

## LangGraph Agent Design

```
                START
                  │
                  ▼
            categorize (LLM)
                  │
                  ▼
        analyze (deterministic)
                  │
                  ▼
   duplicate_detection (deterministic)
                  │
                  ▼
  subscription_detection (deterministic)
                  │
                  ▼
    anomaly_detection (deterministic)
                  │
        ┌─────────┴─────────┐
        │ conditional edge   │
        ▼                    ▼
  explain (LLM)             END
   (only if anomalies
      were found)
        │
        ▼
       END
```

A second graph call (`/agent/recommend`) takes detected subscriptions/anomalies and runs:

```
recommend_node (LLM) → draft_node (LLM) → returned to Node for storage
```

**Design principle:** LLM calls are used only where reasoning or natural language is genuinely required (categorization, explanations, recommendations, draft wording). Everything decidable by plain code — duplicate matching, recurrence-interval math, spending-average thresholds — is deterministic Python, not an LLM judgment call. This keeps the agent's core decisions auditable and cheap to run at scale.

**Conditional routing:** the `explain` node only fires when anomalies exist, avoiding unnecessary LLM calls on clean data — a concrete example of the graph branching rather than running linearly end to end.

---

## Data Model (Prisma / PostgreSQL)

```
User
 ├── FinancialDocument (uploaded statements/receipts, Cloudinary URL + status)
 │     └── Transaction (extracted, categorized)
 ├── Transaction
 │     └── Anomaly (duplicate / unusual spending / forgotten subscription)
 ├── Subscription (detected recurring charges)
 ├── AgentRun (log of each agent execution + summary)
 ├── Recommendation (agent's suggested action, linked to an Anomaly or Subscription)
 └── Action (draft text, approval status: PENDING / APPROVED / REJECTED / EDITED)
```

Every table is scoped by `userId`, and every query enforces ownership at the service layer (never trusting a client-supplied ID) — verified by deriving `userId` exclusively from the Clerk-authenticated request, not from request bodies or params.

---

## Core Features

- **Document ingestion:** PDF, CSV, and image (JPG/PNG) upload with server-side MIME/size validation, stored via Cloudinary (Postgres holds metadata only, never binary files)
- **Extraction:** deterministic text parsing (PDF/CSV) or OCR (Tesseract, for receipts) feeding into Gemini for structured transaction extraction, validated with Zod before it ever reaches the database
- **Categorization:** LLM-assigned spending categories with confidence scores
- **Duplicate detection:** merchant + amount + date-proximity matching
- **Subscription detection:** recurrence-interval analysis (weekly/monthly/yearly) across a user's full transaction history
- **Anomaly detection:** category-average threshold flagging (2× a user's typical spend in that category), with LLM-generated plain-English explanations and computed financial impact (× above category average)
- **Human-in-the-loop actions:** agent drafts cancellation/negotiation messages; user can Approve (opens pre-filled Gmail compose), Edit, or Reject — no message is ever sent by the system itself
- **Dashboard:** month-scoped spending analytics, category breakdown chart, recent transactions, subscription cost, and potential savings (calculated from subscriptions actually flagged for cancellation, not a flat estimate)

---

## Setup

Each repo has its own `.env.example`. All three require:

- A [Neon](https://neon.tech) PostgreSQL database (`DATABASE_URL`, backend only)
- A [Clerk](https://clerk.com) application (publishable key → frontend, secret key → backend)
- A [Google AI Studio](https://aistudio.google.com) Gemini API key (backend + agent)
- A [Cloudinary](https://cloudinary.com) account (backend only)
- A shared internal secret (`NODE_BACKEND_SECRET`) known only to the backend and agent service, authenticating service-to-service calls

**reconcile-ai-backend**
```bash
npm install
npx prisma migrate dev
npm run dev
```

**reconcile-ai-agent**
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**reconcile-ai-frontend**
```bash
npm install
npm run dev
```

---

## Security

- Every route requires a verified Clerk session; `userId` is always derived server-side, never trusted from the client
- File uploads: server-enforced MIME whitelist, 10MB limit, memory-buffered (never written to disk)
- Service-to-service calls (Node → Python) authenticated via shared secret header, since the agent isn't Clerk-aware
- CORS locked to the deployed frontend origin in production, never `*`
- Rate limiting on upload and agent-run endpoints
- No financial data (amounts, merchant names, transaction detail) written to server logs

---


