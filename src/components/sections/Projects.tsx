"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, Code2, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TechTagGroup } from "@/components/ui/TechTag";
import { SectionLabel } from "@/components/ui/SectionLabel";

type ProjectStatus = "live" | "wip" | "lab" | "archived";

interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  deployTarget?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  accentColor: string;
  accentRgb: string;
  category: string;
  year: string;
  isPrivate?: boolean;
  bannerUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: "dino-run",
    name: "DINO RUN",
    tagline: "On-chain multiplayer game — Base Chain",
    description:
      "A fully on-chain multiplayer browser game built on Base mainnet. Smart contracts handle all game logic, scoring, and reward distribution.",
    stack: ["Next.js", "Solidity", "Base SDK", "TypeScript", "Wagmi"],
    status: "live",
    deployTarget: "BASE MAINNET",
    liveUrl: "https://dinorunbase.vercel.app/",
    isPrivate: true,
    bannerUrl: "/images/dinorun.png",
    featured: true,
    accentColor: "var(--color-cyan)",
    accentRgb: "0,212,255",
    category: "WEB3 / GAMING",
    year: "2024",
  },
  {
    id: "agent-stack",
    name: "AGENT STACK",
    tagline: "Modular AI agent orchestration framework",
    description:
      "Composable framework for building and deploying multi-agent AI pipelines. Supports tool use, memory, and parallel task execution.",
    stack: ["Python", "LangChain", "FastAPI", "Redis", "Docker"],
    status: "wip",
    githubUrl: "https://github.com/TheUGultimatum",
    featured: false,
    accentColor: "var(--color-electric)",
    accentRgb: "68,136,255",
    category: "AI / AUTOMATION",
    year: "2025",
  },
  {
    id: "content-pipeline",
    name: "CONTENT PIPELINE",
    tagline: "Automated content generation & publishing",
    description:
      "End-to-end pipeline that generates, edits, and publishes content across platforms. LLM-powered with human-in-loop approval stages.",
    stack: ["TypeScript", "OpenAI", "Node.js", "PostgreSQL"],
    status: "live",
    deployTarget: "VPS",
    githubUrl: "https://github.com/TheUGultimatum",
    featured: false,
    accentColor: "var(--color-purple)",
    accentRgb: "136,85,255",
    category: "AI / CONTENT",
    year: "2024",
  },
  {
    id: "devkit",
    name: "DEVKIT",
    tagline: "CLI toolbox for rapid project scaffolding",
    description:
      "Personal CLI toolkit — scaffolds projects, manages dotfiles, provisions servers, automates repetitive dev workflow tasks.",
    stack: ["Python", "Click", "Bash", "Docker"],
    status: "lab",
    githubUrl: "https://github.com/TheUGultimatus",
    featured: false,
    accentColor: "var(--color-cyan)",
    accentRgb: "0,212,255",
    category: "TOOLING / CLI",
    year: "2025",
  },
];

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ─── Visual preview area ─────────────────────────────────── */
function ProjectPreview({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      height: large ? "220px" : "110px",
      background: `linear-gradient(135deg, rgba(${project.accentRgb},0.04) 0%, var(--color-surface) 50%, var(--color-abyss) 100%)`,
      borderBottom: "1px solid var(--color-border)",
    }}>
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(${project.accentRgb},0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(${project.accentRgb},0.06) 1px, transparent 1px)
        `,
        backgroundSize: large ? "32px 32px" : "20px 20px",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute",
        width: large ? "180px" : "100px",
        height: large ? "180px" : "100px",
        background: `radial-gradient(circle, rgba(${project.accentRgb},0.18) 0%, transparent 70%)`,
        borderRadius: "50%",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        filter: "blur(2px)",
      }} />

      {/* Banner Image */}
      {project.bannerUrl && (
        <Image 
          src={project.bannerUrl} 
          alt={project.name}
          fill
          className="project-banner-img"
          style={{
            objectFit: "cover", opacity: 0.85,
          }}
        />
      )}

      {/* Gradient overlay to ensure text readability */}
      {project.bannerUrl && (
        <div className="project-banner-overlay" style={{
          position: "absolute", inset: 0,
        }} />
      )}

      {/* Corner badge */}
      <div style={{
        position: "absolute", top: "10px", left: "12px",
        fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em",
        color: `rgba(${project.accentRgb},0.7)`,
        background: `rgba(${project.accentRgb},0.08)`,
        border: `1px solid rgba(${project.accentRgb},0.18)`,
        borderRadius: "2px", padding: "2px 7px",
      }}>
        {project.category}
      </div>

      {/* Year */}
      <div style={{
        position: "absolute", bottom: "10px", right: "12px",
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: "var(--color-text-muted)",
      }}>
        {project.year}
      </div>

      {/* Center name for large */}
      {large && (
        <div style={{
          position: "absolute", bottom: "16px", left: "16px",
          fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
          fontSize: "28px", letterSpacing: "0.04em",
          color: `rgba(${project.accentRgb},0.15)`,
          lineHeight: 1,
        }}>
          {project.name}
        </div>
      )}
    </div>
  );
}

/* ─── Featured project ────────────────────────────────────── */
function FeaturedProject({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="panel hover-glow-edge"
      data-cursor="VIEW"
      style={{
        borderColor: hovered ? `rgba(${project.accentRgb},0.35)` : "var(--color-border-glow)",
        boxShadow: hovered
          ? `0 0 48px rgba(${project.accentRgb},0.12), 0 0 1px rgba(${project.accentRgb},0.4)`
          : `0 0 32px rgba(0,212,255,0.06)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="panel-header">
        <div className="panel-controls">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title">↺ featured.project — {project.id}.exe</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <StatusBadge status={project.status} />
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--color-text-muted)", display: "flex" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="featured-inner">
        {/* Preview */}
        <div style={{
          borderRight: "1px solid var(--color-border)",
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.01)" : "scale(1)",
          overflow: "hidden",
        }}>
          <ProjectPreview project={project} large />
        </div>

        {/* Info */}
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em",
                color: "var(--color-text-muted)",
              }}>PROJECT_NAME.exe</span>
            </div>
            <h3 style={{
              fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
              fontSize: "clamp(22px,2.5vw,32px)", letterSpacing: "0.04em",
              color: "var(--color-text-primary)", lineHeight: 1, margin: 0,
            }}>
              {project.name}
            </h3>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: "var(--color-text-muted)", marginTop: "4px",
            }}>
              {project.tagline}
            </p>
          </div>

          <p style={{
            color: "var(--color-text-secondary)", fontSize: "13px",
            lineHeight: 1.75, fontFamily: "var(--font-space-grotesk)",
          }}>
            {project.description}
          </p>

          <div>
            <p className="text-system" style={{ fontSize: "9px", marginBottom: "8px" }}>STACK</p>
            <TechTagGroup tags={project.stack} />
          </div>

          {project.deployTarget && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="text-system" style={{ fontSize: "9px" }}>DEPLOY</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--color-electric)",
                background: "rgba(68,136,255,0.08)",
                border: "1px solid rgba(68,136,255,0.2)",
                borderRadius: "2px", padding: "1px 7px",
              }}>{project.deployTarget}</span>
            </div>
          )}

          <div style={{
            display: "flex", gap: "10px", marginTop: "auto",
            paddingTop: "14px", borderTop: "1px solid var(--color-border)",
          }}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary" style={{ padding: "7px 16px", fontSize: "10px" }}>
                LIVE DEMO <ExternalLink size={10} />
              </a>
            )}
            {project.isPrivate ? (
              <div className="btn-secondary" style={{ padding: "7px 16px", fontSize: "10px", opacity: 0.5, cursor: "not-allowed" }}>
                <Lock size={11} /> PRIVATE REPO
              </div>
            ) : project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="btn-secondary" style={{ padding: "7px 16px", fontSize: "10px" }}>
                <Code2 size={11} /> SOURCE
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Project card ────────────────────────────────────────── */
function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="panel hover-glow-edge animate-fade-in-up"
      data-cursor="OPEN"
      style={{
        animationDelay: `${delay}ms`,
        cursor: "pointer",
        borderColor: hovered ? `rgba(${project.accentRgb},0.3)` : undefined,
        boxShadow: hovered ? `0 0 28px rgba(${project.accentRgb},0.1)` : undefined,
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="panel-header">
        <div className="panel-controls">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title">{project.name.toLowerCase()}.exe</span>
        <div style={{ marginLeft: "auto" }}><StatusBadge status={project.status} /></div>
      </div>

      {/* Preview */}
      <div style={{ transition: "transform 0.3s", transform: hovered ? "scale(1.02)" : "scale(1)", overflow: "hidden" }}>
        <ProjectPreview project={project} />
      </div>

      <div className="panel-body" style={{ padding: "14px 16px" }}>
        {/* Terminal metadata */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "10px",
          color: "var(--color-text-muted)", marginBottom: "8px",
          display: "flex", gap: "12px",
        }}>
          <span>{project.category}</span>
          <span style={{ color: "var(--color-border-glow)" }}>·</span>
          <span>{project.year}</span>
        </div>

        <p style={{
          color: "var(--color-text-muted)", fontSize: "12px",
          lineHeight: 1.6, marginBottom: "10px",
          fontFamily: "var(--font-space-grotesk)",
        }}>
          {project.tagline}
        </p>

        <TechTagGroup tags={project.stack.slice(0, 4)} />

        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-border)",
        }}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--color-text-muted)", transition: "color 0.15s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Code2 size={11} /> SOURCE
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--color-text-muted)", transition: "color 0.15s",
                marginLeft: "auto", textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              DEMO <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────── */
export function Projects() {
  const { ref, inView } = useInView();
  const featured = PROJECTS.find((p) => p.featured)!;
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(28px, 4vw, 56px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        <div className={inView ? "animate-fade-in-up" : "anim-hidden"}>
          <SectionLabel label="PROJECTS.EXE" />
          <p className="text-system" style={{ marginTop: "4px" }}>
            DEPLOYED SYSTEMS · {PROJECTS.length} REGISTERED
          </p>
        </div>

        <div className={inView ? "animate-fade-in-up delay-100" : "anim-hidden"}
          style={{ marginTop: "clamp(24px, 3.5vh, 40px)" }}>
          <FeaturedProject project={featured} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "14px",
          marginTop: "14px",
        }}
          className={`projects-grid ${inView ? "" : "anim-hidden"}`}
        >
          {rest.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 80} />
          ))}
        </div>
      </div>

      <style>{`
        .project-banner-img {
          mix-blend-mode: screen;
        }
        .project-banner-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
        }
        .day-mode .project-banner-img {
          mix-blend-mode: multiply;
          opacity: 0.7 !important;
        }
        .day-mode .project-banner-overlay {
          background: linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 100%) !important;
        }
        @media (max-width: 960px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .featured-inner { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
