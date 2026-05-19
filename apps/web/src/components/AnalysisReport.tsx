import type { AnalysisResult, FileType, ParameterInfo } from "@/lib/types";

interface AnalysisReportProps {
  result: AnalysisResult;
  originalFilename: string;
}

function FileTypeBadge({ type }: { type: FileType }) {
  const styles: Record<FileType, string> = {
    indicator: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    strategy: "text-violet-400 border-violet-400/30 bg-violet-400/10",
    unknown: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  };
  return (
    <span className={`text-[10px] font-black tracking-[0.2em] px-2.5 py-1 rounded-full border ${styles[type]}`}>
      {type.toUpperCase()}
    </span>
  );
}

function CapChip({
  label,
  active,
  color = "cyan",
}: {
  label: string;
  active: boolean;
  color?: "cyan" | "violet" | "blue" | "magenta" | "slate";
}) {
  const activeColors: Record<string, string> = {
    cyan:    "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    violet:  "text-violet-400 border-violet-400/30 bg-violet-400/10",
    blue:    "text-blue-400 border-blue-400/30 bg-blue-400/10",
    magenta: "text-pink-400 border-pink-400/30 bg-pink-400/10",
    slate:   "text-slate-400 border-slate-600/40 bg-slate-800/40",
  };
  const cls = active
    ? activeColors[color]
    : "text-slate-700 border-slate-800/50 bg-transparent";
  return (
    <span className={`text-[10px] font-semibold tracking-widest px-2.5 py-1 rounded-full border ${cls} transition-all`}>
      {label}
    </span>
  );
}

function ParamRow({ p }: { p: ParameterInfo }) {
  const range =
    p.range_min != null && p.range_max != null
      ? `${p.range_min} – ${p.range_max}`
      : p.range_min != null
      ? `≥ ${p.range_min}`
      : "—";

  return (
    <tr className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors">
      <td className="py-2 pr-4 text-xs font-mono text-slate-200">{p.name}</td>
      <td className="py-2 pr-4 text-xs font-mono text-cyan-500/80">{p.type}</td>
      <td className="py-2 pr-4 text-xs font-mono text-slate-400">{p.default_value ?? "—"}</td>
      <td className="py-2 pr-4 text-xs text-slate-500">{range}</td>
      <td className="py-2 text-xs text-slate-600">{p.group_name ?? "—"}</td>
    </tr>
  );
}

export default function AnalysisReport({ result, originalFilename }: AnalysisReportProps) {
  const hasWarningsToShow = result.warnings.filter(
    (w) => !w.startsWith("Phase 2 analyzer only")
  );

  return (
    <div className="glass-bright rounded-2xl overflow-hidden glow-cyan">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-slate-700/40 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg">📋</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{originalFilename}</p>
            <p className="text-[10px] text-slate-600 font-mono">
              {result.total_lines.toLocaleString()} lines · {result.total_chars.toLocaleString()} chars
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FileTypeBadge type={result.file_type} />
          {result.likely_mbo_candidate && (
            <span className="text-[10px] font-black tracking-[0.2em] px-2.5 py-1 rounded-full border text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
              MBO CANDIDATE
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-lg px-4 py-3">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Class Name</p>
            <p className="text-sm font-mono font-semibold text-slate-200">
              {result.class_name ?? <span className="text-yellow-500">Not detected</span>}
            </p>
          </div>
          {result.namespace && (
            <div className="glass rounded-lg px-4 py-3">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Namespace</p>
              <p className="text-xs font-mono text-slate-400 break-all">{result.namespace}</p>
            </div>
          )}
        </div>

        {/* Capabilities */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Capabilities Detected
          </p>
          <div className="flex flex-wrap gap-2">
            <CapChip label="Level 2 / DOM"       active={result.uses_level2}                   color="cyan" />
            <CapChip label="Market Data"          active={result.uses_market_data}              color="blue" />
            <CapChip label="Chart Drawings"       active={result.uses_chart_drawings}           color="violet" />
            <CapChip label="Alerts / Sound"       active={result.uses_alerts}                   color="slate" />
            <CapChip label="Direct Trade Orders"  active={result.contains_direct_trade_orders}  color="magenta" />
          </div>
        </div>

        {/* Methods */}
        {result.methods_detected.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-3">
              Lifecycle Methods Present
            </p>
            <div className="flex flex-wrap gap-2">
              {result.methods_detected.map((m) => (
                <span
                  key={m}
                  className="text-[10px] font-mono px-2.5 py-1 rounded border border-slate-700/40 bg-slate-800/40 text-slate-300"
                >
                  {m}()
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Parameters table */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Parameters ({result.parameters.length} detected)
          </p>
          {result.parameters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Name", "Type", "Default", "Range", "Group"].map((h) => (
                      <th
                        key={h}
                        className="pb-2 pr-4 text-[10px] font-bold tracking-widest text-slate-600 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.parameters.map((p, i) => (
                    <ParamRow key={`${p.name}-${i}`} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-600 italic">
              No [NinjaScriptProperty] parameters detected.
            </p>
          )}
        </div>

        {/* Warnings */}
        {hasWarningsToShow.length > 0 && (
          <div className="glass rounded-lg px-4 py-4 border border-yellow-500/10">
            <p className="text-[10px] font-bold tracking-[0.25em] text-yellow-500/70 uppercase mb-3">
              Parser Warnings
            </p>
            <ul className="space-y-1.5">
              {hasWarningsToShow.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-500/60 text-xs mt-0.5">⚠</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phase boundary note */}
        <div className="glass rounded-lg px-4 py-3 border border-slate-800/40">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <span className="text-cyan-500/80 font-semibold">Phase 2</span> —
            structural metadata only. Strategy definition and backtest
            translation will be built in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
