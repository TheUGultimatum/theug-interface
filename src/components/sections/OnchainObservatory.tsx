"use client";

import React, { useState, useEffect } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { SolarSystem } from "@/components/sections/SolarSystem";
import { ArrowUpRight, Activity, Terminal, Cpu } from "lucide-react";

function ScrambleTitle({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let iteration = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$&*";
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "(" || char === ")" || char === "—" || char === "/") return char;
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1;
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <>{display}</>;
}

const getCommitmentLabel = (status?: string) => {
  switch (status) {
    case "Building": return "PRODUCTION & CONTRACT DEPLOYMENTS";
    case "Contributing": return "OPEN-SOURCE TOOLING & PRs";
    case "Experimenting": return "TESTNET SPIKES & RUNTIME BENCHMARKS";
    case "Researching": return "ARCHITECTURE & CONSENSUS STUDY";
    default: return "ACTIVE ECOSYSTEM MONITORING";
  }
};

const getCommitmentLevel = (status?: string) => {
  switch (status) {
    case "Building": return { label: "CORE BUILDER", score: 96 };
    case "Contributing": return { label: "CONTRIBUTOR", score: 92 };
    case "Researching": return { label: "RESEARCHER", score: 90 };
    case "Experimenting": return { label: "PROTOTYPING", score: 85 };
    default: return { label: "OBSERVING", score: 78 };
  }
};

