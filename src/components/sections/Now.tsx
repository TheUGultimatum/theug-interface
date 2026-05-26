"use client";

import { useEffect, useState, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

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
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Section Title */}
        <div className={inView ? "animate-fade-in" : "anim-hidden"}>
          <SectionLabel label="NOW.EXE" />
          <p className="text-system" style={{ marginTop: "4px" }}>
            REAL-TIME FEED · BUILDER STATUS · ACTIVE SYSTEM TELEMETRY
          </p>
        </div>

        {/* Dynamic Asymmetric Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7fr 5fr",
            gap: "clamp(24px, 3.5vw, 48px)",
            marginTop: "clamp(28px, 4vh, 44px)",
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
              <span className="panel-title">now.exe</span>
              <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                ● OPERATOR // ONLINE
              </span>
            </div>
            
            <div className="panel-body" style={{ padding: "20px 24px" }}>
              <div className="flex flex-col gap-5 font-mono text-[11px]">
                <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  CURRENT_OPS // Active tasks logged on server cluster:
                </div>
                
                <div className="flex flex-col gap-3 pl-2">
                  {[
                    "building ai automation systems",
                    "experimenting with local inference",
                    "researching agentic workflows",
                    "designing immersive system interfaces",
                    "operating blockchain infrastructure"
                  ].map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span 
                        style={{ color: "var(--color-amber)", display: "inline-block" }} 
                        className="animate-pulse"
                      >
                        &gt;
                      </span>
                      <span style={{ color: "var(--color-text-primary)" }}>{task}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", opacity: 0.3, marginTop: "8px" }} />

                <div style={{ color: "var(--color-text-muted)", fontSize: "9px" }}>
                  LAST_SYNC // {new Date().toISOString().slice(0, 10)} · CLUSTER_ID #48E
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: active_systems.log Operations status board (5 cols) */}
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
              <span className="panel-title">active_systems.log</span>
              <span style={{ fontSize: "8px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                SYSTEM_MONITOR
              </span>
            </div>

            <div className="panel-body" style={{ padding: "20px 24px" }}>
              <div className="flex flex-col gap-3 font-mono text-[11px]">
                {[
                  { label: "LOCAL_LLM_CLUSTER",    value: "ONLINE", color: "var(--color-online)" },
                  { label: "AUTOMATION_PIPELINES", value: "ACTIVE", color: "var(--color-amber)" },
                  { label: "NODE_INFRASTRUCTURE",  value: "SYNCED", color: "var(--color-online)" },
                  { label: "GPU_INFERENCE_CORE",   value: "READY",  color: "var(--color-cyan)" },
                  { label: "CONTACT_UPLINK",       value: "STABLE", color: "var(--color-cyan)" }
                ].map((sys) => (
                  <div key={sys.label} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "8px"
                  }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>{sys.label}</span>
                    <span style={{ 
                      color: sys.color, 
                      fontWeight: "bold",
                      border: `1px solid ${sys.color}33`,
                      padding: "2px 8px",
                      background: `${sys.color}08`,
                      borderRadius: "1px",
                      fontSize: "9px"
                    }}>[ {sys.value} ]</span>
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
