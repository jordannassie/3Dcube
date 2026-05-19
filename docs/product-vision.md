# Product Vision — TOWER Umar Strategy Lab

## The Core Idea

You have a NinjaTrader 8 strategy. You have years of raw NQ MBO data on an SSD.
TOWER answers one question:

> **What are the exact best settings for this strategy, and is the edge real?**

The full loop:

```
Upload .cs  →  Parse  →  Backtest on MBO  →  Optimize  →  Robustness  →  Export .cs
```

Every step is automated. The output is a hardened, audit-trailed `.cs` file
you can drop directly into NinjaTrader 8 and run live.

---

## Why This Doesn't Exist Elsewhere

| Tool                    | Problem                                                                   |
|-------------------------|---------------------------------------------------------------------------|
| NT8 built-in optimizer  | Uses OHLCV bars — not MBO order-book data. No Monte Carlo. No export.    |
| QuantConnect / Lean     | General-purpose. No NT8 import/export. No MBO. Cloud-dependent.          |
| Backtrader / Zipline    | Python only — you write the strategy from scratch. No NT8 round-trip.    |
| Excel / custom scripts  | One-off. No walk-forward. No reproducibility. No 3D visualization.       |

TOWER is the only tool that:
1. Reads a real NT8 `.cs` file and understands its parameters
2. Backtests it on raw MBO order-book data (not resampled OHLCV)
3. Runs the full robustness suite automatically
4. Hands back an optimized `.cs` file for NT8

---

## The MBO Advantage

Most backtesting tools use OHLCV bars. Bar-based backtesting has known biases:
- Look-ahead bias in bar construction
- Fill model assumes worst-case bar price, not actual order-book state
- High-frequency intraday signals are smeared across bars

TOWER backtests against the **actual MBO event stream** — the same data NT8
sees when the strategy runs live. Every fill simulation uses the real bid/ask
spread at the moment of signal, not a synthetic OHLCV approximation.

---

## The NT8 Round-Trip

**Import**: The parser extracts the strategy's full parameter space — all
`[Range]` attributes, default values, and step sizes — automatically. No manual
configuration of optimization ranges. If it's in the `.cs` file, the parser
finds it.

**Export**: The exporter injects the optimized values as new defaults and adds
a structured comment block that documents the full optimization audit trail.
The output is a standard `.cs` file — no custom runtime, no TOWER dependency.
Paste it into NT8, compile, run.

---

## The Robustness Suite

Finding a good backtest result is easy. Knowing if it's a real edge is hard.
The robustness suite answers that question through four independent tests:

### Walk-Forward Validation
Splits the data into overlapping in-sample / out-of-sample windows. Optimizes
on the in-sample period, tests on the out-of-sample period. A robust strategy
performs consistently across all windows — not just the window that was optimized.

### Monte Carlo Permutation Test
Shuffles the entry signal timestamps 1,000 times and re-runs the backtest each
time. If the real result ranks in the top 0.5% of the shuffled distribution,
the edge is statistically unlikely to be random. This is the most direct test
of whether the timing of signals matters.

### Parameter Sensitivity Analysis
Perturbs each optimized parameter ±10% and ±20% from its optimal value and
measures the degradation in Sharpe ratio per unit of perturbation. A robust
strategy has a wide, flat peak — not a knife-edge that collapses if a single
parameter moves one tick.

### Slippage Stress Test
Runs the backtest at 0×, 1×, 2×, and 3× the assumed slippage. Identifies the
slippage level at which the strategy's edge disappears. If the strategy only
works at unrealistic slippage assumptions, it won't survive live execution.

---

## The 3D Strategy Simulation Cube

The flagship visualization: a glass-enclosed 3D coordinate system that renders
the entire optimization sweep as an interactive 3D bar chart.

- **X axis** — Time (trade sequence or optimization window)
- **Y axis** — Return (%), positive bars above the plane, negative below
- **Z axis** — Parameter set / strategy variant index

Each bar is a single backtest run. The tallest cluster reveals the optimal
parameter region. Clicking a bar drills into that run's full trade log. The
cube can animate to replay trades chronologically through 3D space.

The visual language is institutional quant: glass geometry, neon accents,
dark field. It communicates the same information as an optimization heat map
but makes the structure of the parameter space immediately intuitive.

---

## Local-First, Always

Every byte of MBO data stays on your SSD. Every computation runs on your CPU.
The dashboard is a local Next.js server at `localhost:3000`. There is no
account, no subscription, no telemetry, no network dependency for core operation.

TOWER is a research tool you own entirely.
