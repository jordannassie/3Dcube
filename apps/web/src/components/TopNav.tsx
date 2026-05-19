export default function TopNav() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-7 h-7">
            <div
              className="absolute inset-0 rounded border border-cyan-500/60"
              style={{ transform: "perspective(40px) rotateX(10deg) rotateY(-15deg)" }}
            />
            <div
              className="absolute inset-1 rounded border border-violet-500/40"
              style={{ transform: "perspective(40px) rotateX(10deg) rotateY(-15deg) translateZ(3px)" }}
            />
          </div>
          <span className="text-sm font-bold tracking-widest text-slate-200 uppercase">
            TOWER
          </span>
          <span className="text-slate-700 text-xs">|</span>
          <span className="text-xs text-slate-500 tracking-widest uppercase">
            Umar Strategy Lab
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-widest text-slate-600 uppercase font-mono">
            v0.1 · Foundation
          </span>
          <div className="flex items-center gap-1.5">
            <span className="dot-pulse bg-emerald-400 w-1.5 h-1.5" />
            <span className="text-[10px] text-emerald-500 font-mono tracking-widest">
              LOCAL
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
