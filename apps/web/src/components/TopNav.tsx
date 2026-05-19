import { IS_HOSTED_PREVIEW } from "@/lib/env";

export default function TopNav() {
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-6 h-6 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-blue-600 rounded-sm" />
            <div className="absolute inset-1.5 border border-blue-400 rounded-sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900 tracking-tight">TOWER</span>
            <span className="text-sm text-gray-400 font-normal">Strategy Lab</span>
          </div>
        </div>

        {/* Right: environment badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">v0.2 · Phase 2</span>

          {IS_HOSTED_PREVIEW ? (
            /* Hosted preview badge */
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <svg className="w-3 h-3 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.578-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium text-amber-700">Hosted UI Preview</span>
            </div>
          ) : (
            /* Local badge */
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <span className="status-dot bg-green-500 dot-pulse" />
              <span className="text-xs font-medium text-green-700">Local</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
