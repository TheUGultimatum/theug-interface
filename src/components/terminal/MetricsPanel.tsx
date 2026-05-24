"use client";

import { MetricBar } from "@/components/ui/MetricBar";

const METRICS = [
  { label: "CPU", value: 42, variant: "cyan" as const },
  { label: "MEMORY", value: 68, variant: "electric" as const },
  { label: "NETWORK", value: 71, variant: "cyan" as const },
  { label: "AI LOAD", value: 63, variant: "purple" as const },
];

export function MetricsPanel() {
  return (
    <div>
      <p
        className="font-mono text-[9px] uppercase tracking-widest mb-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        SYSTEM METRICS
      </p>
      <div className="space-y-2.5">
        {METRICS.map((m) => (
          <MetricBar key={m.label} label={m.label} value={m.value} variant={m.variant} />
        ))}
      </div>
    </div>
  );
}
