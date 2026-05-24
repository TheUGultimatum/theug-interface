import { cn } from "@/lib/utils";

type StatusType = "live" | "wip" | "lab" | "archived" | "online" | "building";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  live: {
    label: "LIVE",
    className: "text-[#00e676] bg-[rgba(0,230,118,0.08)] border-[rgba(0,230,118,0.2)]",
  },
  wip: {
    label: "WIP",
    className: "text-[#4488ff] bg-[rgba(68,136,255,0.08)] border-[rgba(68,136,255,0.2)]",
  },
  lab: {
    label: "LAB",
    className: "text-[#8855ff] bg-[rgba(136,85,255,0.08)] border-[rgba(136,85,255,0.2)]",
  },
  archived: {
    label: "ARCHIVED",
    className: "text-[#4a5878] bg-[rgba(74,88,120,0.08)] border-[rgba(74,88,120,0.2)]",
  },
  online: {
    label: "ONLINE",
    className: "text-[#00e676] bg-[rgba(0,230,118,0.08)] border-[rgba(0,230,118,0.2)]",
  },
  building: {
    label: "BUILDING",
    className: "text-[#ffaa00] bg-[rgba(255,170,0,0.08)] border-[rgba(255,170,0,0.2)]",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-sm border",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
}
