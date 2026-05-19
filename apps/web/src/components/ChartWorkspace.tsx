// Strategy Workspace Preview — static SVG mock.
// Real backtest results will populate this in Phase 5.

const PRICE_POINTS = [
  [0,   192], [40,  185], [80,  178], [120, 188], [160, 172],
  [200, 180], [240, 163], [280, 168], [320, 150], [350, 157],
  [380, 141], [420, 131], [450, 134], [480, 118], [520, 108],
  [560, 100], [590,  93], [620,  88], [650,  94], [680,  86],
];

const pricePath = PRICE_POINTS.map((p, i) =>
  `${i === 0 ? "M" : "L"} ${p[0] + 54},${p[1]}`
).join(" ");

const Y_LABELS = [
  { y: 62,  label: "19,340" },
  { y: 98,  label: "19,300" },
  { y: 134, label: "19,260" },
  { y: 170, label: "19,220" },
  { y: 206, label: "19,180" },
];

const X_LABELS = [
  { x: 54,   label: "09:30" },
  { x: 186,  label: "10:00" },
  { x: 314,  label: "10:30" },
  { x: 440,  label: "11:00" },
  { x: 566,  label: "11:30" },
  { x: 690,  label: "12:00" },
];

const METRICS = [
  { label: "Win Rate",      value: "—",     sub: "Awaiting backtest", color: "#94A3B8" },
  { label: "Profit Factor", value: "—",     sub: "Awaiting backtest", color: "#94A3B8" },
  { label: "Max Drawdown",  value: "—",     sub: "Awaiting backtest", color: "#94A3B8" },
  { label: "MBO Data",      value: "Phase 4", sub: "Not yet connected", color: "#CBD5E1" },
];

export default function ChartWorkspace() {
  return (
    <div className="card overflow-hidden flex flex-col h-full min-h-[400px]">

      {/* ── Toolbar ── */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">NQ · MBO</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Micro Market-by-Order</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex gap-0.5">
            {["1m", "5m", "15m", "1h", "4h"].map((tf) => (
              <button
                key={tf}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
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

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4">
          {[
            { color: "#16A34A", label: "Buy Signal" },
            { color: "#DC2626", label: "Sell Signal" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metrics strip ── */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
        {METRICS.map((m) => (
          <div key={m.label} className="px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-lg font-bold mt-0.5 leading-none" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[9px] text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Chart SVG ── */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox="0 0 754 280"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid — horizontal */}
          {Y_LABELS.map(({ y }) => (
            <line key={y} x1="54" y1={y} x2="730" y2={y} stroke="#F1F5F9" strokeWidth="1" />
          ))}
          {/* Grid — vertical */}
          {X_LABELS.map(({ x }) => (
            <line key={x} x1={x} y1="20" x2={x} y2="234" stroke="#F1F5F9" strokeWidth="1" />
          ))}

          {/* Y-axis labels */}
          {Y_LABELS.map(({ y, label }) => (
            <text key={y} x="50" y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="ui-monospace, monospace">
              {label}
            </text>
          ))}
          {/* X-axis labels */}
          {X_LABELS.map(({ x, label }) => (
            <text key={x} x={x} y="250" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="ui-monospace, monospace">
              {label}
            </text>
          ))}

          {/* EN line */}
          <line x1="54" y1="157" x2="730" y2="157" stroke="#2563EB" strokeWidth="1" strokeDasharray="5,3" opacity="0.4" />
          <rect x="716" y="150" width="22" height="13" fill="#EFF6FF" rx="2" />
          <text x="727" y="160" textAnchor="middle" fontSize="8" fill="#2563EB" fontFamily="ui-monospace, monospace" fontWeight="700">EN</text>

          {/* SL line */}
          <line x1="54" y1="192" x2="730" y2="192" stroke="#DC2626" strokeWidth="1" strokeDasharray="5,3" opacity="0.35" />
          <rect x="716" y="185" width="22" height="13" fill="#FEF2F2" rx="2" />
          <text x="727" y="195" textAnchor="middle" fontSize="8" fill="#DC2626" fontFamily="ui-monospace, monospace" fontWeight="700">SL</text>

          {/* TP line */}
          <line x1="54" y1="90" x2="730" y2="90" stroke="#16A34A" strokeWidth="1" strokeDasharray="5,3" opacity="0.35" />
          <rect x="716" y="83" width="22" height="13" fill="#F0FDF4" rx="2" />
          <text x="727" y="93" textAnchor="middle" fontSize="8" fill="#16A34A" fontFamily="ui-monospace, monospace" fontWeight="700">TP</text>

          {/* Gradient fill */}
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pricePath} L 734,234 L 54,234 Z`}
            fill="url(#priceGrad)"
          />

          {/* Price line */}
          <path d={pricePath} stroke="#2563EB" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />

          {/* BUY marker */}
          <polygon points="374,171 368,184 380,184" fill="#16A34A" opacity="0.85" />
          <text x="374" y="196" textAnchor="middle" fontSize="8" fill="#16A34A" fontFamily="ui-monospace, monospace" fontWeight="700">BUY</text>

          {/* SELL marker */}
          <polygon points="624,76 618,63 630,63" fill="#DC2626" opacity="0.85" />
          <text x="624" y="58" textAnchor="middle" fontSize="8" fill="#DC2626" fontFamily="ui-monospace, monospace" fontWeight="700">SELL</text>

          {/* Watermark */}
          <text x="392" y="132" textAnchor="middle" fontSize="10" fill="#E2E8F0" fontFamily="system-ui" fontWeight="700" letterSpacing="2.5">
            STRATEGY WORKSPACE PREVIEW
          </text>
          <text x="392" y="148" textAnchor="middle" fontSize="9" fill="#E2E8F0" fontFamily="system-ui" letterSpacing="0.5">
            Backtest results appear here in Phase 5
          </text>
        </svg>
      </div>
    </div>
  );
}
