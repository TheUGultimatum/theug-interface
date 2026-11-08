"use client";

import React, { useState } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { SolarSystem } from "@/components/sections/SolarSystem";
import { EcosystemInfoPanel } from "@/components/sections/EcosystemInfoPanel";
import { ConvictionPillars } from "@/components/sections/ConvictionPillars";
import { EcosystemFootprint } from "@/components/sections/EcosystemFootprint";
import { OperatorNodes } from "@/components/sections/OperatorNodes";
import { Compass, Sparkles, Terminal } from "lucide-react";

export function OnchainObservatory() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemData>(ECOSYSTEMS_DATA[3]); // Base by default

  const handleSelect = (ecosystem: EcosystemData) => {
    setSelectedEcosystem(ecosystem);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 lg:px-12 py-8 max-w-[1500px] mx-auto w-full">
      {/* ─────────────────────────────────────────────────────
          1. SECTION HEADER // INTRO
          ───────────────────────────────────────────────────── */}
      <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-[10.5px] font-mono tracking-widest uppercase font-bold">
          <Terminal size={14} />
          <span>03 / ON-CHAIN OBSERVATORY · CELESTIAL REPOSITORY</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-wider font-mono text-[var(--color-text-primary)]">
          ON-CHAIN CONVICTION
        </h1>
        <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-sans max-w-3xl mt-2 leading-relaxed">
          An interactive Web3 universe representing my journey, technical curiosity, and long-term conviction.
          The central Sun is <span className="text-[var(--color-online)] font-mono font-bold">theUG_</span>, anchoring 11 distinct orbiting networks, settlement layers, and execution ecosystems.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          2. THE 120 FPS INTERACTIVE SOLAR SYSTEM
          ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <SolarSystem 
          selectedId={selectedEcosystem.id} 
          onSelect={handleSelect} 
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          3. ACTIVE ECOSYSTEM INFORMATION PANEL
          ───────────────────────────────────────────────────── */}
      <div className="mb-12">
        <EcosystemInfoPanel ecosystem={selectedEcosystem} />
      </div>

      {/* ─────────────────────────────────────────────────────
          4. MY ON-CHAIN CONVICTION (PERSONAL VALUES)
          ───────────────────────────────────────────────────── */}
      <div className="mb-12">
        <ConvictionPillars />
      </div>

      {/* ─────────────────────────────────────────────────────
          5. PROTOCOL & ECOSYSTEM FOOTPRINT (11 WORLDS)
          ───────────────────────────────────────────────────── */}
      <div className="mb-12">
        <EcosystemFootprint 
          selectedId={selectedEcosystem.id} 
          onSelect={handleSelect} 
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          6. ACTIVE OPERATOR NODE INFRASTRUCTURE CLUSTER
          ───────────────────────────────────────────────────── */}
      <div className="mb-16">
        <OperatorNodes />
      </div>
    </div>
  );
}

export default OnchainObservatory;

