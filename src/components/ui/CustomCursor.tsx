"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const hudBadgeRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<"default" | "pointer" | "action" | "text" | "crosshair">("default");
  const [actionText, setActionText] = useState("");
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // References for high-FPS animation loop (0 React re-renders during motion)
  const modeRef = useRef<"default" | "pointer" | "action" | "text" | "crosshair">("default");
  const textRef = useRef("");
  const posRef = useRef({ x: -100, y: -100 });
  const smoothRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef(1);
  const targetScaleRef = useRef(1);

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

  const handlePointerDown = useCallback(() => {
    if (reducedMotion) return;
    const shockwave = shockwaveRef.current;
    if (shockwave) {
      const { x, y } = posRef.current;
      shockwave.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      shockwave.classList.remove("animate-pulse-shockwave");
      void shockwave.offsetWidth; // Force CSS reflow
      shockwave.classList.add("animate-pulse-shockwave");
    }

    // Micro-recoil on center dot
    const dot = dotRef.current;
    if (dot) {
      dot.style.transform = `translate3d(${posRef.current.x - 3}px, ${posRef.current.y - 3}px, 0) scale(1.8)`;
      setTimeout(() => {
        if (dot) {
          dot.style.transform = `translate3d(${posRef.current.x - 3}px, ${posRef.current.y - 3}px, 0) scale(1)`;
        }
      }, 120);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!mounted || isTouch) return;

    let rafId = 0;
    let lastScanTime = 0;

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Throttled element scanner (30fps) for target classification
      const now = performance.now();
      if (now - lastScanTime > 32) {
        lastScanTime = now;
        scanElementUnderPointer(e);
      }
    };

    const scanElementUnderPointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const dataNode = target.closest("[data-cursor]");
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest(".terminal-prompt") || target.isContentEditable;
      const interactiveNode = target.closest("a, button, [role='button'], .cursor-pointer, .panel, summary");

      let nextMode: typeof cursorMode = "default";
      let nextText = "";

      if (isInput) {
        nextMode = "text";
        nextText = "INPUT //";
      } else if (dataNode) {
        const val = dataNode.getAttribute("data-cursor") || "";
        if (val === "crosshair") {
          nextMode = "crosshair";
          nextText = "";
        } else if (val === "text") {
          nextMode = "text";
          nextText = "TERMINAL";
        } else if (val) {
          nextMode = "action";
          nextText = `${val.toUpperCase()} ↗`;
        }
      } else if (interactiveNode) {
        nextMode = "pointer";
        // Check if link goes outside
        const isExternal = interactiveNode.tagName === "A" && (interactiveNode as HTMLAnchorElement).target === "_blank";
        nextText = isExternal ? "EXT_LINK ↗" : "TARGET //";
      }

      // Update telemetry coordinates when in crosshair / observatory mode
      if (nextMode === "crosshair") {
        setCoords({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
      }

      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setCursorMode(nextMode);

        // Adjust target reticle scale based on mode
        if (nextMode === "action") targetScaleRef.current = 1.45;
        else if (nextMode === "pointer") targetScaleRef.current = 1.25;
        else if (nextMode === "crosshair") targetScaleRef.current = 1.6;
        else if (nextMode === "text") targetScaleRef.current = 0.8;
        else targetScaleRef.current = 1.0;
      }

      if (nextText !== textRef.current) {
        textRef.current = nextText;
        setActionText(nextText);
      }
    };

    const onMouseEnter = () => setVisible(true);
    const onMouseLeave = () => setVisible(false);

    // ── GPU-Accelerated 60/120fps Animation Loop ──
    const render = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const { x: tx, y: ty } = posRef.current;
      const dot = dotRef.current;
      const reticle = reticleRef.current;
      const badge = hudBadgeRef.current;

      // 1. Hardware Instant Center Dot
      if (dot) {
        dot.style.transform = `translate3d(${tx - 3}px, ${ty - 3}px, 0)`;
      }

      // 2. Smooth Inertia Reticle (Spring physics)
      if (reticle && !reducedMotion) {
        const ease = modeRef.current === "pointer" ? 0.28 : 0.22;
        smoothRef.current.x += (tx - smoothRef.current.x) * ease;
        smoothRef.current.y += (ty - smoothRef.current.y) * ease;

        scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.2;

        const rx = smoothRef.current.x;
        const ry = smoothRef.current.y;
        reticle.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${scaleRef.current})`;

        // 3. Floating HUD Badge (Offset cleanly top-right)
        if (badge) {
          badge.style.transform = `translate3d(${rx + 20}px, ${ry - 24}px, 0)`;
        }
      } else if (reticle && reducedMotion) {
        reticle.style.transform = `translate3d(${tx - 16}px, ${ty - 16}px, 0)`;
        if (badge) {
          badge.style.transform = `translate3d(${tx + 20}px, ${ty - 24}px, 0)`;
        }
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", handlePointerDown);

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", handlePointerDown);
      cancelAnimationFrame(rafId);
    };
  }, [mounted, isTouch, visible, reducedMotion, handlePointerDown]);

  if (!mounted || isTouch) return null;

  const isCrosshair = cursorMode === "crosshair";
  const isText = cursorMode === "text";
  const isPointer = cursorMode === "pointer";
  const isAction = cursorMode === "action";

  // Accent color mapping based on cyber state
  const reticleColor = isCrosshair
    ? "var(--color-cyan)"
    : isPointer || isAction
    ? "var(--color-amber-bright)"
    : isText
    ? "var(--color-cyan)"
    : "rgba(255, 255, 255, 0.4)";

  const glowShadow = isPointer || isAction
    ? "drop-shadow(0 0 6px rgba(255, 94, 58, 0.6))"
    : isCrosshair || isText
    ? "drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))"
    : "none";

  return (
    <>
      <style>{`
        /* Hide native default cursor across desktop */
        html, body {
          cursor: none !important;
        }
        a, button, [role="button"], input, textarea, [data-cursor], .panel, select, summary {
          cursor: none !important;
        }

        /* Kinetic Laser Shockwave Pulse */
        .cursor-shockwave {
          position: fixed;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          margin-left: -16px;
          margin-top: -16px;
          border-radius: 50%;
          border: 1.5px solid var(--color-amber-bright);
          pointer-events: none;
          z-index: 99996;
          opacity: 0;
          box-shadow: 0 0 16px var(--color-amber);
        }
        .animate-pulse-shockwave {
          animation: shockwave-expand 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        @keyframes shockwave-expand {
          0% {
            transform: translate3d(var(--tx, 0), var(--ty, 0), 0) scale(0.4);
            opacity: 1;
            border-color: var(--color-amber-bright);
          }
          100% {
            transform: translate3d(var(--tx, 0), var(--ty, 0), 0) scale(2.6);
            opacity: 0;
            border-color: var(--color-cyan);
          }
        }

        /* Terminal Caret Pulse */
        @keyframes cyber-caret-pulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.2; transform: scaleY(0.85); }
        }
        .cyber-caret {
          animation: cyber-caret-pulse 0.9s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Kinetic Laser Click Shockwave */}
      <div ref={shockwaveRef} className="cursor-shockwave" />

      {/* 2. Precision 4-Corner Reticle Targeting Frame */}
      <div
        ref={reticleRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          pointerEvents: "none",
          zIndex: 99997,
          opacity: visible && !isText ? 1 : 0,
          transition: "opacity 0.2s ease",
          filter: glowShadow,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
          stroke={reticleColor}
          strokeWidth="1.5"
          className="transition-colors duration-200"
        >
          {/* Top-Left Bracket */}
          <path d="M 3 10 L 3 3 L 10 3" strokeLinecap="square" />
          {/* Top-Right Bracket */}
          <path d="M 22 3 L 29 3 L 29 10" strokeLinecap="square" />
          {/* Bottom-Left Bracket */}
          <path d="M 3 22 L 3 29 L 10 29" strokeLinecap="square" />
          {/* Bottom-Right Bracket */}
          <path d="M 22 29 L 29 29 L 29 22" strokeLinecap="square" />

          {/* Micro Telemetry Ticks (Expand on hover/crosshair) */}
          {(isPointer || isAction || isCrosshair) && (
            <>
              <line x1="16" y1="1" x2="16" y2="4" strokeWidth="1" />
              <line x1="16" y1="28" x2="16" y2="31" strokeWidth="1" />
              <line x1="1" y1="16" x2="4" y2="16" strokeWidth="1" />
              <line x1="28" y1="16" x2="31" y2="16" strokeWidth="1" />
            </>
          )}

          {/* Crosshair Diagonal Vectors (Observatory mode) */}
          {isCrosshair && (
            <>
              <circle cx="16" cy="16" r="6" stroke="var(--color-cyan)" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="16" y1="7" x2="16" y2="25" stroke="var(--color-cyan)" strokeWidth="0.5" />
              <line x1="7" y1="16" x2="25" y2="16" stroke="var(--color-cyan)" strokeWidth="0.5" />
            </>
          )}
        </svg>
      </div>

      {/* 3. Center Precision Core (Zero Latency) */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isText ? "3px" : "6px",
          height: isText ? "16px" : "6px",
          borderRadius: isText ? "1px" : "50%",
          backgroundColor: isCrosshair
            ? "var(--color-cyan)"
            : isPointer || isAction
            ? "var(--color-amber-bright)"
            : isText
            ? "var(--color-amber)"
            : "#FFFFFF",
          boxShadow: isPointer || isAction
            ? "0 0 8px var(--color-amber-bright), 0 0 16px var(--color-amber)"
            : isCrosshair
            ? "0 0 8px var(--color-cyan), 0 0 16px var(--color-cyan)"
            : "0 0 4px rgba(255, 255, 255, 0.8)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          marginTop: isText ? "-8px" : "0",
          marginLeft: isText ? "-1.5px" : "0",
          transition: "background-color 0.15s, box-shadow 0.15s, width 0.15s, height 0.15s, border-radius 0.15s, opacity 0.2s",
        }}
        className={isText ? "cyber-caret" : ""}
      />

      {/* 4. Contextual Telemetry HUD Badge */}
      <div
        ref={hudBadgeRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99998,
          opacity: visible && (actionText || isCrosshair) ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold tracking-widest backdrop-blur-md shadow-lg select-none"
          style={{
            backgroundColor: "rgba(10, 10, 12, 0.88)",
            border: `1px solid ${
              isCrosshair
                ? "rgba(0, 217, 255, 0.4)"
                : isPointer || isAction
                ? "rgba(255, 94, 58, 0.5)"
                : "rgba(255, 255, 255, 0.15)"
            }`,
            color: isCrosshair
              ? "var(--color-cyan)"
              : isPointer || isAction
              ? "var(--color-amber-bright)"
              : "var(--color-text-secondary)",
            boxShadow: isAction
              ? "0 0 12px rgba(255, 94, 58, 0.25)"
              : isCrosshair
              ? "0 0 12px rgba(0, 217, 255, 0.25)"
              : "none",
          }}
        >
          {isCrosshair ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
              <span>
                X:{coords.x} Y:{coords.y}
              </span>
            </>
          ) : (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isAction || isPointer ? "var(--color-amber)" : "var(--color-cyan)",
                }}
              />
              <span>{actionText}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
