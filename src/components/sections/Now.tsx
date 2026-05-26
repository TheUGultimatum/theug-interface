"use client";

import { useEffect, useState, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TerminalFeed, type LogLine } from "@/components/terminal/TerminalFeed";

const STATUS_LOGS: Omit<LogLine, "id">[] = [
  { timestamp: "11:21:40", text: "Initializing optimization sequence on neural subgraphs...", status: "info" },
  { timestamp: "11:21:55", text: "Compiling WASM particle physics layout scripts...", status: "success" },
  { timestamp: "11:22:10", text: "Model inference weights loaded successfully [2.4GB]", status: "success" },
  { timestamp: "11:22:25", text: "Indexing local search vectors on portfolio core...", status: "info" },
  { timestamp: "11:22:42", text: "Re-routing API gateways through edge cluster node-4...", status: "success" },
  { timestamp: "11:23:02", text: "Performing telemetry health checks on autonomous daemons...", status: "ok" },
  { timestamp: "11:23:18", text: "Session validated. Ambient warmth and scanlines nominal.", status: "ok" },
  { timestamp: "11:23:35", text: "Compiling Day/Night swappable CSS custom variables...", status: "info" },
];

const EXPERIMENTS = [
  { name: "Autonomous Agent Tasks Scheduler", status: "Active Run", progress: 84 },
  { name: "Local WebGL ASCII Face Sampler", status: "Refining", progress: 95 },
  { name: "Solidity Multi-sig Vault V2", status: "Auditing", progress: 68 },
];

export function Now() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize first few logs
  useEffect(() => {
    const initial = STATUS_LOGS.slice(0, 4).map((l, i) => ({
      ...l,
      id: `init-${i}`
    }));
    setLogs(initial);
    setLogIndex(4);
  }, []);

  // Cycle new live logs every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const logTemplate = STATUS_LOGS[logIndex % STATUS_LOGS.length];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      setLogs((prev) => {
        const nextLogs = [
          ...prev,
          {
            id: `live-${Date.now()}`,
            timestamp: timeStr,
            text: logTemplate.text,
            status: logTemplate.status
          }
        ];
        return nextLogs.slice(-10); // Keep last 10 logs for performance
      });

      setLogIndex((prev) => prev + 1);
    }, 4500);

    return () => clearInterval(timer);
  }, [logIndex]);

  return (
    <section
      id="now"
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Section Title */}
        <div data-cursor="VIEW">
          <SectionLabel label="NOW.EXE" />
          <p className="text-system" style={{ marginTop: "4px" }}>
            REAL-TIME FEED · BUILDER STATUS · ACTIVE EXPERIMENTS
          </p>
        </div>

        {/* Dynamic Asymmetric Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7fr 5fr",
            gap: "clamp(20px, 3vw, 36px)",
            marginTop: "clamp(28px, 4vh, 44px)",
          }}
          className="now-grid"
        >
          {/* Left panel: Live Console Feed */}
          <div className="panel hover-glow-edge flex flex-col h-[340px]">
            <div className="panel-header flex items-center justify-between">
              <div className="panel-controls">
                <span className="panel-dot panel-dot-red" />
                <span className="panel-dot panel-dot-yellow" />
                <span className="panel-dot panel-dot-green" />
              </div>
              <span className="panel-title">builder_console_live.sh</span>
              <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                ● STREAMING
              </span>
            </div>
            
            <div 
              ref={containerRef}
              className="panel-body overflow-y-auto flex-1 font-mono text-[11px]"
              style={{
                background: "rgba(5, 8, 16, 0.4)",
                padding: "16px",
              }}
            >
              <TerminalFeed lines={logs} maxHeight="270px" />
            </div>
          </div>

          {/* Right panel: Active Status Board */}
          <div className="flex flex-col gap-4">
            
            {/* Vibe / Focus */}
            <div className="panel hover-glow-edge h-[160px]">
              <div className="panel-header">
                <span className="panel-title">active_focus.conf</span>
              </div>
              <div className="panel-body flex flex-col gap-2.5 font-mono text-[11px]" style={{ padding: "12px 14px" }}>
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-1.5">
                  <span style={{ color: "var(--color-text-muted)" }}>CURRENT PROJECT :</span>
                  <span style={{ color: "var(--color-amber-bright)" }}>Portfolio Phase 2 Core</span>
                </div>
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-1.5">
                  <span style={{ color: "var(--color-text-muted)" }}>RESEARCH TOPIC :</span>
                  <span style={{ color: "var(--color-cyan)" }}>Multi-Agent Orchestrations</span>
                </div>
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-1.5">
                  <span style={{ color: "var(--color-text-muted)" }}>READING BOOK   :</span>
                  <span style={{ color: "var(--color-text-primary)" }}>Designing Data Systems</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--color-text-muted)" }}>PLAYLIST VIBE  :</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>Industrial Dark Ambient</span>
                </div>
              </div>
            </div>

            {/* Experiments Progress Panel */}
            <div className="panel hover-glow-edge h-[164px]">
              <div className="panel-header">
                <span className="panel-title">experiments_status.bin</span>
              </div>
              <div className="panel-body flex flex-col gap-3" style={{ padding: "12px 14px" }}>
                {EXPERIMENTS.map((exp) => (
                  <div key={exp.name} className="flex flex-col gap-1 font-mono">
                    <div className="flex justify-between text-[10px]">
                      <span style={{ color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.name}</span>
                      <span style={{ color: "var(--color-cyan)" }} className="shrink-0">{exp.status} ({exp.progress}%)</span>
                    </div>
                    <div className="metric-bar-track w-full">
                      <div 
                        style={{
                          height: "100%",
                          width: `${exp.progress}%`,
                          background: "var(--color-cyan)",
                          opacity: 0.85,
                          transition: "width 1s ease-out"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .now-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
