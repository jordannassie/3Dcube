# Product Vision — TOWER Umar Strategy Lab

## What This Is

TOWER Umar Strategy Lab is a **private, local-first research tool** built for
one purpose: rigorously testing, optimizing, and understanding the exact Umar
/ Level 2 order-flow strategy as practiced on NinjaTrader with NQ MBO data.

This is not a generic backtester. Every design decision is made to serve the
specific needs of replaying high-resolution MBO order flow and measuring the
Umar strategy's true edge under real market conditions.

---

## The 3D Strategy Simulation Cube

The flagship visual — inspired by institutional quant tooling — is the
**3D Strategy Simulation Cube**: a glass-enclosed, 3D coordinate system that
lets you see an entire optimization sweep in one view.

### What it looks like

- A transparent glass cube (acrylic / frosted glass aesthetic)
- A horizontal "chart plane" slices through the cube at the zero-return line
- Colorful 3D bars rise **above** the plane (profitable parameter sets) and
  descend **below** (losing sets)
- Color encodes strategy variant: blue = long bias, cyan = neutral, violet =
  short bias, magenta = peak-edge configuration
- Axes:
  - **X** — Time (trade sequence or backtest period)
  - **Y** — Return (%) relative to baseline
  - **Z** — Strategy variant / parameter set index

### What it lets you do

- Instantly see which parameter combination produces the tallest bar (best edge)
- Observe clustering: if peak bars cluster in one region of the Z-axis, the
  strategy is robust in that parameter range
- Click any bar to drill into the full trade log, equity curve, and order-flow
  replay for that exact parameter set
- Animate the cube to replay the trade sequence chronologically

### Why it matters

Optimization results in a spreadsheet are opaque. The cube externalizes the
entire parameter space into a single visual scan. A trader can look at the cube
and immediately ask the right questions:

> "Why does the edge collapse when the Level 2 threshold crosses 400 contracts?"
> "Is the peak bar an outlier or surrounded by similarly tall bars?"

---

## Design Philosophy

- **Local first**: All data and computation stays on your machine.
- **Exact, not approximate**: The Umar strategy rules will be implemented
  precisely as documented — no approximations.
- **Research quality**: Every output is reproducible, versioned, and explainable.
- **Visual clarity**: The dashboard communicates results at a glance, not buried
  in CSV exports.
- **Dark institutional aesthetic**: The visual language matches professional
  quant research environments — not retail charting tools.
