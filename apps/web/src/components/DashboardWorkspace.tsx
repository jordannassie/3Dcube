"use client";

import { useRef, useState } from "react";
import UploadSection from "@/components/UploadSection";
import BacktestChart from "@/components/BacktestChart";
import AnalysisReport from "@/components/AnalysisReport";
import { IS_HOSTED_PREVIEW } from "@/lib/env";
import type {
  AnalysisResult,
  BacktestChartPoint,
  BacktestTradeMarker,
  TradeResult,
} from "@/lib/types";

// ── Local types ───────────────────────────────────────────────────────────────

interface ScenarioMeta {
  id: string;
  name: string;
  expected_outcome: string;
  description: string;
  direction: string;
  signal_type: string;
}

interface StepState {
  step_index: number;
  label: string;
  price: number;
  state: string;
  reason: string;
  notes: string;
  trade_flow: {
    buyer_pct: number;
    seller_pct: number;
    delta: number;
    aggressive_buy_contracts: number;
    aggressive_sell_contracts: number;
  };
  signal: SignalData | null;
}

interface SignalData {
  state: string;
  signal_type: string;
  direction: string;
  reason: string;
  entry: number;
  stop: number;
  tp1: number;
  tp2: number;
  confidence_label: string;
}

interface RunResult {
  scenario_id: string;
  scenario_name: string;
  expected_outcome: string;
  actual_outcome: string;
  passed_expected_outcome: boolean;
  final_summary: string;
  steps: StepState[];
  signals: SignalData[];
  price_path: number[];
  step_labels: string[];
}

type ActiveTab = "trades" | "file-details" | "notes";

// ── Scenario list (mirrors Python SCENARIO_REGISTRY) ─────────────────────────

const SCENARIOS: ScenarioMeta[] = [
  { id: "bullish_bid_defense_reversal",   name: "Bullish Bid Defense Reversal",   expected_outcome: "BUY_REVERSAL",     description: "Sellers attack a stacked bid wall. Wall holds. Buyers reclaim.",       direction: "BUY",  signal_type: "REVERSAL"      },
  { id: "bearish_ask_defense_reversal",   name: "Bearish Ask Defense Reversal",   expected_outcome: "SELL_REVERSAL",    description: "Buyers attack a stacked ask wall. Wall holds. Sellers reclaim.",      direction: "SELL", signal_type: "REVERSAL"      },
  { id: "bullish_continuation_breakout",  name: "Bullish Continuation Breakout",  expected_outcome: "BUY_CONTINUATION", description: "Buyers break through a defended ask wall with sustained aggression.", direction: "BUY",  signal_type: "CONTINUATION"  },
  { id: "bearish_continuation_breakdown", name: "Bearish Continuation Breakdown", expected_outcome: "SELL_CONTINUATION",description: "Sellers break through a defended bid wall with sustained aggression.", direction: "SELL", signal_type: "CONTINUATION"  },
  { id: "neutral_no_trade",               name: "Neutral — No Confirmation",      expected_outcome: "WAIT",             description: "Mild walls and balanced flow — engine correctly stays in WAIT.",    direction: "NONE", signal_type: "NONE"          },
  { id: "one_signal_per_battle",          name: "One Signal Per Battle",          expected_outcome: "ONE_BUY_REVERSAL", description: "BUY REVERSAL fires once. Identical conditions repeat — no duplicates.", direction: "BUY", signal_type: "REVERSAL"    },
];

// ── Style helpers ─────────────────────────────────────────────────────────────

