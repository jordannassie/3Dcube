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

| Variable                          | Required    | Description                                           |
|-----------------------------------|-------------|-------------------------------------------------------|
| `TOWER_UPLOADED_INDICATORS_DIR`   | Phase 2+    | Local folder for uploaded .cs files (auto-created)    |
| `TOWER_MBO_DATA_DIR`              | Phase 4+    | Local SSD folder containing .dbn MBO files            |
| `DATABENTO_API_KEY`               | Optional    | For live Databento catalog queries                    |
| `TOWER_PYTHON_BIN`                | Optional    | Python binary path (default: `python3`)               |

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

## Build Roadmap

| Phase | Name                           | Status      |
|-------|--------------------------------|-------------|
| 1     | Engine Foundation              | ✅ Done     |
| 2     | .cs Upload + NT8 File Analyzer | ✅ Done     |
| 3     | Strategy Definition Builder    | Next        |
| 4     | Databento MBO Loader           | Upcoming    |
| 5     | Exact Umar Backtest Engine     | Upcoming    |
| 6     | Optimizer                      | Upcoming    |
| 7     | Robustness Validation          | Upcoming    |
| 8     | NT8 Strategy Export            | Upcoming    |
| 9     | 3D Strategy Cube Replay UI     | Upcoming    |

Full details: [`docs/roadmap.md`](docs/roadmap.md)

---

> ⚠️ Private research tool only. Not for production trading. Not a licensed
> financial product. All backtest results are hypothetical.
