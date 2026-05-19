import TopNav from "@/components/TopNav";
import StatusCard from "@/components/StatusCard";
import CubePlaceholder from "@/components/CubePlaceholder";
import RoadmapSection from "@/components/RoadmapSection";

export default function Home() {
  return (
    <>
      <TopNav />

      <main className="max-w-7xl mx-auto px-6 py-14 space-y-20">
        {/* ── Hero ── */}
        <section className="text-center space-y-5 pt-4">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <span className="text-[10px] font-bold tracking-[0.35em] text-cyan-500 uppercase">
              Local Research Platform · NQ MBO Backtesting
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            <span className="text-white">TOWER </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)",
              }}
            >
              Umar Strategy Lab
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Rebuild the order book.{" "}
            <span className="text-slate-300 font-medium">Test the edge.</span>{" "}
            Find the strongest Umar strategy.
          </p>

          {/* Tag pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              "NT8 .cs Import → Export",
              "NQ MBO Order Book",
              "Auto Logic Translation",
              "Walk-Forward Validation",
              "Monte Carlo Permutation",
              "Slippage Stress Test",
              "3D Cube Replay",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-slate-700/50 text-slate-500 bg-slate-900/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── Status Cards ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
              System Status
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatusCard
              icon="🗄️"
              label="MBO Dataset"
              value="Not Loaded"
              status="pending"
              detail="Awaiting local SSD path via TOWER_MBO_DATA_DIR"
            />
            <StatusCard
              icon="⚡"
              label="Umar Strategy"
              value="Not Connected"
              status="offline"
              detail="Strategy rules will be ported in Phase 3"
            />
            <StatusCard
              icon="🔧"
              label="Backtest Engine"
              value="Foundation Ready"
              status="ready"
              detail="Python engine scaffold is live. Health check passing."
            />
            <StatusCard
              icon="🎯"
              label="Optimizer"
              value="Coming Soon"
              status="coming-soon"
              detail="Parameter sweep + Monte Carlo — Phase 5"
            />
          </div>
        </section>

        {/* ── 3D Strategy Simulation Cube ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
              3D Strategy Simulation Cube
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            {/* Cube visual — 3 columns */}
            <div className="lg:col-span-3">
              <CubePlaceholder />
            </div>

            {/* Description — 2 columns */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Replay Every Trade in Three Dimensions
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The 3D Strategy Cube will let you load any completed
                  backtest and replay it as a live 3D animation — time
                  across X, return on Y, strategy variant on Z.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  {
                    accent: "#06b6d4",
                    text: "Glass cube enclosure with transparent faces",
                  },
                  {
                    accent: "#3b82f6",
                    text: "Chart plane slices through the cube at the zero line",
                  },
                  {
                    accent: "#8b5cf6",
                    text: "Colored 3D bars per strategy variant rise above and below the plane",
                  },
                  {
                    accent: "#ec4899",
                    text: "Click any bar to drill into the trade log for that parameter set",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: item.accent, marginTop: 6 }}
                    />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="glass rounded-lg px-4 py-3 border border-slate-800/40">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="text-cyan-500 font-semibold">Phase 6</span>{" "}
                  deliverable — built after the backtest engine and optimizer
                  are producing results to visualize.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Roadmap ── */}
        <RoadmapSection />

        {/* ── Architecture note ── */}
        <section className="glass rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
              Local Architecture
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 text-xs font-mono text-slate-400 justify-center flex-wrap">
            {[
              { label: "NT8 .cs Upload",   sub: "Your strategy file",      color: "#06b6d4" },
              { label: "NT8 Parser",       sub: "Extract params + logic",   color: "#3b82f6" },
              { label: "MBO Loader",       sub: "SSD .dbn data",            color: "#3b82f6" },
              { label: "Translator",       sub: "NT8 → Python class",       color: "#8b5cf6" },
              { label: "Simulator",        sub: "Backtest on MBO",          color: "#8b5cf6" },
              { label: "Optimizer",        sub: "Find best params",         color: "#ec4899" },
              { label: "NT8 Exporter",     sub: "Optimized .cs → NT8 live", color: "#ec4899" },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-4">
                <div className="text-center">
                  <div
                    className="glass rounded-lg px-4 py-3 border mb-1"
                    style={{ borderColor: `${node.color}30` }}
                  >
                    <p className="font-bold text-slate-200">{node.label}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5 tracking-wide">
                      {node.sub}
                    </p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-slate-700 text-base">→</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            MBO data never leaves your machine. All computation runs locally.
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-slate-700 pb-4 space-y-1">
          <p className="tracking-widest uppercase">
            TOWER Umar Strategy Lab · Private Local Research Tool
          </p>
          <p className="font-mono">v0.1.0 — Foundation Build</p>
        </footer>
      </main>
    </>
  );
}
