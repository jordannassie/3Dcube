// Professional trading chart workspace placeholder.
// Static SVG mock — will be replaced with real backtest data in Phase 5.

const PRICE_POINTS = [
  [0,   168], [30,  160], [60,  155], [90,  165], [120, 150],
  [150, 158], [180, 143], [210, 148], [240, 132], [260, 138],
  [280, 124], [310, 115], [340, 118], [370, 104], [400,  96],
  [430,  90], [460,  84], [490,  80], [520,  86], [550,  78],
];

const pricePath = PRICE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0] + 60},${p[1]}`).join(" ");

const Y_LABELS = [
  { y: 60,  label: "19,320" },
  { y: 95,  label: "19,280" },
  { y: 130, label: "19,240" },
  { y: 165, label: "19,200" },
  { y: 200, label: "19,160" },
];

const X_LABELS = [
  { x: 60,   label: "09:30" },
  { x: 173,  label: "10:00" },
  { x: 283,  label: "10:30" },
  { x: 393,  label: "11:00" },
  { x: 503,  label: "11:30" },
  { x: 613,  label: "12:00" },
];

const METRICS = [
  { label: "Win Rate",      value: "Pending", color: "#6B7280" },
  { label: "Profit Factor", value: "Pending", color: "#6B7280" },
  { label: "Max Drawdown",  value: "Pending", color: "#6B7280" },
  { label: "MBO Data",      value: "Not Connected", color: "#9CA3AF" },
];

export default function ChartWorkspace() {
  return (
    <div className="card overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">NQ · MBO</span>
          <div className="flex gap-0.5">
            {["1m", "5m", "15m", "1h"].map((tf) => (
              <button
                key={tf}
                className={`px-2 py-0.5 text-xs rounded font-medium ${
                  tf === "5m"
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Legend */}
          {[
            { color: "#2563EB", label: "Signal" },
            { color: "#16A34A", label: "Backtest" },
            { color: "#9CA3AF", label: "Optimization" },
          ].map((l) => (
            <div key={l.label} className="hidden sm:flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {METRICS.map((m) => (
          <div key={m.label} className="px-4 py-2 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart SVG */}
      <div className="flex-1 relative">
        <svg
          viewBox="0 0 670 260"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines — horizontal */}
          {Y_LABELS.map(({ y }) => (
            <line key={y} x1="60" y1={y} x2="630" y2={y} stroke="#F3F4F6" strokeWidth="1" />
          ))}
          {/* Grid lines — vertical */}
          {X_LABELS.map(({ x }) => (
            <line key={x} x1={x} y1="20" x2={x} y2="220" stroke="#F3F4F6" strokeWidth="1" />
          ))}

          {/* Y-axis labels */}
          {Y_LABELS.map(({ y, label }) => (
            <text key={y} x="55" y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="monospace">
              {label}
            </text>
          ))}

          {/* X-axis labels */}
          {X_LABELS.map(({ x, label }) => (
            <text key={x} x={x} y="235" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="monospace">
              {label}
            </text>
          ))}

          {/* EN (Entry) dashed line */}
          <line x1="60" y1="142" x2="630" y2="142" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          <text x="634" y="146" fontSize="9" fill="#2563EB" fontFamily="monospace" fontWeight="600">EN</text>

          {/* SL (Stop Loss) dashed line */}
          <line x1="60" y1="172" x2="630" y2="172" stroke="#DC2626" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
          <text x="634" y="176" fontSize="9" fill="#DC2626" fontFamily="monospace" fontWeight="600">SL</text>

          {/* TP (Take Profit) dashed line */}
          <line x1="60" y1="82" x2="630" y2="82" stroke="#16A34A" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
          <text x="634" y="86" fontSize="9" fill="#16A34A" fontFamily="monospace" fontWeight="600">TP</text>

          {/* Gradient fill under price line */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pricePath} L 610,220 L 60,220 Z`}
            fill="url(#priceGradient)"
          />

          {/* Price line */}
          <path d={pricePath} stroke="#2563EB" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />

          {/* BUY marker — at (240,132) point index 8 */}
          <polygon points="300,152 294,165 306,165" fill="#16A34A" opacity="0.9" />
          <text x="300" y="175" textAnchor="middle" fontSize="8" fill="#16A34A" fontFamily="monospace" fontWeight="700">BUY</text>

          {/* SELL marker — at (490,80) point index 17 */}
          <polygon points="550,68 544,55 556,55" fill="#DC2626" opacity="0.9" />
          <text x="550" y="50" textAnchor="middle" fontSize="8" fill="#DC2626" fontFamily="monospace" fontWeight="700">SELL</text>

          {/* "Awaiting data" watermark */}
          <text x="345" y="120" textAnchor="middle" fontSize="11" fill="#E5E7EB" fontFamily="system-ui" fontWeight="600" letterSpacing="2">
            STRATEGY WORKSPACE PREVIEW
          </text>
          <text x="345" y="136" textAnchor="middle" fontSize="9" fill="#D1D5DB" fontFamily="system-ui">
            Backtest results will appear here after Phase 5
          </text>
        </svg>
      </div>
    </div>
  );
}
