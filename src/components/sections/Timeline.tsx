"use client";

import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export function Timeline() {
  const { ref, inView } = useInView();

  return (
    <section
      id="timeline"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        <div className={inView ? "animate-fade-in" : "anim-hidden"}>
          <SectionLabel label="TIMELINE.LOG" />
          <p
            className="font-mono text-[10px] mt-1"
            style={{ color: "var(--color-text-muted)", letterSpacing: "0.06em" }}
          >
            CHRONOLOGICAL OPERATIONS REPORT · VERIFIED ARCHIVES
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "7fr 5fr",
            gap: "clamp(24px, 3.5vw, 48px)",
            marginTop: "clamp(32px, 4vh, 48px)",
            alignItems: "start",
          }}
          className="labs-grid"
        >
          {/* LEFT COLUMN: timeline.log (Chronological Deployment Stream) */}
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
              <span className="panel-title">timeline.log</span>
              <span style={{ fontSize: "8px", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
                ● ACTIVE_ARCHIVE
              </span>
            </div>

            <div className="panel-body" style={{ padding: "20px 24px" }}>
              <div className="flex flex-col gap-6 font-mono text-[11px]">
                {/* Entry 1 */}
                <div className="flex flex-col gap-2">
                  <div style={{ color: "var(--color-cyan)" }}>[2024 — PRESENT]</div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "bold", fontSize: "12px", letterSpacing: "0.02em" }}>
                    AI MODEL TRAINING &amp; NODE OPERATIONS
                  </div>
                  <div className="flex flex-col gap-1 text-[var(--color-text-secondary)] pl-2" style={{ lineHeight: "1.7" }}>
                    <div>&gt; deployed local llm environments</div>
                    <div>&gt; optimized gpu/cpu inference workflows</div>
                    <div>&gt; operated blockchain nodes</div>
                    <div>&gt; maintained linux-based infra systems</div>
                    <div>&gt; cli / ssh / docker environments</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", opacity: 0.3 }} />

                {/* Entry 2 */}
                <div className="flex flex-col gap-2">
                  <div style={{ color: "var(--color-amber)" }}>[2023 — 2024]</div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "bold", fontSize: "12px", letterSpacing: "0.02em" }}>
                    WEB3 ANALYST &amp; DEVELOPER
                  </div>
                  <div className="flex flex-col gap-1 text-[var(--color-text-secondary)] pl-2" style={{ lineHeight: "1.7" }}>
                    <div>&gt; researched early-stage protocols</div>
                    <div>&gt; participated in testnets</div>
                    <div>&gt; analyzed token ecosystems</div>
                    <div>&gt; created educational content</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", opacity: 0.3 }} />

                {/* Entry 3 */}
                <div className="flex flex-col gap-2">
                  <div style={{ color: "var(--color-text-muted)" }}>[2021 — 2023]</div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "bold", fontSize: "12px", letterSpacing: "0.02em" }}>
                    TECH SUPPORT &amp; ENV ARCHITECTURE
                  </div>
                  <div className="flex flex-col gap-1 text-[var(--color-text-secondary)] pl-2" style={{ lineHeight: "1.7" }}>
                    <div>&gt; os installation</div>
                    <div>&gt; system optimization</div>
                    <div>&gt; hardware troubleshooting</div>
                    <div>&gt; networking assistance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: cert_registry.log (Monochrome Verification Archive) */}
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
              <span className="panel-title">cert_registry.log</span>
              <span style={{ fontSize: "8px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                VERIFIED // SIGNED
              </span>
            </div>

            <div className="panel-body" style={{ padding: "20px" }}>
              <div className="flex flex-col gap-4 font-mono text-[11px]">
                {[
                  "AWS SOLUTIONS ARCHITECTURE SIMULATION",
                  "TATA CYBERSECURITY ANALYST",
                  "MICROSOFT GENERATIVE AI ESSENTIALS",
                  "PYTHON + MACHINE LEARNING TRAINING"
                ].map((cert, idx) => (
                  <div key={idx} style={{ 
                    border: "1px solid var(--color-border)", 
                    padding: "12px 14px", 
                    background: "var(--color-abyss)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--color-online)", fontSize: "9px" }}>[ VERIFIED ]</span>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "8.5px" }}>SYS_VER // v2.4</span>
                    </div>
                    <div style={{ color: "var(--color-text-primary)", fontWeight: "bold", marginTop: "2px", lineHeight: "1.3" }}>
                      {cert}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
