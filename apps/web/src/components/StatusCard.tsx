type StatusLevel = "ready" | "pending" | "offline" | "coming-soon";

interface StatusCardProps {
  label: string;
  value: string;
  status: StatusLevel;
  icon: string;
  detail?: string;
}

const STATUS_CONFIG: Record<
  StatusLevel,
  { dotColor: string; badgeClass: string; badgeLabel: string }
> = {
  ready:        { dotColor: "bg-green-500",  badgeClass: "badge-ready",   badgeLabel: "Ready" },
  pending:      { dotColor: "bg-amber-400",  badgeClass: "badge-pending", badgeLabel: "Not Loaded" },
  offline:      { dotColor: "bg-gray-400",   badgeClass: "badge-offline", badgeLabel: "Not Connected" },
  "coming-soon":{ dotColor: "bg-blue-400",   badgeClass: "badge-soon",    badgeLabel: "Coming Soon" },
};

export default function StatusCard({ label, value, status, icon, detail }: StatusCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        <span className={`badge ${cfg.badgeClass} flex-shrink-0`}>
          <span className={`status-dot ${cfg.dotColor} dot-pulse`} />
          {cfg.badgeLabel}
        </span>
      </div>

      {/* Main value */}
      <p className="text-sm font-semibold text-gray-900 leading-tight">{value}</p>

      {/* Detail */}
      {detail && (
        <p className="text-xs text-gray-400 leading-relaxed">{detail}</p>
      )}
    </div>
  );
}
