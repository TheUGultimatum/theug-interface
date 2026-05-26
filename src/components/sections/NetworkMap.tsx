"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface NetworkNode {
  id: string;
  name: string;
  role: string;
  status: string;
  focus: string;
  activity: string;
  color: string;
  rx: number;
  ry: number;
  // Dynamic coordinates
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  // Target coordinates for spring physics
  targetX: number;
  targetY: number;
  pulsePhase: number;
  driftOffset: number;
}

const NODES_DATA = [
  { id: "btc", name: "BTC", role: "Security & Settlement", status: "ONLINE", focus: "Store of value / security anchor", activity: "NOMINAL", color: "var(--color-amber)", rx: 0.16, ry: 0.4 },
  { id: "eth", name: "ETH", role: "Smart Contract Core", status: "ACTIVE", focus: "AI agents / automation / L2 cores", activity: "CRITICAL", color: "var(--color-cyan)", rx: 0.42, ry: 0.5 },
  { id: "polygon", name: "POLYGON", role: "Scaling & Aggregation", status: "SYNCED", focus: "Multi-chain zero-knowledge layers", activity: "STABLE", color: "var(--color-text-secondary)", rx: 0.44, ry: 0.76 },
  { id: "sol", name: "SOL", role: "High-Speed Execution", status: "ACTIVE", focus: "Parallel transaction pipelines", activity: "HIGH", color: "var(--color-amber-bright)", rx: 0.65, ry: 0.45 },
  { id: "sui", name: "SUI", role: "Parallel Core Research", status: "SYNCED", focus: "Object-model state topology", activity: "MEDIUM", color: "var(--color-text-secondary)", rx: 0.62, ry: 0.22 },
  { id: "near", name: "NEAR", role: "Chain Abstraction", status: "ONLINE", focus: "User-aggregation protocols", activity: "STABLE", color: "var(--color-text-secondary)", rx: 0.72, ry: 0.72 },
  { id: "ton", name: "TON", role: "Telegram Ecosystem Layer", status: "ONLINE", focus: "Social scaling & bot integrations", activity: "HIGH", color: "var(--color-cyan)", rx: 0.88, ry: 0.55 },
];

const CONNECTIONS = [
  { from: "btc", to: "eth" },
  { from: "eth", to: "polygon" },
  { from: "eth", to: "sol" },
  { from: "eth", to: "ton" },
  { from: "sol", to: "sui" },
  { from: "sol", to: "near" },
  { from: "near", to: "sui" }
];

function NetworkMapComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [inView, setInView] = useState(false);

  // High performance coordinates and mouse tracking refs
  const nodesRef = useRef<NetworkNode[]>([]);
  const mouseRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const dragNodeRef = useRef<NetworkNode | null>(null);
  const dimRef = useRef({ w: 800, h: 500, dpr: 1 });
  const isMobileRef = useRef(false);
  const reducedMotionRef = useRef(false);

  // Setup viewport observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect mobile touch screen for dynamic compaction
    isMobileRef.current = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build the initial nodes layout
    const initializeNodes = (w: number, h: number) => {
      nodesRef.current = NODES_DATA.map((n, idx) => {
        const tx = w * n.rx;
        const ty = h * n.ry;
        return {
          ...n,
          x: tx + (Math.random() - 0.5) * 40,
          y: ty + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0,
          radius: isMobileRef.current ? 16 : 22,
          targetX: tx,
          targetY: ty,
          pulsePhase: Math.random() * Math.PI * 2,
          driftOffset: idx * 4,
        };
      });
    };

    // Resize observer
    let isFirstResize = true;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          dimRef.current = { w: width * dpr, h: height * dpr, dpr };
          
          if (isFirstResize) {
            isFirstResize = false;
            initializeNodes(width * dpr, height * dpr);
          } else {
            // Update node anchors proportionally without jumping
            nodesRef.current.forEach((n) => {
              const originalData = NODES_DATA.find((od) => od.id === n.id);
              if (originalData) {
                n.targetX = width * dpr * originalData.rx;
                n.targetY = height * dpr * originalData.ry;
              }
            });
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse coordinates tracking (Bypassing React state writes!)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dimRef.current.dpr;
      const y = (e.clientY - rect.top) * dimRef.current.dpr;
      mouseRef.current = { x, y, px: e.clientX - rect.left, py: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
      dragNodeRef.current = null;
      setHoveredNode(null);
    };

    const handleMouseDown = () => {
      const mouse = mouseRef.current;
      if (!mouse) return;
      // Check if mouse clicked inside a node to initiate drag
      for (const node of nodesRef.current) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius * 1.5) {
          dragNodeRef.current = node;
          break;
        }
      }
    };

    const handleMouseUp = () => {
      dragNodeRef.current = null;
    };

    // Touch event helpers
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) * dimRef.current.dpr;
      const y = (t.clientY - rect.top) * dimRef.current.dpr;
      mouseRef.current = { x, y, px: t.clientX - rect.left, py: t.clientY - rect.top };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handleTouchMove(e);
      handleMouseDown();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleMouseUp);

    // Vector drawing helpers for blockchain outlines (Crisp 2D Paths)
    const drawSymbol = (c: CanvasRenderingContext2D, name: string, x: number, y: number, r: number) => {
      c.strokeStyle = "currentColor";
      c.lineWidth = 1.5 * dimRef.current.dpr;
      c.lineJoin = "round";

      if (name === "ETH") {
        // Octahedron
        const h = r * 0.9;
        c.beginPath();
        // Top pyramid
        c.moveTo(x, y - h);
        c.lineTo(x + r * 0.55, y);
        c.lineTo(x, y + h * 0.2);
        c.lineTo(x - r * 0.55, y);
        c.lineTo(x, y - h);
        c.lineTo(x, y + h * 0.2);
        // Center diagonals
        c.moveTo(x - r * 0.55, y);
        c.lineTo(x + r * 0.55, y);
        // Bottom pyramid
        c.moveTo(x, y + h * 0.2);
        c.lineTo(x + r * 0.55, y);
        c.lineTo(x, y + h);
        c.lineTo(x - r * 0.55, y);
        c.lineTo(x, y + h * 0.2);
        c.stroke();
      } else if (name === "BTC") {
        // Stylized minimal B
        c.beginPath();
        c.font = `bold ${Math.round(r * 1.15)}px monospace`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "currentColor";
        c.fillText("₿", x, y + 0.5 * dimRef.current.dpr);
      } else if (name === "SOL") {
        // Solana diagonal parallel slash polygons
        const w = r * 0.6;
        const h = r * 0.15;
        const drawSlash = (dy: number) => {
          c.beginPath();
          c.moveTo(x - w * 0.5 + dy * 2.5, y + dy);
          c.lineTo(x + w * 0.5 + dy * 2.5, y + dy);
          c.lineTo(x + w * 0.3 + dy * 2.5, y + dy + h);
          c.lineTo(x - w * 0.7 + dy * 2.5, y + dy + h);
          c.closePath();
          c.fill();
        };
        c.fillStyle = "currentColor";
        drawSlash(-r * 0.4);
        drawSlash(-r * 0.05);
        drawSlash(r * 0.3);
      } else if (name === "SUI") {
        // Sui Teardrop logo
        c.beginPath();
        c.moveTo(x, y - r * 0.85);
        c.bezierCurveTo(x + r * 0.65, y - r * 0.2, x + r * 0.5, y + r * 0.6, x, y + r * 0.85);
        c.bezierCurveTo(x - r * 0.5, y + r * 0.6, x - r * 0.65, y - r * 0.2, x, y - r * 0.85);
        c.stroke();
      } else if (name === "POLYGON") {
        // Polygon hexagon link
        c.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 6;
          const px = x + Math.cos(angle) * r * 0.75;
          const py = y + Math.sin(angle) * r * 0.75;
          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.closePath();
        c.stroke();
        // Inner connected links
        c.beginPath();
        c.arc(x - r * 0.25, y - r * 0.1, 2 * dimRef.current.dpr, 0, Math.PI * 2);
        c.arc(x + r * 0.25, y + r * 0.1, 2 * dimRef.current.dpr, 0, Math.PI * 2);
        c.fillStyle = "currentColor";
        c.fill();
      } else if (name === "NEAR") {
        // Near uppercase N
        c.beginPath();
        c.lineWidth = 2 * dimRef.current.dpr;
        c.moveTo(x - r * 0.4, y + r * 0.55);
        c.lineTo(x - r * 0.4, y - r * 0.55);
        c.lineTo(x + r * 0.4, y + r * 0.55);
        c.lineTo(x + r * 0.4, y - r * 0.55);
        c.stroke();
      } else if (name === "TON") {
        // TON paper airplane delta diamond
        const h = r * 0.8;
        c.beginPath();
        c.moveTo(x, y - h * 0.8);
        c.lineTo(x + r * 0.7, y + h * 0.4);
        c.lineTo(x - r * 0.7, y + h * 0.4);
        c.closePath();
        c.stroke();
        // Split line
        c.beginPath();
        c.moveTo(x, y - h * 0.4);
        c.lineTo(x, y + h * 0.4);
        c.stroke();
      }
    };

    // Occasional dynamic packet pulses along connections
    let packetTimer = 0;
    interface TravelingPacket {
      from: string;
      to: string;
      progress: number;
      speed: number;
    }
    let packets: TravelingPacket[] = [];

    // Animation frame render loop
    let frameId = 0;
    let time = 0;

    const render = () => {
      frameId = requestAnimationFrame(render);

      // Freeze execution if tab is inactive OR canvas is offscreen
      if (document.hidden || !inView) return;

      const { w, h, dpr } = dimRef.current;
      time++;
      ctx.clearRect(0, 0, w, h);

      const isDay = document.documentElement.classList.contains("day-mode");
      const mouse = mouseRef.current;
      const nodeList = nodesRef.current;

      // ── 1. SPAWN DATA PACKETS ──
      packetTimer++;
      if (packetTimer > (isMobileRef.current ? 350 : 160)) {
        packetTimer = 0;
        if (nodeList.length > 0) {
          const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
          packets.push({
            from: conn.from,
            to: conn.to,
            progress: 0,
            speed: 0.008 + Math.random() * 0.008,
          });
        }
      }

      // Update data packet trajectories
      packets = packets.filter((p) => {
        p.progress += p.speed;
        return p.progress < 1.0;
      });

      // ── 2. COMPUTE PHYSICS & SPRING CONSTANTS ──
      for (let i = 0; i < nodeList.length; i++) {
        const n = nodeList[i];

        if (n === dragNodeRef.current && mouse) {
          // Absolute cursor dragging
          n.vx = 0;
          n.vy = 0;
          n.x = mouse.x;
          n.y = mouse.y;
        } else {
          // Gentle idle drift coordinates oscillation
          let driftX = 0;
          let driftY = 0;
          if (!reducedMotionRef.current) {
            const wave = time * 0.015 + n.driftOffset;
            driftX = Math.sin(wave) * 0.4 * dpr;
            driftY = Math.cos(wave * 0.8) * 0.4 * dpr;
          }

          // Hooke's spring limits pulling back to designated target coordinates
          n.vx += (n.targetX + driftX - n.x) * 0.022;
          n.vy += (n.targetY + driftY - n.y) * 0.022;

          // Node-to-node Verlet Repulsion bounds
          for (let j = 0; j < nodeList.length; j++) {
            if (i === j) continue;
            const other = nodeList[j];
            const dx = n.x - other.x;
            const dy = n.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (n.radius + other.radius) * 2.8;
            if (dist < minDist && dist > 0) {
              const pushForce = Math.max(0, minDist - dist) * 0.016;
              n.vx += (dx / dist) * pushForce;
              n.vy += (dy / dist) * pushForce;
            }
          }

          // Magnetic hover attraction pull (Disabled on mobile)
          if (!isMobileRef.current && mouse) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const magnetRadius = 140 * dpr;
            if (dist < magnetRadius && dist > 0) {
              const pull = ((magnetRadius - dist) / magnetRadius) * 0.28;
              n.vx += (mouse.x - n.x) * pull * 0.05;
              n.vy += (mouse.y - n.y) * pull * 0.05;
            }
          }

          // Clamp physics velocities and damp to prevent infinite jitter
          n.vx *= 0.92;
          n.vy *= 0.92;

          if (Math.abs(n.vx) < 0.005) n.vx = 0;
          if (Math.abs(n.vy) < 0.005) n.vy = 0;

          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // Check current hover node index and update HTML overlay positioning
      let currentHover: NetworkNode | null = null;
      if (mouse) {
        for (const n of nodeList) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < n.radius * 1.5) {
            currentHover = n;
            break;
          }
        }
      }

      if (currentHover !== hoveredNode) {
        setHoveredNode(currentHover);
      }

      // Position the absolute HTML hover card dynamically using DOM refs
      if (currentHover && cardRef.current) {
        const scaleX = mouse!.px;
        const scaleY = mouse!.py;
        // Float the card slightly above and right of cursor
        cardRef.current.style.transform = `translate3d(${scaleX + 16}px, ${scaleY - 140}px, 0)`;
        cardRef.current.style.opacity = "1";
        cardRef.current.style.visibility = "visible";
      } else if (cardRef.current) {
        cardRef.current.style.opacity = "0";
        cardRef.current.style.visibility = "hidden";
      }

      // ── 3. DRAW INTERCONNECTION EDGES ──
      ctx.lineWidth = 0.85 * dpr;
      for (const conn of CONNECTIONS) {
        const fromNode = nodeList.find((n) => n.id === conn.from);
        const toNode = nodeList.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) continue;

        ctx.strokeStyle = isDay
          ? "rgba(100, 100, 110, 0.05)"
          : "rgba(255, 255, 255, 0.07)";
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }

      // Draw active traveling data packets
      for (const p of packets) {
        const fromNode = nodeList.find((n) => n.id === p.from);
        const toNode = nodeList.find((n) => n.id === p.to);
        if (!fromNode || !toNode) continue;

        const px = fromNode.x + (toNode.x - fromNode.x) * p.progress;
        const py = fromNode.y + (toNode.y - fromNode.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.0 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isDay ? "var(--color-amber)" : "var(--color-cyan)";
        ctx.fill();
      }

      // ── 4. DRAW NODES ──
      for (const n of nodeList) {
        const isNodeHovered = currentHover?.id === n.id;
        
        // Dynamic breathing halo glow scaling (No shadowBlur!)
        n.pulsePhase += 0.015;
        const glowRadius = n.radius * (isNodeHovered ? 2.6 : 2.0 + Math.sin(n.pulsePhase) * 0.15);

        // Pre-drawn soft radial glow halos (GPU friendly!)
        const gradient = ctx.createRadialGradient(n.x, n.y, n.radius * 0.4, n.x, n.y, glowRadius);
        if (isDay) {
          gradient.addColorStop(0, "rgba(0, 0, 0, 0.015)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        } else {
          const glowColor = n.id === "btc" || n.id === "sol" ? "rgba(255, 94, 58, 0.08)" : "rgba(0, 217, 255, 0.05)";
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node outline rings
        ctx.strokeStyle = isNodeHovered
          ? (n.id === "btc" || n.id === "sol" ? "var(--color-amber-bright)" : "var(--color-cyan)")
          : (isDay ? "var(--color-border)" : "var(--color-border-bright)");
        ctx.lineWidth = (isNodeHovered ? 2.0 : 1.0) * dpr;
        
        ctx.fillStyle = isDay ? "var(--color-surface)" : "var(--color-void)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner ecosystem icon/logo outline
        ctx.save();
        ctx.fillStyle = isNodeHovered
          ? (n.id === "btc" || n.id === "sol" ? "var(--color-amber-bright)" : "var(--color-cyan)")
          : (isDay ? "var(--color-text-secondary)" : "var(--color-text-muted)");
        ctx.strokeStyle = ctx.fillStyle;
        drawSymbol(ctx, n.name, n.x, n.y, n.radius * 0.55);
        ctx.restore();

        // Orbiting status telemetry particles
        const particleCount = isMobileRef.current ? 0 : (isNodeHovered ? 4 : 2);
        for (let idx = 0; idx < particleCount; idx++) {
          const orbitAngle = time * 0.018 + (idx * Math.PI * 2) / particleCount + n.driftOffset;
          const orbitRadius = n.radius * 1.5;
          const ox = n.x + Math.cos(orbitAngle) * orbitRadius;
          const oy = n.y + Math.sin(orbitAngle) * orbitRadius;
          
          ctx.beginPath();
          ctx.arc(ox, oy, 1.0 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = isNodeHovered
            ? (n.id === "btc" || n.id === "sol" ? "var(--color-amber)" : "var(--color-cyan)")
            : (isDay ? "rgba(100, 100, 110, 0.3)" : "rgba(255,255,255,0.15)");
          ctx.fill();
        }
      }
    };

    // Lazy initialization
    render();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="panel relative w-full overflow-hidden group select-none h-[420px] md:h-[480px]"
      style={{
        background: "var(--color-surface)",
        contain: "layout paint style"
      }}
    >
      {/* Background Obsidian-style CSS Dot-Grid (0 Canvas repaints!) */}
      <div 
        className="absolute inset-0 bg-grid opacity-[0.25] dark:opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Decorative Telemetry Borders & Grid Coordinates */}
      <div className="absolute top-3 left-4 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col gap-0.5 z-10">
        <span>SYS.MONITOR // DECENTRALIZED_TOPOLOGY</span>
        <span>GRID_COORD // 48E.92N</span>
      </div>

      <div className="absolute top-3 right-4 pointer-events-none font-mono text-[7.5px] text-[var(--color-online)] flex items-center gap-1.5 z-10 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)]" />
        <span>INFRA_MONITOR // STABLE</span>
      </div>

      <div className="panel-header flex items-center justify-between z-10 relative">
        <span className="panel-title">⬤ &nbsp;network_map.exe</span>
        <span
          style={{
            fontSize: "8.5px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          ACTIVE_SYSTEMS // 7 NODES
        </span>
      </div>

      {/* Razor-sharp DPR Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "crosshair"
        }}
      />

      {/* Absolute HTML Telemetry Overlay Card (0 React re-renders!) */}
      <div
        ref={cardRef}
        className="absolute pointer-events-none z-30 font-mono text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] p-4 flex flex-col gap-2.5 transition-opacity transition-visibility duration-200"
        style={{
          width: "220px",
          opacity: 0,
          visibility: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          left: 0,
          top: 0,
          willChange: "transform",
          borderRadius: "1px"
        }}
      >
        {hoveredNode && (
          <>
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-1.5">
              <span style={{ color: "var(--color-text-primary)", fontWeight: "bold" }}>NETWORK: {hoveredNode.name}</span>
              <span style={{ 
                color: hoveredNode.status === "ACTIVE" ? "var(--color-online-bright)" : "var(--color-text-muted)",
                fontSize: "8.5px",
                border: `1px solid ${hoveredNode.status === "ACTIVE" ? "var(--color-online)" : "var(--color-border)"}44`,
                padding: "1px 5px",
                background: "rgba(0,0,0,0.05)"
              }}>[ {hoveredNode.status} ]</span>
            </div>
            
            <div className="flex flex-col gap-1.5 text-[9.5px]">
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>ROLE: </span>
                <span style={{ color: "var(--color-text-secondary)" }}>{hoveredNode.role}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>FOCUS: </span>
                <span style={{ color: "var(--color-text-secondary)" }}>{hoveredNode.focus}</span>
              </div>
              <div className="flex justify-between mt-1 pt-1.5 border-t border-[var(--color-border)]">
                <span style={{ color: "var(--color-text-muted)" }}>ACTIVITY:</span>
                <span style={{ 
                  color: hoveredNode.activity === "CRITICAL" ? "var(--color-error)" : (hoveredNode.activity === "HIGH" ? "var(--color-amber-bright)" : "var(--color-cyan)")
                }}>{hoveredNode.activity}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-3 left-4 pointer-events-none font-mono text-[7px] flex flex-col gap-0.5 text-[var(--color-text-muted)] z-10">
        <span>CLICK + DRAG TO ARRANGE TOPOLOGY</span>
        <span>HOVER TO INITIATE TELEMETRY LINK</span>
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] z-10">
        <span>VERLET_REPULSION // Hooke&apos;s_Law</span>
      </div>
    </div>
  );
}

export const NetworkMap = memo(NetworkMapComponent);
