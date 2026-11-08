"use client";

import React, { useState } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { SolarSystem } from "@/components/sections/SolarSystem";
import { Terminal, ArrowUpRight, Compass } from "lucide-react";

export function OnchainObservatory() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemData>(ECOSYSTEMS_DATA[3]); // Base by default

  const handleSelect = (ecosystem: EcosystemData) => {
    setSelectedEcosystem(ecosystem);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 lg:px-12 py-8 max-w-[1400px] mx-auto w-full">
      {/* ─────────────────────────────────────────────────────
          1. COMPACT SECTION HEADER // ONE SENTENCE INTRO
          ───────────────────────────────────────────────────── */}
      <div className="pb-5 mb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-[10px] font-mono tracking-widest uppercase font-bold">
          <Terminal size={13} />
          <span>03 / ON-CHAIN CONVICTION · CELESTIAL UNIVERSE</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-wider font-mono text-[var(--color-text-primary)]">
          ON-CHAIN CONVICTION
        </h1>
        <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-sans max-w-2xl mt-1.5 leading-relaxed">
          My personal Web3 journey and long-term ecosystem convictions — anchored by my identity at the center, with my favorite networks and settlement layers orbiting around it.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          2. THE 120 FPS INTERACTIVE SOLAR SYSTEM (THE MAIN EXPERIENCE)
          ───────────────────────────────────────────────────── */}
      <div className="mb-4">
        <SolarSystem 
          selectedId={selectedEcosystem.id} 
          onSelect={handleSelect} 
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          3. COMPACT CONTEXTUAL INFORMATION AREA (SELECTED WORLD)
          ───────────────────────────────────────────────────── */}
      <div 
        className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
        style={{
          borderLeft: `4px solid ${selectedEcosystem.color}`,
          boxShadow: `0 4px 20px ${selectedEcosystem.color}0a`
        }}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div 
            className="w-10 h-10 rounded-xl p-2 flex items-center justify-center shrink-0 border"
            style={{ 
              borderColor: `${selectedEcosystem.color}40`, 
              background: `${selectedEcosystem.color}15` 
            }}
          >
            <img 
              src={`/logos/${selectedEcosystem.id}.svg`} 
              alt={selectedEcosystem.name} 
              className="w-full h-full object-contain" 
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-mono font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                {selectedEcosystem.name} {selectedEcosystem.ticker ? `// ${selectedEcosystem.ticker}` : ""}
              </h3>
              <span 
                className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider"
                style={{ 
                  color: selectedEcosystem.color, 
                  background: `${selectedEcosystem.color}18`, 
                  border: `1px solid ${selectedEcosystem.color}40` 
                }}
              >
                {selectedEcosystem.classification}
              </span>
              {selectedEcosystem.status && (
                <span className="text-[8.5px] font-mono text-[var(--color-text-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
                  {selectedEcosystem.status}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-1 leading-relaxed max-w-2xl">
              {selectedEcosystem.personalInterest}
            </p>
          </div>
        </div>

        {selectedEcosystem.officialWebsite && (
          <div className="shrink-0 flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
            <a
              href={selectedEcosystem.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-bright)] text-xs font-mono text-[var(--color-cyan)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
            >
              <span>Official Protocol</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnchainObservatory;
