const PHASES = [
  {
    phase: "01",
    title: "Engine Foundation",
    description:
      "Monorepo, Python health module, Next.js dashboard shell, environment config.",
    status: "complete",
    accent: "#06b6d4",
    step: null,
  },
  {
    phase: "02",
    title: ".cs Upload + NT8 File Analyzer",
    description:
      "Real file upload. Auto-detect Indicator vs Strategy. Extract parameters, methods, Level 2 logic, and MBO candidacy flags.",
    status: "complete",
    accent: "#06b6d4",
    step: "Steps 1–2",
  },
  {
    phase: "03",
    title: "Strategy Definition Builder",
    description:
      "Build a testable backtest strategy definition from analyzed indicator signals. Map NT8 conditions to Python logic.",
    status: "next",
    accent: "#3b82f6",
    step: "Step 3",
  },
  {
    phase: "04",
    title: "Databento MBO Loader",
    description:
      "Read local .dbn/.dbn.zst files. Normalize MBO events into L2 order-book snapshots for the backtest engine.",
    status: "upcoming",
    accent: "#3b82f6",
    step: "Step 4",
  },
  {
    phase: "05",
    title: "Exact Umar Backtest Engine",
    description:
      "Event-driven replay on real MBO data. Realistic fills, slippage, NQ commission. Trade log and equity curve output.",
    status: "upcoming",
    accent: "#8b5cf6",
    step: "Step 5",
  },
  {
    phase: "06",
    title: "Optimizer",
    description:
      "Grid sweep across all extracted parameter ranges. Score by Sharpe, max DD, win rate, profit factor. Ranked output.",
    status: "upcoming",
    accent: "#8b5cf6",
    step: "Step 6",
  },
  {
    phase: "07",
    title: "Robustness Validation",
    description:
      "Walk-forward, Monte Carlo permutation (1000×), parameter sensitivity tornado, slippage stress tests.",
    status: "upcoming",
    accent: "#ec4899",
    step: "Step 7",
  },
  {
    phase: "08",
    title: "NT8 Strategy Export",
    description:
      "Inject optimized parameters into NinjaScript template. Output a valid, compilable .cs file ready to run in NT8.",
    status: "upcoming",
    accent: "#ec4899",
    step: "Step 8",
  },
  {
    phase: "09",
    title: "3D Strategy Cube UI",
    description:
      "Three.js glass cube: one bar per parameter set, height = return %, animated replay, drill-down to trade log.",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  : "rgba(59,130,246,0.08)",
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
              <span className="text-[10px] font-mono text-slate-700 tracking-widest">
                {p.step}
              </span>
            )}

            <div className="h-px w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-px rounded-full transition-all"
                style={{
                  width:
                    p.status === "complete"
                      ? "100%"
                      : p.status === "next"
                      ? "15%"
                      : "0%",
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
