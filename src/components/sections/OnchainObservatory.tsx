"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { SolarSystem } from "@/components/sections/SolarSystem";
import { ArrowUpRight, Radio, Sparkles, Layers, ShieldCheck, Terminal, Cpu, Flame, ExternalLink, Code, Sliders, Check, Copy } from "lucide-react";

interface AlphaTarget {
  id: string;
  name: string;
  category: "INCENTIVIZED" | "PARALLEL" | "VALIDATOR";
  categoryLabel: string;
  badge: string;
  tps: string;
  architecture: string;
  consensus: string;
  playbook: string;
  strategy: string;
  rpcOrUrl: string;
  officialLink: string;
}

const ALPHA_TARGETS: AlphaTarget[] = [
  {
    id: "monad",
    name: "Monad",
    category: "PARALLEL",
    categoryLabel: "PARALLEL EVM",
    badge: "DEVNET / TESTNET ROLLING",
    tps: "10,000 TPS",
    architecture: "Asynchronous Execution · MonadDb · Pipelined Consensus",
    consensus: "MonadBFT (Single-Slot Finality)",
    playbook: "Devnet contract deployments, RPC throughput stressing, synthetic AMM state transitions.",
    strategy: "High-density contract diversity & non-linear transaction clustering to establish organic builder provenance.",
    rpcOrUrl: "https://rpc.monad.xyz (devnet)",
    officialLink: "https://monad.xyz"
  },
  {
    id: "berachain",
    name: "Berachain",
    category: "VALIDATOR",
    categoryLabel: "PROOF-OF-LIQUIDITY",
    badge: "bArtio V2 TESTNET",
    tps: "BeaconKit EVM",
    architecture: "Tri-Token Model (BERA / BGT / HONEY) · Polaris Framework",
    consensus: "Proof-of-Liquidity (PoL)",
    playbook: "Operating validator testnet telemetry node, routing liquidity through BEX and Bend pools, testing BGT governance delegations.",
    strategy: "Active validator uptime + multi-protocol liquidity provision ensuring maximal PoL allocation weight.",
    rpcOrUrl: "https://bartio.rpc.berachain.com",
    officialLink: "https://berachain.com"
  },
  {
    id: "babylon",
    name: "Babylon Protocol",
    category: "VALIDATOR",
    categoryLabel: "BITCOIN STAKING",
    badge: "CAP 3 TESTNET",
    tps: "Trustless BTC Timestamping",
    architecture: "Extractable One-Time Signatures (EOTS) · Native Bitcoin Scripting",
    consensus: "PoS Cross-Staking Finality Provider",
    playbook: "Self-custodial Bitcoin staking delegation, testing Finality Provider signing infrastructure on Signet.",
    strategy: "Pioneering native Bitcoin security sharing without wrapping or bridge trust assumptions.",
    rpcOrUrl: "https://babylonchain.io/testnet",
    officialLink: "https://babylonchain.io"
  },
  {
    id: "story",
    name: "Story Protocol",
    category: "INCENTIVIZED",
    categoryLabel: "IP GRAPH LAYER",
    badge: "ILIAD / ODYSSEY TESTNET",
    tps: "CometBFT + EVM",
    architecture: "Programmable IP Graph · PIL (Programmable IP License) modules",
    consensus: "EVM-compatible Sovereign IP Ledger",
    playbook: "Registering on-chain IP assets, minting derivative licensing tokens, testing royalty distribution modules.",
    strategy: "AI attribution & creative asset provenance verification for next-generation automated agents.",
    rpcOrUrl: "https://odyssey.storyrpc.io",
    officialLink: "https://story.foundation"
  },
  {
    id: "megaeth",
    name: "MegaETH",
    category: "PARALLEL",
    categoryLabel: "REAL-TIME L2",
    badge: "DEVELOPER ACCESS ALPHA",
    tps: "100,000 TPS",
    architecture: "In-Memory Compute Engine · Sub-millisecond Execution Latency",
    consensus: "Ethereum L2 Rollup · EigenDA Settlement",
    playbook: "Benchmarking microsecond state reads, testing high-frequency autonomous agent loops.",
    strategy: "Positioning for high-throughput AI agent state streaming and zero-latency Web3 gaming rails.",
    rpcOrUrl: "https://megaeth.systems",
    officialLink: "https://megaeth.systems"
  },
  {
    id: "movement",
    name: "Movement",
    category: "INCENTIVIZED",
    categoryLabel: "MOVE ON ETHEREUM",
    badge: "BATTLE ROYALE TESTNET",
    tps: "MoveVM Throughput",
    architecture: "Move Execution Environment on EVM · Celestia Sovereign DA",
    consensus: "Snowman Consensus + Move Prover",
    playbook: "Deploying Move smart contracts, testing cross-VM bridges, participating in incentivized testnet campaigns.",
    strategy: "Leveraging formal verification and memory-safe bytecode execution to eliminate common smart contract exploit vectors.",
    rpcOrUrl: "https://mevm.devnet.imola.movementlabs.xyz",
    officialLink: "https://movementlabs.xyz"
  }
];

