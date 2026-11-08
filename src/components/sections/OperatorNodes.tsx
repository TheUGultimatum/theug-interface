"use client";

import React, { useState } from "react";
import { OPERATOR_NODES } from "@/config/networkData";
import { Cpu, ExternalLink, Activity, ChevronDown, ChevronUp } from "lucide-react";

export function OperatorNodes() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="py-12 border-t border-[var(--color-border)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[var(--color-amber)] text-[10.5px] tracking-widest uppercase font-mono font-bold">
            <Cpu size={14} />
            <span>05 / INFRASTRUCTURE PROOF OF WORK</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)] font-mono">
            ACTIVE OPERATOR NODE CLUSTER
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-2xl font-sans leading-relaxed">
            Decentralized validator nodes, automated background daemons, and sequencers actively maintained, monitored, and documented by Usmaan Gani.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-online)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span>ALL NODES SYNCED</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            title={isOpen ? "Collapse nodes" : "Expand nodes"}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OPERATOR_NODES.map((node, idx) => (
            <div
              key={idx}
              className="panel p-6 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-amber)]/40 transition-all duration-300 relative group flex flex-col justify-between"
              style={{
                background: "var(--color-surface)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[var(--color-amber)] font-mono tracking-wider font-bold">
                    [ NODE // #{idx + 1} ]
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-mono bg-[rgba(0,217,255,0.08)] text-[var(--color-online)] border border-[rgba(0,217,255,0.25)] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
                    {node.status}
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-bold text-[var(--color-text-primary)] font-mono tracking-wide">
                  {node.name}
                </h3>
                <p className="text-[11px] text-[var(--color-cyan)] mt-0.5 font-mono font-bold">
                  {node.category}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-3 leading-relaxed">
                  Role: <span className="text-[var(--color-text-primary)] font-semibold">{node.role}</span>
                </p>

                <div className="mt-4 p-3 rounded-lg bg-[var(--color-void)] border border-[var(--color-border)] font-mono text-[10px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[var(--color-text-muted)]">ENVIRONMENT:</span>
                    <span className="text-[var(--color-text-primary)] font-semibold">{node.stack}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-muted)]">TELEMETRY:</span>
                    <span className="text-[var(--color-online)]">{node.telemetry}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                  ACTIVE DEPLOYMENT
                </span>
                <a
                  href={node.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-border)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
                >
                  <span>VIEW REPO &amp; GUIDE</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

