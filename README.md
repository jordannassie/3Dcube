# TOWER Umar Strategy Lab

> **Private local research platform** for backtesting and optimizing the
> Umar / Level 2 order-flow strategy on NQ MBO futures data.

**Current status: Phase 2 complete — NT8 file upload and analyzer live.**

---

## What This Does

TOWER accepts NinjaTrader 8 `.cs` files — both **Indicators** and **Strategies** —
analyzes their structure, and will eventually backtest them on real NQ MBO data,
optimize their parameters, and export a hardened `.cs` file back to NT8.

**The full pipeline (when complete):**

```
Upload NT8 .cs  →  Analyze  →  Build Strategy Definition
  →  Load MBO Data  →  Backtest  →  Optimize
  →  Robustness Tests  →  Export optimized .cs  →  Run live in NT8
```

All data and computation runs locally. Nothing leaves your machine.

---

## Folder Structure

```
tower-umar-strategy-lab/
├── .env.example             ← copy to apps/web/.env.local
├── .gitignore
├── README.md
├── netlify.toml
├── package.json             ← npm workspaces root
│
├── apps/web/                ← Next.js 16 local dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       ├── upload/route.ts      ← POST: save + analyze .cs file
│   │   │       └── indicators/route.ts  ← GET: file count + list
│   │   ├── components/
│   │   │   ├── TopNav.tsx
│   │   │   ├── StatusCard.tsx
│   │   │   ├── UploadSection.tsx     ← client: manages upload state
│   │   │   ├── UploadZone.tsx        ← drag-and-drop upload UI
│   │   │   ├── AnalysisReport.tsx    ← displays analysis results
│   │   │   ├── CubePlaceholder.tsx
│   │   │   └── RoadmapSection.tsx
│   │   └── lib/
│   │       └── types.ts              ← shared TypeScript interfaces
│   └── package.json
│
├── engine/                  ← Python backtesting engine
│   ├── src/tower_umar_engine/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── health.py
│   │   └── nt8_file_analyzer.py     ← NT8 .cs structural analyzer
│   ├── scripts/
│   │   ├── run_health_check.py
│   │   └── analyze_nt8_file.py      ← CLI for the analyzer
│   ├── requirements.txt
│   └── pyproject.toml
│
└── docs/
    ├── architecture.md
    ├── product-vision.md
    ├── roadmap.md
    └── nt8-parser-spec.md
```

---

## Prerequisites

- Node.js ≥ 20
- Python ≥ 3.9
- npm ≥ 10

---

## Netlify Deployment — UI Preview Only

