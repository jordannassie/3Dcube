import TopNav from "@/components/TopNav";
import StatusCard from "@/components/StatusCard";
import CubePlaceholder from "@/components/CubePlaceholder";
import RoadmapSection from "@/components/RoadmapSection";
import UploadSection from "@/components/UploadSection";
import PipelineBar from "@/components/PipelineBar";
import LocalSetupCard from "@/components/LocalSetupCard";
import SyntheticDemoLab from "@/components/SyntheticDemoLab";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Compact hero ──────────────────────────────────────── */}
        <section className="pt-1">
          <p className="section-label mb-2">NQ Futures · Order-Flow Research</p>
          <h1 className="page-title mb-2">TOWER Strategy Lab</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            Select a NinjaTrader file. Simulate strategy logic. Prepare for real MBO backtesting.
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Current phase: .cs analysis + synthetic Umar scenario testing.
          </p>
        </section>

        {/* ── Primary Workspace ─────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

            {/* LEFT — File selector (2 of 5) */}
            <div className="lg:col-span-2">
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="card-title">Select NinjaTrader File</h2>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Choose a .cs file from your local Test Library.
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

            {/* RIGHT — Synthetic Demo Lab (3 of 5) */}
            <div className="lg:col-span-3">
              <div className="card p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="card-title">Synthetic Umar Demo Lab</h2>
                    <span className="badge badge-soon flex-shrink-0">Phase 3</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Preview how the Umar logic responds before real MBO data is connected.
                  </p>
                </div>
                <SyntheticDemoLab />
              </div>
            </div>
          </div>
        </section>

        {/* ── Pipeline ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="card-title">Product Pipeline</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <PipelineBar />
        </section>

        {/* ── System Status (compact) ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="card-title">System Status</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatusCard icon="📁" label="NT8 Files"
              value="Test Library active" status="pending"
              detail="Select a .cs file from the Test folder" />
            <StatusCard icon="🗄️" label="MBO Dataset"
              value="Not Connected" status="pending"
              detail="TOWER_MBO_DATA_DIR — Phase 4" />
            <StatusCard icon="⚙️" label="Backtest Engine"
              value="Foundation Ready" status="ready"
              detail="Python engine scaffold live" />
            <StatusCard icon="🎯" label="Optimizer"
              value="Phase 6" status="coming-soon"
              detail="Parameter sweep + Monte Carlo" />
          </div>
        </section>

        {/* ── Local Setup ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="card-title">Local Setup</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Required for file selection</span>
          </div>
          <LocalSetupCard />
        </section>

        {/* ── Advanced Visualization (secondary) ───────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="card-title text-gray-400">3D Strategy Simulation Cube</h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="section-label">Phase 9</span>
          </div>
          <div className="card p-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-center">
              <div className="lg:col-span-3">
                <CubePlaceholder />
              </div>
              <div className="lg:col-span-2 space-y-3">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Visualize strategy variants, replay results, and inspect performance dimensions
                  in an interactive 3D model. Every parameter set becomes one bar.
                </p>
                <div className="surface-alt p-3">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-600">Phase 9 deliverable.</span>{" "}
                    Built after the backtest engine and optimizer produce results.
                    React Three Fiber / Three.js WebGL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Roadmap (secondary) ───────────────────────────────── */}
        <RoadmapSection />

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            TOWER Strategy Lab · Built for Serious Traders · v0.3.0 — Phase 3 Complete
          </p>
        </footer>

      </main>
    </div>
  );
}