interface NftTheme {
  id: string;
  name: string;
  chain: string;
  type: string;
  badge: string;
  description: string;
  onchainStorage: string;
  curatorNotes: string;
}

const NFT_THEMES: NftTheme[] = [
  {
    id: "generative-svg",
    name: "Harmonic Lattice #08",
    chain: "Ethereum / Base",
    type: "100% ON-CHAIN SVG",
    badge: "ZERO IPFS DEPENDENCY",
    description: "Pure deterministic algorithmic curves generated at block execution time directly from the contract bytecode. No external servers, no IPFS pinning, permanent on-chain art.",
    onchainStorage: "EVM SSTORE / Contract View Function",
    curatorNotes: "The pinnacle of digital sovereignty: the blockchain itself computes and serves the vector SVG markup directly."
  },
  {
    id: "ordinals",
    name: "Bitcoin Inscriptions",
    chain: "Bitcoin (Taproot)",
    type: "ORDINALS ARTIFACT",
    badge: "IMMUTABLE WITNESS DATA",
    description: "Raw binary inscriptions stored directly within Bitcoin Taproot script witness data. Immutable, eternal, and immune to smart contract upgrades or censorship.",
    onchainStorage: "Raw Satoshis Witness Envelopes",
    curatorNotes: "Digital antiquities etched forever into Bitcoin's proof-of-work distributed ledger."
  },
  {
    id: "generative-code",
    name: "Orbital Vortex Matrix",
    chain: "EVM / Solana",
    type: "CREATIVE COMPUTING",
    badge: "PARAMETRIC GEOMETRY",
    description: "Multi-layered Lissajous oscillations and geometric vortex lattices inspired by cybernetic interfaces and celestial orbital mechanics.",
    onchainStorage: "Deterministic Random Seed Hash",
    curatorNotes: "Art as living mathematics — each hash generates a unique harmonic trajectory across the state coordinate plane."
  }
];

