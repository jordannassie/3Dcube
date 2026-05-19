# Architecture — TOWER Umar Strategy Lab

## System Purpose

TOWER is a **fully local** research pipeline with one job:

> Take a NinjaTrader 8 strategy file (`.cs`), test it rigorously against
> real NQ MBO order-book data, optimize its parameters, and hand back
> a hardened, optimized `.cs` file ready to run live in NT8.

No data leaves your machine. No cloud backend. No SaaS.

---

## End-to-End Workflow (8 Steps)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1 — Upload                                                        │
│  User drops .cs NinjaScript file into the dashboard                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2 — Parse  (nt8_parser.py)                                        │
│  · Extract all [Parameter] declarations (name, type, default, range)   │
│  · Extract OnBarUpdate() logic tree (conditions, comparisons)           │
│  · Identify entry/exit calls: EnterLong, EnterShort, SetStopLoss, etc. │
│  · Detect indicator references: EMA, RSI, SMA, MACD, ATR, etc.        │
│  → Outputs: StrategySpec (JSON)                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────┐        ┌──────────────────────────────────────┐
│  STEP 3a — MBO Load  │        │  STEP 3b — Translate                 │
│  (loader.py)         │        │  (translator.py)                     │
│  · Open .dbn/.dbn.zst│        │  · Map NT8 logic → Python class      │
│  · Parse MBO events  │        │  · Map NT8 indicators → pandas/ta-lib │
│  · Yield L2Snapshots │        │  → Outputs: PythonStrategy class      │
└──────────┬───────────┘        └──────────────┬───────────────────────┘
           │                                   │
           └──────────────┬────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4 — Backtest  (simulator.py)                                      │
│  · Event-driven replay: feed MBO snapshots into PythonStrategy         │
│  · Fill model: realistic spread, slippage, partial fills               │
│  · Commission: NQ futures per-side rate                                 │
│  · Output: TradeLog[], EquityCurve, BacktestReport                     │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5 — Find Strongest Settings  (optimizer.py)                       │
│  · Grid sweep across all extracted parameter ranges                    │
│  · Score each run: Sharpe, max DD, win rate, profit factor             │
│  · Return ranked parameter sets                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6 — Robustness Tests  (robustness.py)                             │
│  · Walk-Forward: rolling in-sample/out-of-sample windows               │
│  · Monte Carlo: permute entry signals 1000×, measure luck vs. edge     │
│  · Parameter Sensitivity: perturb each param ±10%, measure degradation │
│  · Slippage Stress: run at 0×, 1×, 2×, 3× assumed slippage           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7 — Export  (nt8_exporter.py)                                     │
│  · Take optimized parameter set                                         │
│  · Inject into NinjaScript template                                     │
│  · Output valid .cs file (copy into NT8 Strategy Editor)               │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8 — Live  (NinjaTrader 8)                                         │
│  · Paste .cs into NT8 Strategy Editor → Compile → Run live             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module Map

### `engine/src/tower_umar_engine/`

| Module              | Step | Responsibility                                                         |
|---------------------|------|------------------------------------------------------------------------|
| `config.py`         | All  | Env-vars: `TOWER_MBO_DATA_DIR`, `DATABENTO_API_KEY`                  |
| `health.py`         | All  | System boot validation                                                 |
| `nt8_parser.py`     | 2    | Parse NinjaScript .cs → `StrategySpec` dataclass                     |
| `loader.py`         | 3a   | Read .dbn files → `L2Snapshot` stream                                 |
| `translator.py`     | 3b   | `StrategySpec` → Python `BaseStrategy` subclass                       |
| `simulator.py`      | 4    | Event-driven backtest: snapshots × strategy → `BacktestReport`       |
| `optimizer.py`      | 5    | Parameter grid sweep → ranked `OptimizationReport`                    |
| `robustness.py`     | 6    | Walk-forward, Monte Carlo, sensitivity, slippage stress               |
| `nt8_exporter.py`   | 7    | `OptimizedParams` + original spec → valid `.cs` file                 |

### `apps/web/src/`

