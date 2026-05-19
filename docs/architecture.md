# Architecture — TOWER Umar Strategy Lab

## Overview

TOWER is a **fully local** research platform. No data leaves your machine.
There is no cloud backend, no SaaS database, and no external API required
for core backtesting operations.

```
Local SSD (MBO files)
        │
        ▼
 ┌─────────────────────────────────────────────┐
 │         Python Engine  (engine/)            │
 │                                             │
 │  config.py  →  loader.py  →  strategy.py   │
 │                     │                       │
 │              simulator.py                   │
 │                     │                       │
 │    optimizer.py ────┘                       │
 │                     │                       │
 │         results/ (JSON / Parquet)           │
 └──────────────────────┬──────────────────────┘
                        │
                        ▼
 ┌─────────────────────────────────────────────┐
 │     Next.js Dashboard  (apps/web/)          │
 │                                             │
 │   localhost:3000                            │
 │   · Run status + logs                       │
 │   · Equity curves                           │
 │   · Trade log explorer                      │
 │   · 3D Strategy Cube Replay                 │
 └─────────────────────────────────────────────┘
```

---

## Why Raw MBO Data Stays on SSD

- **Size**: Databento NQ MBO files are large (gigabytes per session). Git and
  cloud storage are inappropriate.
- **Speed**: The Python engine reads files directly from NVMe — no network
  latency, no rate limits.
- **Privacy**: Your proprietary data and strategy parameters never touch a
  third-party server.
- **Reproducibility**: The exact byte-identical raw files are always available
  for re-runs.

The `.gitignore` excludes `*.dbn`, `*.dbn.zst`, and `*.mbo` globally.

---

## Component Responsibilities

### `engine/` — Python Backtesting Engine

| Module             | Responsibility                                                                 |
|--------------------|--------------------------------------------------------------------------------|
| `config.py`        | Reads env-vars: `TOWER_MBO_DATA_DIR`, `DATABENTO_API_KEY`                     |
| `health.py`        | Validates that the engine can boot and config is sane                          |
| `loader.py` *(Ph2)*   | Reads Databento `.dbn` files, normalizes MBO order events                  |
| `strategy.py` *(Ph3)* | Implements exact Umar / Level 2 entry and exit rules                       |
| `simulator.py` *(Ph4)*| Event-driven replay, realistic fill model, commission, equity curve        |
| `optimizer.py` *(Ph5)*| Grid / Bayesian sweep over strategy parameters; Monte Carlo permutation    |

### `apps/web/` — Next.js Local Dashboard

| Layer              | Responsibility                                                                 |
|--------------------|--------------------------------------------------------------------------------|
| `app/page.tsx`     | Main dashboard: status, cube placeholder, roadmap                              |
| `components/`      | Reusable: `StatusCard`, `CubePlaceholder`, `RoadmapSection`, `TopNav`          |
| `lib/` *(future)*  | Data-fetching helpers: read engine result JSON, websocket for live logs        |

---

## Data Flow (future phases)

```
Phase 2:  SSD/.dbn  ──► loader.py  ──►  order_book_snapshots (in memory)
Phase 3:  snapshots ──► strategy.py ──►  signals[]
Phase 4:  signals   ──► simulator.py ──► TradeLog, EquityCurve
Phase 5:  params[]  ──► optimizer.py ──► OptimizationReport
Phase 6:  report    ──► Next.js Cube ──► 3D interactive replay
```

---

## Technology Choices

| Layer          | Technology              | Reason                                              |
|----------------|-------------------------|-----------------------------------------------------|
| Dashboard      | Next.js 16 (App Router) | React server components, zero-config local dev      |
| Styling        | Tailwind CSS v4         | Utility-first, no external CSS runtime              |
| Engine         | Python 3.11+            | Best ecosystem for quant data processing            |
| MBO parsing    | `databento` SDK *(Ph2)* | Official SDK, supports `.dbn` format natively       |
| Data frames    | `pandas` + `pyarrow`    | Standard for time-series research                   |
| Optimization   | Custom sweep *(Ph5)*    | Full control; scipy/optuna TBD based on param space |
