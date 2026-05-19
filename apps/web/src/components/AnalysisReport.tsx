import type { AnalysisResult, FileType, ParameterInfo } from "@/lib/types";

interface AnalysisReportProps {
  result: AnalysisResult;
  originalFilename: string;
}

function FileTypeBadge({ type }: { type: FileType }) {
  if (type === "indicator") return <span className="badge badge-soon">Indicator</span>;
  if (type === "strategy")  return <span className="badge badge-ready">Strategy</span>;
  return <span className="badge badge-offline">Unknown</span>;
}

function CapChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={[
      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
      active
        ? "text-blue-700 border-blue-200 bg-blue-50"
        : "text-gray-400 border-gray-200 bg-gray-50",
    ].join(" ")}>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
      {label}
    </span>
  );
}

function ParamRow({ p }: { p: ParameterInfo }) {
  const range =
    p.range_min != null && p.range_max != null ? `${p.range_min} – ${p.range_max}`
    : p.range_min != null ? `≥ ${p.range_min}` : "—";

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-2 pr-4 text-xs font-mono font-medium text-gray-800">{p.name}</td>
      <td className="py-2 pr-4 text-xs text-blue-600 font-mono">{p.type}</td>
      <td className="py-2 pr-4 text-xs font-mono text-gray-600">{p.default_value ?? "—"}</td>
      <td className="py-2 pr-4 text-xs text-gray-500">{range}</td>
      <td className="py-2 text-xs text-gray-400">{p.group_name ?? "—"}</td>
    </tr>
  );
}

export default function AnalysisReport({ result, originalFilename }: AnalysisReportProps) {
  const displayWarnings = result.warnings.filter(w => !w.startsWith("Phase 2 analyzer only"));

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{originalFilename}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {result.total_lines.toLocaleString()} lines · {result.total_chars.toLocaleString()} chars
            {result.class_name && ` · ${result.class_name}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FileTypeBadge type={result.file_type} />
          {result.likely_mbo_candidate && (
            <span className="badge badge-ready">MBO Candidate</span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Capabilities */}
        <div>
          <p className="section-label mb-2">Detected Capabilities</p>
          <div className="flex flex-wrap gap-2">
            <CapChip label="Level 2 / DOM"       active={result.uses_level2} />
            <CapChip label="Market Data"          active={result.uses_market_data} />
            <CapChip label="Chart Drawings"       active={result.uses_chart_drawings} />
            <CapChip label="Alerts"               active={result.uses_alerts} />
            <CapChip label="Trade Orders"         active={result.contains_direct_trade_orders} />
          </div>
        </div>

        {/* Methods */}
        {result.methods_detected.length > 0 && (
          <div>
            <p className="section-label mb-2">Lifecycle Methods</p>
            <div className="flex flex-wrap gap-1.5">
              {result.methods_detected.map((m) => (
                <span key={m} className="text-xs font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">
                  {m}()
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Parameters */}
        <div>
          <p className="section-label mb-2">Parameters — {result.parameters.length} detected</p>
          {result.parameters.length > 0 ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Name", "Type", "Default", "Range", "Group"].map(h => (
                      <th key={h} className="pb-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.parameters.map((p, i) => <ParamRow key={i} p={p} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No [NinjaScriptProperty] parameters detected.</p>
          )}
        </div>

        {/* Warnings */}
        {displayWarnings.length > 0 && (
          <div className="surface-alt p-4">
            <p className="section-label mb-2 text-amber-600">Warnings</p>
            <ul className="space-y-1.5">
              {displayWarnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 text-xs mt-0.5">⚠</span>
                  <span className="text-xs text-gray-500 leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phase note */}
        <div className="surface-alt p-3">
          <p className="text-xs text-gray-400">
            <span className="font-medium text-blue-600">Phase 2 complete.</span>{" "}
            This is structural metadata analysis. Strategy definition and backtesting come in Phase 3+.
          </p>
        </div>
      </div>
    </div>
  );
}
