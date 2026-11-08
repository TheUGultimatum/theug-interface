"use client";

import React from "react";
import { CONVICTION_PILLARS } from "@/config/networkData";
import { 
  Shield, 
  Key, 
  Cpu, 
  Sparkles, 
  Terminal, 
  Compass,
  ArrowUpRight
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Key,
  Cpu,
  Sparkles,
  Terminal
};

export function ConvictionPillars() {
  return (
    <section className="py-12 border-t border-[var(--color-border)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[var(--color-cyan)] text-[10.5px] tracking-widest uppercase font-mono font-bold">
            <Compass size={14} />
            <span>03 / ON-CHAIN PHILOSOPHY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)] font-mono">
            WHAT I VALUE IN WEB3
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-2xl font-sans leading-relaxed">
            Personal engineering thesis on decentralized systems. This portfolio reflects curiosity, experimentation, and architectural conviction—not financial endorsements.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-online)]" />
          <span>PRINCIPLES OVER HYPE</span>
        </div>
      </div>

      {/* Conviction Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CONVICTION_PILLARS.map((pillar, idx) => {
          const IconComp = ICON_MAP[pillar.icon] || Shield;
          return (
            <div
              key={pillar.id}
              className="panel p-6 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-bright)] transition-all duration-300 relative group flex flex-col justify-between"
              style={{
                background: "var(--color-surface)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-void)] text-[var(--color-cyan)] group-hover:text-[var(--color-amber)] group-hover:border-[var(--color-amber)]/40 transition-colors">
                    <IconComp size={18} />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    // 0{idx + 1}
                  </span>
                </div>

                <h3 className="font-mono text-base font-bold text-[var(--color-text-primary)] tracking-wide mb-1">
                  {pillar.title}
                </h3>
                <span className="text-[10px] font-mono text-[var(--color-cyan)] font-semibold block mb-3">
                  {pillar.subtitle}
                </span>

                <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[9px] font-mono text-[var(--color-text-muted)]">
                <span>CONVICTION PILLAR</span>
                <span className="text-[var(--color-online)]">VERIFIED</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

