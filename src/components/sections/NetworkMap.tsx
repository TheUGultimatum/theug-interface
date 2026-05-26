"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   Adding spatial depth coefficient to nodes (0.8 to 1.15)
═══════════════════════════════════════════════════════════ */
interface PhysicsNode {
  id: string;
  label: string;
  role: string;
  belief: string;
  interest: string;
  status: "ACTIVE" | "ONLINE" | "SYNCED";
  baseAngle: number;
  baseDist: number;
  cssSize: number;    // Base CSS diameter
  tier: 1 | 2 | 3;
  depth: number;      // Cinematic depth (foreground: 1.15, mid: 1.0, background: 0.8)
  x: number; y: number;
  vx: number; vy: number;
  targetX: number; targetY: number;
  angleOffset: number;
  driftPhase: number;
}

interface Packet {
  from: string; to: string;
  t: number; speed: number;
  type: "primary" | "secondary" | "weak";
}

/* ═══════════════════════════════════════════════════════════
   DELIBERATE ASYMMETRIC TOPOLOGY & HIERARCHY DEFINITIONS
   Base distances are scaled dynamically based on screen size.
   z-levels (depth) establish spatial parallax layers.
═══════════════════════════════════════════════════════════ */
const RAW_NODES = [
  {
    id: "eth", label: "ETH",
    role: "Smart Contract Core",
    belief: "Decentralized compute coordination — the substrate for autonomous systems.",
    interest: "AI Agents · DeFi Infrastructure · Smart Contracts",
    status: "ACTIVE" as const,
    baseAngle: 4.80,  baseDist: 110, cssSize: 88, tier: 1 as const,
    depth: 1.15,      // Foreground / Largest secondary core
  },
  {
    id: "sol", label: "SOL",
    role: "High-Speed Execution",
    belief: "Parallel throughput at hardware speed. Latency kills real products.",
    interest: "High Throughput · Consumer DApps · NFT Infra",
    status: "ACTIVE" as const,
    baseAngle: 0.20,  baseDist: 145, cssSize: 82, tier: 1 as const,
    depth: 1.10,      // Foreground / High execution speed
  },
  {
    id: "btc", label: "BTC",
    role: "Security Anchor",
    belief: "The immutable digital reserve layer. Value without counterparty risk.",
    interest: "Store of Value · Proof of Work · Self Custody",
    status: "ONLINE" as const,
    baseAngle: 3.45,  baseDist: 200, cssSize: 80, tier: 2 as const,
    depth: 0.85,      // Background / Detached Reserve Anchor
  },
  {
    id: "polygon", label: "POLYGON",
    role: "L2 Scaling Layer",
    belief: "Aggregated liquidity at ZK speed. The modular settlement fabric.",
    interest: "ZK Rollups · EVM Scaling · Modular Infrastructure",
    status: "SYNCED" as const,
    baseAngle: 4.35,  baseDist: 180, cssSize: 72, tier: 2 as const,
    depth: 0.90,      // Background / L2 scaling hub close to ETH
  },
  {
    id: "sui", label: "SUI",
    role: "Parallel Object State",
    belief: "Memory-safe ownership model — the engineering thesis for next-gen chains.",
    interest: "Move Language · Object Model · Parallel Execution",
    status: "SYNCED" as const,
    baseAngle: 0.80,  baseDist: 225, cssSize: 70, tier: 2 as const,
    depth: 1.00,      // Midground / Connected execution core
  },
  {
    id: "near", label: "NEAR",
    role: "Chain Abstraction",
    belief: "User-first abstraction across all chains — the AI coordination fabric.",
    interest: "Account Aggregation · NEAR AI · Interop",
    status: "ONLINE" as const,
    baseAngle: 2.65,  baseDist: 175, cssSize: 76, tier: 2 as const,
    depth: 1.00,      // Midground / Abstraction interface
  },
  {
    id: "ton", label: "TON",
    role: "Social & Messaging Layer",
    belief: "Consumer crypto at Telegram scale — the gateway to mass onchain adoption.",
    interest: "MiniApps · Social Infrastructure · Telegram Ecosystem",
    status: "ONLINE" as const,
    baseAngle: 5.65,  baseDist: 245, cssSize: 74, tier: 3 as const,
    depth: 0.80,      // Background / Detached Social Branch
  },
];

