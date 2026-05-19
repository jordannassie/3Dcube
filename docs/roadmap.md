# Build Roadmap — TOWER Umar Strategy Lab

## The End-to-End Workflow This Roadmap Delivers

```
1. Upload NT8 .cs Indicator or Strategy file
2. Engine analyzes what it contains (parameters, methods, capabilities)
3. Strategy Definition Builder converts indicator signals into a testable strategy
4. Databento MBO Loader reads local SSD data
5. Exact Umar Backtest Engine replays the strategy on real order-book data
6. Optimizer sweeps parameter space to find the strongest settings
7. Robustness Validation: walk-forward, Monte Carlo, sensitivity, slippage stress
8. NT8 Strategy Exporter outputs an optimized .cs file ready for NinjaTrader
9. 3D Strategy Cube Replay UI — visualize the entire optimization sweep in 3D
```

**Important:** TOWER supports both NT8 Indicators and Strategies.
Most Umar files are Indicators. The system analyzes them first, then
builds a backtestable strategy definition from their signals (Phase 3).
TOWER does not claim to auto-translate arbitrary C# perfectly —
it works precisely for TOWER-authored and well-structured NT8 files.

---

## Phase 1 — Engine Foundation ✅ COMPLETE

**Goal**: Stand up the project structure.

- [x] Monorepo scaffold (`apps/web/`, `engine/`, `docs/`)
- [x] Next.js 16 App Router dashboard (TypeScript, Tailwind v4)
- [x] Python engine package with health check
- [x] Docs: architecture, product vision, roadmap, NT8 parser spec

---

## Phase 2 — .cs Upload + NT8 File Analyzer ✅ COMPLETE

**Goal**: User uploads any NT8 .cs file and gets a full structural analysis.

- [x] `TOWER_UPLOADED_INDICATORS_DIR` env var — local file storage
- [x] Next.js POST `/api/upload` — validates, saves, calls Python analyzer
- [x] Next.js GET `/api/indicators` — file count + directory listing
- [x] `nt8_file_analyzer.py` — detects class type, parameters, methods, capabilities
- [x] `analyze_nt8_file.py` — CLI with formatted output + `--json` mode
- [x] `UploadZone` — drag-and-drop upload with states (idle/uploading/success/error)
- [x] `AnalysisReport` — premium glass card showing full structural analysis
- [x] Dashboard integrated: upload section with live file count
- [x] Warning state if `TOWER_UPLOADED_INDICATORS_DIR` is not configured

---

## Phase 3 — Strategy Definition Builder  ← NEXT

**Goal**: Convert analyzed Indicator signals into a backtestable strategy definition.

This is NOT full C# transpilation. It is a structured mapping:
- Extract the indicator's signal logic as documented in the analysis
- Define entry/exit rules in terms of those signals
- Produce a Python `StrategyDefinition` that the backtest engine can run

Deliverables:
- [ ] `strategy_builder.py` — takes `AnalysisResult` + user-defined rules → `StrategyDefinition`
- [ ] Dashboard: "Strategy Definition" form — configure entry/exit from indicator signals
- [ ] CLI: `python engine/scripts/build_strategy.py --analysis result.json`
- [ ] Output: `strategy_definition.json` — portable spec for the simulator

---

## Phase 4 — Databento MBO Loader

**Goal**: Read real NQ MBO files from the local SSD.

- [ ] `pip install databento`
- [ ] `loader.py` — open `.dbn`/`.dbn.zst`, normalize to `L2Snapshot` stream
- [ ] Session stats: events, date range, symbol
- [ ] Dashboard card: "MBO Dataset: Loaded — N sessions, M events"

---

## Phase 5 — Exact Umar Backtest Engine

**Goal**: Replay the strategy definition against MBO data.

- [ ] `simulator.py` — event-driven replay
- [ ] Realistic fill model: bid/ask spread, slippage, commissions
- [ ] Output: `TradeLog[]`, `EquityCurve`, `BacktestReport`
- [ ] Dashboard: equity curve + trade table

---

## Phase 6 — Optimizer

**Goal**: Find the strongest parameter settings.

- [ ] `optimizer.py` — grid sweep over strategy parameter ranges
- [ ] Score each run: Sharpe, max DD, win rate, profit factor
- [ ] Ranked `OptimizationReport` → `results/opt_{date}.parquet`
- [ ] Dashboard: optimization heat map

---

## Phase 7 — Robustness Validation

**Goal**: Prove the edge is real, not curve-fit.

- [ ] `robustness.py`
- [ ] Walk-forward: rolling 70/30 in/out-of-sample windows (8+ folds)
- [ ] Monte Carlo: permute entry timestamps 1000×, compute p-value
- [ ] Parameter sensitivity: perturb each best param ±10%, ±20%
- [ ] Slippage stress: run at 0×, 1×, 2×, 3× assumed slippage
- [ ] Dashboard: walk-forward chart, Monte Carlo histogram, sensitivity tornado

---

## Phase 8 — NT8 Strategy Export

**Goal**: Output an optimized .cs file ready to compile in NinjaTrader.

- [ ] `nt8_exporter.py` — inject optimized params into NinjaScript template
- [ ] Audit trail comment block at top of generated file
- [ ] Dashboard: one-click download + diff vs. original params
- [ ] Validation: check bracket balance, required methods present

---

## Phase 9 — 3D Strategy Cube Replay UI

**Goal**: Make the optimization results explorable in 3D.

- [ ] Replace CSS cube with React Three Fiber / Three.js WebGL scene
- [ ] One 3D bar per optimization run — height = return %, color = variant
- [ ] Chart plane at Y = 0
- [ ] Click bar → drill into trade log + equity curve
- [ ] Animate: replay trade sequence chronologically
- [ ] Rotate / zoom / pan / export PNG

---

## Summary Table

| Phase | Name                           | Status    |
|-------|--------------------------------|-----------|
| 1     | Engine Foundation              | ✅ Done   |
| 2     | .cs Upload + NT8 File Analyzer | ✅ Done   |
| 3     | Strategy Definition Builder    | Next      |
| 4     | Databento MBO Loader           | Upcoming  |
| 5     | Exact Umar Backtest Engine     | Upcoming  |
| 6     | Optimizer                      | Upcoming  |
| 7     | Robustness Validation          | Upcoming  |
| 8     | NT8 Strategy Export            | Upcoming  |
| 9     | 3D Strategy Cube Replay UI     | Upcoming  |
