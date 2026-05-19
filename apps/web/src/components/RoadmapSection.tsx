const PHASES = [
  {
    phase: "01",
    title: "Engine Foundation",
    description: "Monorepo, Python health module, Next.js dashboard shell.",
    status: "complete",
  },
  {
    phase: "02",
    title: ".cs Upload + NT8 File Analyzer",
    description: "Real file upload. Detect Indicator vs Strategy. Extract parameters, methods, and capabilities.",
    status: "complete",
  },
  {
    phase: "03",
    title: "Strategy Definition Builder",
    description: "Build a testable backtest strategy from analyzed indicator signals. Map NT8 conditions to Python logic.",
    status: "next",
  },
  {
    phase: "04",
    title: "Databento MBO Loader",
    description: "Read local .dbn/.dbn.zst files. Normalize MBO events into L2 order-book snapshots.",
    status: "upcoming",
  },
  {
    phase: "05",
    title: "Exact Umar Backtest Engine",
    description: "Event-driven replay on real MBO data. Realistic fills, slippage, NQ commission model.",
    status: "upcoming",
  },
  {
    phase: "06",
    title: "Optimizer",
    description: "Grid sweep across all parameter ranges. Score by Sharpe, max DD, win rate, profit factor.",
    status: "upcoming",
  },
  {
    phase: "07",
    title: "Robustness Validation",
    description: "Walk-forward, Monte Carlo permutation (1000×), parameter sensitivity, slippage stress.",
    status: "upcoming",
  },
  {
    phase: "08",
    title: "NT8 Strategy Export",
    description: "Inject optimized parameters. Output a valid, compilable .cs file ready for NT8.",
    status: "upcoming",
  },
  {
    phase: "09",
    title: "3D Strategy Cube UI",
    description: "Three.js interactive cube: one bar per optimization run, drill-down to trade log.",
    status: "upcoming",
  },
];

const statusStyle = {
  complete: {
    dot: "bg-green-500",
    badge: "text-green-700 bg-green-50 border-green-200",
    label: "Complete",
    phaseColor: "text-green-600",
  },
  next: {
    dot: "bg-blue-500",
    badge: "text-blue-700 bg-blue-50 border-blue-200",
    label: "Next",
    phaseColor: "text-blue-600",
  },
  upcoming: {
    dot: "bg-gray-300",
    badge: "text-gray-500 bg-gray-50 border-gray-200",
    label: "Upcoming",
    phaseColor: "text-gray-400",
  },
};

export default function RoadmapSection() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-base font-bold text-gray-900">Build Roadmap</h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PHASES.map((p) => {
          const s = statusStyle[p.status as keyof typeof statusStyle];
          return (
            <div
              key={p.phase}
              className={[
                "card-flat p-4 flex flex-col gap-2 transition-all",
                p.status === "next" ? "border-blue-200 shadow-sm" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold font-mono ${s.phaseColor}`}>
                  Phase {p.phase}
                </span>
                <span className={`badge text-[10px] ${s.badge}`}>
                  <span className={`status-dot ${s.dot}`} />
                  {s.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{p.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{p.description}</p>

              {/* Progress line */}
              <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                  className={[
                    "h-0.5 rounded-full",
                    p.status === "complete" ? "bg-green-400 w-full"
                    : p.status === "next" ? "bg-blue-400 w-[12%]"
                    : "w-0",
                  ].join(" ")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
