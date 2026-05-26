"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ────────────────────────────────────────────────────────
   IdentityPortrait: Cinematic, 3D Parallax Neural Profile
   ──────────────────────────────────────────────────────── */

export function IdentityPortrait() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const [scanStatus, setScanStatus] = useState("ONLINE");
  const [dots, setDots] = useState("");

  // Parallax values
  const tiltX = useRef(0);
  const tiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);

  // Status text pulsing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // 120fps Damped Parallax loop
  useEffect(() => {
    let rafId: number;
    
    const update = () => {
      // Damped interpolation (0.08 damping)
      currentTiltX.current += (tiltX.current - currentTiltX.current) * 0.08;
      currentTiltY.current += (tiltY.current - currentTiltY.current) * 0.08;

      if (imageWrapperRef.current && reflectionRef.current) {
        // Highly responsive direct DOM transforms bypass React re-renders completely for 120Hz/60fps fluidity
        imageWrapperRef.current.style.transform = `
          rotateX(${currentTiltY.current}deg)
          rotateY(${currentTiltX.current}deg)
          scale3d(1.02, 1.02, 1.02)
        `;
        reflectionRef.current.style.transform = `
          translate3d(${-currentTiltX.current * 4}px, ${-currentTiltY.current * 4}px, 0)
        `;
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate normalized coords (-1 to 1)
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;

    // Max tilt angles (8 deg for premium subtle feel)
    tiltX.current = px * 8;
    tiltY.current = -py * 8;
  };

  const handleMouseLeave = () => {
    // Return smoothly to center
    tiltX.current = 0;
    tiltY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="panel hover-glow-edge relative w-full overflow-hidden select-none group"
      style={{
        height: "clamp(460px, 50vw, 600px)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--glow-ambient)",
        perspective: "1000px",
        cursor: "crosshair",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── TECHNICAL HEADER ── */}
      <div className="panel-header flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5 bg-black/5 dark:bg-white/5">
        <span className="panel-title flex items-center gap-2 text-system font-mono text-[10px] tracking-wider text-[var(--color-text-secondary)]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              background: "var(--color-amber)",
              boxShadow: "0 0 8px var(--color-amber)",
            }}
          />
          IDENTITY_SCAN.ACTIVE
        </span>
        <span className="font-mono text-[8.5px] tracking-widest text-[var(--color-text-muted)]">
          SYNC: <span style={{ color: "var(--color-online)" }}>{scanStatus}{dots}</span>
        </span>
      </div>

      {/* ── METADATA WATERMARKS ── */}
      <div className="absolute top-14 left-4 z-20 pointer-events-none font-mono text-[8.5px] text-[var(--color-text-muted)] opacity-60 flex flex-col gap-1">
        <span>LOC: [IND.IST.530]</span>
        <span>SCAN: 8.42Hz // 120FPS</span>
      </div>

      <div className="absolute top-14 right-4 z-20 pointer-events-none font-mono text-[8.5px] text-[var(--color-text-muted)] opacity-60 flex flex-col gap-1 text-right">
        <span>NEURAL_PROFILE_v2.01</span>
        <span>FACE_LOCK: ACTIVE</span>
      </div>

      {/* ── CORNER BRACKETS ── */}
      <div className="absolute inset-x-3 inset-y-[52px] z-20 pointer-events-none border border-transparent">
        {/* Top-Left */}
        <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-[var(--color-border)] opacity-60 group-hover:opacity-100 group-hover:border-[var(--color-amber)] transition-all duration-300" />
        {/* Top-Right */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-[var(--color-border)] opacity-60 group-hover:opacity-100 group-hover:border-[var(--color-amber)] transition-all duration-300" />
        {/* Bottom-Left */}
        <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-[var(--color-border)] opacity-60 group-hover:opacity-100 group-hover:border-[var(--color-amber)] transition-all duration-300" />
        {/* Bottom-Right */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-[var(--color-border)] opacity-60 group-hover:opacity-100 group-hover:border-[var(--color-amber)] transition-all duration-300" />
      </div>

      {/* ── PORTRAIT WRAPPER WITH 3D PERSPECTIVE ── */}
      <div
        className="w-full h-full flex items-center justify-center p-8 transition-transform duration-500 ease-out"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={imageWrapperRef}
          className="relative aspect-[3/4] h-[90%] overflow-hidden rounded border border-[var(--color-border)] transition-shadow duration-300 shadow-md group-hover:shadow-[0_0_24px_rgba(216,67,21,0.08)]"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            transition: "transform 0.1s ease-out, shadow 0.3s ease",
          }}
        >
          {/* Next.js Image component with premium monochrome grading and object-contain to prevent cropping */}
          <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.93] transition-all duration-500 ease-out group-hover:scale-102 group-hover:brightness-[0.98] group-hover:contrast-[1.16]">
            <Image
              src="/images/portrait.png"
              alt="Usmaan Gani - Identity Profile"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority={false}
              className="object-contain"
              loading="lazy"
            />
          </div>

          {/* ── VIGNETTE OVERLAY ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle, transparent 35%, rgba(0,0,0,0.55) 100%)",
              mixBlendMode: "multiply",
            }}
          />

          {/* ── SOFT SCANLINE OVERLAY ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: "repeating-linear-gradient(rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 1px, transparent 1px, transparent 3px)",
            }}
          />

          {/* ── MOVING FILM GRAIN OVERLAY ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.055] animate-grain"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />

          {/* ── SCAN SWEEP BAR (Sweeps every 12 seconds) ── */}
          <div
            className="absolute left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[var(--color-amber)] to-transparent opacity-60 pointer-events-none animate-scan-sweep"
            style={{
              boxShadow: "0 0 10px var(--color-amber)",
            }}
          />

          {/* ── GLASS GLARE REFLECTION ── */}
          <div
            ref={reflectionRef}
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-20 group-hover:opacity-35"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 40%, transparent 40%, transparent 100%)",
              willChange: "transform",
            }}
          />

          {/* ── SUBTLE INTERACTIVE PULSE RING (Breathing) ── */}
          <div className="absolute inset-0 border-[0.5px] border-[var(--color-amber)] opacity-[0.05] rounded pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-500 animate-pulse" />
        </div>
      </div>

      {/* ── AMBIENT PARTICLES (LIGHTWEIGHT LAYER) ── */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        <span className="particle absolute bottom-4 left-6 w-1 h-1 bg-[var(--color-amber)] rounded-full opacity-30 animate-particle-float-slow" />
        <span className="particle absolute top-8 right-16 w-1.5 h-1.5 bg-[var(--color-amber)] rounded-full opacity-20 animate-particle-float-fast" />
        <span className="particle absolute bottom-24 right-12 w-1 h-1 bg-[var(--color-amber)] rounded-full opacity-25 animate-particle-float-medium" />
      </div>

      {/* ── TECHNICAL BOTTOM PANEL STATUS ── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between pointer-events-none bg-gradient-to-t from-[var(--color-surface)] to-transparent border-t border-[var(--color-border)]"
      >
        <span className="font-mono text-[7.5px] tracking-wider text-[var(--color-text-muted)]">
          LOCKSTATE: COMPLETED
        </span>
        <span className="font-mono text-[7.5px] tracking-wider text-[var(--color-text-muted)]">
          HASH: 0x9AF03C
        </span>
      </div>

      {/* ── COMPONENT-SPECIFIC ANIMATIONS ── */}
      <style>{`
        @keyframes scan-sweep {
          0% { top: -5%; }
          15% { top: 105%; }
          100% { top: 105%; }
        }
        .animate-scan-sweep {
          animation: scan-sweep 12s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Moving grain animation using CSS transforms for 120fps rendering */
        @keyframes grain-shift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10% { transform: translate3d(-1%, -1%, 0); }
          30% { transform: translate3d(-2%, 1%, 0); }
          50% { transform: translate3d(1%, -2%, 0); }
          70% { transform: translate3d(2%, 2%, 0); }
          90% { transform: translate3d(-1%, 2%, 0); }
        }
        .animate-grain {
          width: 120%;
          height: 120%;
          top: -10%;
          left: -10%;
          background-size: 120px;
          animation: grain-shift 8s steps(6) infinite;
        }

        /* Float animations for ambient particles */
        @keyframes float-slow {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate3d(15px, -50px, 0) scale(1.2); opacity: 0.4; }
          100% { transform: translate3d(-5px, -110px, 0) scale(0.8); opacity: 0; }
        }
        @keyframes float-medium {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate3d(-25px, -70px, 0) scale(0.8); opacity: 0.35; }
          100% { transform: translate3d(10px, -140px, 0) scale(1.1); opacity: 0; }
        }
        @keyframes float-fast {
          0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0.2; }
          50% { transform: translate3d(30px, -90px, 0) scale(1.3); opacity: 0.45; }
          100% { transform: translate3d(-10px, -180px, 0) scale(0.7); opacity: 0; }
        }
        .animate-particle-float-slow {
          animation: float-slow 15s infinite linear;
        }
        .animate-particle-float-medium {
          animation: float-medium 12s infinite linear;
        }
        .animate-particle-float-fast {
          animation: float-fast 9s infinite linear;
        }
      `}</style>
    </div>
  );
}
