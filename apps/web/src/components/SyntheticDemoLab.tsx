"use client";

import { useState } from "react";
import { IS_HOSTED_PREVIEW } from "@/lib/env";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Static scenario metadata (mirrors the API) ────────────────────────────────

const SCENARIOS: ScenarioMeta[] = [
  { id: "bullish_bid_defense_reversal",  name: "Bullish Bid Defense Reversal",    expected_outcome: "BUY_REVERSAL",    description: "Sellers attack a stacked bid wall. Wall holds. Buyers reclaim.",               direction: "BUY",  signal_type: "REVERSAL" },
  { id: "bearish_ask_defense_reversal",  name: "Bearish Ask Defense Reversal",    expected_outcome: "SELL_REVERSAL",   description: "Buyers attack a stacked ask wall. Wall holds. Sellers reclaim.",              direction: "SELL", signal_type: "REVERSAL" },
  { id: "bullish_continuation_breakout", name: "Bullish Continuation Breakout",   expected_outcome: "BUY_CONTINUATION",description: "Buyers break through a defended ask wall with sustained aggression.",       direction: "BUY",  signal_type: "CONTINUATION" },
  { id: "bearish_continuation_breakdown",name: "Bearish Continuation Breakdown",  expected_outcome: "SELL_CONTINUATION",description: "Sellers break through a defended bid wall with sustained aggression.",      direction: "SELL", signal_type: "CONTINUATION" },
  { id: "neutral_no_trade",              name: "Neutral Wall — No Confirmation",  expected_outcome: "WAIT",            description: "Mild walls and balanced flow — engine correctly stays in WAIT.",            direction: "NONE", signal_type: "NONE" },
  { id: "one_signal_per_battle",         name: "One Signal Per Battle",           expected_outcome: "ONE_BUY_REVERSAL",description: "BUY REVERSAL fires once. Identical conditions repeat — no duplicates.",    direction: "BUY",  signal_type: "REVERSAL" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  WAIT:              { bg: "bg-gray-100",   text: "text-gray-500",  dot: "bg-gray-400" },
  WATCH_BUY:         { bg: "bg-amber-50",   text: "text-amber-700", dot: "bg-amber-400" },
  WATCH_SELL:        { bg: "bg-amber-50",   text: "text-amber-700", dot: "bg-amber-400" },
  BUY_REVERSAL:      { bg: "bg-green-50",   text: "text-green-700", dot: "bg-green-500" },
  SELL_REVERSAL:     { bg: "bg-red-50",     text: "text-red-700",   dot: "bg-red-500" },
  BUY_CONTINUATION:  { bg: "bg-green-50",   text: "text-green-700", dot: "bg-green-500" },
  SELL_CONTINUATION: { bg: "bg-red-50",     text: "text-red-700",   dot: "bg-red-500" },
};

function stateStyle(state: string) {
  return STATE_STYLE[state] ?? STATE_STYLE["WAIT"];
}

function directionColor(dir: string) {
  if (dir === "BUY") return "text-green-700";
  if (dir === "SELL") return "text-red-700";
  return "text-gray-500";
}

function isSignalState(state: string) {
  return ["BUY_REVERSAL", "SELL_REVERSAL", "BUY_CONTINUATION", "SELL_CONTINUATION"].includes(state);
}

// ── Mini SVG Price Chart ──────────────────────────────────────────────────────

function MiniPriceChart({ priceData, steps, signalStep }: {
  priceData: number[];
  steps: StepState[];
  signalStep: number | null;
}) {
  if (priceData.length < 2) return null;

  const W = 560;
  const H = 120;
  const PAD = { top: 16, right: 20, bottom: 24, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minP = Math.min(...priceData) - 2;
  const maxP = Math.max(...priceData) + 2;
  const priceRange = maxP - minP;

  const xStep = chartW / (priceData.length - 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (p: number) => PAD.top + chartH - ((p - minP) / priceRange) * chartH;

  const pathD = priceData
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)},${toY(p).toFixed(1)}`)
    .join(" ");

  const fillD = `${pathD} L ${toX(priceData.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L ${toX(0).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  // Y-axis labels
  const yLabels = [minP + 2, (minP + maxP) / 2, maxP - 2];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="synthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yLabels.map((yv) => (
        <line key={yv} x1={PAD.left} y1={toY(yv)} x2={W - PAD.right} y2={toY(yv)}
          stroke="#F1F5F9" strokeWidth="1" />
      ))}

      {/* Y labels */}
      {yLabels.map((yv) => (
        <text key={yv} x={PAD.left - 4} y={toY(yv) + 3} textAnchor="end"
          fontSize="8" fill="#94A3B8" fontFamily="ui-monospace, monospace">
          {yv.toFixed(0)}
        </text>
      ))}

      {/* X labels (step labels) */}
      {steps.map((s, i) => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle"
          fontSize="7" fill="#94A3B8" fontFamily="ui-monospace, monospace">
          {i + 1}
        </text>
      ))}

      {/* Gradient fill */}
      <path d={fillD} fill="url(#synthGrad)" />

      {/* Price line */}
      <path d={pathD} stroke="#2563EB" strokeWidth="2" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Signal marker */}
      {signalStep !== null && signalStep < priceData.length && (() => {
        const sig = steps[signalStep]?.signal;
        const sx = toX(signalStep);
        const sy = toY(priceData[signalStep]);
        const isBuy = sig?.direction === "BUY";
        const fill = isBuy ? "#16A34A" : "#DC2626";
        const label = isBuy ? "▲" : "▼";
        const labelY = isBuy ? sy + 16 : sy - 8;
        const markerY = isBuy ? sy + 6 : sy - 6;
        return (
          <g key="signal">
            <circle cx={sx} cy={sy} r="5" fill={fill} opacity="0.9" />
            <text x={sx} y={labelY} textAnchor="middle" fontSize="8"
              fill={fill} fontFamily="ui-monospace, monospace" fontWeight="700">
              {isBuy ? "BUY" : "SELL"}
            </text>
          </g>
        );
      })()}

      {/* Price dots at each step */}
      {priceData.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p)} r="2.5"
          fill={i === signalStep ? (steps[i]?.signal?.direction === "BUY" ? "#16A34A" : "#DC2626") : "#2563EB"}
          opacity={0.7} />
      ))}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface SyntheticDemoLabProps {
  /** Pass the currently selected file's analysis result to show context badge. */
  isMboCandidate?: boolean;
  selectedFilename?: string;
}

