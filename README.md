# Helix — AI Conversational Data Analyst

> **Live demo:** _coming soon_ &nbsp;|&nbsp; **Loom walkthrough:** _coming soon_

A Claude-style streaming analytics assistant. Ask a question in plain English, watch the agent reason through it in real time, and get a prose insight + interactive charts inline — all in a persistent conversation thread. Drop in your own CSV or XLSX and it adapts on the fly.

---

## What it does

- **Natural-language queries** over a built-in 200k-row sales dataset (orders / products / customers / sales reps, 3 years of data across 5 regions)
- **Bring-your-own-data** — drag-drop any CSV or XLSX; the backend ingests it into DuckDB, introspects its schema, and generates three starter questions using the LLM
- **Streaming reasoning trace** — the agent classifies intent, generates SQL, executes it, and streams a prose insight token-by-token before the charts appear
- **Persistent conversation threads** — follow-up questions maintain context; threads are saved, renameable, and deleteable
- **5 chart types** — bar, line, area, pie, stat card — all schema-driven (the LLM outputs a validated spec; the frontend owns the rendering)

---

## The interesting engineering

### Streaming architecture

The backend streams over SSE using FastAPI's `StreamingResponse`. The frontend consumes it via `fetch` + `ReadableStream` (not `EventSource`) — because `EventSource` is GET-only and can't carry a request body. This is the same approach used by the OpenAI and Anthropic streaming SDKs.

Events emitted in order:

```
meta           → { conversation_id, is_followup }
reasoning      → { step, label, detail }   (one per agent step: "route", "generate_sql", etc.)
summary_token  → { token }                 (streamed prose, one token per frame)
dashboard      → { widgets: [...] }        (validated widget specs only — no summary text)
done           → {}
error          → { message }               (in-band; HTTP status is already 200 by this point)
```

The `summary_token` / `dashboard` split is deliberate: streamed prose (free-text, `stream=True`) is separated from the widget spec (structured JSON-mode output, Pydantic-validated). Mixing them in one LLM call forces you to buffer everything before streaming, losing the token-by-token reveal.

**Error handling after 200:** once `StreamingResponse` flushes the first byte, the HTTP status is committed. A Python exception inside the generator can't become a 4xx. The orchestrator wraps the entire generator body in `try/except` and emits an `error` SSE event — the frontend renders it in-turn instead of silently hanging.

### Agent pipeline

```
message + history + schema
        │
        ▼
  ┌─── ROUTER ──────────────────────────────────────────────┐
  │  (intent classification, JSON-mode, schema-grounded)    │
  └─┬──────────────────────────────────────────────────────┘
    │
    ├── greeting / about_data / clarification / out_of_scope
    │       └─→ text reply  (message SSE event)
    │
    └── data_question
            └─→ SQL GEN → SAFETY GUARD → DuckDB
                    │
                    ├── DuckDB error → REPAIR (re-feed error to sql_gen, up to 3×)
                    │
                    └── 0 rows → text reply
                    non-empty → A2UI SCHEMA → dashboard SSE event
```

This is a **Tier-2 agent design** (router + conditional orchestration). A Tier-1 design runs every input through the full SQL pipeline — so "hello" hallucinates a chart. A Tier-3 design uses a tool-calling loop (LangGraph, etc.) where the LLM decides the next step — more powerful but non-deterministic step order breaks the streaming reasoning UI. Tier 2 is the right tradeoff: predictable, cheap, and the streaming trace remains coherent.

**Schema grounding:** before classification and SQL generation, the orchestrator builds a schema card — column list, distinct categorical values (region, status, category), and a few-shot Q→SQL pairs. This dramatically reduces hallucination on filter values.

**SQL safety guard:** `sql_safety.py` allowlists `SELECT` and `WITH`/CTEs, rejects multi-statement input, blocks DML/DDL keywords, enforces a hard `LIMIT`, and applies a query timeout. A `QueryExecutionError` is raised on violation and emitted as an in-band `error` event.

### Bring-your-own-data

Two DuckDB files, deliberately separate:

- `analytics.duckdb` — the built-in demo warehouse. Opened **read-only**. A DB viewer can stay open alongside the app because a read-only connection never holds a write lock.
- `datasets.duckdb` — user uploads. Opened read-write at ingest, read-only at query. Isolated so an upload never locks out a demo query.

Schema grounding is **dependency-inverted**: the router and SQL generator don't import a global `get_schema_card()`. The orchestrator resolves the dataset (demo or upload), builds the right schema card, and injects it. This makes the agent dataset-agnostic and unit-testable.

### Frontend craft

**Stick-to-bottom + jump pill:** the scroll container uses a zero-height sentinel element observed by `IntersectionObserver`. When the sentinel is visible, the container is at the bottom — auto-scroll follows. When the user scrolls up, the sentinel leaves the viewport and auto-scroll releases. Watching the last _turn_ element was a bug: a tall turn stays partially visible for a long time, so the pill never fired. The sentinel is height-independent.

**Token-by-token streaming:** `summary_token` events patch a `pendingInsight` string in the Zustand store. The `AssistantTurn` component renders it live. On `done`, the final insight is committed. Charts mount independently when `dashboard` arrives — neither blocks the other.

