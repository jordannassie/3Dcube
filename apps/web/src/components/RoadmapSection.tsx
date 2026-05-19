const PHASES = [
  {
    phase: "01",
    title: "Engine Foundation",
    description:
      "Monorepo scaffold, Python health module, Next.js dashboard shell, environment config.",
    status: "complete",
    accent: "#06b6d4",
    step: null,
  },
  {
    phase: "02",
    title: "NT8 Strategy Importer",
    description:
      "Upload any NinjaTrader 8 .cs file. Engine auto-extracts all parameters, entry/exit rules, and indicator refs — no manual coding.",
    status: "next",
    accent: "#06b6d4",
    step: "Steps 1–2",
  },
  {
    phase: "03",
    title: "Databento MBO Loader",
    description:
      "Read local .dbn/.dbn.zst files from SSD. Normalize MBO events into L2 order-book snapshots for the backtest engine.",
    status: "upcoming",
    accent: "#3b82f6",
    step: "Step 3a",
  },
  {
    phase: "04",
    title: "Logic Translator",
    description:
      "Auto-convert the parsed NT8 strategy into a runnable Python class. Maps NinjaScript conditions and indicators to Python equivalents.",
    status: "upcoming",
    accent: "#3b82f6",
    step: "Step 3b",
  },
  {
    phase: "05",
    title: "Backtest Simulator",
    description:
      "Event-driven replay on real MBO data. Realistic fills, slippage, NQ commission model. Outputs trade log and equity curve.",
    status: "upcoming",
    accent: "#8b5cf6",
    step: "Step 4",
  },
  {
    phase: "06",
    title: "Optimizer + Robustness Suite",
    description:
      "Grid sweep to find strongest settings. Walk-forward, Monte Carlo permutation, parameter sensitivity, and slippage stress tests.",
    status: "upcoming",
    accent: "#8b5cf6",
    step: "Steps 5–6",
  },
  {
    phase: "07",
    title: "NT8 Exporter",
    description:
      "Output a valid, optimized NinjaScript .cs file. Inject best parameters + full audit trail comment. Paste into NT8 and run live.",
    status: "upcoming",
    accent: "#ec4899",
    step: "Step 7",
  },
  {
    phase: "08",
    title: "3D Strategy Cube Replay UI",
    description:
      "Three.js interactive cube: one bar per parameter set, height = return %, animated replay, click to drill into any trade log.",
    status: "upcoming",
    accent: "#ec4899",
    step: "Visual layer",
  },
];

export default function RoadmapSection() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
        <h2 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
          System Build Roadmap
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PHASES.map((p) => (
          <div
            key={p.phase}
            className={`glass rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 ${
              p.status === "complete"
                ? "glow-cyan"
                : p.status === "next"
                ? "glow-blue"
                : ""
            }`}
            style={{
              borderColor:
                p.status === "complete"
                  ? "rgba(6,182,212,0.35)"
                  : p.status === "next"
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(59,130,246,0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-black tracking-[0.2em] font-mono"
                style={{ color: p.accent }}
              >
                PHASE {p.phase}
              </span>
              {p.status === "complete" ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 tracking-widest">
                  DONE
                </span>
              ) : p.status === "next" ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-400 tracking-widest">
                  NEXT
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-600 tracking-widest">
                  UPCOMING
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-200">{p.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed flex-1">
              {p.description}
            </p>

            {p.step && (
              <span className="text-[10px] font-mono text-slate-600 tracking-widest">
                {p.step}
              </span>
            )}

            <div className="h-px w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-px rounded-full transition-all"
                style={{
                  width: p.status === "complete" ? "100%" : p.status === "next" ? "15%" : "0%",
                  background: `linear-gradient(90deg, ${p.accent}, transparent)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
