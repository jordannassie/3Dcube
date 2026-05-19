const STEPS = [
  { num: 1, label: "Upload .cs",     done: true,  current: false },
  { num: 2, label: "Analyze",        done: true,  current: false },
  { num: 3, label: "Build Strategy", done: false, current: true  },
  { num: 4, label: "Backtest MBO",   done: false, current: false },
  { num: 5, label: "Optimize",       done: false, current: false },
  { num: 6, label: "Export NT8",     done: false, current: false },
];

export default function PipelineBar() {
  return (
    <div className="card px-6 py-4">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-shrink-0">
            {/* Step */}
            <div className="flex flex-col items-center gap-1">
              <div className={[
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0",
                step.done    ? "bg-blue-600 border-blue-600 text-white"
                : step.current ? "bg-white border-blue-600 text-blue-600"
                : "bg-white border-gray-300 text-gray-400",
              ].join(" ")}>
                {step.done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.num}
              </div>
              <span className={[
                "text-[10px] font-medium whitespace-nowrap",
                step.done ? "text-blue-600" : step.current ? "text-gray-800" : "text-gray-400",
              ].join(" ")}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={[
                "h-px w-8 md:w-12 flex-shrink-0 mt-[-14px]",
                step.done ? "bg-blue-400" : "bg-gray-200",
              ].join(" ")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
        <span className="status-dot bg-blue-500 dot-pulse" />
        <span className="text-xs text-gray-500">
          <span className="font-medium text-blue-600">Current phase:</span>{" "}
          Upload + Analyze (Phase 2 complete · Phase 3 next)
        </span>
      </div>
    </div>
  );
}
