const STEPS = [
  { num: 1, label: "Select .cs",      sub: "Test Library",    done: true,  current: false },
  { num: 2, label: "Analyze",          sub: "NT8 Parser",      done: true,  current: false },
  { num: 3, label: "Demo Simulator",   sub: "Synthetic Umar",  done: false, current: true  },
  { num: 4, label: "Backtest MBO",     sub: "Historical Data", done: false, current: false },
  { num: 5, label: "Optimize",         sub: "Parameters",      done: false, current: false },
  { num: 6, label: "Export NT8",       sub: "Strategy File",   done: false, current: false },
];

export default function PipelineBar() {
  return (
    <div className="card px-6 py-5">
      <div className="flex items-start justify-between gap-3 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-start gap-2 flex-shrink-0">
            {/* Step column */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all",
                step.done
                  ? "bg-blue-600 border-blue-600 text-white"
                  : step.current
                  ? "bg-white border-blue-600 text-blue-600"
                  : "bg-white border-gray-200 text-gray-400",
              ].join(" ")}>
                {step.done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.num}
              </div>
              {/* Label */}
              <div className="text-center">
                <p className={[
                  "text-[11px] font-semibold whitespace-nowrap",
                  step.done ? "text-blue-600" : step.current ? "text-gray-900" : "text-gray-400",
                ].join(" ")}>
                  {step.label}
                </p>
                <p className="text-[9px] text-gray-400 whitespace-nowrap">{step.sub}</p>
              </div>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={[
                "h-px flex-shrink-0 mt-4",
                "w-6 md:w-8 lg:w-10",
                step.done ? "bg-blue-300" : "bg-gray-200",
              ].join(" ")} />
            )}
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
        <span className="status-dot bg-blue-500 dot-pulse" />
        <span className="text-xs text-gray-500">
          <span className="font-semibold text-blue-600">Current phase:</span>{" "}
          Phase 3 — Synthetic Umar Demo Simulator (Select + Analyze complete)
        </span>
      </div>
    </div>
  );
}
