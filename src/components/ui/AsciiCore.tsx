"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────
   Bioluminescent Butterfly — Neural Particle Simulation
   ───────────────────────────────────────────────────── */

interface ButterflyParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  alpha: number;
  wing: "L" | "R" | "body" | "antenna" | "trail";
}

export function AsciiCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<ButterflyParticle[]>([]);
  const frameRef = useRef(0);
  const dimRef = useRef({ w: 460, h: 360, dpr: 1 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * dimRef.current.dpr,
      y: (e.clientY - rect.top) * dimRef.current.dpr,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  const triggerGlitch = useCallback(() => {
    setGlitchActive(true);
    particlesRef.current.forEach((p) => {
      p.vx += (Math.random() - 0.5) * 20;
      p.vy += (Math.random() - 0.5) * 20;
    });
    setTimeout(() => setGlitchActive(false), 400);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const setupSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      dimRef.current = { w: rect.width * dpr, h: rect.height * dpr, dpr };
      generateButterfly();
    };

    const generateButterfly = () => {
      const { w, h } = dimRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const particles: ButterflyParticle[] = [];
      const scale = Math.min(w, h) * 0.0028;

      // ── WING SHAPE: parametric butterfly curve with organic fill ──
      // Outer wing contour + filled interior particles
      const wingPoints = (side: "L" | "R", count: number) => {
        for (let i = 0; i < count; i++) {
          // Parametric butterfly wing using polar coordinates
          const t = (i / count) * Math.PI * 2;
          
          // Classic butterfly curve (modified)
          const r = Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5);
          const wingScale = 38 * scale;
          
          let px = wingScale * r * Math.cos(t);
          let py = -wingScale * r * Math.sin(t) * 0.75; // compress vertically

          // Mirror for right wing
          if (side === "R") px = -px;

          // Add fill particles (random interior points)
          const fillRand = Math.random() * 0.85;
          px *= 0.15 + fillRand;
          py *= 0.15 + fillRand;

          const hue = side === "L"
            ? 280 + Math.random() * 60  // Purple-magenta
            : 180 + Math.random() * 60; // Cyan-teal

          // Add subtle color variation based on distance from center
          const dist = Math.sqrt(px * px + py * py);
          const hueShift = (dist / (wingScale * 2)) * 40;

          particles.push({
            x: cx + (Math.random() - 0.5) * w * 0.4,
            y: cy + (Math.random() - 0.5) * h * 0.4,
            tx: cx + px,
            ty: cy + py - 10 * scale,
            vx: 0, vy: 0,
            size: (1.5 + Math.random() * 2) * scale,
            hue: hue + hueShift,
            alpha: 0.4 + Math.random() * 0.5,
            wing: side,
          });
        }
      };

      wingPoints("L", 280);
      wingPoints("R", 280);

      // ── BODY (vertical spine) ──
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        particles.push({
          x: cx + (Math.random() - 0.5) * w * 0.3,
          y: cy + (Math.random() - 0.5) * h * 0.3,
          tx: cx + (Math.random() - 0.5) * 2 * scale,
          ty: cy - 32 * scale + t * 60 * scale,
          vx: 0, vy: 0,
          size: (2 + Math.random()) * scale,
          hue: 40 + Math.random() * 20, // warm golden
          alpha: 0.7 + Math.random() * 0.3,
          wing: "body",
        });
      }

      // ── ANTENNAE ──
      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const side = i < 10 ? -1 : 1;
        const localT = (i % 10) / 10;
        particles.push({
          x: cx + (Math.random() - 0.5) * w * 0.2,
          y: cy + (Math.random() - 0.5) * h * 0.2,
          tx: cx + side * localT * 18 * scale,
          ty: cy - 34 * scale - localT * 22 * scale + localT * localT * 8 * scale,
          vx: 0, vy: 0,
          size: (1 + (1 - localT) * 1.5) * scale,
          hue: 45,
          alpha: 0.5 + (1 - localT) * 0.4,
          wing: "antenna",
        });
      }

      // ── SPARKLE TRAIL PARTICLES (floating around) ──
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        particles.push({
          x: cx + Math.cos(angle) * dist * scale,
          y: cy + Math.sin(angle) * dist * scale,
          tx: cx + Math.cos(angle) * dist * scale,
          ty: cy + Math.sin(angle) * dist * scale,
          vx: 0, vy: 0,
          size: (0.8 + Math.random() * 1.5) * scale,
          hue: Math.random() * 360,
          alpha: 0.15 + Math.random() * 0.25,
          wing: "trail",
        });
      }

      particlesRef.current = particles;
    };

    setupSize();
    window.addEventListener("resize", setupSize);

    // ── RENDER LOOP ──
    const render = () => {
      const { w, h, dpr } = dimRef.current;
      frameRef.current++;
      const time = frameRef.current;
      ctx.clearRect(0, 0, w, h);

      const isDay = document.documentElement.classList.contains("day-mode");
      const cx = w / 2;
      const cy = h / 2;
      const mouse = mouseRef.current;
      const pList = particlesRef.current;
      const scale = Math.min(w, h) * 0.0028;

      // Gentle wing flapping animation — oscillate wing particles
      const flapAngle = Math.sin(time * 0.025) * 0.12; // subtle flap
      const breathe = Math.sin(time * 0.008) * 2 * scale;

      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];

        // Compute dynamic target with wing flap
        let targetX = p.tx;
        let targetY = p.ty;

        if (p.wing === "L" || p.wing === "R") {
          // Flap: rotate wing particles around body axis
          const relX = p.tx - cx;
          const relY = p.ty - cy;
          const angle = p.wing === "L" ? flapAngle : -flapAngle;
          targetX = cx + relX * Math.cos(angle) - relY * Math.sin(angle) * 0.05;
          targetY = cy + relX * Math.sin(angle) * 0.05 + relY * Math.cos(angle) + breathe;
        } else if (p.wing === "body") {
          targetY = p.ty + breathe;
        } else if (p.wing === "antenna") {
          targetY = p.ty + breathe * 0.5;
          targetX = p.tx + Math.sin(time * 0.03 + p.ty * 0.01) * 1.5 * scale;
        } else if (p.wing === "trail") {
          // Sparkles orbit slowly
          const orbitAngle = time * 0.003 + i * 0.5;
          const orbitR = 3 * scale;
          targetX = p.tx + Math.cos(orbitAngle) * orbitR;
          targetY = p.ty + Math.sin(orbitAngle) * orbitR;
          p.alpha = 0.1 + Math.abs(Math.sin(time * 0.01 + i)) * 0.3;
        }

        // Spring physics
        p.vx += (targetX - p.x) * 0.04;
        p.vy += (targetY - p.y) * 0.04;
        p.vx *= 0.88;
        p.vy *= 0.88;

        // Mouse repulsion
        if (mouse) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          const radius = 60 * dpr;
          if (mDist < radius && mDist > 0) {
            const force = ((radius - mDist) / radius) * 4;
            p.vx += (mdx / mDist) * force;
            p.vy += (mdy / mDist) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render particle as glowing circle
        const saturation = isDay ? "75%" : "85%";
        const lightness = isDay ? "45%" : "65%";
        const alpha = p.alpha * (isDay ? 0.85 : 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${saturation}, ${lightness}, ${alpha})`;
        ctx.fill();

        // Glow layer for wing particles
        if (p.wing === "L" || p.wing === "R") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${saturation}, ${lightness}, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      // Draw faint connecting lines between nearby wing particles for web effect
      ctx.strokeStyle = isDay
        ? "rgba(140, 80, 200, 0.03)"
        : "rgba(160, 120, 255, 0.04)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.beginPath();
      for (let i = 0; i < pList.length; i += 3) {
        if (pList[i].wing === "trail") continue;
        for (let j = i + 3; j < pList.length; j += 7) {
          if (pList[j].wing === "trail") continue;
          const dx = pList[i].x - pList[j].x;
          const dy = pList[i].y - pList[j].y;
          const dist = dx * dx + dy * dy;
          const threshold = (20 * scale) * (20 * scale);
          if (dist < threshold) {
            ctx.moveTo(pList[i].x, pList[i].y);
            ctx.lineTo(pList[j].x, pList[j].y);
          }
        }
      }
      ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", setupSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="panel hover-glow-edge relative w-full h-[320px] overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerGlitch}
      data-cursor="glitch"
      style={{
        background: "var(--color-surface)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="panel-header flex items-center justify-between">
        <span className="panel-title">⬤ &nbsp;bioluminescent_sim.exe</span>
        <span
          style={{
            fontSize: "8.5px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          PARTICLE_SIM // {particlesRef.current.length || 650} NODES
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          filter: glitchActive
            ? "hue-rotate(120deg) contrast(160%) brightness(1.2)"
            : "none",
          transition: "filter 0.12s ease",
        }}
      />

      <div className="absolute inset-0 pointer-events-none border border-[var(--color-border)]" style={{ opacity: 0.3 }} />

      {/* Bottom overlays */}
      <div className="absolute bottom-2 left-4 pointer-events-none font-mono text-[7px] flex flex-col gap-0.5" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>
        <span>NEURAL PARTICLE FORMATION</span>
        <span>HOVER TO SCATTER · CLICK TO PULSE</span>
      </div>

      <div
        className="absolute bottom-2 right-4 pointer-events-none font-mono text-[7.5px] animate-pulse"
        style={{ color: "var(--color-online)" }}
      >
        ● SIMULATION ACTIVE
      </div>
    </div>
  );
}
