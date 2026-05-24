"use client";

import { useEffect, useRef, useState } from "react";

const NUM_PARTICLES = 16;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<"default" | "link" | "crosshair" | "text">("default");
  const [cursorText, setCursorText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
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
    
    // History queue for particles
    const history: {x: number, y: number}[] = [];
    const HISTORY_SIZE = 60; // How many positions to remember
    
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let magneticRadius = 0;
    let isMagnetic = false;

    const animate = () => {
      // If magnetic, snap target to center of hovered element
      const tx = isMagnetic ? targetX : mx;
      const ty = isMagnetic ? targetY : my;

      // Base dot moves instantly to target
      dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
      
      // Ring follows smoothly with spring physics
      ringX += (tx - ringX) * (isMagnetic ? 0.3 : 0.2);
      ringY += (ty - ringY) * (isMagnetic ? 0.3 : 0.2);
      const ringSize = isMagnetic ? (magneticRadius + 10) : 32;
      const ringOffset = ringSize / 2;
      
      ring.style.transform = `translate(${ringX - ringOffset}px, ${ringY - ringOffset}px)`;
      if (isMagnetic) {
        ring.style.width = `${ringSize}px`;
        ring.style.height = `${ringSize}px`;
        ring.style.borderRadius = "4px";
      } else {
        ring.style.width = "32px";
        ring.style.height = "32px";
        ring.style.borderRadius = "50%";
      }
      
      // Update history
      history.unshift({ x: tx, y: ty });
      if (history.length > HISTORY_SIZE) {
        history.pop();
      }

      // Text follows the first particle roughly
      if (history.length > 0) {
        txt.style.transform = `translate(${history[0].x}px, ${history[0].y - 25}px)`;
      }

      // Particles follow history
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = particlesRef.current[i];
        if (!particle) continue;

        // Spread particles across the history buffer
        const historyIdx = Math.min((i + 1) * 3, history.length - 1);
        const pos = history[historyIdx] || history[history.length - 1] || { x: tx, y: ty };
        
        // If magnetic, expand the particles slightly
        const offset = isMagnetic ? (i * magneticRadius * 0.1) : 0;
        
        particle.style.transform = `translate(${pos.x - 2}px, ${pos.y - 2 + offset}px)`;
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
    
    const onDown = () => {
      // Glitch pulse effect
      if (dot) {
        dot.style.boxShadow = "0 0 20px var(--color-amber-bright), 0 0 40px var(--color-amber)";
        dot.style.transform = `translate(${mx - 3}px, ${my - 3}px) scale(3)`;
        setTimeout(() => {
          if (dot) {
            dot.style.boxShadow = "none";
            dot.style.transform = `translate(${mx - 3}px, ${my - 3}px) scale(1)`;
          }
        }, 150);
      }
    };
    
    const onUp = () => {};

    const checkHoverState = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      
      const dataNode = el.closest("[data-cursor]");
      const interactiveNode = el.closest("a, button, [role='button'], input, textarea, .panel");

      if (interactiveNode) {
        // Magnetic hover calculation
        const rect = interactiveNode.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        
        // Only magnetize if it's a relatively small button/icon, not a massive panel
        if (rect.width < 100 && rect.height < 100) {
          isMagnetic = true;
          magneticRadius = rect.width;
        } else {
          isMagnetic = false;
        }
      } else {
        isMagnetic = false;
      }

      if (dataNode) {
        const state = dataNode.getAttribute("data-cursor");
        if (state === "crosshair") {
          setCursorState("crosshair");
          setCursorText("");
          return;
        } else if (state && state.length > 0) {
          setCursorState("text");
          setCursorText(state.toUpperCase());
          return;
        }
      }

      if (interactiveNode) {
        setCursorState("link");
        setCursorText("");
      } else {
        setCursorState("default");
        setCursorText("");
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousemove", checkHoverState);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    
    // Initialize history with current mouse position
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
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, [visible, mounted, isTouch]);

  const isCrosshair = cursorState === "crosshair";
  const isLink = cursorState === "link" || cursorState === "text";
  
  if (!mounted || isTouch) return null;

  return (
    <>
      <style>{`
        body { cursor: none; }
        a, button, [role="button"], input, textarea, [data-cursor], .panel { cursor: none !important; }
      `}</style>
      
      {/* Contextual Text */}
      <div
        ref={textRef}
        style={{
          position: "fixed", top: 0, left: 0,
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-amber-bright)",
          letterSpacing: "0.15em",
          pointerEvents: "none", zIndex: 9999,
          opacity: cursorState === "text" ? 1 : 0,
          transform: "translate(-50%, -100%)",
          transition: "opacity 0.2s",
          textShadow: "0 0 8px rgba(255, 94, 58, 0.4)",
        }}
      >
        {cursorText}
      </div>

      {/* Trailing Particles */}
      {[...Array(NUM_PARTICLES)].map((_, i) => (
        <div
          key={i}
          ref={el => { particlesRef.current[i] = el; }}
          style={{
            position: "fixed", top: 0, left: 0,
            width: `${Math.max(1.5, 6 - (i * 0.25))}px`, 
            height: `${Math.max(1.5, 6 - (i * 0.25))}px`,
            borderRadius: "50%",
            background: isLink ? "var(--color-amber)" : "var(--color-text-secondary)",
            zIndex: 9998, pointerEvents: "none",
            opacity: visible && !isCrosshair ? (1 - i * (1/NUM_PARTICLES)) : 0,
            transition: "background 0.2s, opacity 0.2s",
            mixBlendMode: "difference",
          }}
        />
      ))}

      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0,
          border: isCrosshair ? "none" : (isLink ? "1px solid var(--color-amber)" : "1px solid var(--color-border)"),
          zIndex: 9998, pointerEvents: "none",
          opacity: visible && !isCrosshair ? (isLink ? 1 : 0.4) : 0,
          transition: "opacity 0.2s, border-color 0.2s",
        }}
      />

      {/* Center Dot or Crosshair */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: isCrosshair ? "12px" : "6px",
          height: isCrosshair ? "12px" : "6px",
          borderRadius: isCrosshair ? "0" : "50%",
          background: isCrosshair ? "transparent" : (isLink ? "var(--color-amber-bright)" : "var(--color-text-primary)"),
          border: isCrosshair ? "1px solid var(--color-amber)" : "none",
          zIndex: 9999, pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "background 0.15s, opacity 0.2s, width 0.2s, height 0.2s, border-radius 0.2s, transform 0.1s",
          mixBlendMode: isCrosshair ? "normal" : "difference",
          marginLeft: isCrosshair ? "-3px" : "0",
          marginTop: isCrosshair ? "-3px" : "0",
        }}
      >
        {isCrosshair && (
          <>
            <div style={{ position: "absolute", top: "5px", left: "-4px", width: "3px", height: "1px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", top: "5px", right: "-4px", width: "3px", height: "1px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", top: "-4px", left: "5px", width: "1px", height: "3px", background: "var(--color-amber)" }} />
            <div style={{ position: "absolute", bottom: "-4px", left: "5px", width: "1px", height: "3px", background: "var(--color-amber)" }} />
          </>
        )}
      </div>
    </>
  );
}
