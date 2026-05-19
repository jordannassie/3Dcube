type StatusLevel = "ready" | "pending" | "offline" | "coming-soon";

interface StatusCardProps {
  label: string;
  value: string;
  status: StatusLevel;
  icon: string;
  detail?: string;
}

const statusConfig: Record<
  StatusLevel,
  { dotColor: string; badge: string; badgeColor: string; glowClass: string }
> = {
  ready: {
    dotColor: "bg-emerald-400",
    badge: "READY",
    badgeColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    glowClass: "glow-cyan",
  },
  pending: {
    dotColor: "bg-cyan-400",
    badge: "NOT LOADED",
    badgeColor: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    glowClass: "glow-cyan",
  },
  offline: {
    dotColor: "bg-slate-500",
    badge: "NOT CONNECTED",
    badgeColor: "text-slate-400 border-slate-600/40 bg-slate-800/40",
    glowClass: "",
  },
  "coming-soon": {
    dotColor: "bg-violet-400",
    badge: "COMING SOON",
    badgeColor: "text-violet-400 border-violet-400/30 bg-violet-400/10",
    glowClass: "glow-violet",
  },
};

export default function StatusCard({
  label,
  value,
  status,
  icon,
  detail,
}: StatusCardProps) {
  const cfg = statusConfig[status];

  return (
    <div
      className={`glass rounded-xl p-5 flex flex-col gap-3 ${cfg.glowClass} transition-all duration-300 hover:border-cyan-500/30 group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            {label}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}
        >
          {cfg.badge}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`dot-pulse ${cfg.dotColor}`}
          style={{ animationDelay: status === "ready" ? "0ms" : "600ms" }}
        />
        <p className="text-base font-semibold text-slate-200">{value}</p>
      </div>

      {detail && (
        <p className="text-xs text-slate-600 leading-relaxed">{detail}</p>
      )}
    </div>
  );
}
