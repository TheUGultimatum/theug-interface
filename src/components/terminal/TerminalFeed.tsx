"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
export type LogStatus = "success" | "ok" | "info" | "error" | "warn";

export interface LogLine {
  id: string;
  timestamp?: string;
  text: string;
  status?: LogStatus;
}

interface TerminalFeedProps {
  lines: LogLine[];
  className?: string;
  maxHeight?: string;
  autoScroll?: boolean;
}

/* ─── Status Badge ──────────────────────────────────────── */
function LogBadge({ status }: { status: LogStatus }) {
  const map: Record<LogStatus, string> = {
    success: "terminal-badge terminal-badge-success",
    ok: "terminal-badge terminal-badge-ok",
    info: "terminal-badge terminal-badge-info",
    error: "terminal-badge text-[#ff4455] bg-[rgba(255,68,85,0.1)] border-[rgba(255,68,85,0.2)]",
    warn: "terminal-badge text-[#ffaa00] bg-[rgba(255,170,0,0.1)] border-[rgba(255,170,0,0.2)]",
  };
  const labels: Record<LogStatus, string> = {
    success: "SUCCESS",
    ok: "OK",
    info: "INFO",
    error: "ERROR",
    warn: "WARN",
  };
  return <span className={map[status]}>[{labels[status]}]</span>;
}

/* ─── Single Line ───────────────────────────────────────── */
function TerminalLogLine({ line }: { line: LogLine }) {
  return (
    <div className="terminal-line flex items-center gap-2 py-0.5">
      {line.timestamp && (
        <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {line.timestamp}
        </span>
      )}
      <span className="terminal-text flex-1">{line.text}</span>
      {line.status && <LogBadge status={line.status} />}
    </div>
  );
}

/* ─── Feed ──────────────────────────────────────────────── */
export function TerminalFeed({
  lines,
  className,
  maxHeight = "160px",
  autoScroll = true,
}: TerminalFeedProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && ref) {
      ref.scrollTop = ref.scrollHeight;
    }
  }, [lines, autoScroll, ref]);

  return (
    <div
      ref={setRef}
      className={cn("overflow-y-auto", className)}
      style={{ maxHeight }}
    >
      {lines.map((line) => (
        <TerminalLogLine key={line.id} line={line} />
      ))}
    </div>
  );
}