**AbortController:** the streaming fetch is tied to an `AbortController`. Stop calls `controller.abort()`, which closes the reader and the backend connection. Retry re-POSTs the same turn.

**Accessibility:** `role="log" aria-live="polite"` on the chat thread announces new turns to screen readers. A `LiveAnnouncer` component with `role="status" aria-live="polite"` announces the completed insight sentence when streaming ends — without announcing every token (which would be noise).

### Testing

Three layers, each testing a different scope:

| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | Vitest | SSE frame parser (raw `text/event-stream` string → `{event, data}`), store reducer (turn append/patch across a full streaming sequence), `useStickToBottom` state transitions |
| Component | Vitest + RTL | `AssistantTurn` for each widget union type; `Composer` Enter/Shift+Enter/streaming-disabled; `WidgetGrid` dispatches to the right Recharts component |
| E2E | Playwright | Golden path (question → reasoning → insight → chart), CSV upload → schema preview → chart, follow-up appends turn, network error surfaces in-turn, conversation rename |

**Why Vitest over Jest:** Vitest shares Vite's transform pipeline — path aliases, env vars (`import.meta.env.*`), and plugins work identically in tests and in production. Jest requires a separate Babel transform to handle ESM and can't read `import.meta.env` without polyfills.

**Playwright config:** `webServer` starts the Vite dev server automatically. Tests assert on structure (chart rendered, paragraph filled) not exact LLM wording. `page.route()` intercepts and aborts the query endpoint to test the error path without needing a real API failure.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts 3 (lazy-loaded via `React.lazy`, code-split from main bundle) |
| State | Zustand 5 |
| Virtualization | TanStack Virtual 3 (conversation list) |
| Backend framework | FastAPI + Uvicorn |
| Analytics DB | DuckDB (OLAP — columnar, optimised for `GROUP BY` aggregations) |
| App state DB | SQLite via Python `sqlite3` (OLTP — conversations + turns) |
| Schema validation | Pydantic v2 |
| LLM provider | OpenRouter (model-agnostic; defaults to Qwen / Gemini Flash) |
| Testing (FE) | Vitest 3 + React Testing Library + Playwright |
| Testing (BE) | pytest + httpx TestClient |

---

## Running locally

**Prerequisites:** Node 20+, Python 3.12+, [uv](https://github.com/astral-sh/uv)

### Backend

```bash
cd analytics-dashboard-api

uv sync

cp .env.example .env
# → set OPENROUTER_API_KEY

uv run uvicorn app.main:app --reload --port 8001
```

The demo warehouse (`db/analytics.duckdb`) is checked in — no seeding step needed.

### Frontend

```bash
cd analytics-dashboard-ui

npm install

cp .env.example .env.local
# → VITE_API_BASE_URL=http://localhost:8001/api/v1

npm run dev    # → http://localhost:5173
```

### Tests

```bash
# Frontend — unit + component
cd analytics-dashboard-ui && npm test

# Frontend — E2E (backend must be running on :8001)
npx playwright test
npx playwright test --ui      # visual runner, great for writing new tests

# Backend
cd analytics-dashboard-api && pytest tests/ -v
```

---

## Deployment

**Frontend → Vercel**

Connect `analytics-dashboard-ui/`. Set one env var:
```
VITE_API_BASE_URL=https://<your-railway-service>.up.railway.app/api/v1
```
`vercel.json` with the SPA rewrite rule is already included.

**Backend → Railway**

1. Connect `analytics-dashboard-api/`. Railway picks up `railway.toml` (Dockerfile builder).
2. Add a **Volume** mounted at `/data`.
3. Set env vars:
   ```
   OPENROUTER_API_KEY=sk-or-...
   CORS_ORIGINS=https://<your-vercel-app>.vercel.app
   DATA_DIR=/data
   ```

On first boot, `start.sh` copies the pre-seeded `analytics.duckdb` from the image to the volume. Subsequent deploys find it already there. User uploads (`datasets.duckdb`) and conversation history (`app_state.db`) persist on the volume across redeploys.

---

## Architecture

```
Browser  (React + Vite → Vercel)
  │
  │  POST /api/v1/query  { question, conversation_id?, dataset_id? }
  │  ←── SSE stream  meta → reasoning × N → summary_token × N → dashboard → done
  │
  │  REST  GET/PATCH/DELETE /api/v1/conversations
  │        POST/GET/DELETE  /api/v1/datasets
  │
  ▼
FastAPI  (Railway, Dockerized)
  ├── Router           classify intent  (JSON-mode, schema-grounded)
  ├── SQL Gen          NLQ → SQL  (LLM, schema-grounded, self-repair loop)
  ├── Safety Guard     allowlist SELECT/WITH, block DML/DDL, LIMIT + timeout
  ├── DuckDB           execute read-only query  (demo warehouse or uploaded dataset)
  ├── A2UI Schema      rows → widget specs  (JSON-mode, Pydantic-validated)
  ├── Stream Insight   specs → prose insight  (streaming, token-by-token)
  ├── app_state.db     conversations + turns  (SQLite, OLTP)
  └── datasets.duckdb  user uploads  (DuckDB, writable)
        │
        ▼
  OpenRouter  →  Qwen / Gemini Flash / Kimi K2  (swappable via model string)
```
