"use client";

const BARS = [
  { left: 28,  height: 65, color: "rgba(59,130,246,0.85)",  delay: "0s" },
  { left: 55,  height: 40, color: "rgba(6,182,212,0.85)",   delay: "0.4s" },
  { left: 82,  height: 80, color: "rgba(6,182,212,0.7)",    delay: "0.2s" },
  { left: 109, height: 30, color: "rgba(139,92,246,0.85)",  delay: "0.6s" },
  { left: 136, height: 90, color: "rgba(236,72,153,0.9)",   delay: "0.1s" },
];

export default function CubePlaceholder() {
  return (
    <div className="glass-bright rounded-2xl p-8 flex flex-col items-center gap-6 glow-cyan">
      {/* Label */}
      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <span className="text-[10px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
          Visual Module
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      {/* 3D Cube */}
      <div className="cube-scene py-4">
        <div className="cube-wrapper">
          <div className="cube-face face-front" />
          <div className="cube-face face-back" />
          <div className="cube-face face-left" />
          <div className="cube-face face-right" />
          <div className="cube-face face-top" />
          <div className="cube-face face-bottom" />

          {/* 3D bars inside cube */}
          {BARS.map((bar, i) => (
            <div
              key={i}
              className="cube-bar"
              style={{
                left: bar.left,
                height: bar.height,
                background: `linear-gradient(to top, ${bar.color}, ${bar.color.replace("0.8", "0.4").replace("0.85", "0.4").replace("0.9", "0.5").replace("0.7", "0.35")})`,
                boxShadow: `0 0 8px ${bar.color}`,
                animationDelay: bar.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-300 tracking-wide">
          3D Strategy Simulation Cube
        </p>
        <p className="text-xs text-slate-600 mt-1 tracking-widest uppercase">
          Visual Module Coming Next
        </p>
      </div>

      {/* Axes legend */}
      <div className="flex gap-6 text-[10px] text-slate-600 font-mono tracking-widest">
        <span>X: Time</span>
        <span>Y: Return (%)</span>
        <span>Z: Strategy</span>
      </div>

      {/* Color legend */}
      <div className="flex gap-4">
        {[
          { label: "Long",      color: "#3b82f6" },
          { label: "Short",     color: "#06b6d4" },
          { label: "Neutral",   color: "#8b5cf6" },
          { label: "Peak Edge", color: "#ec4899" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
