"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const META = [
  { label: "LOCATION", value: "India" },
  { label: "STATUS", value: "Building" },
  { label: "FOCUS", value: "AI · Web3 · Linux" },
  { label: "EXPERIENCE", value: "4+ Years" },
];

export function HeroLeft() {
  return (
    <div className="flex flex-col justify-center h-full py-8 lg:py-0">
      {/* Section counter + tags */}
      <div className="flex items-center gap-4 mb-5">
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          01
        </span>
        <div className="flex items-center gap-2">
          {["AI", "AUTOMATION", "INFRASTRUCTURE"].map((tag, i) => (
            <span key={tag} className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] tracking-widest"
                style={{ color: "var(--color-cyan)" }}
              >
                {tag}
              </span>
              {i < 2 && (
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main headline */}
      <h1 className="text-hero mb-5 leading-none">
        <span className="block" style={{ color: "var(--color-text-primary)" }}>
          BUILDING
        </span>
        <span className="block" style={{ color: "var(--color-text-primary)" }}>
          INTELLIGENT
        </span>
        <span className="block flex items-end gap-2">
          <span style={{ color: "var(--color-text-primary)" }}>SYSTEMS</span>
          <span
            className="animate-glow-pulse"
            style={{
              color: "var(--color-cyan)",
              textShadow: "0 0 30px rgba(0,212,255,0.6)",
            }}
          >
            .
          </span>
        </span>
      </h1>

      {/* Identity statement */}
      <p
        className="text-[15px] leading-relaxed mb-8 max-w-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        I build AI agents, automation tools, developer systems,
        and experimental internet products.
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/projects" className="btn-primary">
          <ChevronRight size={13} />
          ENTER WORKSPACE
        </Link>
        <Link href="/projects" className="btn-secondary">
          VIEW PROJECTS
          <span className="btn-arrow">
            <ArrowRight size={13} />
          </span>
        </Link>
      </div>

      {/* Metadata strip */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {META.map(({ label, value }) => (
          <div key={label}>
            <p
              className="font-mono text-[9px] tracking-widest uppercase mb-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label}
            </p>
            <p
              className="font-mono text-[11px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
