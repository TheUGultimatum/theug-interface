"use client";

import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface TimelineEntry {
  year: string;
  title: string;
  org: string;
  description: string;
  tags: string[];
  type: "work" | "project" | "milestone";
}

const TIMELINE: TimelineEntry[] = [
  {
    year: "2025",
    title: "Independent Builder",
    org: "Self",
    description:
      "Full-time independent work: AI agents, on-chain products, and automation frameworks. Multiple deployed projects.",
    tags: ["AI", "Web3", "Automation"],
    type: "milestone",
  },
  {
    year: "2024",
    title: "AI Integration Lead",
    org: "Startup",
    description:
      "Led AI product integration across a startup team. Built internal tooling, LLM pipelines, and customer-facing AI features.",
    tags: ["LLMs", "Python", "TypeScript"],
    type: "work",
  },
  {
    year: "2023",
    title: "Web3 Developer",
    org: "DeFi Project",
    description:
      "Smart contract development and frontend integration for a DeFi protocol on Ethereum. Audited and shipped production contracts.",
    tags: ["Solidity", "Ethers.js", "Next.js"],
    type: "work",
  },
  {
    year: "2022",
    title: "Full Stack Engineer",
    org: "Agency",
    description:
      "Built and shipped client products across fintech and SaaS verticals. First deep dive into cloud infra and backend systems.",
    tags: ["Node.js", "React", "AWS"],
    type: "work",
  },
  {
    year: "2021",
    title: "Started Programming",
    org: "Self-taught",
    description:
      "Learned to code. Built first real projects. Went from zero to shipping within the year.",
    tags: ["Python", "HTML", "CSS"],
    type: "milestone",
  },
];

const TYPE_COLOR: Record<TimelineEntry["type"], string> = {
  work: "var(--color-electric)",
  project: "var(--color-purple)",
  milestone: "var(--color-cyan)",
};

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

        <div className={inView ? "animate-fade-in-up" : "anim-hidden"}>
          <SectionLabel label="TIMELINE.EXE" />
          <p
            className="font-mono text-[11px] mt-1"
            style={{ color: "var(--color-text-muted)", letterSpacing: "0.06em" }}
          >
            CHRONOLOGICAL LOG · {TIMELINE.length} ENTRIES
          </p>
        </div>

        <div
          style={{ marginTop: "clamp(32px, 4vh, 48px)", position: "relative" }}
        >
          {/* Vertical rail */}
          <div
            style={{
              position: "absolute",
              left: "88px",
              top: 0,
              bottom: 0,
              width: "1px",
              background: `linear-gradient(to bottom, transparent, var(--color-border) 10%, var(--color-border) 90%, transparent)`,
            }}
          />

          <div className="flex flex-col gap-0">
            {TIMELINE.map((entry, i) => (
              <div
                key={entry.year + i}
                className={inView ? `animate-fade-in-up` : "anim-hidden"}
                style={{
                  animationDelay: `${100 + i * 120}ms`,
                  display: "flex",
                  gap: "0",
                  paddingBottom: i < TIMELINE.length - 1 ? "32px" : "0",
                }}
              >
                {/* Year column */}
                <div
                  style={{
                    width: "88px",
                    flexShrink: 0,
                    paddingRight: "20px",
                    paddingTop: "14px",
                    textAlign: "right",
                  }}
                >
                  <span
                    className="font-mono font-semibold"
                    style={{
                      fontSize: "13px",
                      color: TYPE_COLOR[entry.type],
                      letterSpacing: "0.06em",
                    }}
                  >
                    {entry.year}
                  </span>
                </div>

                {/* Node */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: TYPE_COLOR[entry.type],
                      boxShadow: `0 0 12px ${TYPE_COLOR[entry.type]}88`,
                      marginTop: "17px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                </div>

                {/* Content */}
                <div
                  className="panel"
                  style={{
                    flex: 1,
                    marginLeft: "20px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-glow)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(0,212,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div className="panel-header">
                    <span
                      className="panel-title flex-none font-semibold"
                      style={{ color: "var(--color-text-primary)", fontSize: "12px" }}
                    >
                      {entry.title}
                    </span>
                    <span
                      className="font-mono text-[10px] ml-2"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      @ {entry.org}
                    </span>
                    <div className="ml-auto">
                      <span
                        className="font-mono text-[9px] px-2 py-0.5 rounded-sm"
                        style={{
                          color: TYPE_COLOR[entry.type],
                          background: `${TYPE_COLOR[entry.type]}18`,
                          border: `1px solid ${TYPE_COLOR[entry.type]}44`,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {entry.type}
                      </span>
                    </div>
                  </div>
                  <div className="panel-body">
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", lineHeight: 1.7, marginBottom: "10px" }}>
                      {entry.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((t) => (
                        <span key={t} className="tech-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
