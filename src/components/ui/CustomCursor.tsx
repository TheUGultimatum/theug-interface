"use client";

import { useEffect, useRef, useState } from "react";

const NUM_PARTICLES = 6; // Reduced particle count for a tighter, highly optimized trail

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rippleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nextRippleIdx = useRef(0);
  
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<"default" | "link" | "crosshair" | "text" | "terminal">("default");
  const [cursorText, setCursorText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Gating refs to prevent continuous 60fps state updates during mousemove
  const stateRef = useRef<"default" | "link" | "crosshair" | "text" | "terminal">("default");
  const textValRef = useRef("");

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsTouch(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || isTouch) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const txt = textRef.current;
    if (!dot || !ring || !txt) return;

    let mx = 0, my = 0;
    
    // History queue for trailing particles
    const history: {x: number, y: number}[] = [];
    const HISTORY_SIZE = 16; 
    
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let ringRotation = 0;
    let magneticRadius = 0;
    let isMagnetic = false;

    // ── GPU-ACCELERATED RAF LOOP ( translate3d ) ──
    const animate = () => {
      const tx = isMagnetic ? targetX : mx;
      const ty = isMagnetic ? targetY : my;

      // 1. Center dot translate3d GPU positioning
      dot.style.transform = `translate3d(${tx - 3}px, ${ty - 3}px, 0)`;
      
      // 2. Smooth Ring spring follow
      ringX += (tx - ringX) * (isMagnetic ? 0.32 : 0.18);
      ringY += (ty - ringY) * (isMagnetic ? 0.32 : 0.18);
      
      ringRotation = (ringRotation + 1.2) % 360;

      const ringSize = isMagnetic ? (magneticRadius + 14) : 34;
      const ringOffset = ringSize / 2;
      
      ring.style.transform = `translate3d(${ringX - ringOffset}px, ${ringY - ringOffset}px, 0) rotate(${ringRotation}deg)`;
      
      if (isMagnetic) {
        ring.style.width = `${ringSize}px`;
        ring.style.height = `${ringSize}px`;
        ring.style.borderRadius = "4px";
      } else {
        ring.style.width = "34px";
        ring.style.height = "34px";
        ring.style.borderRadius = "50%";
      }
      
      // 3. Update Trail History
      history.unshift({ x: tx, y: ty });
      if (history.length > HISTORY_SIZE) {
        history.pop();
      }

      // 4. Floating label translate3d position
      if (history.length > 0) {
        txt.style.transform = `translate3d(${history[0].x}px, ${history[0].y - 28}px, 0) translate3d(-50%, -100%, 0)`;
      }

      // 5. Trailing particle coordinate shifts
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = particlesRef.current[i];
        if (!particle) continue;

        const historyIdx = Math.min((i + 1) * 2, history.length - 1);
        const pos = history[historyIdx] || history[history.length - 1] || { x: tx, y: ty };
        
        const offset = isMagnetic ? (i * magneticRadius * 0.08) : 0;
        particle.style.transform = `translate3d(${pos.x - 2}px, ${pos.y - 2 + offset}px, 0)`;
      }

      raf = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    
    // Mousedown click ripple trigger (0% React re-render, native DOM class toggling)
    const onDown = (e: MouseEvent) => {
      if (dot) {
        dot.style.boxShadow = "0 0 24px var(--color-amber-bright), 0 0 48px var(--color-amber)";
        dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0) scale(2.2)`;
        setTimeout(() => {
          if (dot) {
            dot.style.boxShadow = "none";
            dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0) scale(1)`;
          }
        }, 180);
      }

      // Trigger next ripple div in the pre-rendered pool
      const idx = nextRippleIdx.current;
      const ripple = rippleRefs.current[idx];
      if (ripple) {
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        ripple.classList.remove("run-ripple");
        // Force DOM reflow to restart CSS animation
        void ripple.offsetWidth;
        ripple.classList.add("run-ripple");
      }
      nextRippleIdx.current = (idx + 1) % 3; // Cycle pool size (3)
    };

    // Throttled Hover state scanner (Gates state updates inside refs to eliminate DOM re-renders)
    const checkHoverState = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el) return;

      const dataNode = el.closest("[data-cursor]");
      const interactiveNode = el.closest("a, button, [role='button'], input, textarea, .panel");

      let nextState: typeof cursorState = "default";
      let nextText = "";

      if (interactiveNode) {
        const rect = interactiveNode.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        
        // Magnetize to smaller buttons and icons
        if (rect.width < 120 && rect.height < 120) {
          isMagnetic = true;
          magneticRadius = Math.max(rect.width, rect.height);
        } else {
          isMagnetic = false;
        }
      } else {
        isMagnetic = false;
      }

      if (dataNode) {
        const state = dataNode.getAttribute("data-cursor");
        if (state === "crosshair") {
          nextState = "crosshair";
        } else if (state === "terminal") {
          nextState = "terminal";
        } else if (state && state.length > 0) {
          nextState = "text";
          nextText = state.toUpperCase();
        }
      }

      const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.closest(".terminal-prompt") || el.closest("form");
      if (isInput && nextState === "default") {
        nextState = "terminal";
      }

      if (interactiveNode && nextState === "default") {
        nextState = "link";
      }

      // ── CRITICAL GATING ──
      // State is strictly only updated in React if it has actually changed, blocking 60fps re-renders
      if (nextState !== stateRef.current) {
        stateRef.current = nextState;
        setCursorState(nextState);
      }
      if (nextText !== textValRef.current) {
        textValRef.current = nextText;
        setCursorText(nextText);
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousemove", checkHoverState);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    
    for (let i = 0; i < HISTORY_SIZE; i++) {
      history.push({ x: mx, y: my });
    }
    
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", checkHoverState);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf);
    };
  }, [visible, mounted, isTouch]);

  const isCrosshair = cursorState === "crosshair";
  const isTerminal = cursorState === "terminal";
  const isLink = cursorState === "link" || cursorState === "text";
  
  if (!mounted || isTouch) return null;

  return (
    <>
      <style>{`
        body { cursor: none; }
        a, button, [role="button"], input, textarea, [data-cursor], .panel { cursor: none !important; }
        
        .cursor-ripple {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1.5px solid var(--color-amber-bright);
          transform: translate3d(-50%, -50%, 0);
          pointer-events: none;
          z-index: 9997;
          box-shadow: 0 0 10px var(--color-amber-glow);
          opacity: 0;
        }
        .cursor-ripple.run-ripple {
          animation: cursor-ripple-anim 0.65s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes cursor-ripple-anim {
          0% { width: 10px; height: 10px; opacity: 0.95; }
          100% { width: 90px; height: 90px; opacity: 0; }
        }
        @keyframes caret-blink {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.15; }
        }
      `}</style>
      
      {/* Contextual Text Overlay */}
      <div
        ref={textRef}
        style={{
          position: "fixed", top: 0, left: 0,
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-amber-bright)",
          letterSpacing: "0.15em",
          pointerEvents: "none", zIndex: 9999,
          opacity: cursorState === "text" ? 1 : 0,
          transition: "opacity 0.2s",
          textShadow: "0 0 8px rgba(255, 94, 58, 0.4)",
        }}
      >
        {cursorText}
      </div>

      {/* 1. Pre-rendered click ripples pool (strictly zero React re-renders on clicks) */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`ripple-slot-${i}`}
          ref={el => { rippleRefs.current[i] = el; }}
          className="cursor-ripple"
        />
      ))}

      {/* 2. Trailing particles (COMPRESSED to 6 for GPU optimal trails) */}
      {[...Array(NUM_PARTICLES)].map((_, i) => (
        <div
          key={i}
          ref={el => { particlesRef.current[i] = el; }}
          style={{
            position: "fixed", top: 0, left: 0,
            width: `${Math.max(1.5, 5 - (i * 0.55))}px`, 
            height: `${Math.max(1.5, 5 - (i * 0.55))}px`,
            borderRadius: "50%",
            background: isLink ? "var(--color-amber)" : (isTerminal ? "var(--color-cyan)" : "var(--color-text-secondary)"),
            zIndex: 9998, pointerEvents: "none",
            opacity: visible && !isCrosshair && !isTerminal ? (1 - i * (1/NUM_PARTICLES)) * 0.65 : 0,
            transition: "background 0.2s, opacity 0.2s",
            mixBlendMode: "difference",
          }}
        />
      ))}

      {/* 3. Rotating Orbit Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0,
          border: isCrosshair || isTerminal ? "none" : (isLink ? "1.5px dashed var(--color-amber-bright)" : "1px solid var(--color-border)"),
          borderRadius: "50%",
          zIndex: 9998, pointerEvents: "none",
          opacity: visible && !isCrosshair && !isTerminal ? (isLink ? 1 : 0.4) : 0,
          boxShadow: isLink ? "0 0 8px var(--color-amber-glow)" : "none",
          transition: "opacity 0.2s, border-color 0.2s, border-style 0.2s, box-shadow 0.2s",
        }}
      />

      {/* 4. Center dot caret (using translate3d GPU scaling) */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: isCrosshair ? "14px" : (isTerminal ? "8px" : "6px"),
          height: isCrosshair ? "14px" : (isTerminal ? "14px" : "6px"),
          borderRadius: isCrosshair ? "0" : (isTerminal ? "1px" : "50%"),
          background: isCrosshair ? "transparent" : (isTerminal ? "var(--color-cyan)" : (isLink ? "var(--color-amber-bright)" : "var(--color-text-primary)")),
          border: isCrosshair ? "1px solid var(--color-amber)" : "none",
          zIndex: 9999, pointerEvents: "none",
          opacity: visible ? (isTerminal ? 0.9 : 1) : 0,
          transition: "background 0.15s, opacity 0.2s, width 0.2s, height 0.2s, border-radius 0.2s",
          mixBlendMode: isCrosshair ? "normal" : "difference",
          marginLeft: isCrosshair ? "-4px" : (isTerminal ? "-4px" : "0"),
          marginTop: isCrosshair ? "-4px" : (isTerminal ? "-7px" : "0"),
          animation: isTerminal ? "caret-blink 1s step-end infinite" : "none",
          boxShadow: isTerminal ? "0 0 10px var(--color-cyan-glow)" : "none"
        }}
      >
        {isCrosshair && (
          <>
            <div style={{ position: "absolute", top: "6px", left: "-5px", width: "4px", height: "1px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", top: "6px", right: "-5px", width: "4px", height: "1px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", top: "-5px", left: "6px", width: "1px", height: "4px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", bottom: "-5px", left: "6px", width: "1px", height: "4px", background: "var(--color-amber)" }} />
          </>
        )}
      </div>
    </>
  );
}
