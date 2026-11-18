"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Code2,
  Lock,
  Search,
  Sparkles,
  Maximize2,
  X,
  Share2,
  Check,
  ArrowUpRight,
  Info,
  Calendar,
  Layers,
  Globe,
} from "lucide-react";
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

/* ─── Visual Preview Area (Enhanced Image Clarity & Sizing) ────────── */
function ProjectPreview({
  project,
  large = false,
  onExpand,
}: {
  project: Project;
  large?: boolean;
  onExpand?: (project: Project) => void;
}) {
  const rgb = project.accentRgb || "0,212,255";

  return (
    <div
      onClick={() => onExpand?.(project)}
      style={{
        position: "relative",
        overflow: "hidden",
        height: large ? "290px" : "200px",
        background: `linear-gradient(135deg, rgba(${rgb},0.08) 0%, var(--color-surface) 60%, var(--color-abyss) 100%)`,
        borderBottom: "1px solid var(--color-border)",
      }}
      className="project-preview-wrap group cursor-pointer"
      title="Click to expand & view full details"
    >
      {/* Subtle Background Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(${rgb},0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb},0.07) 1px, transparent 1px)
          `,
          backgroundSize: large ? "28px 28px" : "20px 20px",
        }}
      />

      {/* Atmospheric Ambient Glow Orb */}
      <div
        style={{
          position: "absolute",
          width: large ? "260px" : "150px",
          height: large ? "260px" : "150px",
          background: `radial-gradient(circle, rgba(${rgb},0.28) 0%, transparent 70%)`,
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(6px)",
        }}
      />

      {/* Banner Artwork: Crisp, high-contrast, no destructive blend modes */}
      {project.bannerUrl ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={project.bannerUrl}
            alt={project.name}
            fill
            sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      ) : (
        /* Modern Cyberpunk Fallback Graphic */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
              fontSize: large ? "44px" : "28px",
              letterSpacing: "0.08em",
              color: `rgba(${rgb},0.25)`,
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            {project.name}
          </div>
        </div>
      )}

      {/* Subtle Gradient Shadow only at the very bottom for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Category Pill */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          color: `rgb(${rgb})`,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          border: `1px solid rgba(${rgb},0.4)`,
          borderRadius: "4px",
          padding: "3px 8px",
          zIndex: 2,
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
          fontSize: "10px",
          color: "rgba(255,255,255,0.85)",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          padding: "2px 6px",
          borderRadius: "3px",
          zIndex: 2,
        }}
      >
        SYS // {project.year}
      </div>

      {/* Hover "Expand & Details" Overlay Pill */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 3,
        }}
      >
        <span
          className="px-3.5 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-white shadow-xl transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
          style={{
            background: "rgba(10,10,12,0.9)",
            borderColor: `rgba(${rgb},0.6)`,
            boxShadow: `0 0 16px rgba(${rgb},0.35)`,
          }}
        >
          <Maximize2 size={13} style={{ color: `rgb(${rgb})` }} />
          <span>EXPAND DETAILS</span>
        </span>
      </div>
    </div>
  );
}

