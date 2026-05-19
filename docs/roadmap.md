# Build Roadmap — TOWER Umar Strategy Lab

## The 8-Step Workflow This Roadmap Delivers

```
1. Upload NT8 .cs strategy file
2. Engine reads the logic and parameters
3. Recreates that logic inside the MBO backtester
4. Tests it across historical NQ MBO data
5. Finds the strongest settings and strongest strategy version
6. Runs robustness tests: walk-forward · sensitivity · Monte Carlo · slippage stress
7. Exports a final optimized NinjaTrader 8 .cs strategy file
8. Copy/paste into NT8 Strategy Editor → run live
```

---

## Phase 1 — Engine Foundation ✅ COMPLETE

**Goal**: Stand up the project structure and confirm the system can boot.

Deliverables:
- [x] Monorepo scaffold (`apps/web/`, `engine/`, `docs/`)
- [x] Next.js 16 App Router dashboard (local, TypeScript, Tailwind v4)
- [x] Premium dark dashboard with 3D cube placeholder
- [x] Python engine package (`tower_umar_engine`)
- [x] `config.py` — reads `TOWER_MBO_DATA_DIR`, `DATABENTO_API_KEY` from `.env`
- [x] `health.py` — prints system status report
- [x] `run_health_check.py` script
- [x] Docs: architecture, product vision, roadmap

---

## Phase 2 — NT8 Strategy Importer  ← NEXT

**Delivers Step 1 + Step 2 of the workflow.**

**Goal**: User uploads any NinjaTrader 8 `.cs` strategy file and the engine
reads its parameters and logic structure — no manual coding required.

### Engine (`nt8_parser.py`):
- [ ] Regex-based parser for NinjaScript C# files
- [ ] Extract all parameter declarations:
  - `[Range(min, max)]` attributes
  - Property names, types, default values
  - `Parameters.Add()` style (legacy NT8)
- [ ] Extract entry/exit call sites:
  - `EnterLong()`, `EnterShort()`, `ExitLong()`, `ExitShort()`
  - `SetStopLoss()`, `SetProfitTarget()`, `SetTrailingStop()`
- [ ] Detect indicator references: `EMA`, `RSI`, `SMA`, `ATR`, `MACD`, `VOL`
- [ ] Extract `OnBarUpdate()` condition blocks (if/else tree)
- [ ] Output: `StrategySpec` dataclass → serializable to JSON
- [ ] CLI: `python engine/scripts/parse_nt8.py --file path/to/strategy.cs`

### Dashboard (`app/upload/`):
- [ ] Drag-and-drop file upload area (accepts `.cs` only)
- [ ] Calls engine parser → displays results:
  - Strategy name and detected NT8 version
  - Table of all extracted parameters with type/default/range
  - Entry conditions summary (human-readable)
  - Indicator list
- [ ] "Proceed to Backtest" button → passes `StrategySpec` to next phase

---

## Phase 3 — Databento MBO Loader

**Delivers Step 3 (data side).**

**Goal**: Read real NQ MBO files from the local SSD into engine-ready structures.

### Engine (`loader.py`):
- [ ] `pip install databento`
- [ ] Open `.dbn` / `.dbn.zst` files via Databento SDK
- [ ] Normalize raw MBO events into typed dataclasses:
  - `OrderBookUpdate(ts, side, price, size, action)`
  - `L2Snapshot(ts, bids[], asks[])`
- [ ] Session-level iterator: yields snapshots in chronological order
- [ ] Stats on load: total events, date range, symbol, session count
- [ ] CLI: `python engine/scripts/load_mbo.py --dir $TOWER_MBO_DATA_DIR`

### Dashboard:
- [ ] Status card: "MBO Dataset: Loaded — N sessions, M events"
- [ ] Session browser: list available data files

---

## Phase 4 — Logic Translator (NinjaScript → Python)

**Delivers Step 3 (logic side).**

**Goal**: Auto-convert the parsed NT8 strategy spec into a runnable Python
strategy class. This is the bridge between Steps 2 and 4 of the workflow.

### Engine (`translator.py`):
- [ ] `BaseStrategy` ABC with `on_snapshot(snapshot) → Signal | None`
- [ ] `translate(spec: StrategySpec) → BaseStrategy subclass`
- [ ] Indicator mapping: NT8 calls → `pandas_ta` equivalents
- [ ] Condition mapping: NT8 comparisons → Python boolean logic
- [ ] Entry/exit mapping: NT8 calls → `Signal(direction, stop, target, trail)`
- [ ] Handles: `CrossAbove`, `CrossBelow`, `Rising`, `Falling` NT8 helpers
- [ ] Output: a Python file that can be inspected, edited, and re-run

### Dashboard:
- [ ] Show translated strategy code (syntax-highlighted)
- [ ] Highlight any conditions that required manual review / approximation

---

## Phase 5 — Backtest Simulator

**Delivers Step 4 of the workflow.**

**Goal**: Replay signals from the translated strategy against MBO data with
realistic execution modelling.

