# Build Roadmap — TOWER Umar Strategy Lab

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

## Phase 2 — Databento MBO Loader

**Goal**: Read real NQ MBO files from the local SSD into engine-ready data structures.

Deliverables:
- [ ] `pip install databento` integration
- [ ] `loader.py` — opens `.dbn` / `.dbn.zst` files using the Databento Python SDK
- [ ] Normalize raw MBO events into typed Python dataclasses:
  - `OrderBookUpdate(ts, side, price, size, action)`
  - `L2Snapshot(ts, bids[], asks[])`
- [ ] Session-level iterator: yields snapshots in chronological order
- [ ] Basic stats on load: total events, date range, symbol, sessions
- [ ] Dashboard card: "MBO Dataset: Loaded — N sessions, M events"

---

## Phase 3 — Exact Umar Strategy Port

**Goal**: Implement the precise Umar / Level 2 order-flow entry and exit rules.

Deliverables:
- [ ] `strategy.py` — `UmarStrategy` class
- [ ] Entry signal logic (exact Umar conditions — to be documented from NinjaTrader rules)
- [ ] Trade management: stop, target, trailing rules
- [ ] Signal generator: `stream_signals(snapshots) → Signal[]`
- [ ] Unit tests against known order-flow scenarios
- [ ] Dashboard card: "Umar Strategy: Connected"

---

## Phase 4 — Backtest Simulator

**Goal**: Replay signals against historical data with realistic execution modelling.

Deliverables:
- [ ] `simulator.py` — event-driven replay engine
- [ ] Fill model: bid/ask spread, slippage, partial fills
- [ ] Commission model (NQ futures: per-side)
- [ ] Trade log: entry/exit price, PnL, hold time, drawdown
- [ ] Equity curve export (JSON + Parquet)
- [ ] Dashboard: equity curve chart, trade table
- [ ] CLI: `python engine/scripts/run_backtest.py --config backtest.toml`

---

## Phase 5 — Optimizer + Monte Carlo

**Goal**: Find the strongest parameter set and validate robustness.

Deliverables:
- [ ] `optimizer.py` — parameter sweep runner
- [ ] Grid search over key Umar thresholds
- [ ] Walk-forward validation (in-sample / out-of-sample splits)
- [ ] Monte Carlo permutation test (shuffle entry signals, re-run 1000×)
- [ ] Optimization report: best params, Sharpe, max DD, win rate
- [ ] Dashboard: optimization heat map table
- [ ] Export: `results/optimization_{date}.parquet`

---

## Phase 6 — Strategy Cube Replay UI

**Goal**: Make the 3D Strategy Simulation Cube interactive and data-driven.

Deliverables:
- [ ] Replace CSS cube placeholder with a real Three.js / React Three Fiber scene
- [ ] Load optimization report JSON → render one 3D bar per parameter set
- [ ] Bar height = return (%), bar color = strategy variant
- [ ] Chart-plane at Y=0
- [ ] Click a bar → drill down to that run's trade log and equity curve
- [ ] Animate: replay trade sequence in time order
- [ ] Rotate/zoom controls
- [ ] Screenshot / export frame

---

## Future Considerations (Phase 7+)

- Live paper-trading monitor (read NinjaTrader live data feed)
- Comparison across multiple strategy variants (not just Umar parameters)
- Regime detection overlay (VIX, macro calendar)
- Multi-instrument extension (ES, RTY)
