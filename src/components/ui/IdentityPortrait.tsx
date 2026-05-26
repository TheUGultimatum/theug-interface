"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────────
   IdentityPortrait: Frameless, Floating Holographic Visualizer
   ───────────────────────────────────────────────────────────────── */

export function IdentityPortrait() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const [dots, setDots] = useState("");
  const frameRef = useRef(0);

  // Parallax / Spring Dynamics Refs
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const vx = useRef(0);
  const vy = useRef(0);

  const isIntersectingRef = useRef(true);
  const reducedMotionRef = useRef(false);

  // Status indicator pulsing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // 120Hz Damped Spring Parallax & Idle Float Loop with Intersection Observer & Tab Freezing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // media query check for reduced motion
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Viewport observer to pause loops when scrolled offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let rafId: number;

    const update = () => {
      rafId = requestAnimationFrame(update);

      // Freeze execution if tab is inactive OR component is offscreen
      if (document.hidden || !isIntersectingRef.current) return;

      // Skip dynamic coordinate physics under prefers-reduced-motion
      if (reducedMotionRef.current) {
        if (imageWrapperRef.current && reflectionRef.current) {
          imageWrapperRef.current.style.transform = "none";
          reflectionRef.current.style.transform = "none";
        }
        return;
      }

      frameRef.current++;
      const time = frameRef.current;

      const springK = 0.05; 
      const damping = 0.86;  

      const forceX = (targetX.current - currentX.current) * springK;
      const forceY = (targetY.current - currentY.current) * springK;

      vx.current = vx.current * damping + forceX;
      vy.current = vy.current * damping + forceY;

      currentX.current += vx.current;
      currentY.current += vy.current;

      const breatheTime = time * 0.012;
      const breatheX = Math.sin(breatheTime) * 1.2;
      const breatheY = Math.cos(breatheTime * 0.8) * 1.2;

      const finalX = currentX.current + breatheX;
      const finalY = currentY.current + breatheY;

      if (imageWrapperRef.current && reflectionRef.current) {
        imageWrapperRef.current.style.transform = `
          rotateX(${finalY}deg)
          rotateY(${finalX}deg)
          scale3d(1.02, 1.02, 1.02)
        `;

        reflectionRef.current.style.transform = `
          translate3d(${-finalX * 3.5}px, ${-finalY * 3.5}px, 0)
        `;
      }
    };

    rafId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;

    targetX.current = px * 6;
    targetY.current = -py * 6;
  };

  const handleMouseLeave = () => {
    targetX.current = 0;
    targetY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none group flex items-center justify-center p-6"
      style={{
        height: "clamp(300px, 48vh, 600px)", // Adjusted minimum to 300px to prevent viewport spilling on mobile screens (320px/375px)
        background: "transparent",
        perspective: "1200px",
        cursor: "crosshair",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* AMBIENT PROJECTING GLOW */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full blur-[80px] opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-1000 animate-pulse"
        style={{
          background: "radial-gradient(circle, var(--color-amber) 0%, transparent 65%)",
          transform: "translate3d(0, -20px, 0) scale(1.1)",
        }}
      />

      {/* PORTRAIT CONTAINER */}
      <div
        ref={imageWrapperRef}
        className="relative aspect-[3/4] h-[92%] max-h-[92%] w-auto overflow-hidden transition-all duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          willChange: reducedMotionRef.current ? "auto" : "transform",
          transition: "box-shadow 0.6s ease",
          maskImage: "linear-gradient(to bottom, black 62%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0.1) 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 62%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0.1) 90%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 grayscale contrast-[1.12] brightness-[0.93] transition-all duration-700 ease-out group-hover:scale-101 group-hover:brightness-[0.97] group-hover:contrast-[1.14]">
          <Image
            src="/images/portrait.png"
            alt="Usmaan Gani - Editorial Portrait"
            fill
            sizes="(max-width: 768px) 100vw, 550px"
            priority={true}
            className="object-contain"
          />
        </div>

        {/* VIGNETTE OVERLAY */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80"
          style={{
            background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* SOFT OPERATING SYSTEM SCANLINES */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.05]"
          style={{
            backgroundImage: "repeating-linear-gradient(rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Film grain noise */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] animate-grain"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* SCANNING BEAM */}
        <div
          className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--color-amber)] to-transparent opacity-[0.35] pointer-events-none animate-scan-sweep"
          style={{
            boxShadow: "0 0 6px var(--color-amber)",
          }}
        />

        {/* reflection GLARE */}
        <div
          ref={reflectionRef}
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 opacity-[0.12] group-hover:opacity-[0.24]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 45%, transparent 45%, transparent 100%)",
            willChange: reducedMotionRef.current ? "auto" : "transform",
          }}
        />
      </div>

      {/* FLOATING TECHNICAL METADATA */}
      <div className="absolute inset-x-2 inset-y-6 pointer-events-none z-20 font-mono text-[8px] tracking-wider text-[var(--color-text-muted)] opacity-60 group-hover:opacity-85 transition-opacity duration-500">
        
        {/* Top-Left */}
        <div className="absolute top-0 left-0 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-amber)",
              boxShadow: "0 0 6px var(--color-amber)",
            }}
          />
          <span>SYS.LOCK // SECURED{dots}</span>
        </div>

        {/* Top-Right */}
        <div className="absolute top-0 right-0 text-right flex flex-col gap-0.5">
          <span>SCAN_FREQ // 120.00Hz</span>
          <span>LATENCY // 1.2ms</span>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-6 left-0 flex flex-col gap-0.5">
          <span>LOC // IND.IST.530</span>
          <span>NEURAL.SYNC // 0.9982</span>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-6 right-0 text-right flex flex-col gap-0.5">
          <span>IDENTITY_SCAN.EXE</span>
          <span>SYS_VER // v2.01</span>
        </div>
      </div>

      {/* DUST PARTICLES */}
      {!reducedMotionRef.current && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          <span className="particle absolute bottom-8 left-16 w-[1.5px] h-[1.5px] bg-[var(--color-amber)] rounded-full opacity-20 animate-particle-float-slow" />
          <span className="particle absolute top-12 right-24 w-[1px] h-[1px] bg-[var(--color-amber)] rounded-full opacity-15 animate-particle-float-fast" />
          <span className="particle absolute bottom-28 right-20 w-[1.5px] h-[1.5px] bg-[var(--color-amber)] rounded-full opacity-25 animate-particle-float-medium" />
        </div>
      )}

      {/* TECHNICAL TICK MARKS */}
      <div className="absolute inset-x-0 inset-y-12 pointer-events-none z-10 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
        <span className="absolute top-0 left-12 w-2 h-[1px] bg-[var(--color-border)]" />
        <span className="absolute top-0 right-12 w-2 h-[1px] bg-[var(--color-border)]" />
        <span className="absolute bottom-6 left-12 w-2 h-[1px] bg-[var(--color-border)]" />
        <span className="absolute bottom-6 right-12 w-2 h-[1px] bg-[var(--color-border)]" />
        
        <span className="absolute top-[48%] left-4 w-2 h-[1px] bg-[var(--color-border)]" />
        <span className="absolute top-[48%] right-4 w-2 h-[1px] bg-[var(--color-border)]" />
      </div>

      {/* COMPONENT-SPECIFIC ANIMATIONS */}
      <style>{`
        @keyframes scan-sweep {
          0% { top: -2%; }
          20% { top: 102%; }
          100% { top: 102%; }
        }
        .animate-scan-sweep {
          animation: ${reducedMotionRef.current ? "none" : "scan-sweep 15s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)"};
        }
        
        @keyframes grain-shift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10% { transform: translate3d(-1.5%, -1.5%, 0); }
          30% { transform: translate3d(-3%, 1.5%, 0); }
          50% { transform: translate3d(1.5%, -3%, 0); }
          70% { transform: translate3d(3%, 3%, 0); }
          90% { transform: translate3d(-1.5%, 3%, 0); }
        }
        .animate-grain {
          width: 130%;
          height: 130%;
          top: -15%;
          left: -15%;
          background-size: 110px;
          animation: ${reducedMotionRef.current ? "none" : "grain-shift 10s steps(8) infinite"};
        }

        /* Particle drifts */
        @keyframes float-slow {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.05; }
          50% { transform: translate3d(20px, -60px, 0) scale(1.3); opacity: 0.3; }
          100% { transform: translate3d(-8px, -130px, 0) scale(0.7); opacity: 0; }
        }
        @keyframes float-medium {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate3d(-30px, -80px, 0) scale(0.7); opacity: 0.25; }
          100% { transform: translate3d(15px, -160px, 0) scale(1.2); opacity: 0; }
        }
        @keyframes float-fast {
          0% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0.15; }
          50% { transform: translate3d(35px, -100px, 0) scale(1.4); opacity: 0.4; }
          100% { transform: translate3d(-12px, -200px, 0) scale(0.6); opacity: 0; }
        }
        .animate-particle-float-slow {
          animation: float-slow 16s infinite linear;
        }
        .animate-particle-float-medium {
          animation: float-medium 13s infinite linear;
        }
        .animate-particle-float-fast {
          animation: float-fast 10s infinite linear;
        }
      `}</style>
    </div>
  );
}