export function OnchainObservatory() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemData>(ECOSYSTEMS_DATA[0]); // Bitcoin by default
  const [hudTab, setHudTab] = useState<"THESIS" | "TECH" | "FIELD_LOGS">("THESIS");

  const handleSelect = (ecosystem: EcosystemData) => {
    setSelectedEcosystem(ecosystem);
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-100px)] px-3 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 max-w-[1600px] mx-auto w-full">
      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET HEADER (Displayed on < lg screens)
          ───────────────────────────────────────────────────────── */}
      <header className="lg:hidden mb-4">
        <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-xs font-mono tracking-widest uppercase font-bold">
          <span>&gt;</span>
          <span>05 / ON-CHAIN CONVICTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-[var(--color-text-primary)] leading-tight">
          <span>ON-CHAIN</span>
          <br />
          <span className="text-[var(--color-amber)] drop-shadow-[0_0_20px_rgba(255,123,0,0.35)]">
            CONVICTION
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans max-w-xl mt-2 leading-relaxed">
          The ecosystems, chains and networks I explore, build on and believe in.
          <span className="animate-pulse text-[var(--color-cyan)] font-mono font-bold">_</span>
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 text-[var(--color-amber)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-pulse" />
            SMART CONTRACTS &amp; PROTOCOLS
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)]" />
            CONSENSUS &amp; NODE OPERATOR
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          COSMIC COCKPIT STAGE: Full Desktop & Responsive Canvas
          ───────────────────────────────────────────────────────── */}
      <section aria-label="Web3 Solar System Canvas" className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-void)] shadow-[0_0_50px_rgba(0,0,0,0.25)]">
        {/* DESKTOP TOP-LEFT HEADER OVERLAY */}
        <header className="hidden lg:block absolute top-6 left-6 xl:top-8 xl:left-8 z-30 pointer-events-none max-w-sm xl:max-w-md">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-xs font-mono tracking-widest uppercase font-bold">
            <span>&gt;</span>
            <span>05 / ON-CHAIN CONVICTION</span>
          </div>
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-black tracking-tight font-display text-[var(--color-text-primary)] leading-none">
            <span>ON-CHAIN</span>
            <br />
            <span className="text-[var(--color-amber)] drop-shadow-[0_0_24px_rgba(255,123,0,0.4)]">
              CONVICTION
            </span>
          </h2>
          <p className="text-xs xl:text-sm text-[var(--color-text-secondary)] font-sans mt-2.5 leading-relaxed">
            The ecosystems, chains and networks
            <br />
            I explore, build on and believe in.
            <span className="animate-pulse text-[var(--color-cyan)] font-mono font-bold">_</span>
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 text-[var(--color-amber)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-pulse" />
              SMART CONTRACTS &amp; PROTOCOLS
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)]" />
              CONSENSUS &amp; NODE OPERATOR
            </span>
          </div>
        </header>

        {/* DESKTOP RIGHT-SIDE HOLOGRAPHIC HUD CARD OVERLAY */}
        <div className="hidden lg:block absolute top-6 right-6 xl:top-8 xl:right-8 z-30 pointer-events-auto w-80 xl:w-88 2xl:w-92">
          <div className="relative p-4 xl:p-5 2xl:p-6 rounded-2xl bg-[var(--color-surface)]/95 border border-[var(--color-border)] hover:border-[var(--color-border-bright)] backdrop-blur-xl shadow-2xl transition-all overflow-hidden">
            {/* Animated Laser Sweep Beam in Token Color */}
            <div 
              key={`sweep-${selectedEcosystem.id}`}
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${selectedEcosystem.color} 50%, transparent 100%)`,
                backgroundSize: "200% 100%",
                animation: "laser-sweep 2.8s ease-in-out infinite",
              }}
            />

            {/* Ambient Radial Color Bloom Behind Card */}
            <div
              key={`bloom-${selectedEcosystem.id}`}
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none blur-3xl opacity-20 transition-opacity"
              style={{ background: selectedEcosystem.color }}
            />

            {/* Cyber Corner Notches */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-cyan)]" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: selectedEcosystem.color }} />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: selectedEcosystem.color }} />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-cyan)]" />

            {/* Header Telemetry Broadcast */}
            <div className="flex items-center justify-between gap-2 mb-3.5 text-[10px] font-mono text-[var(--color-cyan)] tracking-widest uppercase font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                <span>SYSTEM_ARCH // OBSERVATORY</span>
              </div>
              <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-[var(--color-void)] border border-[var(--color-border)] text-[var(--color-online)]">
                ● 120 FPS LOCK
              </span>
            </div>

            {/* Emblem + Animated Title */}
            <div className="flex items-center gap-3.5 mb-3.5">
              {/* Rotating Kinetic Emblem Reticle */}
              <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border border-dashed pointer-events-none animate-spin"
                  style={{
                    borderColor: `${selectedEcosystem.color}70`,
                    animationDuration: "14s",
                  }}
                />
                <div
                  className="w-11 h-11 rounded-full p-2 flex items-center justify-center border shadow-lg relative overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: `${selectedEcosystem.color}90`,
                    background: `radial-gradient(circle at 35% 35%, ${selectedEcosystem.color}45 0%, var(--color-surface) 85%)`,
                    boxShadow: `0 0 16px ${selectedEcosystem.color}35`,
                  }}
                >
                  <img
                    src={`/logos/${selectedEcosystem.id}.svg`}
                    alt={selectedEcosystem.name}
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-mono font-bold text-base xl:text-lg text-[var(--color-text-primary)] truncate tracking-wide flex items-center gap-1.5">
                  <ScrambleTitle key={selectedEcosystem.id} text={`${selectedEcosystem.name} ${selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}`} />
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
                    {selectedEcosystem.classification}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono font-bold" style={{ color: selectedEcosystem.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: selectedEcosystem.color }} />
                    <span>{selectedEcosystem.status?.toUpperCase() || "EXPLORING"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Commitment & Velocity Gauges */}
            <div className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-void)]/60 mb-3.5 font-mono text-[9px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--color-text-secondary)] font-semibold flex items-center gap-1">
                  <Activity size={10} className="text-[var(--color-online)]" />
                  <span>COMMITMENT TIER</span>
                </span>
                <span className="font-bold tracking-wider" style={{ color: selectedEcosystem.color }}>
                  {getCommitmentLevel(selectedEcosystem.status).label}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] p-[0.5px] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${getCommitmentLevel(selectedEcosystem.status).score}%`,
                    backgroundColor: selectedEcosystem.color,
                    boxShadow: `0 0 8px ${selectedEcosystem.color}88`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[8px] text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]/50">
                <span className="truncate max-w-[170px] font-mono">{getCommitmentLabel(selectedEcosystem.status)}</span>
                <span className="text-[var(--color-cyan)] font-bold">ORBIT: {Math.round(selectedEcosystem.radius)} AU</span>
              </div>
            </div>

            {/* Interactive HUD Tabs with ARIA roles */}
            <div 
              role="tablist"
              aria-label="Ecosystem information tabs"
              className="flex items-center gap-1 mb-3 p-1 rounded-lg bg-[var(--color-void)] border border-[var(--color-border)] font-mono text-[9px]"
            >
              {(["THESIS", "TECH", "FIELD_LOGS"] as const).map(tab => (
                <button
                  key={tab}
                  role="tab"
                  id={`tab-${tab}`}
                  aria-selected={hudTab === tab}
                  aria-controls={`panel-${tab}`}
                  onClick={() => setHudTab(tab)}
                  className={`flex-1 py-1.5 rounded text-center transition-all cursor-pointer font-bold min-h-[30px] flex items-center justify-center focus-visible:ring-1 focus-visible:ring-[var(--color-cyan)] focus-visible:outline-none ${
                    hudTab === tab
                      ? "bg-[var(--color-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tab === "THESIS" ? "THESIS" : tab === "TECH" ? "TECH STACK" : "FIELD LOGS"}
                </button>
              ))}
            </div>

            {/* Tab Contents with Transition & Tabpanel Roles */}
            <div className="min-h-[95px]">
              {hudTab === "THESIS" && (
                <div 
                  role="tabpanel"
                  id="panel-THESIS"
                  aria-labelledby="tab-THESIS"
                  className="animate-fade-in"
                >
                  <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed mb-3">
                    {selectedEcosystem.personalInterest}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedEcosystem.relevantProjects || []).slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="text-[9.5px] font-mono px-2 py-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-bright)] transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hudTab === "TECH" && (
                <div 
                  role="tabpanel"
                  id="panel-TECH"
                  aria-labelledby="tab-TECH"
                  className="animate-fade-in"
                >
                  <div className="text-[9px] font-mono text-[var(--color-text-secondary)] font-bold uppercase mb-2">
                    Verified Tooling &amp; Architecture:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedEcosystem.toolsAndTech || []).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-void)] text-[var(--color-cyan)] font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Cpu size={10} className="text-[var(--color-amber)]" />
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hudTab === "FIELD_LOGS" && (
                <div 
                  role="tabpanel"
                  id="panel-FIELD_LOGS"
                  aria-labelledby="tab-FIELD_LOGS"
                  className="animate-fade-in p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-void)] font-mono text-[9.5px] text-[var(--color-text-secondary)] leading-relaxed"
                >
                  <span className="text-[var(--color-cyan)] flex items-center gap-1 mb-1 font-bold">
                    <Terminal size={10} />
                    <span>$ cat experiments.log</span>
                  </span>
                  <p className="text-[var(--color-text-primary)] font-sans text-xs">
                    {selectedEcosystem.experimentsAndObservations || selectedEcosystem.personalNotes || "Observing network mechanics and developer activity."}
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic CTA Button */}
            {selectedEcosystem.officialWebsite && (
              <a
                href={selectedEcosystem.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3.5 py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all group"
                style={{
                  borderColor: `${selectedEcosystem.color}70`,
                  backgroundColor: `${selectedEcosystem.color}15`,
                  color: selectedEcosystem.color,
                  boxShadow: `0 0 16px ${selectedEcosystem.color}20`,
                }}
              >
                <span>Explore {selectedEcosystem.name} Portal</span>
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

        {/* BOTTOM TELEMETRY BAR */}
        <div className="px-6 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-semibold tracking-widest uppercase">
            <span className="text-[var(--color-cyan)]">{"//"}</span>
            <span>WEB3 UNIVERSE</span>
          </div>

          <div className="text-[var(--color-cyan)] font-mono tracking-wider font-bold">
            [ theUG_ / on-chain ]
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET CONTEXTUAL CARD (Displayed on < lg screens)
          ───────────────────────────────────────────────────────── */}
      <div className="lg:hidden mt-4">
        <div className="relative p-5 rounded-2xl bg-[var(--color-surface)]/95 border border-[var(--color-border)] shadow-xl overflow-hidden">
          {/* Animated Laser Sweep Beam in Token Color */}
          <div 
            key={`mob-sweep-${selectedEcosystem.id}`}
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${selectedEcosystem.color} 50%, transparent 100%)`,
              backgroundSize: "200% 100%",
              animation: "laser-sweep 2.8s ease-in-out infinite",
            }}
          />

          {/* Cyber Corner Notches */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-cyan)]" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: selectedEcosystem.color }} />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: selectedEcosystem.color }} />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-cyan)]" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-[var(--color-cyan)] tracking-widest uppercase font-bold">
            <span>&gt; SELECTED ECOSYSTEM</span>
            <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: selectedEcosystem.color }}>
              ● {getCommitmentLevel(selectedEcosystem.status).label}
            </span>
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
              <h3 className="font-mono font-bold text-base text-[var(--color-text-primary)] truncate">
                <ScrambleTitle key={`mob-${selectedEcosystem.id}`} text={`${selectedEcosystem.name} ${selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}`} />
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
                  {selectedEcosystem.classification}
                </span>
                <span className="text-[9px] font-mono font-bold" style={{ color: selectedEcosystem.color }}>
                  ● {selectedEcosystem.status?.toUpperCase() || "EXPLORING"}
                </span>
              </div>
            </div>
          </div>

          {/* Animated Commitment Bar on Mobile */}
          <div className="w-full h-1.5 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${getCommitmentLevel(selectedEcosystem.status).score}%`,
                backgroundColor: selectedEcosystem.color,
                boxShadow: `0 0 8px ${selectedEcosystem.color}88`,
              }}
            />
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed mb-3">
            {selectedEcosystem.personalInterest}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(selectedEcosystem.relevantProjects || []).slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[9.5px] font-mono px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)]"
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
              className="w-full py-2 px-3 rounded-lg border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                borderColor: `${selectedEcosystem.color}70`,
                backgroundColor: `${selectedEcosystem.color}15`,
                color: selectedEcosystem.color,
              }}
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
