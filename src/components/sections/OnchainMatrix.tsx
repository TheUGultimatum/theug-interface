"use client";

import React, { useState, useMemo } from "react";
import { TOKENS_DATA, TokenData } from "@/config/networkData";
import { 
  Compass, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Sparkles,
  Cpu
} from "lucide-react";

export function OnchainMatrix() {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"conviction" | "alpha">("conviction");

  const filteredTokens = useMemo(() => {
    return TOKENS_DATA.filter((token) => {
      const matchesFilter = filter === "ALL" || token.narrative === filter;
      const q = search.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        token.name.toLowerCase().includes(q) ||
        token.label.toLowerCase().includes(q) ||
        token.thesis.toLowerCase().includes(q) ||
        token.role.toLowerCase().includes(q) ||
        token.ecosystemHighlight.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "conviction") {
        return (b.convictionScore || 0) - (a.convictionScore || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [filter, search, sortBy]);

  return (
    <section className="px-4 md:px-12 py-16 max-w-[1400px] mx-auto w-full">
      {/* ─────────────────────────────────────────────────────
          HEADER & INTERACTIVE CONTROLS
          ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[var(--color-cyan)] text-[10px] tracking-widest uppercase font-bold">
            <Compass size={14} />
            <span>LAYER-BY-LAYER ARCHITECTURAL AUDIT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-[var(--color-text-primary)]">
            TRENDING ONCHAIN CONVICTIONS
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-2xl font-sans leading-relaxed">
            Deconstructive engineering audit of consensus security, pipelined execution engines, tokenized equities (Robinhood L2, Base, Arbitrum), and high-frequency orderbooks (Hyperliquid, Solana, Monad).
          </p>
        </div>

        {/* Live Counter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search chain or protocol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] w-full sm:w-56 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] p-1 rounded-lg font-mono text-[10px]">
            <span className="text-[var(--color-text-muted)] px-1.5 hidden sm:inline">SORT:</span>
            <button
              onClick={() => setSortBy("conviction")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                sortBy === "conviction"
                  ? "bg-[var(--color-cyan)] text-black font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              CONVICTION
            </button>
            <button
              onClick={() => setSortBy("alpha")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                sortBy === "alpha"
                  ? "bg-[var(--color-cyan)] text-black font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {[
          { id: "ALL", label: "ALL ECOSYSTEMS" },
          { id: "CONSUMER_L2", label: "CONSUMER L2 & RWAs" },
          { id: "HIGH_THROUGHPUT", label: "HIGH-THROUGHPUT & PERPS" },
          { id: "DEFI_CONSENSUS", label: "DEFI & LIQUIDITY" },
          { id: "SETTLEMENT", label: "BASE SETTLEMENT" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? "bg-[var(--color-amber)] text-black font-bold shadow-sm"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────
          DECONSTRUCTION MATRIX GRID
          ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTokens.map((token) => (
          <div
            key={token.id}
            className="panel p-5 flex flex-col justify-between transition-all duration-300 hover:border-[var(--color-border-bright)] hover:-translate-y-1 relative group overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderTop: `3px solid ${token.color}`,
            }}
          >
            {/* Top Identity Block */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center p-1.5 border shrink-0"
                    style={{ 
                      background: `${token.color}15`,
                      borderColor: `${token.color}35`
                    }}
                  >
                    <img
                      src={`/logos/${token.id}.svg`}
                      alt={token.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm tracking-wider text-[var(--color-text-primary)] truncate">
                      {token.name}
                    </h3>
                    <span className="text-[9px] text-[var(--color-text-muted)] tracking-wider block">
                      {token.tier || "LAYER 1"}
                    </span>
                  </div>
                </div>

                {/* Conviction Score Pill */}
                <div className="flex flex-col items-end">
                  <span
                    className="px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider shrink-0"
                    style={{
                      color: token.color,
                      background: `${token.color}15`,
                      border: `1px solid ${token.color}35`,
                    }}
                  >
                    {token.convictionScore}% CONVICTION
                  </span>
                </div>
              </div>

              {/* Conviction Progress Bar */}
              <div className="w-full h-1 bg-[var(--color-void)] rounded-full overflow-hidden mb-3 border border-[var(--color-border)]">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${token.convictionScore}%`,
                    background: token.color
                  }}
                />
              </div>

              {/* Role Title */}
              <div className="text-[10.5px] text-[var(--color-cyan)] font-bold tracking-wider mb-2">
                {token.role}
              </div>

              {/* Thesis Body */}
              <p className="text-[11.5px] text-[var(--color-text-secondary)] font-sans leading-relaxed mb-4">
                {token.thesis}
              </p>
            </div>

            {/* Technical Specs & Protocols */}
            <div className="pt-3 border-t border-[var(--color-border)] mt-auto">
              <div className="grid grid-cols-2 gap-2 text-[9px] mb-3">
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[8px]">THROUGHPUT</span>
                  <span className="text-[var(--color-text-primary)] font-bold text-[9.5px]">{token.tps || "High"}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[8px]">FINALITY</span>
                  <span className="text-[var(--color-online)] font-bold text-[9.5px]">{token.finality || "Fast"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--color-text-muted)] block text-[8px]">CONSENSUS MODEL</span>
                  <span className="text-[var(--color-text-secondary)] truncate block font-semibold">{token.consensus || "PoS"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--color-text-muted)] block text-[8px]">ECOSYSTEM HIGHLIGHTS</span>
                  <span className="text-[var(--color-amber)] truncate block font-semibold">{token.ecosystemHighlight}</span>
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
  );
}