/* ═══════════════════════════════════════════════════════════
   CONNECTION PRIORITIES FOR VISUAL STORYTELLING
═══════════════════════════════════════════════════════════ */
const EDGES = [
  { a: "core", b: "eth", type: "primary" as const },
  { a: "core", b: "sol", type: "primary" as const },
  { a: "eth",  b: "polygon", type: "primary" as const },
  
  { a: "core", b: "near", type: "secondary" as const },
  { a: "sol",  b: "sui", type: "secondary" as const },
  { a: "near", b: "sui", type: "secondary" as const },
  
  { a: "core", b: "btc", type: "weak" as const },
  { a: "core", b: "ton", type: "weak" as const },
  { a: "eth",  b: "btc", type: "weak" as const },
];

/* ═══════════════════════════════════════════════════════════
   ECOSYSTEM BRAND ACCENT COLORS (LOW SATURATION / Sleek Tones)
═══════════════════════════════════════════════════════════ */
const ACCENT: Record<string, string> = {
  core:    "#A0A8B8",
  btc:     "#D4A24C",
  eth:     "#7BA3D0",
  polygon: "#9370CC",
  sol:     "#A08CE8",
  sui:     "#5AAED5",
  near:    "#8E8E8E",
  ton:     "#4E90C8",
};

/* ═══════════════════════════════════════════════════════════
   MAIN VISUALIZATION COMPONENT
═══════════════════════════════════════════════════════════ */
function NetworkMapComponent() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const coreElRef  = useRef<HTMLDivElement>(null);
  const nodeElsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [inView,    setInView]    = useState(false);

  const nodesRef    = useRef<PhysicsNode[]>([]);
  const corePosRef  = useRef({ x: 0, y: 0 });
  const dimRef      = useRef({ w: 900, h: 500, dpr: 1 });
  const mouseRef    = useRef<{ x: number; y: number } | null>(null);
  const dragRef     = useRef<PhysicsNode | null>(null);
  const dragVelRef  = useRef({ vx: 0, vy: 0 });
  const mobileRef   = useRef(false);
  const rmRef       = useRef(false);
  const sweepRef    = useRef(0);

  // Viewport intersection observer to save CPU cycles
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Initialize node coordinate mapping
  const initNodes = useCallback((cssW: number, cssH: number, dpr: number) => {
    const w = cssW * dpr, h = cssH * dpr;
    // CINEMATIC ASYMMETRY: Center Core Node is deliberately left-heavy (42% width, 53% height)
    const cx = w * 0.42, cy = h * 0.53;
    corePosRef.current = { x: cx, y: cy };
    
    const refScale = Math.min(cssW / 900, cssH / 520);
    const mobileScale = mobileRef.current ? 0.78 : 1.0;
    
    nodesRef.current = RAW_NODES.map((d, i) => {
      const dist = d.baseDist * refScale * dpr * mobileScale;
      const tx = cx + Math.cos(d.baseAngle) * dist;
      const ty = cy + Math.sin(d.baseAngle) * dist;
      
      return {
        ...d,
        x: tx + (Math.random() - 0.5) * 20 * dpr,
        y: ty + (Math.random() - 0.5) * 20 * dpr,
        vx: 0, vy: 0,
        targetX: tx, targetY: ty,
        angleOffset: 0,
        driftPhase: i * 1.35,
      } as PhysicsNode;
    });
  }, []);

  // Primary requestAnimationFrame render and physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    mobileRef.current = window.matchMedia("(hover:none)and(pointer:coarse)").matches || window.innerWidth < 768;
    rmRef.current     = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    let firstResize = true;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width: cssW, height: cssH } = e.contentRect;
        if (cssW < 1 || cssH < 1) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = cssW * dpr;
        canvas.height = cssH * dpr;
        canvas.style.width  = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
        dimRef.current = { w: cssW * dpr, h: cssH * dpr, dpr };

        if (firstResize) {
          firstResize = false;
          initNodes(cssW, cssH, dpr);
        } else {
          const cx = (cssW * dpr) * 0.42;
          const cy = (cssH * dpr) * 0.53;
          const refScale = Math.min(cssW / 900, cssH / 520);
          const mobileScale = mobileRef.current ? 0.78 : 1.0;
          corePosRef.current = { x: cx, y: cy };
          
          nodesRef.current.forEach(n => {
            const dist = n.baseDist * refScale * dpr * mobileScale;
            n.targetX = cx + Math.cos(n.baseAngle + n.angleOffset) * dist;
            n.targetY = cy + Math.sin(n.baseAngle + n.angleOffset) * dist;
          });
        }
      }
    });
    ro.observe(wrap);

    /* Pointer coordinates map */
    const getCanvasXY = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left) * dimRef.current.dpr,
        y: (clientY - r.top)  * dimRef.current.dpr,
      };
    };
    
    const onMove = (e: MouseEvent) => {
      const p = getCanvasXY(e.clientX, e.clientY);
      if (dragRef.current && mouseRef.current) {
        dragVelRef.current = { vx: p.x - mouseRef.current.x, vy: p.y - mouseRef.current.y };
      }
      mouseRef.current = p;
    };
    
    const onLeave = () => {
      if (dragRef.current) {
        dragRef.current.vx = dragVelRef.current.vx;
        dragRef.current.vy = dragVelRef.current.vy;
        dragRef.current = null;
      }
      mouseRef.current = null;
      setHoveredId(null);
    };
    
    const pickNode = () => {
      const m = mouseRef.current;
      if (!m) return;
      
      const mobileScale = mobileRef.current ? 0.78 : 1.0;
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        const hitR = ((n.cssSize * mobileScale) / 2 + 12) * dimRef.current.dpr;
        if ((n.x - m.x) ** 2 + (n.y - m.y) ** 2 < hitR * hitR) {
          dragRef.current = n;
          dragVelRef.current = { vx: 0, vy: 0 };
          return;
        }
      }
    };
    
    const relNode = () => {
      if (dragRef.current) {
        dragRef.current.vx = dragVelRef.current.vx;
        dragRef.current.vy = dragVelRef.current.vy;
        dragRef.current = null;
      }
    };
    
    const tPos = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      const p = getCanvasXY(t.clientX, t.clientY);
      if (dragRef.current && mouseRef.current) {
        dragVelRef.current = { vx: p.x - mouseRef.current.x, vy: p.y - mouseRef.current.y };
      }
      mouseRef.current = p;
    };
    
    const tStart = (e: TouchEvent) => {
      if (!e.touches.length) return;
      tPos(e);
      pickNode();
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousedown", pickNode);
    window.addEventListener("mouseup", relNode);
    canvas.addEventListener("touchmove", tPos, { passive: true });
    canvas.addEventListener("touchstart", tStart, { passive: true });
    window.addEventListener("touchend", relNode);

    let packets: Packet[] = [];
    let pTimer = 0;
    let raf = 0, tick = 0;
    let prevHover: string | null = null;

    // RAF Core animation loop
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || !inView) return;

      const { w, h, dpr } = dimRef.current;
      tick++;
      ctx.clearRect(0, 0, w, h);

      const isDay = document.documentElement.classList.contains("day-mode");
      const mouse = mouseRef.current;
      const nodes = nodesRef.current;
      const cx = corePosRef.current.x;
      const cy = corePosRef.current.y;
      
      const cssW = w / dpr, cssH = h / dpr;
      const refScale = Math.min(cssW / 900, cssH / 520);
      const mobileScale = mobileRef.current ? 0.78 : 1.0;

      /* Visual Packets Flow along priorities */
      pTimer++;
      const packetCooldown = mobileRef.current ? 120 : 55;
      if (pTimer > packetCooldown) {
        pTimer = 0;
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
        
        // Skip packet rendering on weak edges on mobile
        if (!(mobileRef.current && edge.type === "weak")) {
          packets.push({
            from: edge.a, to: edge.b,
            t: 0,
            speed: 0.005 + Math.random() * 0.006,
            type: edge.type
          });
        }
      }
      packets = packets.filter(p => {
        p.t += p.speed;
        return p.t < 1;
      });

      /* ── 1. Atmosphere tuning per theme ── */
      ctx.save();
      const atmosphereGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.58);
      if (isDay) {
        atmosphereGrad.addColorStop(0,   "rgba(215, 210, 198, 0.14)");
        atmosphereGrad.addColorStop(0.5, "rgba(215, 210, 198, 0.04)");
        atmosphereGrad.addColorStop(1,   "rgba(255, 255, 255, 0)");
      } else {
        atmosphereGrad.addColorStop(0,   "rgba(0, 217, 255, 0.024)");
        atmosphereGrad.addColorStop(0.4, "rgba(20, 60, 140, 0.008)");
        atmosphereGrad.addColorStop(1,   "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = atmosphereGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      /* ── 2. Cinematic Radar Telemetry Sweep ── */
      if (!rmRef.current) {
        sweepRef.current = (sweepRef.current + 0.0009) % (Math.PI * 2);
      }
      ctx.save();
      ctx.globalAlpha = isDay ? 0.016 : 0.012;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Math.max(w, h) * 0.65, sweepRef.current, sweepRef.current + 0.14);
      ctx.closePath();
      ctx.fillStyle = isDay ? "#1a1a24" : "#00d9ff";
      ctx.fill();
      ctx.restore();

      /* ── 3. Active-Idle Breathing & Physics Engine ── */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        
        if (n === dragRef.current && mouse) {
          n.vx = 0; n.vy = 0;
          n.x = mouse.x; n.y = mouse.y;
        } else {
          // Continuous orbit drift offset
          if (!rmRef.current) {
            n.angleOffset += 0.0002;
          }
          
          const dist = n.baseDist * refScale * dpr * mobileScale;
          const a    = n.baseAngle + n.angleOffset;
          
          // Organic sine wave breathing, scaled down for background depth layers
          const driftSpeed = 0.003 + n.depth * 0.0015;
          const driftAmp = 11 * dpr * n.depth * (isDay ? 0.8 : 1.0);
          const driftX = rmRef.current ? 0 : Math.cos(tick * driftSpeed + n.driftPhase) * driftAmp;
          const driftY = rmRef.current ? 0 : Math.sin(tick * (driftSpeed * 1.15) + n.driftPhase) * driftAmp;
          
          n.targetX = cx + Math.cos(a) * dist + driftX;
          n.targetY = cy + Math.sin(a) * dist + driftY;

          // Hooke's Law Spring. Foreground nodes (high depth) are slightly stiffer/more dynamic.
          n.vx += (n.targetX - n.x) * 0.016 * n.depth;
          n.vy += (n.targetY - n.y) * 0.016 * n.depth;

          // Spatial node-node repulsion (skipped on mobile to optimize CPU)
          if (!mobileRef.current) {
            for (let j = 0; j < nodes.length; j++) {
              if (i === j) continue;
              const o = nodes[j];
              const dx = n.x - o.x;
              const dy = n.y - o.y;
              const d2 = dx * dx + dy * dy;
              const minD = ((n.cssSize + o.cssSize) / 2 + 30) * dpr;
              
              if (d2 < minD * minD && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const f = ((minD - d) / minD) * 0.025;
                n.vx += (dx / d) * f;
                n.vy += (dy / d) * f;
              }
            }
          }

          // Gentle pointer magnetism (skipped on mobile)
          if (!mobileRef.current && mouse) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const mr = 160 * dpr;
            
            if (d < mr && d > 0.01) {
              const pull = ((mr - d) / mr) * 0.14;
              // Foreground nodes pulled more noticeably, creating parallax
              n.vx += (mouse.x - n.x) * pull * 0.035 * n.depth;
              n.vy += (mouse.y - n.y) * pull * 0.035 * n.depth;
            }
          }

          n.vx *= 0.91;
          n.vy *= 0.91;
          if (Math.abs(n.vx) < 0.003) n.vx = 0;
          if (Math.abs(n.vy) < 0.003) n.vy = 0;
          
          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // Position maps for connection drawing
      const pos: Record<string, { x: number; y: number; depth: number }> = {
        core: { x: cx, y: cy, depth: 1.0 }
      };
      for (const n of nodes) {
        pos[n.id] = { x: n.x, y: n.y, depth: n.depth };
      }

      /* ── 4. Pointer Hover Detection ── */
      let hovered: string | null = null;
      if (mouse) {
        const dc = (cx - mouse.x) ** 2 + (cy - mouse.y) ** 2;
        if (dc < (50 * dpr) ** 2) {
          hovered = "core";
        } else {
          for (const n of nodes) {
            const dd = (n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2;
            const hitRadius = ((n.cssSize * mobileScale) / 2 + 10) * dpr;
            if (dd < hitRadius * hitRadius) {
              hovered = n.id;
              break;
            }
          }
        }
      }
      if (hovered !== prevHover) {
        prevHover = hovered;
        setHoveredId(hovered);
      }

      /* ── 5. Renders Connections by Priority & Depth Layers ── */
      for (const edge of EDGES) {
        // Mobile Mode optimization: hide weak connections to declutter viewport
        if (mobileRef.current && edge.type === "weak") continue;

        const fp = pos[edge.a];
        const tp = pos[edge.b];
        if (!fp || !tp) continue;
        
        const hot = hovered === edge.a || hovered === edge.b;
        const lineDepthScale = Math.min(fp.depth, tp.depth);

        ctx.save();
        
        // Canvas stroke weight modulated dynamically by layer depth
        if (edge.type === "primary") {
          ctx.lineWidth = (hot ? 2.2 : 1.25) * dpr * lineDepthScale;
        } else if (edge.type === "secondary") {
          ctx.lineWidth = (hot ? 1.6 : 0.8) * dpr * lineDepthScale;
          ctx.setLineDash([5 * dpr, 6 * dpr]);
        } else {
          ctx.lineWidth = (hot ? 1.0 : 0.45) * dpr * lineDepthScale;
          ctx.setLineDash([1.5 * dpr, 5 * dpr]); // Dotted look
        }

        // Color mapping per theme
        const grad = ctx.createLinearGradient(fp.x, fp.y, tp.x, tp.y);
        if (isDay) {
          if (edge.type === "primary") {
            grad.addColorStop(0, hot ? "rgba(40,40,50,0.45)" : "rgba(40,40,50,0.18)");
            grad.addColorStop(1, hot ? "rgba(40,40,50,0.30)" : "rgba(40,40,50,0.08)");
          } else if (edge.type === "secondary") {
            grad.addColorStop(0, hot ? "rgba(40,40,50,0.32)" : "rgba(40,40,50,0.10)");
            grad.addColorStop(1, hot ? "rgba(40,40,50,0.20)" : "rgba(40,40,50,0.04)");
          } else {
            grad.addColorStop(0, hot ? "rgba(40,40,50,0.18)" : "rgba(40,40,50,0.04)");
            grad.addColorStop(1, hot ? "rgba(40,40,50,0.10)" : "rgba(40,40,50,0.01)");
          }
        } else {
          if (edge.type === "primary") {
            grad.addColorStop(0, hot ? "rgba(0,217,255,0.45)" : "rgba(0,217,255,0.18)");
            grad.addColorStop(1, hot ? "rgba(100,150,255,0.28)" : "rgba(100,150,255,0.08)");
          } else if (edge.type === "secondary") {
            grad.addColorStop(0, hot ? "rgba(0,217,255,0.30)" : "rgba(0,217,255,0.11)");
            grad.addColorStop(1, hot ? "rgba(100,150,255,0.18)" : "rgba(100,150,255,0.04)");
          } else {
            grad.addColorStop(0, hot ? "rgba(0,217,255,0.15)" : "rgba(0,217,255,0.04)");
            grad.addColorStop(1, hot ? "rgba(100,150,255,0.08)" : "rgba(100,150,255,0.01)");
          }
        }

        ctx.strokeStyle = grad as unknown as string;
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);
        ctx.lineTo(tp.x, tp.y);
        ctx.stroke();
        ctx.restore();
      }

      /* ── 6. Renders Traffic Flow Packets ── */
      for (const p of packets) {
        const fp = pos[p.from];
        const tp = pos[p.to];
        if (!fp || !tp) continue;
        
        const px = fp.x + (tp.x - fp.x) * p.t;
        const py = fp.y + (tp.y - fp.y) * p.t;
        const lineDepthScale = Math.min(fp.depth, tp.depth);

        ctx.save();
        ctx.beginPath();
        
        // Packets on primary paths are larger and brighter
        let pRadius = 2.4 * dpr * lineDepthScale;
        let trailLength = 0.08;
        if (p.type === "primary") {
          pRadius = 3.2 * dpr * lineDepthScale;
          trailLength = 0.12;
        } else if (p.type === "weak") {
          pRadius = 1.4 * dpr * lineDepthScale;
          trailLength = 0.04;
        }

        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDay ? "rgba(40, 60, 100, 0.7)" : "rgba(0, 217, 255, 0.85)";
        ctx.fill();

        // Packet tail trails
        const tail = Math.max(0, p.t - trailLength);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(fp.x + (tp.x - fp.x) * tail, fp.y + (tp.y - fp.y) * tail);
        ctx.lineWidth = (p.type === "primary" ? 2.5 : p.type === "secondary" ? 1.4 : 0.8) * dpr * lineDepthScale;
        ctx.strokeStyle = isDay ? "rgba(40, 60, 100, 0.22)" : "rgba(0, 217, 255, 0.28)";
        ctx.stroke();
        ctx.restore();
      }

      /* ── 7. DOM Translation Positioning (Free of React loops) ── */
      if (coreElRef.current) {
        coreElRef.current.style.transform = `translate(-50%,-50%) translate3d(${cx / dpr}px,${cy / dpr}px,0)`;
      }

      for (const n of nodes) {
        const el = nodeElsRef.current[n.id];
        if (!el) continue;
        el.style.transform = `translate(-50%,-50%) translate3d(${n.x / dpr}px,${n.y / dpr}px,0)`;
      }

      /* ── 8. Hover Telemetry Card Tracker ── */
      if (cardRef.current && mouse) {
        const cssx = mouse.x / dpr;
        const cssy = mouse.y / dpr;
        const cw = 262;
        const offX = (cssx + cw + 28 > cssW) ? -(cw + 14) : 20;
        cardRef.current.style.transform = `translate3d(${cssx + offX}px,${Math.max(16, cssy - 180)}px,0)`;
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousedown", pickNode);
      window.removeEventListener("mouseup", relNode);
      canvas.removeEventListener("touchmove", tPos);
      canvas.removeEventListener("touchstart", tStart);
      window.removeEventListener("touchend", relNode);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, initNodes]);

  const hoveredData = hoveredId === "core"
    ? { id: "core", label: "theUG", role: "Operator Core", belief: "Decentralized autonomy and sovereign infrastructure code.", interest: "AI Systems · Web3 Infrastructure · Autonomous Pipelines", status: "ONLINE" as const }
    : RAW_NODES.find(n => n.id === hoveredId) ?? null;

  return (
    <div
      ref={wrapRef}
      className="panel relative w-full overflow-hidden select-none"
      style={{
        height: "clamp(460px, 56vw, 580px)",
        background: "var(--color-surface)",
        contain: "layout paint style",
        cursor: "crosshair",
      }}
    >
      {/* Dynamic Keyframes Definitions inside self-contained Style block */}
      <style>{`
        @keyframes rotate-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-breathing {
          0%, 100% { transform: scale(0.97); opacity: 0.35; }
          50% { transform: scale(1.05); opacity: 0.58; }
        }
        .animate-rotate-cw {
          animation: rotate-cw 22s linear infinite;
        }
        .animate-rotate-ccw {
          animation: rotate-ccw 32s linear infinite;
        }
        .animate-pulse-breathing {
          animation: pulse-breathing 4.5s ease-in-out infinite;
        }

        /* Highly optimized GPU composite style chains */
        .node-container {
          box-shadow: 0 4px 14px rgba(0,0,0,0.16);
          will-change: border-color, box-shadow, transform;
        }
        .node-container:hover {
          border-color: currentColor !important;
          box-shadow: 0 10px 32px rgba(0,0,0,0.32) !important;
          transform: scale(1.15) !important; /* Overrides target depth scale on hover */
        }
        .node-glow-halo {
          transform: scale(1);
          will-change: transform, opacity;
        }
        .node-container:hover .node-glow-halo {
          transform: scale(1.28) !important;
          opacity: 0.95 !important;
        }
        .node-logo-wrap {
          opacity: 0.65;
          filter: grayscale(0.4) brightness(1.0);
          will-change: opacity, filter, transform;
        }
        .node-container:hover .node-logo-wrap {
          opacity: 1 !important;
          filter: grayscale(0) brightness(1.15) !important;
          transform: scale(1.08) !important;
        }
        .node-label {
          color: var(--color-text-secondary);
          opacity: 0.85;
          transition: color 300ms ease, opacity 300ms ease;
        }
        .node-container:hover .node-label {
          color: var(--color-text-primary) !important;
          opacity: 1 !important;
        }

        /* Core styling */
        .core-container {
          transition: border-color 300ms ease, box-shadow 300ms ease;
          will-change: border-color, box-shadow;
        }
        .core-container:hover {
          border-color: ${ACCENT.core}65 !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.22) !important;
        }
        .core-container:hover .core-ring-inner {
          border-color: ${ACCENT.core}60 !important;
          animation-duration: 9s !important;
        }
        .core-container:hover .core-ring-outer {
          border-color: ${ACCENT.core}35 !important;
          animation-duration: 14s !important;
        }
        .core-container:hover .core-glyph {
          color: var(--color-online-bright) !important;
        }

        /* Dual theme visual overrides */
        .day-mode .node-container {
          border-color: rgba(40, 40, 50, 0.08) !important;
          background: #fcfbfa !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }
        .day-mode .node-container:hover {
          border-color: currentColor !important;
        }
        .day-mode .core-container {
          border-color: rgba(40, 40, 50, 0.08) !important;
          background: #fcfbfa !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }
        .day-mode .core-container:hover {
          border-color: ${ACCENT.core}75 !important;
        }
        .day-mode .node-glow-halo {
          background: radial-gradient(circle, rgba(0,0,0,0.025) 0%, rgba(0,0,0,0) 70%) !important;
        }
        .day-mode .core-glow {
          background: radial-gradient(circle, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 70%) !important;
        }
        .day-mode .node-logo-wrap {
          filter: grayscale(0.5) brightness(0.95);
        }
        .day-mode .node-container:hover .node-logo-wrap {
          filter: grayscale(0) brightness(1.0) !important;
        }
      `}</style>

      {/* Grid Canvas Background Layer */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.28,
      }} />

      {/* Atmospheric Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 75% 68% at 50% 50%, transparent 30%, var(--color-surface) 100%)",
      }} />

      {/* Header telemetry info */}
      <div className="panel-header flex items-center justify-between z-20 relative">
        <span className="panel-title">⬤ &nbsp;network_map.exe</span>
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "7.5px", color: "var(--color-online)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-online)", display: "inline-block" }} />
          <span>7 ECOSYSTEM INFRASTRUCTURE LAYER MAP // ONLINE</span>
        </div>
      </div>

      {/* CANVAS ELEMENT — z-index 1 */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%", display: "block", zIndex: 1 }} />

      {/* DOM OVERLAYS CONTAINER — z-index 10 */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        
        {/* ==================================================
            CENTRAL IDENTITY CUSTOM CORE NODE
            ================================================== */}
        <div
          ref={coreElRef}
          className="absolute pointer-events-auto core-container"
          style={{
            left: 0, top: 0,
            width: "100px", height: "100px",
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: `1.5px solid ${ACCENT.core}22`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
            willChange: "transform, border-color",
            color: ACCENT.core,
            cursor: "default",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            zIndex: 11,
          }}
        >
          {/* Rotating Concentric Rings */}
          <div className="absolute inset-0 pointer-events-none core-ring-inner animate-rotate-cw" style={{
            border: `1.2px dashed ${ACCENT.core}18`,
            borderRadius: "50%",
            margin: "6px",
          }} />
          
          <div className="absolute inset-0 pointer-events-none core-ring-outer animate-rotate-ccw" style={{
            border: `0.8px dashed ${ACCENT.core}10`,
            borderRadius: "50%",
            margin: "-6px",
          }} />

          {/* Dynamic Breathing Halo */}
          <div className="absolute pointer-events-none core-glow animate-pulse-breathing" style={{
            inset: "-35px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT.core}12 0%, ${ACCENT.core}00 70%)`,
            zIndex: -1,
          }} />

          {/* Branded Operator Glyph */}
          <span className="core-glyph" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "19px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "0.05em",
            lineHeight: 1,
            opacity: 0.9,
            transition: "color 300ms ease, transform 300ms ease",
          }}>
            [ ⏽ ]
          </span>

          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "8px",
            color: "var(--color-text-muted)",
            letterSpacing: "0.10em",
            lineHeight: 1,
            marginTop: "6px",
            textTransform: "uppercase",
          }}>
            theUG
          </span>
        </div>

        {/* ==================================================
            ECOSYSTEM TOKEN NODES
            ================================================== */}
        {RAW_NODES.map(n => {
          const logoPx = Math.round(n.cssSize * 0.44);
          
          return (
            <div
              key={n.id}
              ref={el => { nodeElsRef.current[n.id] = el; }}
              className="absolute pointer-events-auto"
              style={{
                left: 0, top: 0,
                transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
                willChange: "transform",
                cursor: "grab",
                zIndex: n.depth > 1.1 ? 14 : n.depth < 0.9 ? 8 : 10,
              }}
            >
              {/* Composite-friendly inner node box */}
              <div
                className="node-container flex flex-col items-center justify-center"
                style={{
                  position: "relative",
                  width: `${n.cssSize}px`, height: `${n.cssSize}px`,
                  borderRadius: "50%",
                  background: "var(--color-surface)",
                  border: `1.5px solid ${ACCENT[n.id]}22`,
                  color: ACCENT[n.id],
                  transition: "border-color 300ms ease, box-shadow 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: `scale(${n.depth})`, // Initial depth scale
                }}
              >
                {/* GPU-composited Glow Halo absolute element */}
                <div
                  className="absolute pointer-events-none node-glow-halo"
                  style={{
                    inset: "-32px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT[n.id]}18 0%, ${ACCENT[n.id]}00 70%)`,
                    opacity: 0.35,
                    transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: -1,
                  }}
                />

                {/* Next.js optimized preloaded logo */}
                <div className="node-logo-wrap flex items-center justify-center" style={{
                  position: "relative",
                  width: `${logoPx}px`, height: `${logoPx}px`,
                  transition: "opacity 300ms ease, filter 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}>
                  <Image
                    src={`/logos/${n.id}.svg`}
                    alt={n.label}
                    width={logoPx}
                    height={logoPx}
                    priority
                    unoptimized // SVGs are light vector shapes and don't need raster optimization
                    style={{ objectFit: "contain", display: "block" }}
                  />
                </div>

                {/* Mono branding label */}
                <span className="node-label" style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: `${Math.round(n.cssSize * 0.125)}px`,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  fontWeight: 500,
                  marginTop: `${Math.round(n.cssSize * 0.045)}px`,
                }}>
                  {n.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================
          HOVER TELEMETRY COMPOSITE PANEL
          ================================================== */}
      <div
        ref={cardRef}
        style={{
          position: "absolute", left: 0, top: 0,
          zIndex: 40, width: "262px",
          pointerEvents: "none",
          willChange: "transform",
          transform: "translate3d(-9999px,-9999px,0)",
          opacity: hoveredData ? 1 : 0,
          visibility: hoveredData ? "visible" : "hidden",
          transition: "opacity 160ms ease",
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border-bright)",
          padding: "18px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {hoveredData && (() => {
          const accent = ACCENT[hoveredData.id];
          const sc = hoveredData.status === "ACTIVE" || hoveredData.status === "ONLINE" ? "var(--color-online-bright)" : "var(--color-text-muted)";
          return (
            <div style={{ fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "11px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: accent, opacity: 0.85 }} />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "14.5px", letterSpacing: "0.03em" }}>{hoveredData.label}</span>
                </div>
                <span style={{ marginLeft: "auto", fontSize: "8px", color: sc, border: `1px solid ${sc}`, padding: "2px 8px", letterSpacing: "0.10em", opacity: 0.85 }}>{hoveredData.status}</span>
              </div>
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "4px" }}>ROLE</div>
                <div style={{ fontSize: "11.5px", color: "var(--color-text-primary)", lineHeight: 1.45 }}>{hoveredData.role}</div>
              </div>
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "4px" }}>BELIEF</div>
                <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;{hoveredData.belief}&rdquo;</div>
              </div>
              <div style={{ paddingTop: "11px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "5px" }}>FOCUS AREA</div>
                <div style={{ fontSize: "9.5px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>{hoveredData.interest}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend guide */}
      <div className="absolute bottom-3 left-4 pointer-events-none" style={{ zIndex: 20, fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
        DRAG NODES TO ARRANGE · HOVER TO ENGAGE TELEMETRY
      </div>
    </div>
  );
}

export const NetworkMap = memo(NetworkMapComponent);
