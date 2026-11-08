import type { Metadata } from "next";
import Link from "next/link";
import { NetworkMapClient } from "@/components/sections/NetworkMapClient";
import { TOKENS_DATA, OPERATOR_NODES, METEOR_TYPES } from "@/config/networkData";
import { 
  ShieldCheck, 
  Cpu, 
  Radio, 
  ExternalLink, 
  Activity, 
  Sparkles, 
  Layers, 
  Flame, 
  CheckCircle2, 
  Compass,
  Zap,
  Terminal,
  Network
} from "lucide-react";

export const metadata: Metadata = {
  title: "Onchain Convictions — theUG",
  description:
    "Interactive planetary observatory and architectural conviction deconstructions by Usmaan Gani (theUG). Visualizing L1/L2 settlement, execution engines, and active node infrastructure.",
};

export default function OnchainPage() {
  return (
    <div className="flex flex-col min-h-screen font-mono text-[var(--color-text-primary)]">
      {/* ─────────────────────────────────────────────────────
          1. INTERACTIVE COSMIC OBSERVATORY & PLANETARY MAP
          ───────────────────────────────────────────────────── */}
      <NetworkMapClient />

      {/* ─────────────────────────────────────────────────────
          2. EDITORIAL PROTOCOL THESES // ARCHITECTURAL MATRIX
          ───────────────────────────────────────────────────── */}
      <section className="px-4 md:px-12 py-16 max-w-[1400px] mx-auto w-full">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[var(--color-cyan)] text-[10px] tracking-widest uppercase">
              <Compass size={14} />
              <span>LAYER-BY-LAYER ARCHITECTURAL AUDIT</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)]">
              DECONSTRUCTED PROTOCOL CONVICTIONS
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-2xl font-sans leading-relaxed">
              Why these specific networks? An engineering perspective on consensus security, execution mechanics, and long-term ecosystem durability.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-online)]" />
              {TOKENS_DATA.length} ECOSYSTEMS ANALYZED
            </span>
          </div>
        </div>

        {/* Deconstructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOKENS_DATA.map((token) => (
            <div
              key={token.id}
              className="panel p-5 flex flex-col justify-between transition-all duration-300 hover:border-[var(--color-border-bright)] hover:-translate-y-1 relative group overflow-hidden"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderTop: `3px solid ${token.color}`,
              }}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 border border-white/10"
                      style={{ background: `${token.color}15` }}
                    >
                      <img
                        src={`/logos/${token.id}.svg`}
                        alt={token.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wider text-[var(--color-text-primary)]">
                        {token.label}
                      </h3>
                      <span className="text-[9px] text-[var(--color-text-muted)] tracking-wider">
                        {token.tier || "LAYER 1"}
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider"
                    style={{
                      color: token.color,
                      background: `${token.color}12`,
                      border: `1px solid ${token.color}33`,
                    }}
                  >
                    {token.id}
                  </span>
                </div>

                <div className="text-[10px] text-[var(--color-cyan)] font-bold tracking-wider mb-2">
                  {token.role}
                </div>

                <p className="text-[11.5px] text-[var(--color-text-secondary)] font-sans leading-relaxed mb-4">
                  {token.thesis}
                </p>
              </div>

              {/* Technical Spec Matrix */}
              <div className="pt-3 border-t border-[var(--color-border)] mt-auto">
                <div className="grid grid-cols-2 gap-2 text-[9px] mb-3">
                  <div>
                    <span className="text-[var(--color-text-muted)] block">THROUGHPUT</span>
                    <span className="text-[var(--color-text-primary)] font-bold">{token.tps || "High"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block">FINALITY</span>
                    <span className="text-[var(--color-online)] font-bold">{token.finality || "Fast"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--color-text-muted)] block">CONSENSUS MODEL</span>
                    <span className="text-[var(--color-text-secondary)] truncate block">{token.consensus || "PoS"}</span>
                  </div>
                </div>

                {/* Operator Quote */}
                <div
                  className="p-2.5 rounded text-[10px] font-sans italic"
                  style={{
                    background: `${token.color}08`,
                    borderLeft: `2px solid ${token.color}`,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {token.comment}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          3. ACTIVE OPERATOR NODE INFRASTRUCTURE TELEMETRY
          ───────────────────────────────────────────────────── */}
      <section className="px-4 md:px-12 py-16 max-w-[1400px] mx-auto w-full border-t border-[var(--color-border)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[var(--color-amber)] text-[10px] tracking-widest uppercase font-bold">
              <Cpu size={14} />
              <span>INFRASTRUCTURE PROOF OF WORK</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)]">
              ACTIVE OPERATOR NODE CLUSTER
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl font-sans leading-relaxed">
              Validator consensus engines, background daemons, and sequencers actively maintained and documented by theUG.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span className="text-[10px] text-[var(--color-online)] tracking-wider">
              ALL NODES SYNCED // ACTIVE HEALTH CHECK
            </span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OPERATOR_NODES.map((node, idx) => (
            <div
              key={idx}
              className="panel p-6 flex flex-col justify-between hover:border-[var(--color-amber)]/40 transition-all duration-300 relative group"
              style={{
                background: "linear-gradient(135deg, rgba(16,16,22,0.95) 0%, rgba(8,8,12,0.98) 100%)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[var(--color-amber)] tracking-wider font-bold">
                    [ NODE // #{idx + 1} ]
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-[rgba(0,217,255,0.08)] text-[var(--color-online)] border border-[rgba(0,217,255,0.25)] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
                    {node.status}
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-bold text-[var(--color-text-primary)] tracking-wide">
                  {node.name}
                </h3>
                <p className="text-[11px] text-[var(--color-cyan)] mt-0.5">
                  {node.category}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-3 leading-relaxed">
                  Role: <span className="text-[var(--color-text-primary)] font-semibold">{node.role}</span>
                </p>

                <div className="mt-4 p-3 rounded bg-[var(--color-void)] border border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-[var(--color-text-muted)]">STACK ENVIRONMENT:</span>
                    <span className="text-[var(--color-text-primary)]">{node.stack}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-text-muted)]">TELEMETRY:</span>
                    <span className="text-[var(--color-online)]">{node.telemetry}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-[9px] text-[var(--color-text-muted)]">
                  AUTOMATED RECOVERY ACTIVE
                </span>
                <a
                  href={node.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded text-xs border border-[var(--color-border)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
                >
                  <span>VIEW REPO & GUIDE</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          4. THE MEMETIC LIQUIDITY LAYER THESIS
          ───────────────────────────────────────────────────── */}
      <section className="px-4 md:px-12 py-16 max-w-[1400px] mx-auto w-full border-t border-[var(--color-border)]">
        <div className="p-8 md:p-10 rounded-2xl border border-[var(--color-border-bright)] bg-gradient-to-r from-[rgba(255,94,58,0.06)] via-[rgba(0,217,255,0.03)] to-transparent relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-amber)] text-[10px] tracking-widest uppercase font-bold">
            <Flame size={14} />
            <span>CULTURAL GRAVITY & STRESS TESTING</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-[var(--color-text-primary)]">
            THE MEMETIC METEOR LAYER: ATTENTION AS A PROTOCOL PRIMITIVE
          </h2>

          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-sans max-w-3xl mt-3 leading-relaxed">
            In our cosmic observatory, meme meteors (Doge, Pepe, Shiba, Pudgy) blaze across planetary orbits. This isn&apos;t novelty decoration—it reflects onchain market truth: Memecoins are the ultimate high-velocity liquidity testing grounds. They test network throughput under peak congestion, drive organic user onboarding, and form the most resilient decentralized communities in Web3.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {METEOR_TYPES.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center p-2 shrink-0 border"
                  style={{
                    background: `${m.color}15`,
                    borderColor: `${m.color}40`,
                  }}
                >
                  <img src={`/meme/${m.file}`} alt={m.id} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--color-text-primary)] uppercase">
                    {m.id}
                  </h4>
                  <span className="text-[9px] text-[var(--color-text-muted)] line-clamp-1">
                    {m.label.split("//")[1]?.trim() || "LIQUIDITY DRIVER"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