### Engine (`simulator.py`):
- [ ] Event-driven replay engine
- [ ] Feed `L2Snapshot` stream into strategy → collect `Signal[]`
- [ ] Fill model: bid/ask spread, slippage (configurable ticks), partial fills
- [ ] Commission model: NQ futures per-side ($2.09 NinjaTrader default)
- [ ] Position management: one contract at a time (Phase 5), multi-lot later
- [ ] Output: `TradeLog[]`, `EquityCurve`, `BacktestReport` (JSON + Parquet)
- [ ] CLI: `python engine/scripts/run_backtest.py --config backtest.toml`

### Dashboard (`app/backtest/`):
- [ ] Equity curve chart (Chart.js or Recharts)
- [ ] Trade log table (entry/exit time, price, PnL, hold bars)
- [ ] Summary stats: total trades, win rate, profit factor, Sharpe, max DD

---

## Phase 6 — Optimizer + Robustness Suite

**Delivers Step 5 + Step 6 of the workflow.**

**Goal**: Find the strongest parameter set and prove it's a real edge — not curve fitting.

### Engine (`optimizer.py` + `robustness.py`):

**Optimizer:**
- [ ] Grid search across all parameter ranges from `StrategySpec`
- [ ] Score each run: Sharpe ratio, max drawdown, win rate, profit factor
- [ ] Pareto front: identify non-dominated runs (high Sharpe + low DD)
- [ ] Output: ranked `OptimizationReport` → `results/opt_{date}.parquet`

**Robustness:**
- [ ] **Walk-Forward**: rolling 70/30 in-sample/out-of-sample splits, 8+ windows
- [ ] **Monte Carlo**: shuffle entry signal timestamps 1000×, re-run each shuffle,
      compute p-value (fraction of shuffles that beat real result)
- [ ] **Parameter Sensitivity**: perturb each best param ±10%, ±20% — measure
      performance degradation per unit perturbation
- [ ] **Slippage Stress**: run at 0×, 1×, 2×, 3× assumed slippage —
      find the slippage level at which the strategy breaks even

### Dashboard (`app/robustness/`):
- [ ] Optimization heat map (param A vs param B, colored by Sharpe)
- [ ] Walk-forward equity curve (stacked OOS windows)
- [ ] Monte Carlo distribution histogram with real result marker
- [ ] Sensitivity tornado chart
- [ ] Slippage stress table

---

## Phase 7 — NT8 Exporter

**Delivers Step 7 of the workflow.**

**Goal**: Output a valid, optimized NinjaScript `.cs` file ready to compile in NT8.

### Engine (`nt8_exporter.py`):
- [ ] Jinja2 template for NinjaScript strategy boilerplate
- [ ] Inject optimized parameter default values
- [ ] Inject optimization summary comment block at top of file:
  ```
  // TOWER Umar Strategy Lab — Optimized Build
  // Date: 2026-05-18 | Sharpe: 2.41 | Max DD: 4.2%
  // Win Rate: 58% | Walk-Forward: 7/8 windows passed
  // Monte Carlo p-value: 0.003 (edge confirmed)
  ```
- [ ] Preserve all original strategy logic exactly
- [ ] Output: `results/UmarStrategy_optimized_{date}.cs`
- [ ] Validation: check output is syntactically valid NinjaScript (bracket balance, required methods present)

### Dashboard (`app/export/`):
- [ ] One-click download of optimized `.cs`
- [ ] Side-by-side diff: original params vs. optimized params
- [ ] Paste instructions for NT8 Strategy Editor

---

## Phase 8 — 3D Strategy Cube Replay UI

**Delivers the visual layer across the full workflow.**

**Goal**: Make the optimization results explorable in the 3D Strategy Simulation Cube.

### Dashboard:
- [ ] React Three Fiber / Three.js — replace CSS cube with real 3D WebGL scene
- [ ] Load optimization report → one 3D bar per parameter set
  - Bar height = return (%)
  - Bar color = strategy variant / parameter region
  - Chart plane at Y = 0
- [ ] Click any bar → drill into that run's trade log and equity curve
- [ ] Animate: replay trade sequence chronologically through the cube
- [ ] Rotate / zoom / pan controls
- [ ] Export frame as PNG

---

## Summary Table

| Phase | Name                         | Workflow Steps | Status    |
|-------|------------------------------|----------------|-----------|
| 1     | Engine Foundation            | —              | ✅ Done   |
| 2     | NT8 Strategy Importer        | 1, 2           | Next      |
| 3     | Databento MBO Loader         | 3 (data)       | Upcoming  |
| 4     | Logic Translator             | 3 (logic)      | Upcoming  |
| 5     | Backtest Simulator           | 4              | Upcoming  |
| 6     | Optimizer + Robustness Suite | 5, 6           | Upcoming  |
| 7     | NT8 Exporter                 | 7              | Upcoming  |
| 8     | 3D Strategy Cube Replay UI   | Visual layer   | Upcoming  |
