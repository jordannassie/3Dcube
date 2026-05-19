"use client";

const BARS = [
  { left: 24,  height: 60, color: "rgba(37,99,235,0.80)"  },
  { left: 50,  height: 38, color: "rgba(8,145,178,0.78)"  },
  { left: 76,  height: 75, color: "rgba(8,145,178,0.65)"  },
  { left: 102, height: 28, color: "rgba(79,70,229,0.78)"  },
  { left: 128, height: 88, color: "rgba(124,58,237,0.82)" },
];

export default function CubePlaceholder() {
  return (
    <div className="card p-8 flex flex-col items-center gap-5">
      {/* Label */}
      <div className="w-full flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="section-label">3D Visualization Module</span>
        <div className="h-px flex-1 bg-gray-100" />
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

          {BARS.map((bar, i) => (
            <div
              key={i}
              className="cube-bar"
              style={{
                left: bar.left,
                height: bar.height,
                background: `linear-gradient(to top, ${bar.color}, ${bar.color.replace(/[\d.]+\)$/, "0.25)")})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">3D Strategy Simulation Cube</p>
        <p className="text-xs text-gray-400 mt-0.5">Visual Module — Phase 9</p>
      </div>

      {/* Axes */}
      <div className="flex gap-5 text-[10px] text-gray-400 font-mono">
        <span>X: Time</span>
        <span>Y: Return (%)</span>
        <span>Z: Strategy variant</span>
      </div>

      {/* Color legend */}
      <div className="flex gap-4">
        {[
          { label: "Long",      color: "#2563EB" },
          { label: "Short",     color: "#0891B2" },
          { label: "Neutral",   color: "#4F46E5" },
          { label: "Peak Edge", color: "#7C3AED" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
