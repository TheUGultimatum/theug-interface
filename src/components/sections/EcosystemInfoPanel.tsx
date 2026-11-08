"use client";

import React from "react";
import { EcosystemData } from "@/config/networkData";
import { 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Terminal, 
  Sparkles, 
  Compass, 
  Cpu, 
  Radio,
  Activity
} from "lucide-react";

interface EcosystemInfoPanelProps {
  ecosystem: EcosystemData;
}

export function EcosystemInfoPanel({ ecosystem }: EcosystemInfoPanelProps) {
  const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
    Building: { bg: "rgba(0, 255, 102, 0.12)", text: "#00FF66", border: "rgba(0, 255, 102, 0.35)" },
    Researching: { bg: "rgba(0, 217, 255, 0.12)", text: "#00D9FF", border: "rgba(0, 217, 255, 0.35)" },
    Experimenting: { bg: "rgba(255, 184, 0, 0.12)", text: "#FFB800", border: "rgba(255, 184, 0, 0.35)" },
    Exploring: { bg: "rgba(168, 85, 247, 0.12)", text: "#C084FC", border: "rgba(168, 85, 247, 0.35)" },
    Contributing: { bg: "rgba(239, 68, 68, 0.12)", text: "#F87171", border: "rgba(239, 68, 68, 0.35)" }
  };

  const statusStyle = ecosystem.status 
    ? statusColorMap[ecosystem.status] || { bg: "rgba(255,255,255,0.1)", text: "var(--color-text-primary)", border: "var(--color-border)" }
    : null;

  return (
    <div 
      className="panel p-6 md:p-8 rounded-2xl border border-[var(--color-border-bright)] transition-all duration-300 relative overflow-hidden"
      style={{
        background: "var(--color-surface)",
        borderLeft: `4px solid ${ecosystem.color}`,
      }}
    >
      {/* ─────────────────────────────────────────────────────
          TOP HEADER: LOGO, IDENTITY & STATUS BADGE
          ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="flex items-center gap-3.5">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center p-2.5 border shrink-0 transition-transform hover:scale-105"
            style={{ 
              background: `${ecosystem.color}15`, 
              borderColor: `${ecosystem.color}45` 
            }}
          >
            <img 
              src={`/logos/${ecosystem.id}.svg`} 
              alt={ecosystem.name} 
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-wider text-[var(--color-text-primary)] font-mono">
                {ecosystem.displayName}
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-mono tracking-wide mt-0.5">
              {ecosystem.classificationDetail}
            </p>
          </div>
        </div>

        {/* Status Badge & Classification Tag */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {statusStyle && (
            <span 
              className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{
                background: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusStyle.text }} />
              STATUS: {ecosystem.status}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-md text-[9px] font-mono border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-void)] uppercase">
            {ecosystem.classification}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          CORE CONTENT: PERSONAL THESIS & OBSERVATIONS
          ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Personal Interest & Conviction */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-cyan)] font-bold tracking-wider uppercase mb-2">
            <Compass size={13} />
            <span>PERSONAL INTEREST &amp; ECOSYSTEM ANGLE</span>
          </div>
          <p className="text-xs md:text-[13px] text-[var(--color-text-secondary)] font-sans leading-relaxed">
            {ecosystem.personalInterest}
          </p>
        </div>

        {/* Right: Experiments & Observations */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-amber)] font-bold tracking-wider uppercase mb-2">
            <Activity size={13} />
            <span>EXPERIMENTS &amp; ON-CHAIN OBSERVATIONS</span>
          </div>
          <p className="text-xs md:text-[13px] text-[var(--color-text-secondary)] font-sans leading-relaxed">
            {ecosystem.experimentsAndObservations}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          PROJECTS & TOOLS GRID
          ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[var(--color-border)] mb-6">
        {/* Relevant Projects */}
        <div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase mb-2.5">
            <Layers size={12} />
            <span>RELEVANT ECOSYSTEM PROJECTS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ecosystem.relevantProjects.map((proj, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-md text-[10.5px] font-mono border border-[var(--color-border)] bg-[var(--color-void)] text-[var(--color-text-primary)]"
              >
                {proj}
              </span>
            ))}
          </div>
        </div>

        {/* Tools and Technologies */}
        <div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase mb-2.5">
            <Terminal size={12} />
            <span>TOOLS &amp; TECHNOLOGIES</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ecosystem.toolsAndTech.map((tool, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-md text-[10.5px] font-mono border border-[var(--color-border)] bg-[var(--color-void)] text-[var(--color-cyan)]"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          FOOTER: OFFICIAL LINKS & PERSONAL NOTES
          ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
        {/* Personal Notes Quote */}
        {ecosystem.personalNotes && (
          <div className="text-xs italic text-[var(--color-text-secondary)] font-sans flex-1">
            &ldquo;{ecosystem.personalNotes}&rdquo;
          </div>
        )}

        {/* Action Links */}
        <div className="flex items-center gap-3 shrink-0">
          {ecosystem.docsUrl && (
            <a 
              href={ecosystem.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
            >
              <BookOpen size={12} />
              <span>DOCS</span>
            </a>
          )}

          <a 
            href={ecosystem.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-black flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>OFFICIAL SITE</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
