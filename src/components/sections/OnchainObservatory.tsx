"use client";

import React, { useState } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { SolarSystem } from "@/components/sections/SolarSystem";
import { ArrowUpRight } from "lucide-react";

export function OnchainObservatory() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemData>(ECOSYSTEMS_DATA[0]); // Bitcoin by default, matching reference

  const handleSelect = (ecosystem: EcosystemData) => {
    setSelectedEcosystem(ecosystem);
  };

  return (
    <div className="relative flex flex-col min-h-screen px-4 md:px-8 lg:px-10 py-6 max-w-[1560px] mx-auto w-full select-none">
      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET HEADER (Displayed on < lg screens)
          ───────────────────────────────────────────────────────── */}
      <div className="lg:hidden mb-5">
        <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-xs font-mono tracking-widest uppercase font-bold">
          <span>&gt;</span>
          <span>05 / ON-CHAIN CONVICTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-white leading-tight">
          <span>ON-CHAIN</span>
          <br />
          <span className="text-[var(--color-amber)] drop-shadow-[0_0_20px_rgba(255,123,0,0.4)]">
            CONVICTION
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans max-w-xl mt-2 leading-relaxed">
          The ecosystems, chains and networks I explore, build on and believe in.
          <span className="animate-pulse text-[var(--color-cyan)] font-mono font-bold">_</span>
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────
          COSMIC COCKPIT STAGE: Full Desktop & Responsive Canvas
          ───────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-void)] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* DESKTOP TOP-LEFT HEADER OVERLAY */}
        <div className="hidden lg:block absolute top-7 left-8 z-30 pointer-events-none max-w-md">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-xs font-mono tracking-widest uppercase font-bold">
            <span>&gt;</span>
            <span>05 / ON-CHAIN CONVICTION</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight font-mono text-white leading-none">
            <span>ON-CHAIN</span>
            <br />
            <span className="text-[var(--color-amber)] drop-shadow-[0_0_24px_rgba(255,123,0,0.45)]">
              CONVICTION
            </span>
          </h1>
          <p className="text-xs xl:text-sm text-[var(--color-text-secondary)] font-sans mt-3 leading-relaxed">
            The ecosystems, chains and networks
            <br />
            I explore, build on and believe in.
            <span className="animate-pulse text-[var(--color-cyan)] font-mono font-bold">_</span>
          </p>
        </div>

        {/* DESKTOP RIGHT-SIDE HOLOGRAPHIC HUD CARD OVERLAY */}
        <div className="hidden lg:block absolute top-7 right-8 z-30 pointer-events-auto w-80 xl:w-88">
          <div className="relative p-5 xl:p-6 rounded-2xl bg-[#07090e]/90 border border-[var(--color-border)] hover:border-[var(--color-border-bright)] backdrop-blur-xl shadow-2xl transition-all">
            {/* Cyber Corner Notches */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-cyan)]" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-amber)]" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-amber)]" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-cyan)]" />

            {/* Header */}
            <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-[var(--color-cyan)] tracking-widest uppercase font-bold">
              <span>&gt;</span>
              <span>SELECTED ECOSYSTEM</span>
            </div>

            {/* Emblem + Title */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className="w-13 h-13 rounded-full p-2.5 flex items-center justify-center shrink-0 border shadow-lg relative overflow-hidden"
                style={{
                  borderColor: `${selectedEcosystem.color}80`,
                  background: `radial-gradient(circle at 35% 35%, ${selectedEcosystem.color}45 0%, #030508 85%)`,
                  boxShadow: `0 0 20px ${selectedEcosystem.color}35`,
                }}
              >
                <img
                  src={`/logos/${selectedEcosystem.id}.svg`}
                  alt={selectedEcosystem.name}
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-mono font-bold text-base xl:text-lg text-white truncate tracking-wide">
                  {selectedEcosystem.name} {selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider bg-white/5 border border-white/10 text-white/80">
                    {selectedEcosystem.classification}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--color-online)] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
                    <span>{selectedEcosystem.status?.toUpperCase() || "EXPLORING"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed mb-4">
              {selectedEcosystem.personalInterest}
            </p>

            {/* Interests Tag Pills */}
            <div className="mb-5">
              <div className="text-[10px] font-mono font-bold tracking-wider text-[var(--color-amber)] uppercase mb-2">
                MY INTERESTS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(selectedEcosystem.relevantProjects || []).slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            {selectedEcosystem.officialWebsite && (
              <a
                href={selectedEcosystem.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-amber)]/60 bg-[var(--color-amber)]/10 hover:bg-[var(--color-amber)]/20 text-[var(--color-amber)] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(255,123,0,0.15)] group"
              >
                <span>Explore {selectedEcosystem.name}</span>
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* 120 FPS INTERACTIVE SOLAR SYSTEM CANVAS */}
        <SolarSystem 
          selectedId={selectedEcosystem.id} 
          onSelect={handleSelect} 
        />

        {/* BOTTOM TELEMETRY BAR (Matching Reference Image) */}
        <div className="px-6 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-void)]/90 backdrop-blur-md flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] tracking-widest uppercase">
            <span className="text-[var(--color-cyan)]">//</span>
            <span>WEB3 UNIVERSE</span>
          </div>

          <div className="text-[var(--color-cyan)] font-mono tracking-wider">
            [ theUG_ / on-chain ]
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET CONTEXTUAL CARD (Displayed on < lg screens)
          ───────────────────────────────────────────────────────── */}
      <div className="lg:hidden mt-4">
        <div className="relative p-5 rounded-2xl bg-[#07090e]/95 border border-[var(--color-border)] shadow-xl">
          {/* Cyber Corner Notches */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-cyan)]" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-amber)]" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-amber)]" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-cyan)]" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-[var(--color-cyan)] tracking-widest uppercase font-bold">
            <span>&gt;</span>
            <span>SELECTED ECOSYSTEM</span>
          </div>

          {/* Emblem + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-full p-2 flex items-center justify-center shrink-0 border shadow-md relative overflow-hidden"
              style={{
                borderColor: `${selectedEcosystem.color}80`,
                background: `radial-gradient(circle at 35% 35%, ${selectedEcosystem.color}45 0%, #030508 85%)`,
              }}
            >
              <img
                src={`/logos/${selectedEcosystem.id}.svg`}
                alt={selectedEcosystem.name}
                className="w-full h-full object-contain relative z-10"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-mono font-bold text-base text-white truncate">
                {selectedEcosystem.name} {selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-white/5 border border-white/10 text-white/80">
                  {selectedEcosystem.classification}
                </span>
                <span className="text-[9px] font-mono text-[var(--color-online)] font-bold">
                  ● {selectedEcosystem.status?.toUpperCase() || "EXPLORING"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed mb-3">
            {selectedEcosystem.personalInterest}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(selectedEcosystem.relevantProjects || []).slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[9.5px] font-mono px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              >
                {item}
              </span>
            ))}
          </div>

          {selectedEcosystem.officialWebsite && (
            <a
              href={selectedEcosystem.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-lg border border-[var(--color-amber)]/60 bg-[var(--color-amber)]/10 text-[var(--color-amber)] font-mono text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Explore {selectedEcosystem.name}</span>
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnchainObservatory;
