import { IS_HOSTED_PREVIEW } from "@/lib/env";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: "0 1px 0 #E8ECF0" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mark: two nested squares suggesting 3D depth */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-blue-600 rounded-md" />
            <div className="absolute inset-[5px] border border-blue-400 rounded-sm opacity-75" />
            <div className="absolute inset-[9px] bg-blue-600 rounded-[2px]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-none">TOWER</span>
              <span className="text-[13px] text-gray-400 font-normal leading-none">Strategy Lab</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">Built for Serious Traders</p>
          </div>
        </div>

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:block font-mono">v0.2 · Phase 2</span>

          {/* Environment badge */}
          {IS_HOSTED_PREVIEW ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.578-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold text-amber-700">Hosted UI Preview</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
              <span className="status-dot bg-green-500 dot-pulse" />
              <span className="text-xs font-semibold text-green-700">Local</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
