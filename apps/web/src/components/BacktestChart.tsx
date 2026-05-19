"use client";

import { useState } from "react";
import type {
  BacktestChartPoint,
  BacktestTradeMarker,
  TradeFilter,
} from "@/lib/types";

interface BacktestChartProps {
  points: BacktestChartPoint[];
  trades: BacktestTradeMarker[];
  /** "synthetic" = demo mode with reference lines; "mbo" = dense real trade markers */
  mode?: "synthetic" | "mbo";
  height?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FILTER_OPTS: { id: TradeFilter; label: string }[] = [
  { id: "ALL",     label: "All" },
  { id: "BUY",     label: "Buy" },
  { id: "SELL",    label: "Sell" },
  { id: "WINNERS", label: "Winners" },
  { id: "LOSERS",  label: "Losers" },
];

function passesFilter(trade: BacktestTradeMarker, filter: TradeFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "BUY") return trade.direction === "BUY";
  if (filter === "SELL") return trade.direction === "SELL";
  if (filter === "WINNERS") return trade.result === "WIN";
  if (filter === "LOSERS") return trade.result === "LOSS";
  return true;
}

function EmptyChart({ mode }: { mode: "synthetic" | "mbo" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400">
          {mode === "synthetic" ? "Select a scenario and run to see results" : "No backtest data loaded"}
        </p>
        <p className="text-xs text-gray-300 mt-1">
          {mode === "synthetic"
            ? "Synthetic price path and signal markers will appear here"
            : "Connect MBO data and run a backtest to populate this chart"}
        </p>
      </div>
    </div>
  );
}

// ── SVG Chart ─────────────────────────────────────────────────────────────────

