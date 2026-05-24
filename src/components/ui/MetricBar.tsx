"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  value: number; // 0-100
  variant?: "cyan" | "purple" | "electric";
  className?: string;
}

export function MetricBar({ label, value, variant = "cyan", className }: MetricBarProps) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(value), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const fillClass = {
    cyan: "metric-bar-fill-cyan",
    purple: "metric-bar-fill-purple",
    electric: "metric-bar-fill-electric",
  }[variant];

  return (
    <div ref={ref} className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-system" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {value}%
        </span>
      </div>
      <div className="metric-bar-track">
        <div
          className={cn("metric-bar-fill", fillClass)}
          style={{ width: `${animated}%`, transition: "width 1.2s ease-out" }}
        />
      </div>
    </div>
  );
}