export function OnchainObservatory() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemData>(ECOSYSTEMS_DATA[0]); // Bitcoin by default

  // Alpha Dossier State
  const [alphaFilter, setAlphaFilter] = useState<"ALL" | "INCENTIVIZED" | "PARALLEL" | "VALIDATOR">("ALL");
  const [selectedAlphaId, setSelectedAlphaId] = useState<string>("monad");
  const [copiedRpc, setCopiedRpc] = useState<boolean>(false);

  // NFT Vault State
  const [selectedNftId, setSelectedNftId] = useState<string>("generative-svg");
  const [showNftCode, setShowNftCode] = useState<boolean>(false);
  const [generativeDensity, setGenerativeDensity] = useState<number>(24);
  const [generativePreset, setGenerativePreset] = useState<"HARMONIC" | "CYBER" | "VORTEX">("HARMONIC");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const nftCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSelect = (ecosystem: EcosystemData) => {
    setSelectedEcosystem(ecosystem);
  };

  const filteredAlphaTargets = useMemo(() => {
    if (alphaFilter === "ALL") return ALPHA_TARGETS;
    return ALPHA_TARGETS.filter(t => t.category === alphaFilter);
  }, [alphaFilter]);

  const activeAlpha = useMemo(() => {
    return ALPHA_TARGETS.find(t => t.id === selectedAlphaId) || ALPHA_TARGETS[0];
  }, [selectedAlphaId]);

  const activeNft = useMemo(() => {
    return NFT_THEMES.find(t => t.id === selectedNftId) || NFT_THEMES[0];
  }, [selectedNftId]);

  const handleCopyRpc = useCallback(() => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeAlpha.rpcOrUrl);
      setCopiedRpc(true);
      setTimeout(() => setCopiedRpc(false), 2000);
    }
  }, [activeAlpha.rpcOrUrl]);

  const handleCopyCode = useCallback(() => {
    const codeSnippet = `// SPDX-License-Identifier: MIT
// On-Chain SVG Generator - ${activeNft.name}
function renderArtifact(uint256 seed, uint8 density) public pure returns (string memory) {
    bytes memory paths;
    for (uint8 i = 0; i < density; i++) {
        uint256 angle = (i * 360) / density;
        paths = abi.encodePacked(paths, '<path d="M... Q..." stroke="currentColor" fill="none" />');
    }
    return string(abi.encodePacked(
        '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">',
        paths, '</svg>'
    ));
}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }, [activeNft.name]);

  // Render Live Generative Canvas
  useEffect(() => {
    const canvas = nftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const isDay = document.documentElement.classList.contains("day-mode");
    const cx = w / 2;
    const cy = h / 2;
    const count = generativeDensity;

    // Draw background fine grid
    ctx.strokeStyle = isDay ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Parametric curves
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const progress = i / count;
      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      let strokeCol = isDay ? "#0284C7" : "#00D9FF";
      if (generativePreset === "HARMONIC") {
        ctx.rotate(theta);
        const rx = 120 * Math.sin(theta * 2);
        const ry = 60 * Math.cos(theta * 3);
        ctx.ellipse(0, 0, Math.abs(rx) + 20, Math.abs(ry) + 15, theta, 0, Math.PI * 2);
        strokeCol = i % 2 === 0 
          ? (isDay ? "rgba(2, 132, 199, 0.55)" : "rgba(0, 217, 255, 0.65)")
          : (isDay ? "rgba(216, 67, 21, 0.55)" : "rgba(255, 94, 58, 0.65)");
      } else if (generativePreset === "CYBER") {
        ctx.rotate(theta + progress * Math.PI);
        const size = 30 + (i % 6) * 18;
        ctx.rect(-size / 2, -size / 2, size, size);
        strokeCol = isDay ? `rgba(2, 132, 199, ${0.2 + progress * 0.6})` : `rgba(0, 217, 255, ${0.25 + progress * 0.7})`;
      } else {
        // VORTEX
        const spiralR = 15 + progress * 85;
        const waveX = Math.cos(theta * 4) * spiralR;
        const waveY = Math.sin(theta * 4) * spiralR * 0.6;
        ctx.arc(waveX, waveY, 8 + (i % 5) * 4, 0, Math.PI * 2);
        strokeCol = i % 3 === 0 
          ? (isDay ? "#D84315" : "#FF5E3A") 
          : (isDay ? "#0284C7" : "#00D9FF");
      }

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }, [generativeDensity, generativePreset]);

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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-[var(--color-text-primary)] leading-tight">
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 text-[var(--color-amber)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-pulse" />
            ALPHA &amp; AIRDROP HUNTER
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)]" />
            NFT ENTHUSIAST
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          COSMIC COCKPIT STAGE: Full Desktop & Responsive Canvas
          ───────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-void)] shadow-[0_0_50px_rgba(0,0,0,0.25)]">
        {/* DESKTOP TOP-LEFT HEADER OVERLAY */}
        <div className="hidden lg:block absolute top-7 left-8 z-30 pointer-events-none max-w-md">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)] text-xs font-mono tracking-widest uppercase font-bold">
            <span>&gt;</span>
            <span>05 / ON-CHAIN CONVICTION</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight font-mono text-[var(--color-text-primary)] leading-none">
            <span>ON-CHAIN</span>
            <br />
            <span className="text-[var(--color-amber)] drop-shadow-[0_0_24px_rgba(255,123,0,0.4)]">
              CONVICTION
            </span>
          </h1>
          <p className="text-xs xl:text-sm text-[var(--color-text-secondary)] font-sans mt-3 leading-relaxed">
            The ecosystems, chains and networks
            <br />
            I explore, build on and believe in.
            <span className="animate-pulse text-[var(--color-cyan)] font-mono font-bold">_</span>
          </p>
          <div className="flex items-center gap-2 mt-3.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 text-[var(--color-amber)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-pulse" />
              ALPHA &amp; AIRDROP HUNTER
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)]" />
              NFT ENTHUSIAST
            </span>
          </div>
        </div>

        {/* DESKTOP RIGHT-SIDE HOLOGRAPHIC HUD CARD OVERLAY */}
        <div className="hidden lg:block absolute top-7 right-8 z-30 pointer-events-auto w-80 xl:w-88">
          <div className="relative p-5 xl:p-6 rounded-2xl bg-[var(--color-surface)]/90 border border-[var(--color-border)] hover:border-[var(--color-border-bright)] backdrop-blur-xl shadow-2xl transition-all">
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
                <h3 className="font-mono font-bold text-base xl:text-lg text-[var(--color-text-primary)] truncate tracking-wide">
                  {selectedEcosystem.name} {selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
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
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)]"
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
        <div className="px-6 py-3.5 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-3 text-[var(--color-text-muted)] tracking-widest uppercase flex-wrap">
            <span className="text-[var(--color-cyan)]">//</span>
            <span>WEB3 UNIVERSE</span>
            <span className="text-[var(--color-border)]">·</span>
            <span className="text-[var(--color-amber)] text-[10px] font-bold">ALPHA_RADAR: ACTIVE</span>
            <span className="text-[var(--color-border)] hidden md:inline">·</span>
            <span className="text-[var(--color-cyan)] text-[10px] font-bold hidden md:inline">NFT_VAULT: CURATED</span>
          </div>

          <div className="text-[var(--color-cyan)] font-mono tracking-wider">
            [ theUG_ / on-chain hunter ]
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET CONTEXTUAL CARD (Displayed on < lg screens)
          ───────────────────────────────────────────────────────── */}
      <div className="lg:hidden mt-4">
        <div className="relative p-5 rounded-2xl bg-[var(--color-surface)]/95 border border-[var(--color-border)] shadow-xl">
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
              <h3 className="font-mono font-bold text-base text-[var(--color-text-primary)] truncate">
                {selectedEcosystem.name} {selectedEcosystem.ticker ? `(${selectedEcosystem.ticker})` : ""}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
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
              className="w-full py-2 px-3 rounded-lg border border-[var(--color-amber)]/60 bg-[var(--color-amber)]/10 text-[var(--color-amber)] font-mono text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Explore {selectedEcosystem.name}</span>
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          ON-CHAIN INTELLIGENCE: UNIFIED CYBERNETIC WARP DECK
          ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* ── 1. ALPHA & TESTNET RADAR DOSSIER ── */}
        <div className="panel hover-glow-edge p-5 md:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between">
          <div>
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-pulse" />
                <span className="font-mono text-xs font-bold text-[var(--color-amber)] tracking-wider flex items-center gap-1.5">
                  <Flame size={13} />
                  <span>ALPHA_RADAR // TESTNET EXPEDITIONS</span>
                </span>
              </div>
              <span className="self-start sm:self-auto font-mono text-[9px] px-2 py-0.5 rounded border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 text-[var(--color-amber)] font-bold">
                ACTIVE HUNTER ({filteredAlphaTargets.length} TARGETS)
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none font-mono text-[9.5px]">
              {(["ALL", "INCENTIVIZED", "PARALLEL", "VALIDATOR"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAlphaFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 font-bold ${
                    alphaFilter === tab
                      ? "bg-[var(--color-amber)] text-white shadow-sm"
                      : "bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tab === "ALL" ? "ALL (6)" : tab}
                </button>
              ))}
            </div>

            {/* Protocol Chips Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-4">
              {filteredAlphaTargets.map(target => {
                const isSelected = selectedAlphaId === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setSelectedAlphaId(target.id)}
                    className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
                      isSelected
                        ? "border border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber-bright)] shadow-sm"
                        : "border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {target.name}
                  </button>
                );
              })}
            </div>

            {/* Active Protocol Dossier Card */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)]/60 p-4 font-mono text-[11px] mb-3">
              <div className="flex items-start justify-between gap-2 mb-2.5 pb-2.5 border-b border-[var(--color-border)]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{activeAlpha.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--color-amber)]/10 border border-[var(--color-amber)]/30 text-[var(--color-amber)] font-bold">
                      {activeAlpha.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-cyan)] font-bold">{activeAlpha.categoryLabel} · {activeAlpha.tps}</span>
                </div>

                <a
                  href={activeAlpha.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-amber)] hover:border-[var(--color-amber)]/40 transition-colors shrink-0"
                  title={`Open official ${activeAlpha.name} portal`}
                >
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="flex flex-col gap-2.5 text-[10.5px]">
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[9px] uppercase tracking-wider">Architecture &amp; Consensus</span>
                  <p className="text-[var(--color-text-primary)] font-sans text-xs mt-0.5">{activeAlpha.architecture} ({activeAlpha.consensus})</p>
                </div>

                <div>
                  <span className="text-[var(--color-text-muted)] block text-[9px] uppercase tracking-wider">Tactical Playbook</span>
                  <p className="text-[var(--color-text-secondary)] font-sans text-xs mt-0.5">{activeAlpha.playbook}</p>
                </div>

                <div>
                  <span className="text-[var(--color-text-muted)] block text-[9px] uppercase tracking-wider">Sybil-Resistant Strategy</span>
                  <p className="text-[var(--color-online)] font-sans text-xs mt-0.5">{activeAlpha.strategy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RPC & Copy Toolbar */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] truncate min-w-0">
              <Terminal size={12} className="shrink-0 text-[var(--color-cyan)]" />
              <span className="truncate">{activeAlpha.rpcOrUrl}</span>
            </div>

            <button
              onClick={handleCopyRpc}
              className="px-2.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] hover:border-[var(--color-amber)]/40 font-mono text-[9px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              {copiedRpc ? <Check size={11} className="text-[var(--color-online)]" /> : <Copy size={11} />}
              <span>{copiedRpc ? "COPIED" : "COPY RPC"}</span>
            </button>
          </div>
        </div>

        {/* ── 2. NFT ARTIFACTS & GENERATIVE ON-CHAIN VAULT ── */}
        <div className="panel hover-glow-edge p-5 md:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between">
          <div>
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                <span className="font-mono text-xs font-bold text-[var(--color-cyan)] tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>NFT_VAULT // DIGITAL CULTURE &amp; PROVENANCE</span>
                </span>
              </div>
              <span className="self-start sm:self-auto font-mono text-[9px] px-2 py-0.5 rounded border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] font-bold">
                CURATOR &amp; COLLECTOR
              </span>
            </div>

            {/* Theme Selector Tabs & Code Switcher */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 font-mono text-[9.5px]">
                {NFT_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedNftId(theme.id)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
                      selectedNftId === theme.id
                        ? "bg-[var(--color-cyan)] text-black shadow-sm"
                        : "bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {theme.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNftCode(!showNftCode)}
                className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-elevated)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Code size={11} className={showNftCode ? "text-[var(--color-cyan)]" : ""} />
                <span>{showNftCode ? "SHOW CANVAS" : "VIEW CODE"}</span>
              </button>
            </div>

            {/* Live Generative Canvas or Code Display */}
            <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-void)] overflow-hidden mb-3">
              {!showNftCode ? (
                <div className="relative flex flex-col items-center justify-center p-2">
                  <canvas
                    ref={nftCanvasRef}
                    width={380}
                    height={160}
                    className="w-full max-h-[160px] object-contain"
                  />

                  {/* Interactive Controls Overlay */}
                  <div className="w-full px-3 py-2 border-t border-[var(--color-border)]/60 bg-[var(--color-surface)]/80 flex items-center justify-between gap-3 font-mono text-[9.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-text-muted)]">PRESET:</span>
                      {(["HARMONIC", "CYBER", "VORTEX"] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setGenerativePreset(p)}
                          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                            generativePreset === p
                              ? "bg-[var(--color-cyan)] text-black"
                              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Sliders size={10} className="text-[var(--color-cyan)]" />
                      <input
                        type="range"
                        min="12"
                        max="36"
                        step="2"
                        value={generativeDensity}
                        onChange={e => setGenerativeDensity(Number(e.target.value))}
                        className="w-16 h-1 accent-[var(--color-cyan)] cursor-pointer"
                        title={`Strand density: ${generativeDensity}`}
                      />
                      <span className="text-[var(--color-cyan)] font-bold">{generativeDensity}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 font-mono text-[10px] max-h-[195px] overflow-y-auto leading-relaxed text-[var(--color-text-secondary)] select-text">
                  <pre className="text-[var(--color-cyan)]"><code>{`// SPDX-License-Identifier: MIT
// 100% On-Chain SVG Artifact Renderer
function renderArtifact(uint256 seed, uint8 density) public pure returns (string memory) {
    bytes memory paths;
    for (uint8 i = 0; i < density; i++) {
        uint256 angle = (i * 360) / density;
        paths = abi.encodePacked(paths, 
            '<ellipse rx="120" ry="60" transform="rotate(', 
            Strings.toString(angle), ' 200 120)" stroke="url(#c)" fill="none" />'
        );
    }
    return string(abi.encodePacked(
        '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">',
        paths, '</svg>'
    ));
}`}</code></pre>
                </div>
              )}
            </div>

            {/* Active NFT Theme Metadata */}
            <div className="flex flex-col gap-1.5 font-mono text-[10.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-primary)] font-bold text-xs">{activeNft.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 text-[var(--color-cyan)] font-bold">
                  {activeNft.badge}
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)] font-sans text-xs leading-relaxed">
                {activeNft.description}
              </p>
            </div>
          </div>

          {/* Curation Ethos Footer */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] truncate min-w-0">
              <Layers size={12} className="shrink-0 text-[var(--color-amber)]" />
              <span className="text-[var(--color-text-primary)] font-bold">ETHOS:</span>
              <span className="text-[var(--color-online)] truncate">Art &gt; Speculation · 100% On-Chain Storage</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 font-mono text-[9px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              {copiedCode ? <Check size={11} className="text-[var(--color-online)]" /> : <Copy size={11} />}
              <span>{copiedCode ? "COPIED" : "COPY SNIPPET"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnchainObservatory;