function ChartSvg({
  points,
  trades,
  height,
}: {
  points: BacktestChartPoint[];
  trades: BacktestTradeMarker[];
  height: number;
}) {
  const W = 800;
  const H = height;
  const PAD = { top: 18, right: 20, bottom: 28, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const prices = points.map((p) => p.price);
  const allLevels = [
    ...prices,
    ...trades.flatMap((t) => [
      t.entryPrice,
      t.stopPrice ?? t.entryPrice,
      t.tp2Price ?? t.entryPrice,
    ]),
  ].filter(Boolean);

  const rawMin = Math.min(...allLevels);
  const rawMax = Math.max(...allLevels);
  const range = rawMax - rawMin || 10;
  const pad = range * 0.12;
  const minP = rawMin - pad;
  const maxP = rawMax + pad;
  const priceRange = maxP - minP;

  const xStep = chartW / Math.max(points.length - 1, 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (p: number) => PAD.top + chartH - ((p - minP) / priceRange) * chartH;

  // Y-axis grid lines
  const yCount = 5;
  const yLines = Array.from({ length: yCount }, (_, i) =>
    minP + (priceRange * i) / (yCount - 1)
  );

  // Price path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)},${toY(p.price).toFixed(1)}`)
    .join(" ");

  const fillD = points.length > 1
    ? `${pathD} L ${toX(points.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L ${toX(0).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`
    : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="btGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLines.map((yv, i) => (
        <line key={i}
          x1={PAD.left} y1={toY(yv)} x2={W - PAD.right} y2={toY(yv)}
          stroke="#F1F5F9" strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {yLines.map((yv, i) => (
        <text key={i}
          x={PAD.left - 6} y={toY(yv) + 3.5}
          textAnchor="end" fontSize="9" fill="#94A3B8"
          fontFamily="ui-monospace, monospace"
        >
          {yv.toFixed(0)}
        </text>
      ))}

      {/* X-axis step labels */}
      {points.map((p, i) => {
        if (points.length <= 12 || i % Math.ceil(points.length / 8) === 0) {
          return (
            <text key={i}
              x={toX(i)} y={H - 6}
              textAnchor="middle" fontSize="8" fill="#94A3B8"
              fontFamily="ui-monospace, monospace"
            >
              {p.label ?? (i + 1)}
            </text>
          );
        }
        return null;
      })}

      {/* Gradient fill under price line */}
      {fillD && <path d={fillD} fill="url(#btGrad)" />}

      {/* Price line */}
      {pathD && (
        <path d={pathD} stroke="#2563EB" strokeWidth="2" fill="none"
          strokeLinejoin="round" strokeLinecap="round" />
      )}

      {/* EN / SL / TP reference lines (synthetic mode: single trade) */}
      {trades.length === 1 && (() => {
        const t = trades[0];
        const lines: Array<{ price: number; label: string; color: string; dash?: string }> = [
          { price: t.entryPrice, label: "EN", color: "#2563EB" },
        ];
        if (t.stopPrice !== undefined)
          lines.push({ price: t.stopPrice, label: "SL", color: "#DC2626", dash: "4,3" });
        if (t.tp1Price !== undefined)
          lines.push({ price: t.tp1Price, label: "TP1", color: "#16A34A", dash: "3,3" });
        if (t.tp2Price !== undefined)
          lines.push({ price: t.tp2Price, label: "TP2", color: "#15803D", dash: "3,3" });
        return lines.map((ln) => {
          const ly = toY(ln.price);
          if (ly < PAD.top - 2 || ly > PAD.top + chartH + 2) return null;
          return (
            <g key={ln.label}>
              <line
                x1={PAD.left} y1={ly} x2={W - PAD.right} y2={ly}
                stroke={ln.color} strokeWidth="1"
                strokeDasharray={ln.dash ?? ""}
                opacity={0.55}
              />
              <rect x={W - PAD.right + 1} y={ly - 7} width={26} height={12}
                fill={ln.color} opacity={0.85} rx="2" />
              <text x={W - PAD.right + 14} y={ly + 3.5}
                textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700"
                fontFamily="ui-sans-serif, sans-serif">
                {ln.label}
              </text>
            </g>
          );
        });
      })()}

      {/* Trade markers */}
      {trades.map((trade) => {
        if (trade.step >= points.length) return null;
        const mx = toX(trade.step);
        const my = toY(points[trade.step].price);
        const isBuy = trade.direction === "BUY";
        const fill = isBuy ? "#16A34A" : "#DC2626";
        const labelY = isBuy ? my + 18 : my - 10;
        return (
          <g key={trade.id}>
            <circle cx={mx} cy={my} r="6" fill={fill} opacity="0.15" />
            <circle cx={mx} cy={my} r="4" fill={fill} opacity="0.9" />
            <text x={mx} y={labelY}
              textAnchor="middle" fontSize="9" fill={fill}
              fontWeight="700" fontFamily="ui-sans-serif, sans-serif">
              {isBuy ? "▲ BUY" : "▼ SELL"}
            </text>
          </g>
        );
      })}

      {/* Price dots */}
      {points.map((p, i) => {
        const isTradePt = trades.some((t) => t.step === i);
        return (
          <circle key={i}
            cx={toX(i)} cy={toY(p.price)} r={isTradePt ? 0 : 2.5}
            fill="#2563EB" opacity={0.5}
          />
        );
      })}
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function BacktestChart({
  points,
  trades,
  mode = "synthetic",
  height = 220,
}: BacktestChartProps) {
  const [filter, setFilter] = useState<TradeFilter>("ALL");

  const hasData = points.length >= 2;

  // Filters only applicable when multiple trade markers exist
  const canFilter = trades.length > 1;
  const visibleTrades = canFilter
    ? trades.filter((t) => passesFilter(t, filter))
    : trades;

  return (
    <div className="flex flex-col gap-0">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1 items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-gray-700">NQ · MBO</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {mode === "synthetic" ? "Synthetic demo values" : "MBO replay data"}
          </span>
        </div>

        {/* Filter pills — enabled only when multiple trades */}
        <div className="flex items-center gap-1">
          {FILTER_OPTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => canFilter && setFilter(opt.id)}
              disabled={!canFilter}
              className={[
                "px-2 py-0.5 text-[10px] font-semibold rounded transition-colors",
                !canFilter
                  ? "text-gray-300 cursor-default"
                  : filter === opt.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart body ── */}
      <div
        className="relative bg-white rounded-b-xl overflow-hidden"
        style={{ height }}
      >
        {hasData ? (
          <div className="w-full h-full p-2">
            <ChartSvg points={points} trades={visibleTrades} height={height - 16} />
          </div>
        ) : (
          <EmptyChart mode={mode} />
        )}

        {/* MBO future placeholder watermark */}
        {!hasData && mode === "mbo" && (
          <div className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none">
            <span className="text-[9px] text-gray-200 font-mono">
              Real MBO mode will plot all trades across the selected backtest period
            </span>
          </div>
        )}
      </div>

      {/* ── Trade count strip ── */}
      <div className="px-4 py-1.5 border-t border-gray-100 flex items-center gap-3">
        <span className="text-[10px] text-gray-400">
          {hasData
            ? `${points.length} price steps · ${visibleTrades.length} signal${visibleTrades.length !== 1 ? "s" : ""}`
            : "Awaiting scenario run"
          }
        </span>
        {mode === "synthetic" && (
          <span className="text-[10px] text-gray-300">·  Demo values only — no real trades</span>
        )}
      </div>
    </div>
  );
}
