const PHASES = [
  {
    phase: "01",
    title: "Engine Foundation",
    description:
      "Monorepo scaffold, Python health module, Next.js dashboard shell, environment config.",
    status: "complete",
    accent: "#06b6d4",
  },
  {
    phase: "02",
    title: "Databento MBO Loader",
    description:
      "Parse local .dbn / .dbn.zst files from SSD. Normalize Level 2 order book snapshots into engine-ready structs.",
    status: "upcoming",
    accent: "#3b82f6",
  },
  {
    phase: "03",
    title: "Exact Umar Strategy Port",
    description:
      "Implement the precise Umar / Level 2 order-flow entry rules, filters, and trade management logic in Python.",
    status: "upcoming",
    accent: "#8b5cf6",
  },
  {
    phase: "04",
    title: "Backtest Simulator",
    description:
      "Event-driven replay engine. Realistic fill simulation, slippage, commissions. Export trade logs + equity curves.",
    status: "upcoming",
    accent: "#8b5cf6",
  },
  {
    phase: "05",
    title: "Optimizer + Monte Carlo",
    description:
      "Parameter sweep over Umar entry thresholds. Monte Carlo permutation testing. Walk-forward validation.",
    status: "upcoming",
    accent: "#ec4899",
  },
  {
    phase: "06",
    title: "Strategy Cube Replay UI",
    description:
      "Interactive 3D visualization: replay any backtest through the glass cube. Axis = Time / Return / Strategy variant.",
    status: "upcoming",
    accent: "#ec4899",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PHASES.map((p) => (
          <div
            key={p.phase}
            className={`glass rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 hover:border-opacity-50 ${
              p.status === "complete" ? "glow-cyan" : ""
            }`}
            style={{
              borderColor:
                p.status === "complete"
                  ? "rgba(6,182,212,0.3)"
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
                  COMPLETE
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-500 tracking-widest">
                  UPCOMING
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-200">{p.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {p.description}
            </p>

            {/* Phase progress bar */}
            <div className="mt-auto pt-2">
              <div className="h-px w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-px rounded-full transition-all"
                  style={{
                    width: p.status === "complete" ? "100%" : "0%",
                    background: `linear-gradient(90deg, ${p.accent}, transparent)`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