The live Netlify site at [3dcube.netlify.app](https://3dcube.netlify.app) is a
**visual / UI preview only**.

- File uploads are **disabled on the hosted preview** — the upload zone shows a
  clear "Local only" state and does not attempt to write to any filesystem.
- Real `.cs` file uploads require running TOWER locally so files can be saved to
  your SSD via `TOWER_UPLOADED_INDICATORS_DIR`.
- No `.cs` files, backtest data, or trading data are ever sent to Netlify or any
  cloud service. The platform is intentionally **local-first**.

The Netlify deploy is triggered automatically on every push to `main` via
`netlify.toml` (base: `apps/web`). The build sets
`NEXT_PUBLIC_RUNTIME_ENV=preview` so the hosted UI correctly identifies itself.

---

## Running the Dashboard Locally

```bash
# 1. Set up your local environment
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local — set at minimum:
#   TOWER_UPLOADED_INDICATORS_DIR=/path/to/your/upload/folder

# 2. Install dependencies
cd apps/web && npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# → http://localhost:3000
```

Or from the repo root using npm workspaces:
```bash
npm install && npm run dev
```

---

## Environment Variables

Copy `.env.example` to `apps/web/.env.local`:

| Variable                          | Required    | Description                                                    |
|-----------------------------------|-------------|----------------------------------------------------------------|
| `TOWER_UPLOADED_INDICATORS_DIR`   | Phase 2+    | **Local** folder for uploaded .cs files (required for uploads) |
| `TOWER_MBO_DATA_DIR`              | Phase 4+    | Local SSD folder containing .dbn MBO files                     |
| `DATABENTO_API_KEY`               | Optional    | For live Databento catalog queries                             |
| `TOWER_PYTHON_BIN`                | Optional    | Python binary path (default: `python3`)                        |

> `NEXT_PUBLIC_RUNTIME_ENV` is set automatically to `preview` by `netlify.toml`
> during Netlify builds. Do **not** set this in `.env.local` — leave it unset
> locally so the app correctly identifies itself as running in local mode.

---

## Running the Python Health Check

```bash
python3 engine/scripts/run_health_check.py
```

---

## Analyzing an NT8 .cs File (CLI)

```bash
# Formatted summary
python3 engine/scripts/analyze_nt8_file.py --file /path/to/TOWERUmar2_BALANCED_SELECTIVE_UPDATE.cs

# JSON output only
python3 engine/scripts/analyze_nt8_file.py --file /path/to/TOWERUmar2_BALANCED_SELECTIVE_UPDATE.cs --json
```

---

## Running the Synthetic Umar Demo (CLI)

```bash
# List all scenarios
python3 engine/scripts/run_synthetic_umar_demo.py --list

# Run one scenario
python3 engine/scripts/run_synthetic_umar_demo.py --scenario bullish_bid_defense_reversal

# Run all six scenarios
python3 engine/scripts/run_synthetic_umar_demo.py --all

# JSON output (used by the Next.js API)
python3 engine/scripts/run_synthetic_umar_demo.py --scenario bearish_ask_defense_reversal --json
```

Available scenarios:
- `bullish_bid_defense_reversal` — expects: BUY_REVERSAL
- `bearish_ask_defense_reversal` — expects: SELL_REVERSAL
- `bullish_continuation_breakout` — expects: BUY_CONTINUATION
- `bearish_continuation_breakdown` — expects: SELL_CONTINUATION
- `neutral_no_trade` — expects: WAIT (no signal)
- `one_signal_per_battle` — expects: ONE_BUY_REVERSAL (no duplicates)

---

## Build Roadmap

| Phase | Name                              | Status      |
|-------|-----------------------------------|-------------|
| 1     | Engine Foundation                 | ✅ Done     |
| 2     | .cs File Analysis + Test Library  | ✅ Done     |
| 3     | Synthetic Umar Demo Simulator     | ✅ Done     |
| 4     | Databento MBO Loader              | Next        |
| 5     | Exact Umar Backtest Engine        | Upcoming    |
| 6     | Optimizer                         | Upcoming    |
| 7     | Robustness Validation             | Upcoming    |
| 8     | NT8 Strategy Export               | Upcoming    |
| 9     | 3D Strategy Simulation Cube       | Upcoming    |

### Phase 3 — Synthetic Umar Demo Simulator

Phase 3 proves the TOWER workflow end-to-end before real MBO data arrives.

The `engine/src/tower_umar_engine/synthetic/` module builds six deterministic NQ scenarios
modelled after Umar/Level-2 order-flow logic:

- **Scenario engine** (`umar_demo_engine.py`): detects bid/ask wall liquidity, tracks
  aggression from synthetic trade flow, and transitions through WAIT → WATCH_BUY/WATCH_SELL
  → signal states (BUY/SELL REVERSAL or CONTINUATION).
- **Six scenarios** (`scenarios.py`): each scenario is a 5–8 step deterministic sequence with
  hand-crafted NQ-like prices, order book snapshots, and trade flow data.
- **CLI** (`run_synthetic_umar_demo.py`): run any or all scenarios from the terminal.
- **API** (`/api/synthetic-umar/run`): bridges the Python engine to the Next.js dashboard.
- **Demo Lab UI**: select a scenario, click Run, see the state timeline, mini chart, and trade plan.

**Important:** Synthetic scenarios do NOT prove profitability. They prove the architecture works.
Real validation begins after Databento MBO data is connected in Phase 4.

Full details: [`docs/roadmap.md`](docs/roadmap.md)

---

> ⚠️ Private research tool only. Not for production trading. Not a licensed
> financial product. All backtest results are hypothetical.
