"use client";

import { useEffect, useRef, useState } from "react";
import { TechTagGroup } from "@/components/ui/TechTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IdentityPortrait } from "@/components/ui/IdentityPortrait";

const SKILLS = [
  { label: "AI SYSTEMS / LOCAL LLM OPS", status: "ACTIVE",   bar: "[██████████████░░░░]" },
  { label: "AUTOMATION / WORKFLOWS",    status: "STABLE",   bar: "[████████████░░░░░░]" },
  { label: "WEB3 / NODE INFRASTRUCTURE", status: "SYNCED",   bar: "[██████████░░░░░░░░]" },
  { label: "LINUX / DEVOPS",            status: "OPTIMIZED",bar: "[████████████░░░░░░]" },
  { label: "BACKEND / API SYSTEMS",     status: "STABLE",   bar: "[██████████████░░░░]" },
  { label: "INTERACTIVE UI ENGINEERING", status: "READY",   bar: "[██████████░░░░░░░░]" },
];

const TECH_STACK = [
  "Next.js", "TypeScript", "Python", "Linux",
  "Docker", "Node.js", "SQL", "AWS",
  "Oracle Cloud", "GCP", "SSH", "CLI",
  "Solidity", "Web3 Tooling"
];

const IDENTITY_LINES = [
  { prompt: "name",     value: "Usmaan Gani" },
  { prompt: "role",     value: "Independent Engineer" },
  { prompt: "focus",    value: "AI systems / automation / infra" },
  { prompt: "stack",    value: "Next.js / Python / Docker / Linux" },
  { prompt: "location", value: "India" },
  { prompt: "status",   value: "actively building" },
];

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export function About() {
  const { ref, inView } = useInView();

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* Section label */}
        <div className={inView ? "animate-fade-in" : "anim-hidden"}>
          <SectionLabel label="ABOUT.LOG" />
          <h1 className="sr-only">Usmaan Gani — AI Engineer & Web3 Builder</h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(24px, 4vw, 48px)",
            marginTop: "clamp(32px, 4vh, 48px)",
          }}
          className="about-grid"
        >

          {/* ── LEFT: Cinematic Biometric Profile Anchor ── */}
          <div className={`flex flex-col gap-6 ${inView ? "animate-fade-in-up delay-100" : "anim-hidden"}`}>
            <IdentityPortrait />
          </div>

          {/* ── RIGHT: Biometrics Terminal + Bio + Skills + Stack ── */}
          <div className={`flex flex-col gap-6 ${inView ? "animate-fade-in-up delay-200" : "anim-hidden"}`}>
            
            {/* Bio (Generous spacing, line height 2.0, shortened by 25%) */}
            <div className="panel hover-glow-edge" data-cursor="VIEW" style={{ contain: "layout paint style" }}>
              <div className="panel-header">
                <span className="panel-title">bio.md</span>
              </div>
              <div className="panel-body" style={{ padding: "20px 24px" }}>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 2.0, letterSpacing: "0.02em" }}>
                  I’m Usmaan Gani, a self-driven builder based in Ranchi, Jharkhand, with roots in Bokaro and Chandrapura, India. I am focused on AI systems,
                  automation pipelines, blockchain infrastructure,
                  and developer tooling.
                </p>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 2.0, letterSpacing: "0.02em", marginTop: "14px" }}>
                  My work ranges from local LLM deployment and
                  Linux-based inference environments to Web3 node
                  operations, interactive interfaces, and experimental
                  software systems.
                </p>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 2.0, letterSpacing: "0.02em", marginTop: "14px" }}>
                  I enjoy building systems that feel alive —
                  clean architecture, immersive UX, and infrastructure
                  that actually works in production.
                </p>
              </div>
            </div>

            {/* Identity Terminal Panel (whoami.sh styled like a real grep shell) */}
            <div className="panel hover-glow-edge" data-cursor="VIEW" style={{ contain: "layout paint style" }}>
              <div className="panel-header flex items-center justify-between">
                <div className="panel-controls">
                  <span className="panel-dot panel-dot-red" />
                  <span className="panel-dot panel-dot-yellow" />
                  <span className="panel-dot panel-dot-green" />
                </div>
                <span className="panel-title">whoami.sh</span>
              </div>
              <div className="panel-body font-mono text-[11px]" style={{ padding: "18px 24px" }}>
                <div style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
                  $ env | grep operator
                </div>
                <div className="flex flex-col gap-2">
                  {IDENTITY_LINES.map(({ prompt, value }) => (
                    <div key={prompt} className="flex gap-2">
                      <span style={{ color: "var(--color-amber)", width: "84px", flexShrink: 0 }}>
                        {prompt.toUpperCase()}=
                      </span>
                      <span style={{ color: "var(--color-text-primary)" }}>
                        &quot;{value}&quot;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills (skills.json with technical monochrome progress brackets) */}
            <div className="panel hover-glow-edge" data-cursor="VIEW" style={{ contain: "layout paint style" }}>
              <div className="panel-header">
                <span className="panel-title">skills.json</span>
              </div>
              <div className="panel-body" style={{ padding: "20px 24px" }}>
                <div className="flex flex-col gap-4">
                  {SKILLS.map((s) => (
                    <div key={s.label} className="flex flex-col gap-1.5 font-mono">
                      <div className="flex justify-between items-baseline text-[11px]">
                        <span style={{ color: "var(--color-text-primary)" }}>{s.label}</span>
                        <span style={{ color: "var(--color-cyan)" }}>[ {s.status} ]</span>
                      </div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "11px", letterSpacing: "0.15em" }}>
                        {s.bar}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Stack (tech_stack.config styled as monochrome badging tags) */}
            <div className="panel hover-glow-edge" data-cursor="VIEW" style={{ contain: "layout paint style" }}>
              <div className="panel-header">
                <span className="panel-title">tech_stack.config</span>
              </div>
              <div className="panel-body" style={{ padding: "20px 24px" }}>
                <TechTagGroup tags={TECH_STACK} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
