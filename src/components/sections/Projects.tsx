"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Code2, Lock, Shield, Search, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TechTagGroup } from "@/components/ui/TechTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Project } from "@/types/project";
import defaultProjects from "@/data/projects.json";

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ─── Visual preview area with HUD grid and ambient bloom ────── */
function ProjectPreview({ project, large = false }: { project: Project; large?: boolean }) {
  const rgb = project.accentRgb || "0,212,255";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height: large ? "240px" : "130px",
        background: `linear-gradient(135deg, rgba(${rgb},0.05) 0%, var(--color-surface) 50%, var(--color-abyss) 100%)`,
        borderBottom: "1px solid var(--color-border)",
      }}
      className="project-preview-wrap group"
    >
      {/* Cyberpunk Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(${rgb},0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb},0.07) 1px, transparent 1px)
          `,
          backgroundSize: large ? "32px 32px" : "20px 20px",
        }}
      />

      {/* Atmospheric Radial Glow Orb */}
      <div
        style={{
          position: "absolute",
          width: large ? "220px" : "120px",
          height: large ? "220px" : "120px",
          background: `radial-gradient(circle, rgba(${rgb},0.22) 0%, transparent 70%)`,
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(4px)",
        }}
      />

      {/* Banner Image */}
      {project.bannerUrl && (
        <Image
          src={project.bannerUrl}
          alt={project.name}
          fill
          className="project-banner-img transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            objectFit: "cover",
            opacity: 0.85,
          }}
        />
      )}

      {/* Vignette Overlay */}
      <div
        className="project-banner-overlay"
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {/* HUD Corner Ticks */}
      <div className="absolute inset-2 pointer-events-none opacity-40">
        <span className="absolute top-0 left-0 w-2 h-[1px] bg-white/40" />
        <span className="absolute top-0 left-0 w-[1px] h-2 bg-white/40" />
        <span className="absolute bottom-0 right-0 w-2 h-[1px] bg-white/40" />
        <span className="absolute bottom-0 right-0 w-[1px] h-2 bg-white/40" />
      </div>

      {/* Category Pill */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.1em",
          color: `rgba(${rgb},0.9)`,
          background: `rgba(${rgb},0.08)`,
          border: `1px solid rgba(${rgb},0.25)`,
          borderRadius: "2px",
          padding: "2px 7px",
        }}
      >
        {project.category}
      </div>

      {/* Year */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--color-text-muted)",
        }}
      >
        SYS // {project.year}
      </div>

      {/* Giant Watermark Name */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "12px",
          fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
          fontSize: large ? "36px" : "20px",
          letterSpacing: "0.05em",
          color: `rgba(${rgb},0.15)`,
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {project.name}
      </div>
    </div>
  );
}

