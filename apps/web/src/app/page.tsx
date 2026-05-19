import TopNav from "@/components/TopNav";
import StatusCard from "@/components/StatusCard";
import CubePlaceholder from "@/components/CubePlaceholder";
import RoadmapSection from "@/components/RoadmapSection";
import UploadSection from "@/components/UploadSection";
import ChartWorkspace from "@/components/ChartWorkspace";
import PipelineBar from "@/components/PipelineBar";
import LocalSetupCard from "@/components/LocalSetupCard";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="pt-1">
          <p className="section-label mb-3">NQ Futures · MBO Order-Flow Research</p>
          <h1 className="page-title mb-3">
            TOWER Strategy Lab
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
            Select a NinjaTrader file from your local Test Library. TOWER analyzes its structure,
            builds a strategy model, backtests on MBO data, optimizes parameters, and exports
            a hardened .cs file back to NT8.
          </p>

          {/* Capability tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              "Test Library",
              "NT8 Import",
              "Indicator Analysis",
              "Strategy Builder",
              "MBO Replay",
              "Backtesting",
              "Optimization",
              "NT8 Export",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-gray-600 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── Primary Workspace ─────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

            {/* Left — File selector (2 of 5) */}
            <div className="lg:col-span-2">
              <div className="card p-6 h-full">
                {/* Card header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="card-title">Select NinjaTrader File</h2>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Choose an Indicator or Strategy .cs file from your local Test Library
                      to begin analysis.
                    </p>
                  </div>
                  <span className="badge badge-soon ml-3 flex-shrink-0">
                    <span className="status-dot bg-blue-500 dot-pulse" />
                    Active
                  </span>
                </div>
                <UploadSection />
              </div>
            </div>

            {/* Right — Strategy chart (3 of 5) */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="card-title">Strategy Workspace Preview</h2>
                <span className="section-label">Results appear here in Phase 5</span>
              </div>
              <div style={{ height: 460 }}>
                <ChartWorkspace />
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Pipeline ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="card-title">Product Pipeline</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">6-step workflow</span>
          </div>
          <PipelineBar />
        </section>

        {/* ── System Status ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="card-title">System Status</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <StatusCard
              icon="📁"
              label="NT8 Files"
              value="Test Library active"
              status="pending"
              detail="Select any .cs Indicator or Strategy from the Test folder above"
            />
            <StatusCard
              icon="🗄️"
              label="MBO Dataset"
              value="Not Connected"
              status="pending"
              detail="Set TOWER_MBO_DATA_DIR in .env.local — Phase 4"
            />
            <StatusCard
              icon="⚙️"
              label="Backtest Engine"
              value="Foundation Ready"
              status="ready"
              detail="Python engine scaffold live. Health check passing."
            />
            <StatusCard
              icon="🎯"
              label="Optimizer"
              value="Phase 6"
              status="coming-soon"
              detail="Parameter sweep + Monte Carlo robustness"
            />
          </div>
        </section>

        {/* ── Local Setup ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="card-title">Local Setup</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Required for file selection</span>
          </div>
          <LocalSetupCard />
        </section>

        {/* ── Architecture ──────────────────────────────────────── */}
        <section className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="card-title">Local Architecture</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Fully local · No cloud</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            {[
              { label: "Test Library",      sub: "Select .cs file" },
              { label: "NT8 Parser",         sub: "Extract params + logic" },
              { label: "MBO Loader",         sub: "SSD .dbn files" },
              { label: "Strategy Builder",   sub: "Signal → backtest def" },
              { label: "Simulator",          sub: "Backtest on MBO" },
              { label: "Optimizer",          sub: "Find best params" },
              { label: "NT8 Exporter",       sub: "Optimized .cs → live" },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-2">
                <div className="surface-alt px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">{node.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{node.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 text-base">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">
            All computation is local. MBO data, .cs files, and backtest results never leave your machine.
          </p>
        </section>

        {/* ── Advanced Visualization ────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="card-title">Advanced Visualization</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Phase 9</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Explore backtest results, parameter landscapes, and strategy variants in an interactive 3D model.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3">
              <CubePlaceholder />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-6">
                <h3 className="card-title mb-2">3D Strategy Simulation Cube</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Visualize strategy variants, replay results, and inspect performance dimensions in an
                  interactive 3D model. Every parameter set becomes one bar in the cube.
                </p>
                <ul className="space-y-2.5">
                  {[
                    ["X-axis", "Time — trade sequence or backtest window"],
                    ["Y-axis", "Return (%) — positive above plane, negative below"],
                    ["Z-axis", "Strategy variant / parameter set index"],
                    ["Drill-down", "Click any bar to open that run's trade log"],
                  ].map(([key, val]) => (
                    <li key={key} className="flex gap-3 text-xs">
                      <span className="font-semibold text-gray-700 min-w-[68px]">{key}</span>
                      <span className="text-gray-500">{val}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface-alt p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-700">Phase 9 deliverable.</span>{" "}
                  Built after the backtest engine and optimizer produce results to visualize.
                  React Three Fiber / Three.js WebGL.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Roadmap ───────────────────────────────────────────── */}
        <RoadmapSection />

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="text-center py-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            TOWER Strategy Lab · Built for Serious Traders · v0.2.0 — Phase 2 Complete
          </p>
        </footer>

      </main>
    </div>
  );
}