export default function SyntheticDemoLab({ isMboCandidate, selectedFilename }: SyntheticDemoLabProps) {
  const [selected, setSelected] = useState<ScenarioMeta>(SCENARIOS[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (IS_HOSTED_PREVIEW) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/synthetic-umar/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: selected.id }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result as RunResult);
      } else {
        setError(data.error || "Engine returned an unexpected response.");
      }
    } catch {
      setError("Network error — is the dev server running?");
    } finally {
      setRunning(false);
    }
  };

  // Signal step index (0-based) for chart
  const signalStepIdx = result?.steps.findIndex((s) => isSignalState(s.state)) ?? null;
  const lastSignal = result?.signals?.[result.signals.length - 1] ?? null;

  return (
    <div className="space-y-5">

      {/* ── File context badge ── */}
      {selectedFilename && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium ${
          isMboCandidate
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isMboCandidate ? "bg-green-500" : "bg-gray-400"}`} />
          {isMboCandidate
            ? `Umar-compatible file detected: ${selectedFilename}`
            : `Synthetic scenarios demonstrate the Umar order-flow engine (not specific to ${selectedFilename})`
          }
        </div>
      )}

      {/* ── Hosted preview notice ── */}
      {IS_HOSTED_PREVIEW && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">Synthetic engine runs locally</p>
            <p className="text-xs text-amber-700 mt-0.5">
              The Python simulation engine requires a local dev server. This hosted preview shows
              the UI shell only. Clone the repo and run locally to execute scenarios.
            </p>
          </div>
        </div>
      )}

      {/* ── Scenario selector ── */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2.5">Select Scenario</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCENARIOS.map((sc) => {
            const isActive = selected.id === sc.id;
            const dirColor =
              sc.direction === "BUY" ? "text-green-600" :
              sc.direction === "SELL" ? "text-red-600" :
              "text-gray-400";
            return (
              <button
                key={sc.id}
                onClick={() => { setSelected(sc); setResult(null); setError(null); }}
                className={[
                  "text-left p-3 rounded-xl border transition-all duration-150",
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-semibold ${isActive ? "text-blue-800" : "text-gray-800"}`}>
                    {sc.name}
                  </p>
                  {sc.direction !== "NONE" && (
                    <span className={`text-[10px] font-bold flex-shrink-0 ${dirColor}`}>
                      {sc.direction}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{sc.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Expected:</span>
                  <span className="text-[10px] font-mono font-semibold text-gray-600">
                    {sc.expected_outcome}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Run button ── */}
      <button
        onClick={handleRun}
        disabled={running || IS_HOSTED_PREVIEW}
        className={[
          "w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all",
          running || IS_HOSTED_PREVIEW
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow",
        ].join(" ")}
      >
        {running ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Running scenario…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Run Demo Scenario
          </>
        )}
      </button>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Engine error</p>
          <p className="text-xs text-gray-500 font-mono break-all">{error}</p>
        </div>
      )}

      {/* ── Results ── */}
      {result && !running && (
        <div className="space-y-4">

          {/* Result header */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">{result.scenario_name}</h4>
              <span className={`badge ${result.passed_expected_outcome ? "badge-ready" : "badge-pending"}`}>
                <span className={`status-dot ${result.passed_expected_outcome ? "bg-green-500" : "bg-amber-500"}`} />
                {result.passed_expected_outcome ? "PASS" : "REVIEW"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="section-label mb-1">Expected</p>
                <p className="text-sm font-mono font-semibold text-gray-600">{result.expected_outcome}</p>
              </div>
              <div>
                <p className="section-label mb-1">Actual</p>
                <p className={`text-sm font-mono font-semibold ${
                  result.passed_expected_outcome ? "text-green-700" : "text-amber-700"
                }`}>{result.actual_outcome}</p>
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-semibold text-gray-600">Synthetic Price Path</span>
              <span className="text-[10px] text-gray-400 font-mono">NQ · Demo Values Only</span>
            </div>
            <div className="p-3" style={{ height: 140 }}>
              <MiniPriceChart
                priceData={result.price_path}
                steps={result.steps}
                signalStep={signalStepIdx !== -1 ? signalStepIdx : null}
              />
            </div>
          </div>

          {/* State timeline */}
          <div className="card p-5">
            <p className="section-label mb-3">State Progression</p>
            <div className="flex items-start gap-1 flex-wrap">
              {result.steps.map((step, i) => {
                const ss = stateStyle(step.state);
                return (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`px-2 py-1 rounded-lg ${ss.bg}`}>
                      <div className="flex items-center gap-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                        <span className={`text-[10px] font-semibold ${ss.text}`}>{step.state}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5">{step.label}</p>
                    </div>
                    {i < result.steps.length - 1 && (
                      <span className="text-gray-300 text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step details table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Step", "State", "Price", "B%", "S%", "Δ"].map((h) => (
                      <th key={h} className="pb-2 pr-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step) => {
                    const ss = stateStyle(step.state);
                    const delta = step.trade_flow.delta;
                    return (
                      <tr key={step.step_index} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-1.5 pr-3 text-xs text-gray-400">{step.step_index}</td>
                        <td className="py-1.5 pr-3">
                          <span className={`text-[10px] font-semibold ${ss.text}`}>{step.state}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-xs font-mono text-gray-700">{step.price.toFixed(2)}</td>
                        <td className="py-1.5 pr-3 text-xs font-mono text-green-600">{step.trade_flow.buyer_pct.toFixed(0)}%</td>
                        <td className="py-1.5 pr-3 text-xs font-mono text-red-600">{step.trade_flow.seller_pct.toFixed(0)}%</td>
                        <td className={`py-1.5 pr-3 text-xs font-mono ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {delta >= 0 ? "+" : ""}{delta}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order-flow chips */}
          {lastSignal && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Signal Type", value: lastSignal.signal_type, color: "badge-soon" },
                { label: "Direction", value: lastSignal.direction, color: lastSignal.direction === "BUY" ? "badge-ready" : "badge-pending" },
                { label: "Confidence", value: lastSignal.confidence_label ?? "Demo", color: "badge-offline" },
              ].map((chip) => (
                <span key={chip.label} className={`badge ${chip.color}`}>
                  {chip.label}: {chip.value}
                </span>
              ))}
            </div>
          )}

          {/* Trade plan */}
          {lastSignal && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Demo Trade Plan</p>
                <span className={`text-xs font-bold ${directionColor(lastSignal.direction)}`}>
                  {lastSignal.direction} {lastSignal.signal_type}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Entry", value: lastSignal.entry, color: "text-blue-700" },
                  { label: "Stop", value: lastSignal.stop, color: "text-red-600" },
                  { label: "TP1 (1R)", value: lastSignal.tp1, color: "text-green-700" },
                  { label: "TP2 (2R)", value: lastSignal.tp2, color: "text-green-700" },
                ].map((item) => (
                  <div key={item.label} className="surface-alt p-3 text-center rounded-xl">
                    <p className="section-label mb-1">{item.label}</p>
                    <p className={`text-base font-bold font-mono ${item.color}`}>
                      {item.value?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {lastSignal.entry && lastSignal.stop && (
                <div className="text-xs text-gray-500">
                  Risk: <span className="font-mono font-semibold text-gray-700">
                    {Math.abs(lastSignal.entry - lastSignal.stop).toFixed(2)} pts
                  </span>
                  {" "} · TP1: {(Math.abs(lastSignal.tp1 - lastSignal.entry) / Math.abs(lastSignal.entry - lastSignal.stop)).toFixed(1)}R
                  {" "} · TP2: {(Math.abs(lastSignal.tp2 - lastSignal.entry) / Math.abs(lastSignal.entry - lastSignal.stop)).toFixed(1)}R
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                {lastSignal.reason}
              </p>
            </div>
          )}

          {/* No-trade summary */}
          {!lastSignal && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.9.985 2.8A6.723 6.723 0 0013.5 18c3.728 0 6.75-3.022 6.75-6.75S17.228 4.5 13.5 4.5c-1.084 0-2.1.262-3.003.725" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">No Signal — Correct WAIT</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The engine correctly held WAIT throughout this scenario. No qualifying wall battle
                was detected and no aggression thresholds were exceeded.
                This validates the engine does not over-signal on ambiguous setups.
              </p>
            </div>
          )}

          {/* Summary note */}
          <div className="surface-alt p-4">
            <p className="text-xs text-gray-500 leading-relaxed">{result.final_summary}</p>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            ⚠ Synthetic demo values only. These results do not represent real trading performance
            or profitability. Real validation requires Databento MBO data (Phase 4).
          </p>
        </div>
      )}
    </div>
  );
}
