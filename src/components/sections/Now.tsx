"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Terminal, Activity, Cpu, Layers } from "lucide-react";

const ACTIVE_TASKS = [
  {
    tag: "AGENTIC_AI",
    color: "var(--color-online)",
    title: "Autonomous Agent Toolchains & Dynamic RAG Pipelines",
    description: "Engineering multi-agent orchestration with deterministic tooling, MCP integration, and low-latency local model fallbacks.",
  },
  {
    tag: "WEB3_CORE",
    color: "var(--color-amber)",
    title: "High-Throughput Decentralized Protocols & Indexers",
    description: "Developing robust EVM smart contracts, token telemetry listeners, and high-frequency transaction stream processors.",
  },
  {
    tag: "ONCHAIN",
    color: "var(--color-cyan)",
    title: "Multi-Ecosystem Solar System Observatory",
    description: "Tracking conviction models across Base, Solana, and Ethereum with 120 FPS Web API Canvas kinematics.",
  },
  {
    tag: "INTERFACE",
    color: "var(--color-text-primary)",
    title: "Cybernetic High-Density Terminal UIs",
    description: "Designing tactile, dark/light Obsidian workspaces with zero layout shift and sub-10ms render overhead.",
  },
];

const INFRA_NODES = [
  { label: "BASE_L2_RPC_RELAY",      value: "FAST · 12ms",  status: "SYNCED", color: "var(--color-online)" },
  { label: "ETH_MAINNET_NODE",       value: "ARCHIVE",      status: "STABLE", color: "var(--color-online)" },
  { label: "SOLANA_RPC_CLUSTER",     value: "MAINNET-BETA", status: "HEALTHY", color: "var(--color-amber)" },
  { label: "LOCAL_VLLM_ENGINE",      value: "CUDA_12.4",    status: "ACTIVE", color: "var(--color-cyan)" },
  { label: "AGENT_RUNTIME_SANDBOX",  value: "CONTAINER",    status: "READY",  color: "var(--color-online)" },
  { label: "X_TELEMETRY_UPLINK",     value: "@Usmaangani",  status: "ONLINE", color: "var(--color-cyan)" },
];

export function Now() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="now"
      ref={containerRef}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        
        {/* Section Header with Monumental Typographic Presence */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--color-border)] ${inView ? "animate-fade-in" : "anim-hidden"}`}>
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[var(--color-online)] uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--color-online)] shadow-sm animate-pulse" />
              <span>LIVE TELEMETRY FEED // 02</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] font-display uppercase leading-tight">
              Current Focus & Operator Status
            </h2>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-2 font-mono max-w-2xl leading-relaxed">
              Real-time engineering operations, active AI toolchain development, and decentralized node telemetry.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-[var(--color-text-muted)] shrink-0">
            <div className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-text-muted)]">NODE:</span>
              <span className="text-[var(--color-amber)] font-bold">CLUSTER_ID #48E</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-text-muted)]">SYSTEM:</span>
              <span className="text-[var(--color-online)] font-bold">100% OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Dynamic Asymmetric Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7fr 5fr",
            gap: "clamp(24px, 3.5vw, 48px)",
            marginTop: "clamp(32px, 4vh, 48px)",
            alignItems: "start",
          }}
          className="now-grid"
        >
          {/* Left Panel: now.exe Live Operations Feed (7 cols) */}
          <div 
            className={`panel hover-glow-edge ${inView ? "animate-fade-in-up delay-100" : "anim-hidden"}`}
            style={{ contain: "layout paint style" }}
          >
            <div className="panel-header flex items-center justify-between">
              <div className="panel-controls">
                <span className="panel-dot panel-dot-red" />
                <span className="panel-dot panel-dot-yellow" />
                <span className="panel-dot panel-dot-green" />
              </div>
              <span className="panel-title flex items-center gap-2 font-mono">
                <Terminal size={12} className="text-[var(--color-amber)]" />
                <span>active_workstreams.log</span>
              </span>
              <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                ● DISPATCH // LIVE
              </span>
            </div>
            
            <div className="panel-body" style={{ padding: "24px 28px" }}>
              <div className="flex flex-col gap-6">
                <div className="font-mono text-xs text-[var(--color-text-muted)] flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <span>ACTIVE_WORK_MATRIX // IN-FLIGHT DELIVERABLES</span>
                  <span className="text-[10px] text-[var(--color-online)]">4 STREAMS ACTIVE</span>
                </div>
                
                <div className="flex flex-col gap-5">
                  {ACTIVE_TASKS.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 group">
                      <span 
                        style={{ color: task.color, display: "inline-block", marginTop: "2px" }} 
                        className="font-mono font-bold text-sm shrink-0"
                      >
                        &gt;
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span 
                            style={{ 
                              color: task.color, 
                              borderColor: `${task.color}33`, 
                              background: `${task.color}0a` 
                            }} 
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border tracking-wider uppercase"
                          >
                            {task.tag}
                          </span>
                          <h4 className="font-bold text-xs md:text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-amber)] transition-colors">
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                  <span>LAST_SYNC // {new Date().toISOString().slice(0, 10)}</span>
                  <span className="text-[var(--color-cyan)]">SYS_CHECK_PASSED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: infrastructure node telemetry (5 cols) */}
          <div 
            className={`panel hover-glow-edge ${inView ? "animate-fade-in-up delay-200" : "anim-hidden"}`}
            style={{ contain: "layout paint style" }}
          >
            <div className="panel-header flex items-center justify-between">
              <div className="panel-controls">
                <span className="panel-dot panel-dot-red" />
                <span className="panel-dot panel-dot-yellow" />
                <span className="panel-dot panel-dot-green" />
              </div>
              <span className="panel-title flex items-center gap-2 font-mono">
                <Activity size={12} className="text-[var(--color-cyan)]" />
                <span>node_infrastructure.sys</span>
              </span>
              <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)" }}>
                ● CLUSTER_OK
              </span>
            </div>

            <div className="panel-body" style={{ padding: "24px 28px" }}>
              <div className="flex flex-col gap-4 font-mono text-xs">
                <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <span>RELAY_INTERFACE</span>
                  <span>STATUS</span>
                </div>

                {INFRA_NODES.map((sys) => (
                  <div key={sys.label} className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[var(--color-text-primary)] font-semibold text-[11px]">{sys.label}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{sys.value}</span>
                    </div>
                    <span 
                      style={{ 
                        color: sys.color, 
                        border: `1px solid ${sys.color}33`,
                        background: `${sys.color}0a`,
                      }}
                      className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider"
                    >
                      [{sys.status}]
                    </span>
                  </div>
                ))}

                <div className="pt-2 text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  Deterministic health checks executed every 60s against remote and local nodes.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bolder Home Gateway Banner: Direct action routes */}
        <div className={`mt-12 p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg ${inView ? "animate-fade-in-up delay-300" : "anim-hidden"}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-amber)] mb-2 font-semibold">
                <Layers size={14} />
                <span>WORKSPACE NAVIGATION</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Ready to explore the full engineering universe?
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                Dive into verified Web3 repositories, track the live 120 FPS celestial conviction observatory, or read recent technical essays.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 font-mono text-xs">
              <Link
                href="/projects"
                className="px-5 py-3 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Featured Projects</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/onchain"
                className="px-5 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-bright)] text-[var(--color-text-primary)] font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Solar System (11 Worlds)</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/blogs"
                className="px-5 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-bright)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Technical Essays</span>
                <ArrowUpRight size={15} />
              </Link>
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
