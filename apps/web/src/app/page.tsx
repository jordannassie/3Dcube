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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* ── Hero ── */}
        <section className="pt-2">
          <div className="max-w-2xl">
            <p className="section-label mb-3">Professional Order-Flow Research · NQ Futures</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
              TOWER Strategy Lab
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-1">
              Upload NinjaTrader files. Build strategy logic. Backtest with MBO data. Optimize and export.
            </p>
            <p className="text-sm text-gray-400">
              From .cs file to tested NT8 strategy — fully local, no cloud required.
            </p>
          </div>

          {/* Capability tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              "NT8 Import",
              "Indicator Analysis",
              "Strategy Builder",
              "MBO Replay",
              "Backtesting",
              "Optimization",
              "Robustness Testing",
              "NT8 Export",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-gray-600 px-3 py-1 bg-white border border-gray-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── Research Workspace ── */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-base font-bold text-gray-900">Research Workspace</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Primary workflow</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
            {/* Upload column — 2/5 */}
            <div className="lg:col-span-2">
              <div className="card p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Upload NinjaTrader File</h3>
                  <span className="badge badge-soon">
                    <span className="status-dot bg-blue-400 dot-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Drop in an Indicator or Strategy <code className="font-mono text-blue-600">.cs</code> file
                  to begin analysis and strategy development.
                </p>
                <UploadSection />
              </div>
            </div>

            {/* Chart column — 3/5 */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Strategy Workspace Preview</h3>
                <span className="section-label">Backtest results appear here in Phase 5</span>
              </div>
              <div style={{ height: 420 }}>
                <ChartWorkspace />
              </div>
            </div>
          </div>
        </section>

        {/* ── Pipeline bar ── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900">Product Pipeline</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <PipelineBar />
        </section>

        {/* ── System Status ── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900">System Status</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <StatusCard
              icon="📄"
              label="NT8 Files"
              value="Upload zone active"
              status="pending"
              detail="Drag any .cs Indicator or Strategy into the upload zone above"
            />
            <StatusCard
              icon="🗄️"
              label="MBO Dataset"
              value="Not Loaded"
              status="pending"
              detail="Set TOWER_MBO_DATA_DIR in .env.local — Phase 4"
            />
            <StatusCard
              icon="🔧"
              label="Backtest Engine"
              value="Foundation Ready"
              status="ready"
              detail="Python engine scaffold live. Health check passing."
            />
            <StatusCard
              icon="🎯"
              label="Optimizer"
              value="Coming Soon"
              status="coming-soon"
              detail="Parameter sweep + Monte Carlo — Phase 6"
            />
          </div>
        </section>

        {/* ── Advanced Visualization ── */}
        <section>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-base font-bold text-gray-900">Advanced Visualization</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Phase 9</span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Explore backtest results, parameter landscapes, and strategy variants in an interactive 3D model.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3">
              <CubePlaceholder />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">3D Strategy Simulation Cube</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Visualize strategy variants, replay results, and inspect performance dimensions in an interactive
                  3D model. Every parameter set becomes one bar in the cube.
                </p>
                <ul className="space-y-2">
                  {[
                    ["X-axis", "Time — trade sequence or backtest window"],
                    ["Y-axis", "Return (%) — positive above plane, negative below"],
                    ["Z-axis", "Strategy variant / parameter set index"],
                    ["Drill-down", "Click any bar to open that run's trade log"],
                  ].map(([key, val]) => (
                    <li key={key} className="flex gap-2 text-xs">
                      <span className="font-semibold text-gray-700 min-w-[60px]">{key}</span>
                      <span className="text-gray-500">{val}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-alt p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-medium text-gray-700">Phase 9 deliverable.</span>{" "}
                  Built after the backtest engine and optimizer produce results to visualize.
                  React Three Fiber / Three.js WebGL implementation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Local Setup Guide ── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900">Local Setup</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Required for uploads</span>
          </div>
          <LocalSetupCard />
        </section>

        {/* ── Roadmap ── */}
        <RoadmapSection />

        {/* ── Architecture ── */}
        <section className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-base font-bold text-gray-900">Local Architecture</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            {[
              { label: "NT8 .cs Upload",    sub: "Indicator or Strategy" },
              { label: "NT8 Parser",         sub: "Extract params + logic" },
              { label: "MBO Loader",         sub: "SSD .dbn files" },
              { label: "Strategy Builder",   sub: "Signal → backtest def" },
              { label: "Simulator",          sub: "Backtest on MBO" },
              { label: "Optimizer",          sub: "Find best params" },
              { label: "NT8 Exporter",       sub: "Optimized .cs → live" },
            ].map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-2">
                <div className="surface-alt px-3 py-2 text-center rounded-lg">
                  <p className="text-xs font-semibold text-gray-700">{node.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{node.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 text-sm">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            All computation is local. MBO data never leaves your machine.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            TOWER Strategy Lab · Private Local Research Tool · v0.2.0 — Phase 2
          </p>
        </footer>

      </main>
    </div>
  );
}
