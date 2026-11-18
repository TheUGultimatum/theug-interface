"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // High-performance animation loop state (0 React re-renders during motion)
  const posRef = useRef({ x: -100, y: -100 });
  const prevPosRef = useRef({ x: -100, y: -100 });
  const lensPosRef = useRef({ x: -100, y: -100 });
  const targetScaleRef = useRef(1);
  const currentScaleRef = useRef(1);
  const isClickingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hoverTypeRef = useRef<"default" | "link" | "button" | "action" | "text" | "drag">("default");
  const hoverLabelRef = useRef("");

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add("has-custom-cursor");

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", motionListener);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      mediaQuery.removeEventListener("change", motionListener);
    };
  }, []);

  const handleMouseDown = useCallback(() => {
    isClickingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isClickingRef.current = false;
  }, []);

  useEffect(() => {
    if (!mounted || isTouch) return;

    let rafId = 0;
    let lastScanTime = 0;

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Throttled element scanner (30fps) to detect interactive elements
      const now = performance.now();
      if (now - lastScanTime > 32) {
        lastScanTime = now;
        scanElement(e);
      }
    };

    const scanElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const dataNode = target.closest("[data-cursor]");
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest(".terminal-prompt") ||
        target.isContentEditable;
      const isInteractive = target.closest("a, button, [role='button'], .cursor-pointer, summary");
      const isCard = target.closest(".panel, article");

      let nextType: typeof hoverTypeRef.current = "default";
      let nextLabel = "";

      if (isInput) {
        nextType = "text";
        nextLabel = "";
      } else if (dataNode) {
        const val = dataNode.getAttribute("data-cursor") || "";
        if (val === "text") {
          nextType = "text";
          nextLabel = "";
        } else if (val === "crosshair" || val.toLowerCase().includes("drag")) {
          nextType = "drag";
          nextLabel = "DRAG";
        } else if (val) {
          nextType = "action";
          nextLabel = val.toLowerCase();
        }
      } else if (isInteractive) {
        const isExternal =
          target.closest("a") &&
          (target.closest("a") as HTMLAnchorElement).target === "_blank";
        nextType = "link";
        nextLabel = isExternal ? "visit ↗" : "";
      } else if (isCard) {
        nextType = "button";
        nextLabel = "";
      }

      hoverTypeRef.current = nextType;
      hoverLabelRef.current = nextLabel;
      isHoveringRef.current = nextType !== "default";

      // Target scale & size
      if (nextType === "action") {
        targetScaleRef.current = 1.6;
      } else if (nextType === "link" || nextType === "drag") {
        targetScaleRef.current = 1.35;
      } else if (nextType === "button") {
        targetScaleRef.current = 1.2;
      } else if (nextType === "text") {
        targetScaleRef.current = 0.8;
      } else {
        targetScaleRef.current = 1.0;
      }

      // Update inner label text directly on DOM (0 React re-renders)
      if (labelRef.current) {
        labelRef.current.textContent = nextLabel;
      }
    };

    const onMouseEnter = () => setVisible(true);
    const onMouseLeave = () => setVisible(false);

    // ── 60/120 FPS Fluid Inertia & Velocity Physics Loop ──
    const render = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const { x: tx, y: ty } = posRef.current;
      const { x: px, y: py } = prevPosRef.current;
      const dot = dotRef.current;
      const lens = lensRef.current;
      const glow = glowRef.current;

      // 1. Hardware-Instant Center Dot (0ms lag)
      if (dot) {
        const isText = hoverTypeRef.current === "text";
        const dotSize = isText ? 2 : (isHoveringRef.current ? 4 : 5);
        const dotRadius = isText ? "1px" : "50%";
        dot.style.transform = `translate3d(${tx - dotSize / 2}px, ${ty - (isText ? 8 : dotSize / 2)}px, 0)`;
        dot.style.width = `${dotSize}px`;
        dot.style.height = isText ? "16px" : `${dotSize}px`;
        dot.style.borderRadius = dotRadius;
      }

      // 2. Ambient Glow Spotlight
      if (glow) {
        glow.style.transform = `translate3d(${tx - 100}px, ${ty - 100}px, 0)`;
      }

      // 3. Fluid Glass Lens with Elastic Velocity Stretch
      if (lens) {
        if (!reducedMotion) {
          // Smooth spring damping
          const ease = isHoveringRef.current ? 0.24 : 0.18;
          lensPosRef.current.x += (tx - lensPosRef.current.x) * ease;
          lensPosRef.current.y += (ty - lensPosRef.current.y) * ease;

          // Scale easing + click compression
          const clickScale = isClickingRef.current ? 0.82 : 1.0;
          currentScaleRef.current +=
            (targetScaleRef.current * clickScale - currentScaleRef.current) * 0.2;

          // Velocity calculation
          const vx = tx - px;
          const vy = ty - py;
          const speed = Math.sqrt(vx * vx + vy * vy);

          // Liquid stretch along velocity vector (only when not hovering an element)
          let stretchX = 1;
          let stretchY = 1;
          let angle = 0;

          if (!isHoveringRef.current && speed > 1) {
            angle = Math.atan2(vy, vx);
            const stretch = Math.min(speed * 0.016, 0.42); // Subtle fluid droplet stretch
            stretchX = 1 + stretch;
            stretchY = Math.max(0.68, 1 - stretch * 0.4);
          }

          const lx = lensPosRef.current.x;
          const ly = lensPosRef.current.y;
          const scale = currentScaleRef.current;

          // Apply matrix transform: translate -> rotate -> stretch -> scale
          if (angle !== 0 && !isHoveringRef.current) {
            lens.style.transform = `translate3d(${lx - 16}px, ${ly - 16}px, 0) rotate(${angle}rad) scale(${stretchX * scale}, ${stretchY * scale}) rotate(${-angle}rad)`;
          } else {
            lens.style.transform = `translate3d(${lx - 16}px, ${ly - 16}px, 0) scale(${scale})`;
          }
        } else {
          lens.style.transform = `translate3d(${tx - 16}px, ${ty - 16}px, 0) scale(${targetScaleRef.current})`;
        }
      }

      // Store previous coordinates for velocity delta
      prevPosRef.current = { x: tx, y: ty };
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [mounted, isTouch, visible, reducedMotion, handleMouseDown, handleMouseUp]);

  if (!mounted || isTouch) return null;

  return (
    <>
      <style>{`
        /* Hide native OS pointer cleanly across desktop */
        html, body {
          cursor: none !important;
        }
        a, button, [role="button"], input, textarea, [data-cursor], .panel, select, summary {
          cursor: none !important;
        }

        /* Fluid Glass Lens Styling */
        .fluid-lens {
          position: fixed;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          pointer-events: none;
          z-index: 99997;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.04), inset 0 0 8px rgba(255, 255, 255, 0.02);
          transition: background 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.2s ease;
        }

        /* Interactive Hover Mode (Subtle Amber Glass Accent) */
        .has-custom-cursor:has(a:hover, button:hover, [data-cursor]:hover) .fluid-lens {
          background: rgba(255, 94, 58, 0.08);
          border-color: rgba(255, 94, 58, 0.55);
          box-shadow: 0 0 16px rgba(255, 94, 58, 0.25), inset 0 0 10px rgba(255, 94, 58, 0.1);
        }

        /* Ambient Glow Spotlight */
        .ambient-spotlight {
          position: fixed;
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99995;
          background: radial-gradient(circle, rgba(255, 94, 58, 0.065) 0%, rgba(255, 94, 58, 0.02) 40%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      `}</style>

      {/* 1. Ambient Surface Spotlight (Gently illuminates dark cards) */}
      <div
        ref={glowRef}
        className="ambient-spotlight"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* 2. Fluid Frosted Glass Follower Lens */}
      <div
        ref={lensRef}
        className="fluid-lens"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Contextual Micro-Label (Whisper quiet) */}
        <span
          ref={labelRef}
          className="font-mono text-[8.5px] font-semibold uppercase tracking-widest select-none pointer-events-none text-white/90 drop-shadow-xs"
          style={{ whiteSpace: "nowrap" }}
        />
      </div>

      {/* 3. Precision Hardware Dot (Instant 1:1 Response) */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px var(--color-amber-bright)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
        }}
      />
    </>
  );
}
