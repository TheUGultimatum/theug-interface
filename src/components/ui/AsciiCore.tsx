"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  tx: number; // Target X coordinate (sampled face shape)
  ty: number; // Target Y coordinate (sampled face shape)
  vx: number;
  vy: number;
  char: string;
  size: number;
  color: string;
  originalChar: string;
  delay: number; // Staggered reveal delay
  alpha: number;
}

export function AsciiCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = 460);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        width = canvasRef.current.width = containerRef.current.clientWidth;
        height = canvasRef.current.height = containerRef.current.clientHeight;
        generateFaceParticles();
      }
    };

    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const CHARS = ["@", "#", "8", "&", "*", "o", "x", "z", "1", "0", "+", "-", "=", "[", "]"];

    const generateFaceParticles = () => {
      particles.length = 0;
      const numParticles = 360;

      // Draw mathematical curves to sample points from for a highly detailed cyber face mask
      for (let i = 0; i < numParticles; i++) {
        let tx = width / 2;
        let ty = height / 2;

        const choice = i % 8;

        if (choice === 0) {
          // Left Goggle / Eye Outline (Circle)
          const theta = Math.random() * Math.PI * 2;
          tx = width / 2 - 32 + Math.cos(theta) * 16;
          ty = height * 0.44 + Math.sin(theta) * 10;
        } else if (choice === 1) {
          // Right Goggle / Eye Outline (Circle)
          const theta = Math.random() * Math.PI * 2;
          tx = width / 2 + 32 + Math.cos(theta) * 16;
          ty = height * 0.44 + Math.sin(theta) * 10;
        } else if (choice === 2) {
          // Visor strip linking the goggles
          tx = width / 2 + (Math.random() - 0.5) * 80;
          ty = height * 0.44 + (Math.random() - 0.5) * 4;
        } else if (choice === 3) {
          // Jaw contour (Robotic U-shape)
          const t = Math.random() * 2 - 1; // -1 to 1
          tx = width / 2 + t * 64;
          ty = height * 0.46 + 48 + t * t * 28;
        } else if (choice === 4) {
          // Vertical circuit bridge (Forehead & Nose line)
          tx = width / 2 + (Math.random() - 0.5) * 3;
          ty = height * 0.28 + Math.random() * 70;
        } else if (choice === 5) {
          // Cheek vents Left
          const t = Math.random();
          tx = width / 2 - 50 + t * 14;
          ty = height * 0.52 + t * 24;
        } else if (choice === 6) {
          // Cheek vents Right
          const t = Math.random();
          tx = width / 2 + 50 - t * 14;
          ty = height * 0.52 + t * 24;
        } else {
          // Cyber Mouth Plate (Dotted grid pattern)
          tx = width / 2 + (Math.random() - 0.5) * 32;
          ty = height * 0.70 + (Math.random() - 0.5) * 5;
        }

        // Add minor scatter variance so outline feels handwritten/experimental
        tx += (Math.random() - 0.5) * 3.5;
        ty += (Math.random() - 0.5) * 3.5;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const size = 8.5 + Math.random() * 4;

        // Orange / Cyan cyber accents
        const isCyan = Math.random() > 0.85;
        const color = isCyan ? "var(--color-cyan)" : "var(--color-amber-bright)";

        particles.push({
          x: width / 2 + (Math.random() - 0.5) * width,
          y: height / 2 + (Math.random() - 0.5) * height,
          tx,
          ty,
          vx: 0,
          vy: 0,
          char,
          size,
          color,
          originalChar: char,
          delay: Math.random() * 1500, // Cinematic reveal staggering
          alpha: 0
        });
      }
    };

    generateFaceParticles();
    handleResize();

    let rafId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Cyber glowing filter
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(255, 94, 58, 0.2)";

      // Draw faint structural schematic grids underneath for visual depth
      ctx.strokeStyle = "rgba(255, 94, 58, 0.035)";
      ctx.lineWidth = 0.35;
      ctx.beginPath();
      // Draw facial crosshairs
      ctx.moveTo(width / 2, height * 0.1);
      ctx.lineTo(width / 2, height * 0.9);
      ctx.moveTo(width / 2 - 90, height * 0.44);
      ctx.lineTo(width / 2 + 90, height * 0.44);
      ctx.stroke();

      // Render outer networking connections among adjacent face coordinates
      ctx.strokeStyle = "rgba(255, 94, 58, 0.04)";
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < particles.length; j += 15) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 38) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();

      // Update & Draw Particles
      particles.forEach((p) => {
        // Staggered cinematic entry transition
        if (p.alpha < 1) {
          p.alpha += 0.02;
        }

        // 1. Organic spring attraction forces
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        
        p.vx += dx * 0.016;
        p.vy += dy * 0.016;

        // Friction damping for premium soft restoration inertia
        p.vx *= 0.85;
        p.vy *= 0.85;

        // 2. High-Deflection Mouse Repulsion (Dissolve on Hover)
        if (mouseRef.current) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          
          if (mdist < 54) {
            // Strong blast repulsion to completely scatter coordinates
            const force = (54 - mdist) * 0.32;
            p.vx += (mdx / mdist) * force + (Math.random() - 0.5) * 5;
            p.vy += (mdy / mdist) * force + (Math.random() - 0.5) * 5;
          }
        }

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;

        // 3. Glitch particle behavior
        if (frame % 10 === 0 && Math.random() > 0.94) {
          p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        } else if (frame % 25 === 0) {
          p.char = p.originalChar;
        }

        // Draw character
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.font = `bold ${p.size}px var(--font-mono), monospace`;
        ctx.fillText(p.char, p.x, p.y);
      });

      ctx.globalAlpha = 1.0;
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = null;
  };

  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 420);
  };

  return (
    <div 
      ref={containerRef}
      className={`panel hover-glow-edge relative w-full h-[320px] overflow-hidden group select-none`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerGlitch}
      data-cursor="glitch"
      style={{
        background: "rgba(5, 5, 5, 0.45)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Decorative grid scanning and interface elements */}
      <div className="panel-header flex items-center justify-between">
        <span className="panel-title">⬤ &nbsp;cybernetic_mask_matrix.exe</span>
        <span style={{ fontSize: "8.5px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
          SYS.SCAN // 360 COORDINATES
        </span>
      </div>

      <canvas 
        ref={canvasRef} 
        className="animate-screen-flicker"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          filter: glitchActive ? "skewX(18deg) contrast(300%) invert(20%) hue-rotate(180deg)" : "none",
          transition: "filter 0.08s ease",
        }}
      />

      <div className="absolute inset-0 pointer-events-none border border-[rgba(255,94,58,0.06)]" />
      
      {/* Decorative digital overlays */}
      <div className="absolute bottom-2 left-4 pointer-events-none font-mono text-[7px] text-[rgba(255,94,58,0.22)] flex flex-col gap-0.5">
        <span>FACIAL STRUCTURE MAPPED</span>
        <span>HOVER TO DISSOLVE PROTOCOL</span>
      </div>
      
      <div className="absolute bottom-2 right-4 pointer-events-none font-mono text-[7.5px] text-[var(--color-online)] animate-pulse">
        ● SECURE CORE
      </div>
    </div>
  );
}