/* ─── Featured project showcase ───────────────────────────── */
function FeaturedProject({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const rgb = project.accentRgb || "255,94,58";

  return (
    <div
      className="panel hover-glow-edge relative overflow-hidden"
      data-cursor="VIEW"
      style={{
        borderColor: hovered ? `rgba(${rgb},0.45)` : "var(--color-border-bright)",
        boxShadow: hovered
          ? `0 0 48px rgba(${rgb},0.15), 0 0 1px rgba(${rgb},0.5)`
          : `0 0 24px rgba(0,0,0,0.4)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Header Bar */}
      <div className="panel-header flex items-center justify-between">
        <div className="panel-controls flex items-center gap-1.5">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title flex items-center gap-1.5">
          <Sparkles size={11} className="text-[var(--color-amber)]" />
          featured.deployment // {project.id}.exe
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <StatusBadge status={project.status} />
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-cyan)] transition-colors"
              title="Launch Application"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }} className="featured-inner">
        {/* Preview */}
        <div
          style={{
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <ProjectPreview project={project} large />
        </div>

        {/* Info & Metadata */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  color: `rgb(${rgb})`,
                }}
              >
                ● SPOTLIGHT ARCHITECTURE
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
                fontSize: "clamp(24px,2.8vw,36px)",
                letterSpacing: "0.04em",
                color: "var(--color-text-primary)",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {project.name}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--color-text-muted)",
                marginTop: "6px",
              }}
            >
              {project.tagline}
            </p>
          </div>

          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "13px",
              lineHeight: 1.7,
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            {project.description}
          </p>

          <div>
            <p className="text-system" style={{ fontSize: "9px", marginBottom: "8px" }}>
              STACK MODULES
            </p>
            <TechTagGroup tags={project.stack} />
          </div>

          {project.deployTarget && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="text-system" style={{ fontSize: "9px" }}>
                INFRASTRUCTURE TARGET
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--color-electric)",
                  background: "rgba(68,136,255,0.08)",
                  border: "1px solid rgba(68,136,255,0.25)",
                  borderRadius: "2px",
                  padding: "1px 7px",
                }}
              >
                {project.deployTarget}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "auto",
              paddingTop: "14px",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "10px" }}
              >
                LAUNCH APPLICATION <ExternalLink size={11} />
              </a>
            )}
            {project.isPrivate ? (
              <div
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "10px", opacity: 0.6, cursor: "not-allowed" }}
                title="Source code is private"
              >
                <Lock size={12} className="text-[var(--color-amber)]" />
                PRIVATE REPO
              </div>
            ) : project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "10px" }}
              >
                <Code2 size={12} />
                VIEW SOURCE
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Grid Project card ───────────────────────────────────── */
function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const rgb = project.accentRgb || "0,212,255";

  return (
    <div
      className="panel hover-glow-edge animate-fade-in-up flex flex-col h-full"
      data-cursor="OPEN"
      style={{
        animationDelay: `${delay}ms`,
        borderColor: hovered ? `rgba(${rgb},0.4)` : "var(--color-border)",
        boxShadow: hovered ? `0 0 32px rgba(${rgb},0.12)` : undefined,
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="panel-header flex items-center justify-between">
        <div className="panel-controls flex items-center gap-1">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title">{project.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.exe</span>
        <div style={{ marginLeft: "auto" }}>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Visual Preview */}
      <div style={{ overflow: "hidden" }}>
        <ProjectPreview project={project} />
      </div>

      <div className="panel-body flex flex-col flex-1" style={{ padding: "16px 18px" }}>
        {/* Terminal metadata */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{project.category}</span>
          <span style={{ color: "var(--color-border-glow)" }}>·</span>
          <span>{project.year}</span>
          {project.deployTarget && (
            <>
              <span style={{ color: "var(--color-border-glow)" }}>·</span>
              <span className="text-[var(--color-electric)]">{project.deployTarget}</span>
            </>
          )}
        </div>

        <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1 font-mono tracking-wide">
          {project.name}
        </h4>

        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "12px",
            lineHeight: 1.6,
            marginBottom: "12px",
            fontFamily: "var(--font-space-grotesk)",
          }}
          className="line-clamp-2"
        >
          {project.tagline || project.description}
        </p>

        <div className="mt-auto pt-2">
          <TechTagGroup tags={project.stack.slice(0, 4)} />
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {project.isPrivate ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
              }}
            >
              <Lock size={11} className="text-[var(--color-amber)]" /> PRIVATE
            </span>
          ) : project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
                transition: "color 0.15s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Code2 size={11} /> SOURCE
            </a>
          ) : null}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-cyan)",
                transition: "color 0.15s",
                marginLeft: "auto",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-cyan)")}
            >
              LAUNCH <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Projects Section ───────────────────────────────── */
export function Projects() {
  const { ref, inView } = useInView();
  const [projectList, setProjectList] = useState<Project[]>(defaultProjects as Project[]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Attempt dynamic load from API for live admin sync
  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjectList(data.projects);
        }
      })
      .catch(() => {
        // graceful offline / static fallback
      });
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projectList.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["ALL", ...Array.from(cats)];
  }, [projectList]);

  // Filter projects by category and search
  const filtered = useMemo(() => {
    return projectList.filter((p) => {
      const matchCat = activeCategory === "ALL" || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [projectList, activeCategory, searchQuery]);

  const featured = filtered.find((p) => p.featured) || filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <section
      id="projects"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 56px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        {/* Section Title & Admin Uplink */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${inView ? "animate-fade-in-up" : "anim-hidden"}`}>
          <div>
            <SectionLabel label="PROJECTS.EXE" />
            <p className="text-system" style={{ marginTop: "4px" }}>
              DEPLOYED SYSTEMS · {projectList.length} REGISTERED INVENTORY
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-amber)] transition-colors flex items-center gap-1.5 border border-[var(--color-border)] px-3 py-1.5 rounded bg-[var(--color-surface)]"
            >
              <Shield size={12} className="text-[var(--color-amber)]" />
              <span>[ SYS.ADMIN // MANAGE ]</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-8 pb-4 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          {/* Categories */}
          <div 
            role="tablist"
            aria-label="Filter projects by category"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none"
          >
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${cat} projects`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[var(--color-amber)] text-black font-bold shadow-[0_0_12px_rgba(255,94,58,0.3)]"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              aria-label="Search projects by keyword or tech stack"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stack, keywords..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear project search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Featured Showcase Card */}
        {featured && (
          <div
            className={inView ? "animate-fade-in-up delay-100" : "anim-hidden"}
            style={{ marginTop: "24px" }}
          >
            <FeaturedProject project={featured} />
          </div>
        )}

        {/* Projects Modular Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginTop: "16px",
          }}
          className={`projects-grid ${inView ? "" : "anim-hidden"}`}
        >
          {rest.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 60} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="panel p-16 text-center my-8 border border-[var(--color-border)]">
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              NO PROJECTS FOUND MATCHING &quot;{searchQuery}&quot; IN {activeCategory}
            </p>
            <button
              onClick={() => {
                setActiveCategory("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-1.5 rounded text-[10px] font-mono border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-black transition-all cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        )}
      </div>

      <style>{`
        .project-banner-img {
          mix-blend-mode: screen;
        }
        .project-banner-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
        }
        .day-mode .project-banner-img {
          mix-blend-mode: multiply;
          opacity: 0.7 !important;
        }
        .day-mode .project-banner-overlay {
          background: linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 100%) !important;
        }
        @media (max-width: 1024px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .featured-inner { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