| Component / Route   | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `app/page.tsx`      | Main dashboard: status cards, cube, roadmap                            |
| `app/upload/`       | Step 1 upload UI — drag-and-drop .cs, shows parsed parameters          |
| `app/backtest/`     | Step 4–5 results: equity curve, trade table, parameter heat map        |
| `app/robustness/`   | Step 6 results: walk-forward chart, Monte Carlo distribution           |
| `app/export/`       | Step 7 — download optimized .cs, diff vs. original                     |
| `components/`       | Reusable: StatusCard, CubePlaceholder, RoadmapSection, TopNav          |
| `lib/`              | Engine result readers, file download helpers                            |

---

## NT8 Parser — Technical Approach

NinjaScript follows highly predictable C# patterns. The parser uses
**regex + line-by-line pattern matching** (no full C# AST needed):

### Parameters

```csharp
// NT8 style 1 — property with [Range] and [Display] attributes
[Range(1, 100), NinjaScriptProperty]
[Display(Name="EMA Period", GroupName="Parameters", Order=1)]
public int EmaPeriod { get; set; }

// NT8 style 2 — AddPlot() and Parameters.Add() in Initialize()
Parameters.Add(new Parameter("EmaPeriod", 20));
```

The parser extracts: `name`, `type`, `default_value`, `min`, `max`
→ builds a `ParameterSpec` for each.

### Entry / Exit Signals

```csharp
// Entries
EnterLong(quantity, signalName);
EnterShort(quantity, signalName);

// Exits
ExitLong(signalName);
ExitShort(signalName);
SetStopLoss(signalName, CalculationMode.Ticks, stopTicks, false);
SetProfitTarget(signalName, CalculationMode.Ticks, targetTicks);
SetTrailingStop(signalName, CalculationMode.Ticks, trailTicks, true);
```

### Indicator References

NT8 built-ins map directly to Python equivalents:

| NinjaScript             | Python (pandas-ta / manual) |
|-------------------------|-----------------------------|
| `EMA(Close, period)`    | `ta.ema(close, period)`     |
| `SMA(Close, period)`    | `ta.sma(close, period)`     |
| `RSI(Close, period)`    | `ta.rsi(close, period)`     |
| `ATR(period)`           | `ta.atr(high, low, close, period)` |
| `MACD(...)`             | `ta.macd(...)`              |
| `VOL()`                 | `volume`                    |

---

## NT8 Exporter — Technical Approach

The exporter uses a **parameterized NinjaScript template**:

1. Reads the original parsed `StrategySpec` (preserves all logic)
2. Replaces parameter default values with the optimized values
3. Injects a comment block at the top:
   ```csharp
   // TOWER Umar Strategy Lab — Optimized
   // Optimization date: 2026-05-18
   // Sharpe: 2.41 | Max DD: 4.2% | Win Rate: 58%
   // Walk-forward: passed 7/8 windows
   // Monte Carlo p-value: 0.003
   ```
4. Outputs a valid, compilable `.cs` file

---

## Why Raw MBO Data Stays on SSD

- **Size**: Databento NQ MBO files are multiple GB per session — not committable
- **Speed**: Engine reads directly from NVMe — no network, no latency
- **Privacy**: Your strategy and data never leave the machine
- **Reproducibility**: Byte-identical files guarantee exact re-runs

The `.gitignore` excludes `*.dbn`, `*.dbn.zst`, `*.mbo` globally.

---

## Technology Choices

| Layer             | Technology                    | Reason                                                   |
|-------------------|-------------------------------|----------------------------------------------------------|
| Dashboard         | Next.js 16 (App Router)       | Local dev server, React server components                |
| Styling           | Tailwind CSS v4               | Utility-first, zero runtime                              |
| 3D Cube (Phase 8) | React Three Fiber / Three.js  | Full 3D scene with WebGL, interaction, animation         |
| Engine            | Python 3.9+                   | Best quant data ecosystem                                |
| NT8 Parser        | `re` + dataclasses            | No C# AST needed — NinjaScript patterns are predictable  |
| MBO loading       | `databento` SDK               | Official .dbn format support                             |
| Data frames       | `pandas` + `pyarrow`          | Standard for time-series research                        |
| Optimization      | Custom grid + `scipy`/`optuna`| Full control over scoring and stopping criteria          |
| NT8 Export        | String templates (Jinja2)     | Clean, auditable .cs generation                          |