/* ─── Expandable Project Lightbox & Detail Modal ──────────────────────── */
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) setIsZoomed(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isZoomed]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [project]);

  if (!project) return null;
  const rgb = project.accentRgb || "0,212,255";

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects#${project.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Fullscreen High-Resolution Lightbox for Image */}
      {isZoomed && project.bannerUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Fullscreen"
          >
            <X size={22} />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-[85vh]">
            <Image
              src={project.bannerUrl}
              alt={project.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-white/70 bg-black/60 px-4 py-2 rounded-full border border-white/20">
            {project.name} · Full Resolution View (Click anywhere or ESC to close)
          </div>
        </div>
      )}

      {/* Main Details Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-[var(--color-surface)] border border-[var(--color-border-bright)] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col font-mono animate-fade-in-up"
          style={{
            boxShadow: `0 0 50px rgba(${rgb},0.15), 0 20px 40px rgba(0,0,0,0.8)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Window Header */}
          <div className="panel-header flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-abyss)] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
              <span className="text-xs text-[var(--color-text-muted)] ml-2">
                architecture_spec // {project.id}.exe
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="h-8 px-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1.5 text-[11px]"
                title="Copy shareable link"
              >
                {copied ? <Check size={13} className="text-[var(--color-green)]" /> : <Share2 size={13} />}
                <span>{copied ? "Link Copied" : "Share"}</span>
              </button>

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors flex items-center justify-center cursor-pointer"
                title="Close modal (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1 p-0">
            {/* Expanded Hero Banner Display */}
            {project.bannerUrl ? (
              <div
                className="relative w-full h-[280px] sm:h-[360px] bg-black/60 group overflow-hidden cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
                title="Click to view full-resolution photo"
              >
                <Image
                  src={project.bannerUrl}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-black/30 pointer-events-none" />

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-black/75 border border-white/20 text-white text-xs font-mono backdrop-blur-md flex items-center gap-1.5 shadow-lg group-hover:border-[var(--color-cyan)] transition-colors">
                    <Maximize2 size={13} />
                    <span>Click to Zoom Fullscreen</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-32 flex items-center justify-center border-b border-[var(--color-border)]"
                style={{
                  background: `linear-gradient(135deg, rgba(${rgb},0.15) 0%, var(--color-surface) 100%)`,
                }}
              >
                <h2 className="text-3xl font-bold tracking-wider" style={{ color: `rgb(${rgb})` }}>
                  {project.name}
                </h2>
              </div>
            )}

            {/* Modal Body Info */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Meta Row: Badges, Categories, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)] text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="px-2.5 py-1 rounded font-semibold tracking-wider uppercase text-[10px]"
                    style={{
                      color: `rgb(${rgb})`,
                      background: `rgba(${rgb},0.1)`,
                      border: `1px solid rgba(${rgb},0.3)`,
                    }}
                  >
                    {project.category}
                  </span>

                  <StatusBadge status={project.status} />

                  {project.deployTarget && (
                    <span className="px-2.5 py-1 rounded border border-[var(--color-electric)]/30 text-[var(--color-electric)] bg-[var(--color-electric)]/10 text-[10px]">
                      {project.deployTarget}
                    </span>
                  )}
                </div>

                <div className="text-[var(--color-text-muted)] text-xs flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>SYS // {project.year}</span>
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] font-sans tracking-tight">
                  {project.name}
                </h2>
                {project.tagline && (
                  <p className="text-base text-[var(--color-amber)] mt-1.5 font-medium leading-relaxed">
                    {project.tagline}
                  </p>
                )}
              </div>

              {/* Comprehensive Description */}
              <div className="space-y-2">
                <div className="text-xs uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                  <Info size={13} />
                  <span>SYSTEM OVERVIEW & ARCHITECTURE</span>
                </div>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-sans leading-relaxed whitespace-pre-line bg-[var(--color-elevated)]/60 p-4 sm:p-5 rounded-xl border border-[var(--color-border)]">
                  {project.description}
                </p>
              </div>

              {/* Technology Stack Modules */}
              <div>
                <div className="text-xs uppercase text-[var(--color-text-muted)] tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>TECHNOLOGY STACK & INTEGRATIONS</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-elevated)]/40 border border-[var(--color-border)]">
                  <TechTagGroup tags={project.stack} />
                </div>
              </div>

              {/* Action Buttons & Links */}
              <div className="pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                      style={{
                        boxShadow: `0 0 20px rgba(255,94,58,0.3)`,
                      }}
                    >
                      <Globe size={14} />
                      <span>Launch Application</span>
                      <ArrowUpRight size={14} />
                    </a>
                  )}

                  {project.isPrivate ? (
                    <span
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs flex items-center gap-2 bg-[var(--color-elevated)]/50"
                      title="Source code is private property"
                    >
                      <Lock size={14} className="text-[var(--color-amber)]" />
                      <span>Private Repository</span>
                    </span>
                  ) : project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] text-xs flex items-center gap-2 transition-all bg-[var(--color-surface)] shadow-sm"
                    >
                      <Code2 size={14} />
                      <span>View Source Code</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : null}
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors ml-auto"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Featured Spotlight Project Showcase ────────────────────────────── */
function FeaturedProject({
  project,
  onExpand,
}: {
  project: Project;
  onExpand: (project: Project) => void;
}) {
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
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr" }} className="featured-inner">
        {/* Preview Container with clickable expand */}
        <div
          style={{
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <ProjectPreview project={project} large onExpand={onExpand} />
        </div>

        {/* Info & Metadata */}
        <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
              onClick={() => onExpand(project)}
              className="cursor-pointer hover:text-[var(--color-amber)] transition-colors"
              style={{
                fontFamily: "var(--font-bebas, var(--font-space-grotesk))",
                fontSize: "clamp(26px,2.8vw,38px)",
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
                fontSize: "12px",
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
            className="line-clamp-3"
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
            <button
              onClick={() => onExpand(project)}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "10px", cursor: "pointer" }}
            >
              EXPAND DETAILS <Maximize2 size={12} />
            </button>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "10px" }}
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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

/* ─── Grid Project Card (Clickable with Enhanced Image Preview) ───────── */
function ProjectCard({
  project,
  delay,
  onExpand,
}: {
  project: Project;
  delay: number;
  onExpand: (project: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rgb = project.accentRgb || "0,212,255";

  return (
    <div
      className="panel hover-glow-edge animate-fade-in-up flex flex-col h-full group"
      data-cursor="OPEN"
      style={{
        animationDelay: `${delay}ms`,
        borderColor: hovered ? `rgba(${rgb},0.45)` : "var(--color-border)",
        boxShadow: hovered ? `0 0 32px rgba(${rgb},0.15)` : undefined,
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Header Bar */}
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

      {/* Visual Preview (Clickable & Crisp) */}
      <div style={{ overflow: "hidden" }}>
        <ProjectPreview project={project} onExpand={onExpand} />
      </div>

      {/* Card Body */}
      <div className="panel-body flex flex-col flex-1" style={{ padding: "18px 20px" }}>
        {/* Terminal Metadata */}
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

        <h4
          onClick={() => onExpand(project)}
          className="font-bold text-base text-[var(--color-text-primary)] mb-1 font-mono tracking-wide cursor-pointer hover:text-[var(--color-cyan)] transition-colors"
        >
          {project.name}
        </h4>

        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "12px",
            lineHeight: 1.6,
            marginBottom: "14px",
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
          <button
            onClick={() => onExpand(project)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors"
            title="Expand full project details"
          >
            <Maximize2 size={11} /> DETAILS
          </button>

          {project.isPrivate ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
                marginLeft: "8px",
              }}
            >
              <Lock size={11} className="text-[var(--color-amber)]" /> PRIVATE
            </span>
          ) : project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
                transition: "color 0.15s",
                textDecoration: "none",
                marginLeft: "8px",
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
              onClick={(e) => e.stopPropagation()}
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

/* ─── Main Projects Section ───────────────────────────────────────────── */
export function Projects() {
  const { ref, inView } = useInView();
  const [projectList, setProjectList] = useState<Project[]>(defaultProjects as Project[]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dynamic load from API for live database sync
  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          setProjectList(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for hash in URL to auto-open project modal (e.g. /projects#dino-run)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "").toLowerCase();
      const match = projectList.find((p) => p.id.toLowerCase() === targetId);
      if (match) setSelectedProject(match);
    }
  }, [projectList]);

  // Compute unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projectList.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["ALL", ...Array.from(cats)];
  }, [projectList]);

  // Filter projects by category and search query
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
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      {/* Expandable Project Detail Lightbox Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="02 // PORTFOLIO" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mt-3 mb-3">
              Featured Builds & Systems
            </h2>
            <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Autonomous agents, production web platforms, smart contract systems, and validator infrastructure. Click any build to inspect complete specs.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span>ACTIVE BUILDS // {projectList.length} UNITS</span>
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div
          className={`flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-6 mb-8 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          {/* Category Tabs */}
          <div
            className="flex flex-wrap gap-2"
            role="toolbar"
            aria-label="Filter projects by category"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[var(--color-amber)] text-black font-bold shadow-md"
                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]"
                }`}
                aria-label={`Show ${cat} projects`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search builds by name or stack..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
              aria-label="Search projects by keyword or tech stack"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Featured Showcase Card */}
        {featured && (
          <div
            className={inView ? "animate-fade-in-up delay-100" : "anim-hidden"}
            style={{ marginTop: "20px" }}
          >
            <FeaturedProject project={featured} onExpand={setSelectedProject} />
          </div>
        )}

        {/* Projects Modular Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "24px",
          }}
          className={`projects-grid ${inView ? "" : "anim-hidden"}`}
        >
          {rest.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              delay={i * 60}
              onExpand={setSelectedProject}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="panel p-16 text-center my-8 border border-[var(--color-border)] rounded-2xl">
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              NO PROJECTS FOUND MATCHING &quot;{searchQuery}&quot; IN {activeCategory}
            </p>
            <button
              onClick={() => {
                setActiveCategory("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-mono border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-black transition-all cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        )}
      </div>

      <style>{`
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
