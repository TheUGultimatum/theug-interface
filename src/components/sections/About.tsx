"use client";

import { useEffect, useRef, useState } from "react";
import { MetricBar } from "@/components/ui/MetricBar";
import { TechTagGroup } from "@/components/ui/TechTag";
import { SectionLabel } from "@/components/ui/SectionLabel";

const SKILLS = [
  { label: "AI / LLM Engineering",  value: 90, variant: "electric" as const },
  { label: "Backend / APIs",        value: 85, variant: "electric" as const },
  { label: "Web3 / Smart Contracts",value: 78, variant: "purple"   as const },
  { label: "DevOps / Infra",        value: 72, variant: "cyan"     as const },
  { label: "Frontend / Systems UI", value: 80, variant: "electric" as const },
];

const TECH_STACK = [
  "Python", "TypeScript", "Next.js", "Node.js",
  "Solidity", "Docker", "PostgreSQL", "Redis",
  "OpenAI", "LangChain", "Linux", "Git",
];

const IDENTITY_LINES = [
  { prompt: "name",   value: "Usmaan Gani" },
  { prompt: "handle", value: "theUG" },
  { prompt: "role",   value: "Independent Engineer" },
  { prompt: "base",   value: "India · IST+5:30" },
  { prompt: "status", value: "actively building" },
  { prompt: "open",   value: "collaboration / freelance" },
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
        <div className={inView ? "animate-fade-in-up" : "anim-hidden"}>
          <SectionLabel label="ABOUT.EXE" />
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

          {/* ── LEFT: Identity + Bio ── */}
          <div className={`flex flex-col gap-6 ${inView ? "animate-fade-in-up delay-100" : "anim-hidden"}`}>

            {/* Identity terminal panel */}
            <div className="panel hover-glow-edge" data-cursor="VIEW">
              <div className="panel-header">
                <div className="panel-controls">
                  <span className="panel-dot panel-dot-red" />
                  <span className="panel-dot panel-dot-yellow" />
                  <span className="panel-dot panel-dot-green" />
                </div>
                <span className="panel-title">whoami.sh</span>
              </div>
              <div className="panel-body">
                <div className="flex flex-col gap-2">
                  {IDENTITY_LINES.map(({ prompt, value }) => (
                    <div key={prompt} className="terminal-line">
                      <span className="terminal-prompt" style={{ fontSize: "11px" }}>
                        {prompt}:
                      </span>
                      <span className="terminal-text">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="panel hover-glow-edge" data-cursor="VIEW">
              <div className="panel-header">
                <span className="panel-title">bio.md</span>
              </div>
              <div className="panel-body">
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.8 }}>
                  I'm an independent builder focused on AI agents, automation systems, and
                  experimental software products. I work at the intersection of AI, blockchain,
                  and developer tooling — building things that either didn't exist before or
                  weren't done properly yet.
                </p>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.8, marginTop: "12px" }}>
                  I care about the craft — clean systems, sharp interfaces, and code that
                  does exactly what it says.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Skills + Stack ── */}
          <div className={`flex flex-col gap-6 ${inView ? "animate-fade-in-up delay-200" : "anim-hidden"}`}>

            {/* Skills */}
            <div className="panel hover-glow-edge" data-cursor="VIEW">
              <div className="panel-header">
                <span className="panel-title">skills.json</span>
              </div>
              <div className="panel-body">
                <div className="flex flex-col gap-4">
                  {SKILLS.map((s) => (
                    <MetricBar
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      variant={s.variant}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tech stack */}
            <div className="panel hover-glow-edge" data-cursor="VIEW">
              <div className="panel-header">
                <span className="panel-title">tech_stack.config</span>
              </div>
              <div className="panel-body">
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
