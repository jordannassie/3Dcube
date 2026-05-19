# TOWER Umar Strategy Lab

> **Private local research platform** for backtesting and optimizing the
> Umar / Level 2 order-flow strategy on NQ MBO futures data.

**Current status: Phase 1 — Foundation complete.**  
No real MBO data processing or strategy logic yet. The Next.js dashboard
and Python engine scaffold are running.

---

## What This Is

TOWER Umar Strategy Lab is a fully local, offline-capable research tool built for:

- Replaying Databento NQ MBO historical order-book data from a local SSD
- Implementing the exact Umar / Level 2 order-flow strategy rules
- Running backtest simulations with realistic fill modelling
- Sweeping parameters + running Monte Carlo validation
- Visualizing optimization results in an interactive 3D Strategy Simulation Cube

All data and computation stays on your machine.

---

## Folder Structure

```
tower-umar-strategy-lab/
├── README.md
├── .gitignore
├── .env.example          ← copy to .env, set your paths
├── package.json          ← npm workspaces root
│
├── apps/
│   └── web/              ← Next.js 16 local dashboard
│       ├── src/
│       │   ├── app/      ← App Router pages & layout
│       │   └── components/
│       ├── package.json
│       ├── next.config.ts
│       └── tsconfig.json
│
├── engine/               ← Python backtesting engine
│   ├── src/
│   │   └── tower_umar_engine/
│   │       ├── __init__.py
│   │       ├── config.py
│   │       └── health.py
│   ├── scripts/
│   │   └── run_health_check.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
│
└── docs/
    ├── architecture.md
    ├── product-vision.md
    └── roadmap.md
```

---

## Prerequisites

- Node.js ≥ 20
- Python ≥ 3.11
- npm ≥ 10

---

## Running the Next.js Dashboard Locally

```bash
# 1. Install dependencies
cd apps/web
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

Or from the repo root using npm workspaces:

```bash
npm install
npm run dev
```

---

## Running the Python Health Check

No installation needed for Phase 1:

```bash
# From the repo root
python engine/scripts/run_health_check.py
```

Expected output:

```
  TOWER Umar Engine — Health Check
  ────────────────────────────────────────

  Engine
  ✓  TOWER Umar Engine: OK  (v0.1.0)

  MBO Data Directory (TOWER_MBO_DATA_DIR)
  ⚠  Not configured — set TOWER_MBO_DATA_DIR in .env

  Databento API Key (optional)
  ⚠  Not set — only needed for live catalog queries (Phase 2+)
```

To configure the MBO data directory:

```bash
cp .env.example .env
# Edit .env:
#   TOWER_MBO_DATA_DIR=/Volumes/YourSSD/nq-mbo-data
```

---

## Environment Variables

See `.env.example` for all variables:

| Variable              | Description                                       |
|-----------------------|---------------------------------------------------|
| `TOWER_MBO_DATA_DIR`  | Absolute path to local SSD folder with .dbn files |
| `DATABENTO_API_KEY`   | Optional — for live Databento catalog queries     |

---

## Build Roadmap

| Phase | Name                        | Status      |
|-------|-----------------------------|-------------|
| 1     | Engine Foundation           | ✅ Complete |
| 2     | Databento MBO Loader        | Upcoming    |
| 3     | Exact Umar Strategy Port    | Upcoming    |
| 4     | Backtest Simulator          | Upcoming    |
| 5     | Optimizer + Monte Carlo     | Upcoming    |
| 6     | Strategy Cube Replay UI     | Upcoming    |

Full details in [`docs/roadmap.md`](docs/roadmap.md).

---

## Docs

- [`docs/architecture.md`](docs/architecture.md) — system design and data flow
- [`docs/product-vision.md`](docs/product-vision.md) — the 3D Strategy Cube vision
- [`docs/roadmap.md`](docs/roadmap.md) — step-by-step build plan

---

> ⚠️ **Private research tool only.** Not for production trading. Not a licensed
> financial product. All backtest results are hypothetical.
