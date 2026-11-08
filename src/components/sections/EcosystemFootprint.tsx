"use client";

import React from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { ExternalLink, Globe, Compass, ArrowUpRight } from "lucide-react";

interface EcosystemFootprintProps {
  selectedId: string;
  onSelect: (ecosystem: EcosystemData) => void;
}

export function EcosystemFootprint({ selectedId, onSelect }: EcosystemFootprintProps) {
  return (
    <section className="py-12 border-t border-[var(--color-border)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[var(--color-cyan)] text-[10.5px] tracking-widest uppercase font-mono font-bold">
            <Compass size={14} />
            <span>04 / ECOSYSTEM FOOTPRINT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)] font-mono">
            THE 11 ORBITING WORLDS
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-2xl font-sans leading-relaxed">
            Quick directory of my followed networks, platforms, and settlement layers. Click any world to focus the celestial solar system and inspect detailed technical telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
          <span>11 WORLDS SYNCHRONIZED</span>
        </div>
      </div>

      {/* 11 Worlds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ECOSYSTEMS_DATA.map((eco) => {
          const isSelected = selectedId === eco.id;
          return (
            <div
              key={eco.id}
              onClick={() => onSelect(eco)}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? "border-[var(--color-border-bright)] shadow-lg -translate-y-0.5"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-bright)]"
              }`}
              style={{
                background: "var(--color-surface)",
                borderTop: `3px solid ${eco.color}`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 border shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        background: `${eco.color}15`,
                        borderColor: `${eco.color}35`,
                      }}
                    >
                      <img 
                        src={`/logos/${eco.id}.svg`} 
                        alt={eco.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-xs sm:text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-cyan)] transition-colors">
                        {eco.name}
                      </h4>
                      {eco.ticker && (
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                          [{eco.ticker}]
                        </span>
                      )}
                    </div>
                  </div>

                  {eco.status && (
                    <span 
                      className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        color: eco.color,
                        background: `${eco.color}15`,
                        border: `1px solid ${eco.color}30`,
                      }}
                    >
                      {eco.status}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--color-text-secondary)] font-sans line-clamp-2 leading-relaxed mb-3">
                  {eco.personalNotes || eco.personalInterest}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[9px] font-mono text-[var(--color-text-muted)]">
                <span className="uppercase">{eco.classification}</span>
                <span className="flex items-center gap-1 text-[var(--color-cyan)] group-hover:underline">
                  <span>INSPECT</span>
                  <ArrowUpRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
