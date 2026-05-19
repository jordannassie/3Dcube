export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: wordmark */}
        <div className="flex items-center gap-2.5">
          {/* Logo mark — two nested squares suggesting 3D */}
          <div className="relative w-6 h-6 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-blue-600 rounded-sm" />
            <div className="absolute inset-1.5 border border-blue-400 rounded-sm" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900 tracking-tight">TOWER</span>
            <span className="text-sm text-gray-400 font-normal">Strategy Lab</span>
          </div>
        </div>

        {/* Right: meta info */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">v0.2 · Phase 2</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
            <span className="status-dot bg-green-500 dot-pulse" />
            <span className="text-xs font-medium text-green-700">Local</span>
          </div>
        </div>

      </div>
    </header>
  );
}
