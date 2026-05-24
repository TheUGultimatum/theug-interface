"use client";

import { useEffect, useState, useRef } from "react";

interface BootLine {
  text: string;
  delay: number;
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: "> Initializing environment", delay: 300 },
  { text: "> Loading modules", delay: 600 },
  { text: "> Connecting to neural network...", delay: 1000 },
  { text: "> AI systems online", delay: 1400 },
  { text: "> Automation engine ready", delay: 1800 },
  { text: "> System running at optimal performance.", delay: 2200 },
];

interface TerminalWindowProps {
  title?: string;
  className?: string;
}

export function TerminalWindow({ title = "main.sh", className }: TerminalWindowProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_SEQUENCE.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, line.delay);
      timers.push(t);
    });

    // Show cursor after all lines
    const cursorTimer = setTimeout(
      () => setShowCursor(true),
      BOOT_SEQUENCE[BOOT_SEQUENCE.length - 1].delay + 300
    );
    timers.push(cursorTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className={`panel ${className ?? ""}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Window Header */}
      <div className="panel-header">
        <div className="panel-controls">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title">⬤ &nbsp;{title}</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            — &nbsp; □ &nbsp; ×
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={containerRef}
        className="panel-body overflow-y-auto"
        style={{
          minHeight: "180px",
          maxHeight: "220px",
          background: "rgba(5, 8, 16, 0.6)",
        }}
      >
        {/* Prompt line */}
        <div className="terminal-line mb-2">
          <span className="terminal-prompt">theUG@workspace:~$</span>
          <span className="terminal-text">system_status</span>
        </div>

        {/* Boot sequence lines */}
        {visibleLines.map((line, i) => (
          <div key={i} className="terminal-line">
            <span
              className="terminal-text"
              style={{
                color:
                  line.includes("neural") || line.includes("AI")
                    ? "var(--color-cyan)"
                    : line.includes("optimal")
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
              }}
            >
              {line}
            </span>
          </div>
        ))}

        {/* Final prompt with cursor */}
        {showCursor && (
          <div className="terminal-line mt-2">
            <span className="terminal-prompt">theUG@workspace:~$</span>
            <span className="cursor-blink ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