const STATE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  WAIT:              { bg: "bg-gray-100",  text: "text-gray-500",  dot: "bg-gray-400"  },
  WATCH_BUY:         { bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400" },
  WATCH_SELL:        { bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400" },
  BUY_REVERSAL:      { bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500" },
  SELL_REVERSAL:     { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500"   },
  BUY_CONTINUATION:  { bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500" },
  SELL_CONTINUATION: { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500"   },
};

function stateStyle(state: string) {
  return STATE_STYLE[state] ?? STATE_STYLE["WAIT"];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusStrip({
  filename,
}: {
  filename: string | null;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-semibold text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Local
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Synthetic Demo Mode
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-500">
        MBO Data: Not Connected
      </span>
      {filename && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-600 max-w-[200px] truncate">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="truncate">{filename}</span>
        </span>
      )}
    </div>
  );
}

function ScenarioCard({
  scenario,
  active,
  onClick,
}: {
  scenario: ScenarioMeta;
  active: boolean;
  onClick: () => void;
}) {
  const dirColor =
    scenario.direction === "BUY"  ? "text-green-600" :
    scenario.direction === "SELL" ? "text-red-600"   : "text-gray-400";
  return (
    <button
      onClick={onClick}
      className={[
        "text-left px-3 py-2.5 rounded-xl border transition-all duration-150",
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className={`text-xs font-semibold leading-snug ${active ? "text-blue-800" : "text-gray-800"}`}>
          {scenario.name}
        </p>
        {scenario.direction !== "NONE" && (
          <span className={`text-[10px] font-bold flex-shrink-0 ${dirColor}`}>
            {scenario.direction}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">{scenario.description}</p>
    </button>
  );
}

function StateTimeline({ steps }: { steps: StepState[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => {
        const ss = stateStyle(step.state);
        return (
          <div key={i} className="flex items-center gap-1">
            <div className={`px-2 py-1 rounded-lg ${ss.bg}`}>
              <div className="flex items-center gap-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${ss.dot}`} />
                <span className={`text-[10px] font-semibold ${ss.text}`}>{step.state}</span>
              </div>
            </div>
            {i < steps.length - 1 && <span className="text-gray-200 text-sm">›</span>}
          </div>
        );
      })}
    </div>
  );
}

function ResultSummary({ result }: { result: RunResult }) {
  const lastSignal = result.signals?.[result.signals.length - 1] ?? null;
  const isBuy = lastSignal?.direction === "BUY";

  return (
    <div className="space-y-3">
      {/* Outcome cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Expected</p>
          <p className="text-xs font-mono font-semibold text-gray-700">{result.expected_outcome}</p>
        </div>
        <div className={`rounded-xl border p-3 ${result.passed_expected_outcome ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Actual</p>
          <p className={`text-xs font-mono font-semibold ${result.passed_expected_outcome ? "text-green-700" : "text-amber-700"}`}>
            {result.actual_outcome}
          </p>
        </div>
      </div>

      {/* Status + Signal row */}
      <div className="flex items-center gap-2">
        <span className={`badge ${result.passed_expected_outcome ? "badge-ready" : "badge-pending"}`}>
          <span className={`status-dot ${result.passed_expected_outcome ? "bg-green-500" : "bg-amber-500"}`} />
          {result.passed_expected_outcome ? "PASS" : "REVIEW"}
        </span>
        {lastSignal && (
          <span className={`badge ${isBuy ? "badge-ready" : "badge-pending"}`}>
            {lastSignal.direction} {lastSignal.signal_type}
          </span>
        )}
        {!lastSignal && (
          <span className="badge badge-offline">No Signal — Correct WAIT</span>
        )}
      </div>

      {/* Trade plan (when signal exists) */}
      {lastSignal && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-gray-700">Demo Trade Plan</p>
            <span className={`text-[11px] font-bold ${isBuy ? "text-green-700" : "text-red-700"}`}>
              {lastSignal.direction} {lastSignal.signal_type}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-2.5">
            {[
              { label: "Entry", value: lastSignal.entry, color: "text-blue-700" },
              { label: "Stop",  value: lastSignal.stop,  color: "text-red-600"  },
              { label: "TP1",   value: lastSignal.tp1,   color: "text-green-700"},
              { label: "TP2",   value: lastSignal.tp2,   color: "text-green-700"},
            ].map((item) => (
              <div key={item.label} className="surface-alt rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-400 uppercase">{item.label}</p>
                <p className={`text-xs font-bold font-mono mt-0.5 ${item.color}`}>
                  {item.value?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          {lastSignal.entry && lastSignal.stop && (
            <p className="text-[10px] text-gray-400">
              Risk: <span className="font-mono font-semibold text-gray-600">
                {Math.abs(lastSignal.entry - lastSignal.stop).toFixed(2)} pts
              </span>
              {" · "}TP1: {(Math.abs(lastSignal.tp1 - lastSignal.entry) / Math.abs(lastSignal.entry - lastSignal.stop)).toFixed(1)}R
              {" · "}TP2: {(Math.abs(lastSignal.tp2 - lastSignal.entry) / Math.abs(lastSignal.entry - lastSignal.stop)).toFixed(1)}R
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100 leading-relaxed">
            {lastSignal.reason}
          </p>
        </div>
      )}

      {/* No-trade summary */}
      {!lastSignal && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">No Signal — Correct WAIT</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            The engine held WAIT throughout. No qualifying wall battle was detected and no aggression
            thresholds were exceeded — validating the engine does not over-signal on ambiguous setups.
          </p>
        </div>
      )}

      {/* Final summary note */}
      <p className="text-[10px] text-gray-400 leading-relaxed">{result.final_summary}</p>
    </div>
  );
}

// ── Trades tab ────────────────────────────────────────────────────────────────

function TradesTable({ result }: { result: RunResult | null }) {
  if (!result) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400">Run a synthetic scenario to see generated signals here.</p>
        <p className="text-xs text-gray-300 mt-1">
          In real MBO mode this table will contain every strategy trade across the full backtest period.
        </p>
      </div>
    );
  }

  const signalSteps = result.steps.filter((s) => s.signal !== null);

  if (signalSteps.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500 font-medium">No signals generated</p>
        <p className="text-xs text-gray-400 mt-1">
          The engine held WAIT for the entire "{result.scenario_name}" scenario. This is expected for neutral setups.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-600">
          {signalSteps.length} signal{signalSteps.length !== 1 ? "s" : ""} · Scenario: {result.scenario_name}
        </p>
        <span className="text-[10px] text-gray-400">
          Demo values only — no real trade performance
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["Step", "Signal", "Direction", "Entry", "Stop", "TP1", "TP2", "Status"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signalSteps.map((step) => {
              const sig = step.signal!;
              const isBuy = sig.direction === "BUY";
              return (
                <tr key={step.step_index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{step.step_index}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-700">{sig.signal_type}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold ${isBuy ? "text-green-700" : "text-red-700"}`}>
                      {sig.direction}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-mono text-blue-700">{sig.entry.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-red-600">{sig.stop.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-green-700">{sig.tp1.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-green-700">{sig.tp2.toFixed(2)}</td>
                  <td className="px-3 py-2.5">
                    <span className="badge badge-offline text-[10px]">Demo</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
        ⚠ Synthetic demo values only. Real MBO mode will replay historical data and populate
        every strategy trade across the full backtest period with actual entry/exit prices.
      </p>
    </div>
  );
}

// ── Backtest Notes tab ────────────────────────────────────────────────────────

function BacktestNotesTab() {
  return (
    <div className="space-y-3 py-2">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-1.5">Current Mode: Synthetic Demo</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          The Umar engine is running against deterministic synthetic market snapshots. These are not
          real historical prices. They prove the engine logic is correct without requiring live MBO data.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-gray-700">What real MBO mode will add:</p>
        {[
          "Replay the selected historical NQ dataset tick-by-tick",
          "Plot every valid strategy trade across the full backtest period on the Backtest Results Chart",
          "Populate the Trades table with hundreds or thousands of real signals",
          "Calculate Win Rate, Profit Factor, Max Drawdown, Sharpe Ratio",
          "Enable parameter optimization and robustness testing (Phase 6)",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Real MBO mode will replay the selected historical dataset and plot every valid strategy
        trade across the full backtest range. Connect <code className="font-mono bg-gray-100 px-1 rounded">TOWER_MBO_DATA_DIR</code> to begin.
      </p>
    </div>
  );
}

// ── Main DashboardWorkspace ───────────────────────────────────────────────────

export default function DashboardWorkspace() {
  // File state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);

  // Scenario state
  const [selectedScenario, setSelectedScenario] = useState<ScenarioMeta>(SCENARIOS[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("trades");

  // Ref for scrolling to lower panel
  const lowerPanelRef = useRef<HTMLDivElement>(null);

  const handleAnalysis = (res: AnalysisResult | null, filename: string | null) => {
    setAnalysis(res);
    setSelectedFilename(filename);
  };

  const handleViewFileDetails = () => {
    setActiveTab("file-details");
    setTimeout(() => {
      lowerPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleScenarioChange = (sc: ScenarioMeta) => {
    setSelectedScenario(sc);
    setResult(null);
    setRunError(null);
  };

  const handleRun = async () => {
    if (IS_HOSTED_PREVIEW) return;
    setRunning(true);
    setResult(null);
    setRunError(null);
    try {
      const res = await fetch("/api/synthetic-umar/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: selectedScenario.id }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result as RunResult);
        setActiveTab("trades");
      } else {
        setRunError(data.error || "Engine returned an unexpected response.");
      }
    } catch {
      setRunError("Network error — is the dev server running?");
    } finally {
      setRunning(false);
    }
  };

  // Derive chart data from result
  const chartPoints: BacktestChartPoint[] = result
    ? result.price_path.map((price, i) => ({
        step: i,
        price,
        label: result.step_labels[i] ?? String(i + 1),
      }))
    : [];

  const tradeMarkers: BacktestTradeMarker[] = result
    ? result.steps
        .filter((s) => s.signal !== null)
        .map((s, i) => ({
          id: `sig-${i}`,
          step: s.step_index,
          entryPrice: s.signal!.entry,
          direction: s.signal!.direction as "BUY" | "SELL",
          signalType: s.signal!.signal_type,
          result: "NONE" as TradeResult,
          stopPrice: s.signal!.stop,
          tp1Price: s.signal!.tp1,
          tp2Price: s.signal!.tp2,
          reason: s.signal!.reason,
        }))
    : [];

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "trades",       label: "Trades"        },
    { id: "file-details", label: "File Details"  },
    { id: "notes",        label: "Backtest Notes" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Hero + Status ── */}
      <section className="pt-1">
        {IS_HOSTED_PREVIEW ? (
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Hosted Preview — Run locally for full functionality
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <StatusStrip filename={selectedFilename} />
          </div>
        )}
        <h1 className="page-title mb-1">TOWER Strategy Lab</h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
          Select a NinjaTrader file. Test the logic. Prepare for full MBO backtesting.
        </p>
      </section>

      {/* ── Primary Two-Column Workspace ── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-5 items-start">

          {/* LEFT: File selection + Test setup (3/8) */}
          <div className="lg:col-span-3 space-y-4">

            {/* File selector card */}
            <div className="card p-4">
              <div className="flex items-start justify-between mb-3.5">
                <div>
                  <h2 className="card-title">Select NinjaTrader File</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Choose an Indicator or Strategy .cs file from your local Test Library.
                  </p>
                </div>
                <span className="badge badge-soon ml-2 flex-shrink-0">
                  <span className="status-dot bg-blue-500 dot-pulse" />
                  Active
                </span>
              </div>
              <UploadSection
                onAnalysis={handleAnalysis}
                onViewFileDetails={handleViewFileDetails}
              />
            </div>

            {/* Synthetic test setup card */}
            <div className="card p-4">
              <div className="mb-3.5">
                <h2 className="card-title mb-0.5">Synthetic Test Setup</h2>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Select a scenario and run the Umar order-flow engine against synthetic market data.
                </p>
              </div>

              {/* Scenario cards */}
              <div className="grid grid-cols-1 gap-2 mb-3.5">
                {SCENARIOS.map((sc) => (
                  <ScenarioCard
                    key={sc.id}
                    scenario={sc}
                    active={selectedScenario.id === sc.id}
                    onClick={() => handleScenarioChange(sc)}
                  />
                ))}
              </div>

              {/* Hosted notice */}
              {IS_HOSTED_PREVIEW && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Python engine runs locally only. Clone the repo and run <code className="font-mono bg-amber-100 px-0.5 rounded">npm run dev</code> to execute scenarios.
                  </p>
                </div>
              )}

              {/* Run button */}
              <button
                onClick={handleRun}
                disabled={running || IS_HOSTED_PREVIEW}
                className={[
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  running || IS_HOSTED_PREVIEW
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow",
                ].join(" ")}
              >
                {running ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    Run Demo Scenario
                  </>
                )}
              </button>

              {runError && (
                <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Engine error</p>
                  <p className="text-[11px] text-gray-500 font-mono break-all">{runError}</p>
                </div>
              )}

              <p className="text-[10px] text-gray-400 leading-relaxed mt-3">
                Synthetic mode previews logic only. Real 3-month backtesting begins when MBO data is connected.
              </p>
            </div>
          </div>

          {/* RIGHT: Backtest Results Chart + results (5/8) */}
          <div className="lg:col-span-5 space-y-4">

            {/* Chart card */}
            <div className="card overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className="card-title">Backtest Results Chart</h2>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      Synthetic mode shows demo logic.{" "}
                      <span className="text-gray-300">
                        Real MBO mode will plot all trades across the selected backtest period.
                      </span>
                    </p>
                  </div>
                  {result && (
                    <span className={`badge flex-shrink-0 ml-3 ${result.passed_expected_outcome ? "badge-ready" : "badge-pending"}`}>
                      <span className={`status-dot ${result.passed_expected_outcome ? "bg-green-500" : "bg-amber-500"}`} />
                      {result.passed_expected_outcome ? "PASS" : "REVIEW"}
                    </span>
                  )}
                </div>
              </div>
              <BacktestChart
                points={chartPoints}
                trades={tradeMarkers}
                mode="synthetic"
                height={230}
              />
            </div>

            {/* State timeline (when result exists) */}
            {result && (
              <div className="card px-4 py-3.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  State Progression · {result.scenario_name}
                </p>
                <StateTimeline steps={result.steps} />
              </div>
            )}

            {/* Result summary (when result exists) */}
            {result && (
              <div className="card p-4">
                <ResultSummary result={result} />
              </div>
            )}

            {/* Awaiting run placeholder */}
            {!result && !running && (
              <div className="card p-5 text-center border-dashed">
                <p className="text-sm text-gray-400">Select a scenario and click Run Demo Scenario to see results.</p>
                <p className="text-xs text-gray-300 mt-1">
                  Results, state timeline, and trade plan will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Lower Tabbed Panel ── */}
      <section ref={lowerPanelRef} className="card overflow-hidden" id="lower-panel">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-5 py-3 text-xs font-semibold transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100",
              ].join(" ")}
            >
              {tab.label}
              {tab.id === "trades" && result && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                  {result.steps.filter((s) => s.signal !== null).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "trades" && <TradesTable result={result} />}
          {activeTab === "file-details" && (
            analysis ? (
              <AnalysisReport result={analysis} originalFilename={selectedFilename ?? ""} />
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">
                  Select and analyze a .cs file to view its full details here.
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Parameters, methods, capabilities, and warnings will appear in this tab.
                </p>
              </div>
            )
          )}
          {activeTab === "notes" && <BacktestNotesTab />}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          TOWER Strategy Lab · Built for Serious Traders · v0.3.0 — Phase 3 Complete
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          Real MBO mode will replay the selected historical dataset and plot every valid strategy trade across the full backtest range.
        </p>
      </footer>

    </div>
  );
}
