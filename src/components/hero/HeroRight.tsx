"use client";

import { useEffect, useState } from "react";
import { TerminalWindow } from "@/components/terminal/TerminalWindow";
import { MetricsPanel } from "@/components/terminal/MetricsPanel";
import { NodeGraph } from "@/components/terminal/NodeGraph";
import { TerminalFeed, type LogLine } from "@/components/terminal/TerminalFeed";

/* Live feed data */
const INITIAL_LOGS: LogLine[] = [
  { id: "1", timestamp: "03:17:21", text: "Deploying AI agent on edge node...", status: "success" },
  { id: "2", timestamp: "03:17:18", text: "Connecting to neural network", status: "success" },
  { id: "3", timestamp: "03:17:15", text: "Data pipeline executed", status: "success" },
  { id: "4", timestamp: "03:17:12", text: "System health check", status: "ok" },
  { id: "5", timestamp: "03:17:07", text: "New visitor detected", status: "info" },
];

const CYCLE_LOGS: Omit<LogLine, "id">[] = [
  { timestamp: "live", text: "Automation script triggered", status: "success" },
  { timestamp: "live", text: "Model inference complete", status: "success" },
  { timestamp: "live", text: "WebSocket connection established", status: "info" },
  { timestamp: "live", text: "Memory snapshot saved", status: "ok" },
  { timestamp: "live", text: "Agent task queue updated", status: "info" },
];

export function HeroRight() {
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [cycleIndex, setCycleIndex] = useState(0);

  /* Add a new log line every 3.5 seconds */
  useEffect(() => {
    const id = setInterval(() => {
      const next = CYCLE_LOGS[cycleIndex % CYCLE_LOGS.length];
      setLogs((prev) => {
        const updated = [
          ...prev,
          { ...next, id: `live-${Date.now()}` },
        ].slice(-8); // keep max 8 lines
        return updated;
      });
      setCycleIndex((i) => i + 1);
    }, 3500);
    return () => clearInterval(id);
  }, [cycleIndex]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Terminal window (boot sequence) */}
      <TerminalWindow title="main.sh" />

      {/* Live feed + Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Live feed panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-online)] animate-pulse shrink-0" />
            <span className="panel-title">LIVE FEED</span>
          </div>
          <div className="panel-body" style={{ padding: "10px 12px" }}>
            <TerminalFeed lines={logs} maxHeight="130px" />
          </div>
        </div>

        {/* Metrics panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SYSTEM METRICS</span>
          </div>
          <div className="panel-body" style={{ padding: "10px 12px" }}>
            <MetricsPanel />
          </div>
        </div>
      </div>

      {/* Node graph panel */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">NETWORK TOPOLOGY</span>
        </div>
        <div className="panel-body" style={{ padding: "8px 12px" }}>
          <NodeGraph />
        </div>
      </div>
    </div>
  );
}
