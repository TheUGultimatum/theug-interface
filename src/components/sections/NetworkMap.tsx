"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";

/* ═══════════════════════════════════════════════════════════
   TYPE DEFINITIONS
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
  cssSize: number;    // CSS px diameter of the visible circle
  tier: 1 | 2 | 3;
  x: number; y: number;       // canvas-space coordinates
  vx: number; vy: number;
  targetX: number; targetY: number;
  angleOffset: number;
  driftPhase: number;
}

interface Packet {
  from: string; to: string;
  t: number; speed: number;
}

/* ═══════════════════════════════════════════════════════════
   NODE DEFINITIONS
   Polar coordinates: baseAngle (radians), baseDist (pixels at 1x scale)
   Tier 1 = largest & closest, Tier 3 = smallest & most detached
═══════════════════════════════════════════════════════════ */
const RAW_NODES = [
  {
    id: "eth", label: "ETH",
    role: "Smart Contract Core",
    belief: "Decentralized compute coordination — the substrate for autonomous systems.",
    interest: "AI Agents · DeFi Infrastructure · Smart Contracts",
    status: "ACTIVE" as const,
    baseAngle: 4.85,  baseDist: 115, cssSize: 96, tier: 1 as const,
  },
  {
    id: "btc", label: "BTC",
    role: "Security Anchor",
    belief: "The immutable digital reserve layer. Value without counterparty risk.",
    interest: "Store of Value · Proof of Work · Self Custody",
    status: "ONLINE" as const,
    baseAngle: 3.40,  baseDist: 220, cssSize: 84, tier: 2 as const,
  },
  {
    id: "sol", label: "SOL",
    role: "High-Speed Execution",
    belief: "Parallel throughput at hardware speed. Latency kills real products.",
    interest: "High Throughput · Consumer DApps · NFT Infra",
    status: "ACTIVE" as const,
    baseAngle: 0.38,  baseDist: 130, cssSize: 90, tier: 1 as const,
  },
  {
    id: "polygon", label: "POLYGON",
    role: "L2 Scaling Layer",
    belief: "Aggregated liquidity at ZK speed. The modular settlement fabric.",
    interest: "ZK Rollups · EVM Scaling · Modular Infrastructure",
    status: "SYNCED" as const,
    baseAngle: 4.25,  baseDist: 175, cssSize: 76, tier: 2 as const,
  },
  {
    id: "sui", label: "SUI",
    role: "Parallel Object State",
    belief: "Memory-safe ownership model — the engineering thesis for next-gen chains.",
    interest: "Move Language · Object Model · Parallel Execution",
    status: "SYNCED" as const,
    baseAngle: 1.10,  baseDist: 185, cssSize: 72, tier: 2 as const,
  },
  {
    id: "near", label: "NEAR",
    role: "Chain Abstraction",
    belief: "User-first abstraction across all chains — the AI coordination fabric.",
    interest: "Account Aggregation · NEAR AI · Interop",
    status: "ONLINE" as const,
    baseAngle: 2.55,  baseDist: 170, cssSize: 76, tier: 2 as const,
  },
  {
    id: "ton", label: "TON",
    role: "Social & Messaging Layer",
    belief: "Consumer crypto at Telegram scale — the gateway to mass onchain adoption.",
    interest: "MiniApps · Social Infrastructure · Telegram Ecosystem",
    status: "ONLINE" as const,
    baseAngle: 5.55,  baseDist: 230, cssSize: 72, tier: 3 as const,
  },
];

const EDGES = [
  { a: "core", b: "eth" },
  { a: "core", b: "btc" },
  { a: "core", b: "sol" },
  { a: "core", b: "near" },
  { a: "core", b: "ton" },
  { a: "eth",  b: "polygon" },
  { a: "eth",  b: "btc" },
  { a: "sol",  b: "sui" },
  { a: "near", b: "sui" },
];

/* ═══════════════════════════════════════════════════════════
   TOKEN ACCENT COLORS  —  slightly boosted for visibility
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
   INLINE SVG LOGOS
   Each receives explicit pixel dimensions to guarantee rendering.
   fill="currentColor" inherits from parent <div> color prop.
═══════════════════════════════════════════════════════════ */
function LogoBTC({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 64 64" fill="currentColor">
      <path d="M42.4 27.2c.7-4.4-2.7-6.8-7.4-8.4l1.5-6-3.7-.9-1.5 5.8c-1-.2-2-.4-3-.7l1.5-5.9-3.7-.9-1.5 6c-.8-.2-1.6-.4-2.4-.5l-5.2-1.3-1 4s2.7.6 2.7.7c1.5.4 1.8 1.4 1.7 2.2l-4.1 16.5c-.3.8-1.2 1.9-3 1.4l-2.7-.7-1.8 4.3 4.9 1.2c.9.2 1.8.5 2.7.7l-1.5 6.1 3.7.9 1.5-6c1 .3 2 .6 3 .8l-1.5 6 3.7.9 1.5-6.1c6.4 1.2 11.2.7 13.2-5.1 1.6-4.6-.6-7.3-3.9-9 2.7-.6 4.7-2.4 5.3-5.9zm-9.3 13.1c-1.1 4.6-9 2.1-11.5 1.5l2.1-8.3c2.5.6 10.6 1.9 9.4 6.8zm1.2-13.3c-1 4.2-7.5 2.1-9.6 1.6l1.9-7.5c2.1.5 8.8 1.5 7.7 5.9z"/>
    </svg>
  );
}

function LogoETH({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 256 417" fill="currentColor">
      <path d="M127.96 0L125.17 9.5V285.17l2.79 2.78L256 212.28 127.96 0z" opacity="0.6"/>
      <path d="M127.96 0L0 212.28l127.96 74.98V0z" opacity="0.4"/>
      <path d="M127.96 311.7l-1.58 1.93v96.77l1.58 4.6L256 236.8l-128.04 74.9z" opacity="0.6"/>
      <path d="M127.96 417V311.7L0 236.8l127.96 180.2z" opacity="0.4"/>
      <path d="M127.96 287.26L256 212.28l-128.04-58.7v133.68z" opacity="0.8"/>
      <path d="M0 212.28l127.96 74.98V153.58L0 212.28z" opacity="0.6"/>
    </svg>
  );
}

function LogoSOL({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 397 311" fill="currentColor">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" opacity="0.85"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" opacity="0.7"/>
    </svg>
  );
}

function LogoSUI({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 36 44" fill="currentColor">
      <path d="M24.5 9.4L18 2 11.5 9.4C8.9 12.2 7.2 16 7.2 20.2c0 4 1.5 7.5 4 10.2L18 38l6.8-7.6c2.5-2.7 4-6.2 4-10.2 0-4.2-1.7-8-4.3-10.8z" opacity="0.8"/>
      <path d="M18 15c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" fill="var(--color-surface)"/>
      <path d="M18 17c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
    </svg>
  );
}

function LogoPOLYGON({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 38 33" fill="currentColor">
      <path d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21.2 13l-3.7 2.1-5.4 2.8c-.7.4-1.6.4-2.4 0l-4.2-2.5c-.7-.4-1.2-1.2-1.2-2.1V8.8c0-.8.4-1.7 1.2-2.1l4.2-2.4c.7-.4 1.6-.4 2.4 0l4.2 2.4c.7.4 1.2 1.2 1.2 2.1v2.8l3.7-2.2V6.6c0-.8-.4-1.7-1.2-2.1L14.1.7c-.7-.4-1.6-.4-2.4 0L5.5 4.6C4.7 5 4.3 5.8 4.3 6.6v7.8c0 .8.4 1.7 1.2 2.1l6.2 3.6c.7.4 1.6.4 2.4 0l5.4-2.7 3.7-2.2 5.4-2.7c.7-.4 1.6-.4 2.4 0l4.2 2.4c.7.4 1.2 1.2 1.2 2.1v4.4c0 .8-.4 1.7-1.2 2.1l-4.1 2.5c-.7.4-1.6.4-2.4 0l-4.2-2.5c-.7-.4-1.2-1.2-1.2-2.1v-2.8L18 21v2.8c0 .8.4 1.7 1.2 2.1l6.2 3.6c.7.4 1.6.4 2.4 0l6.2-3.6c.7-.4 1.2-1.2 1.2-2.1v-7.8c0-.8-.4-1.7-1.2-2.1L29 10.2z"/>
    </svg>
  );
}

function LogoNEAR({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 90 90" fill="currentColor">
      <path d="M72.2 4.6L53.4 32.2c-1.3 1.9 1.2 4.2 3 2.6l17.8-15.2c.5-.4 1.2-.1 1.2.6v49.7c0 .7-.8 1-1.3.5L22.7 4.2c-2.6-3-6.4-4.8-10.5-4.8h-1.7C4.7-.6 0 4.1 0 9.9v70.2c0 5.8 4.7 10.5 10.5 10.5 3.8 0 7.3-2.1 9.1-5.4l18.8-27.6c1.3-1.9-1.2-4.2-3-2.6L17.6 70.2c-.5.4-1.2.1-1.2-.6V19.9c0-.7.8-1 1.3-.5l51.4 66.2c2.6 3.3 6.6 5.3 10.7 5.3h.7c5.8 0 10.5-4.7 10.5-10.5V9.9C91 4.1 86.3-.6 80.5-.6c-3.6 0-7 1.9-8.3 5.2z"/>
    </svg>
  );
}

function LogoTON({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 56 56" fill="currentColor">
      <path d="M28 3.4C13.8 3.4 2.4 14.8 2.4 29S13.8 54.6 28 54.6 53.6 43.2 53.6 29 42.2 3.4 28 3.4zm12 12.3l-4 18.8c-.3 1.3-1.1 1.7-2.2 1l-6-4.5-2.9 2.8c-.3.3-.6.6-1.2.6l.4-6.2 11.2-10.1c.5-.4-.1-.7-.8-.3L21 28.6l-6-1.9c-1.3-.4-1.3-1.3.3-1.9l23.5-9c1.1-.4 2 .3 1.6 2z" opacity="0.85"/>
    </svg>
  );
}

function LogoCORE({ px }: { px: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={px} height={px} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="5.5" fill="currentColor" opacity="0.9"/>
      <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" fill="none"/>
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="0.6" opacity="0.2" strokeDasharray="3 4" fill="none"/>
      <path d="M20 4v5M20 31v5M4 20h5M31 20h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
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

  // viewport guard
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const initNodes = useCallback((cssW: number, cssH: number, dpr: number) => {
    const w = cssW * dpr, h = cssH * dpr;
    const cx = w / 2, cy = h / 2;
    corePosRef.current = { x: cx, y: cy };
    const refScale = Math.min(cssW / 900, cssH / 520);
    nodesRef.current = RAW_NODES.map((d, i) => {
      const dist = d.baseDist * refScale * dpr;
      const tx = cx + Math.cos(d.baseAngle) * dist;
      const ty = cy + Math.sin(d.baseAngle) * dist;
      return {
        ...d,
        x: tx + (Math.random() - 0.5) * 12,
        y: ty + (Math.random() - 0.5) * 12,
        vx: 0, vy: 0,
        targetX: tx, targetY: ty,
        angleOffset: 0,
        driftPhase: i * 0.9,
      } as PhysicsNode;
    });
  }, []);

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
          const cx = (cssW * dpr) / 2;
          const cy = (cssH * dpr) / 2;
          const refScale = Math.min(cssW / 900, cssH / 520);
          corePosRef.current = { x: cx, y: cy };
          nodesRef.current.forEach(n => {
            const dist = n.baseDist * refScale * dpr;
            n.targetX = cx + Math.cos(n.baseAngle + n.angleOffset) * dist;
            n.targetY = cy + Math.sin(n.baseAngle + n.angleOffset) * dist;
          });
        }
      }
    });
    ro.observe(wrap);

    /* pointer events */
    const getCanvasXY = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left) * dimRef.current.dpr,
        y: (clientY - r.top)  * dimRef.current.dpr,
      };
    };
    const onMove = (e: MouseEvent) => {
      const p = getCanvasXY(e.clientX, e.clientY);
      if (dragRef.current && mouseRef.current) dragVelRef.current = { vx: p.x - mouseRef.current.x, vy: p.y - mouseRef.current.y };
      mouseRef.current = p;
    };
    const onLeave = () => {
      if (dragRef.current) { dragRef.current.vx = dragVelRef.current.vx; dragRef.current.vy = dragVelRef.current.vy; dragRef.current = null; }
      mouseRef.current = null; setHoveredId(null);
    };
    const pickNode = () => {
      const m = mouseRef.current; if (!m) return;
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        const hitR = (n.cssSize / 2 + 10) * dimRef.current.dpr;
        if ((n.x - m.x) ** 2 + (n.y - m.y) ** 2 < hitR * hitR) {
          dragRef.current = n; dragVelRef.current = { vx: 0, vy: 0 }; return;
        }
      }
    };
    const relNode = () => { if (dragRef.current) { dragRef.current.vx = dragVelRef.current.vx; dragRef.current.vy = dragVelRef.current.vy; dragRef.current = null; } };
    const tPos = (e: TouchEvent) => { if (!e.touches.length) return; const t = e.touches[0]; const p = getCanvasXY(t.clientX, t.clientY); if (dragRef.current && mouseRef.current) dragVelRef.current = { vx: p.x - mouseRef.current.x, vy: p.y - mouseRef.current.y }; mouseRef.current = p; };
    const tStart = (e: TouchEvent) => { if (!e.touches.length) return; tPos(e); pickNode(); };

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

      /* packets */
      pTimer++;
      if (pTimer > (mobileRef.current ? 140 : 65)) {
        pTimer = 0;
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
        packets.push({ from: edge.a, to: edge.b, t: 0, speed: 0.006 + Math.random() * 0.008 });
      }
      packets = packets.filter(p => { p.t += p.speed; return p.t < 1; });

      /* ── atmosphere ── */
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      if (isDay) {
        g.addColorStop(0,   "rgba(195,188,175,0.12)");
        g.addColorStop(0.5, "rgba(195,188,175,0.04)");
        g.addColorStop(1,   "rgba(255,255,255,0)");
      } else {
        g.addColorStop(0,   "rgba(0,160,240,0.028)");
        g.addColorStop(0.4, "rgba(40,80,180,0.010)");
        g.addColorStop(1,   "rgba(0,0,0,0)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      /* ── radar sweep ── */
      if (!rmRef.current) sweepRef.current = (sweepRef.current + 0.001) % (Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = isDay ? 0.02 : 0.015;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Math.max(w, h) * 0.7, sweepRef.current, sweepRef.current + 0.16);
      ctx.closePath();
      ctx.fillStyle = isDay ? "#1a1a1a" : "#00d9ff";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      /* ── core halo ring ── */
      const coreHaloR = 52 * dpr;
      ctx.save();
      ctx.strokeStyle = isDay ? "rgba(0,0,0,0.06)" : "rgba(0,217,255,0.08)";
      ctx.lineWidth = 0.8 * dpr;
      ctx.setLineDash([4 * dpr, 8 * dpr]);
      ctx.beginPath();
      ctx.arc(cx, cy, coreHaloR, tick * 0.002, tick * 0.002 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* ── physics ── */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n === dragRef.current && mouse) {
          n.vx = 0; n.vy = 0; n.x = mouse.x; n.y = mouse.y;
        } else {
          if (!rmRef.current) n.angleOffset += 0.0003;
          const dist = n.baseDist * refScale * dpr;
          const a    = n.baseAngle + n.angleOffset;
          const drift = rmRef.current ? 0 : Math.sin(tick * 0.008 + n.driftPhase) * 5 * dpr;
          n.targetX = cx + Math.cos(a) * (dist + drift);
          n.targetY = cy + Math.sin(a) * (dist + drift);

          n.vx += (n.targetX - n.x) * 0.018;
          n.vy += (n.targetY - n.y) * 0.018;

          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            const o = nodes[j];
            const dx = n.x - o.x, dy = n.y - o.y;
            const d2 = dx * dx + dy * dy;
            const minD = ((n.cssSize + o.cssSize) / 2 + 24) * dpr;
            if (d2 < minD * minD && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = (minD - d) / minD * 0.025;
              n.vx += (dx / d) * f;
              n.vy += (dy / d) * f;
            }
          }

          if (!mobileRef.current && mouse) {
            const dx = n.x - mouse.x, dy = n.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const mr = 170 * dpr;
            if (d < mr && d > 0.01) {
              const pull = ((mr - d) / mr) * 0.16;
              n.vx += (mouse.x - n.x) * pull * 0.035;
              n.vy += (mouse.y - n.y) * pull * 0.035;
            }
          }

          n.vx *= 0.91; n.vy *= 0.91;
          if (Math.abs(n.vx) < 0.004) n.vx = 0;
          if (Math.abs(n.vy) < 0.004) n.vy = 0;
          n.x += n.vx; n.y += n.vy;
        }
      }

      // position map
      const pos: Record<string, { x: number; y: number }> = { core: { x: cx, y: cy } };
      for (const n of nodes) pos[n.id] = { x: n.x, y: n.y };

      /* ── hover detection ── */
      let hovered: string | null = null;
      if (mouse) {
        const dc = (cx - mouse.x) ** 2 + (cy - mouse.y) ** 2;
        if (dc < (55 * dpr) ** 2) hovered = "core";
        else for (const n of nodes) {
          const dd = (n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2;
          if (dd < ((n.cssSize / 2 + 12) * dpr) ** 2) { hovered = n.id; break; }
        }
      }
      if (hovered !== prevHover) { prevHover = hovered; setHoveredId(hovered); }

      /* ── draw edges ── */
      for (const edge of EDGES) {
        const fp = pos[edge.a], tp = pos[edge.b];
        if (!fp || !tp) continue;
        const hot = hovered === edge.a || hovered === edge.b;

        const grad = ctx.createLinearGradient(fp.x, fp.y, tp.x, tp.y);
        if (isDay) {
          grad.addColorStop(0, hot ? "rgba(20,20,30,0.30)" : "rgba(20,20,30,0.10)");
          grad.addColorStop(1, hot ? "rgba(20,20,30,0.15)" : "rgba(20,20,30,0.04)");
        } else {
          grad.addColorStop(0, hot ? "rgba(0,217,255,0.35)" : "rgba(0,217,255,0.10)");
          grad.addColorStop(1, hot ? "rgba(100,150,255,0.18)" : "rgba(100,150,255,0.03)");
        }

        ctx.save();
        ctx.lineWidth = (hot ? 1.5 : 0.8) * dpr;
        ctx.strokeStyle = grad as unknown as string;
        if (!hot) ctx.setLineDash([3 * dpr, 6 * dpr]);
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);
        ctx.lineTo(tp.x, tp.y);
        ctx.stroke();
        ctx.restore();
      }

      /* ── draw packets ── */
      for (const p of packets) {
        const fp = pos[p.from], tp = pos[p.to];
        if (!fp || !tp) continue;
        const px2 = fp.x + (tp.x - fp.x) * p.t;
        const py2 = fp.y + (tp.y - fp.y) * p.t;

        ctx.beginPath();
        ctx.arc(px2, py2, 2.6 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isDay ? "rgba(200,130,40,0.8)" : "rgba(0,217,255,0.8)";
        ctx.fill();

        const tail = Math.max(0, p.t - 0.08);
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(fp.x + (tp.x - fp.x) * tail, fp.y + (tp.y - fp.y) * tail);
        ctx.lineWidth = 2 * dpr;
        ctx.strokeStyle = isDay ? "rgba(200,130,40,0.25)" : "rgba(0,217,255,0.25)";
        ctx.stroke();
      }

      /* ── node halo glows on canvas (behind DOM nodes) ── */
      for (const n of nodes) {
        const isHot = hovered === n.id;
        if (!isHot) continue;
        const haloR = (n.cssSize / 2 + 20) * dpr;
        const haloGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
        const accent = ACCENT[n.id];
        if (isDay) {
          haloGrad.addColorStop(0, `rgba(0,0,0,0.04)`);
          haloGrad.addColorStop(1, `rgba(0,0,0,0)`);
        } else {
          haloGrad.addColorStop(0, `${accent}18`);
          haloGrad.addColorStop(1, `${accent}00`);
        }
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
        ctx.fill();
      }

      // core halo glow
      if (hovered === "core") {
        const haloR = 55 * dpr;
        const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
        hg.addColorStop(0, isDay ? "rgba(0,0,0,0.05)" : "rgba(0,217,255,0.08)");
        hg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── position core DOM node ── */
      if (coreElRef.current) {
        coreElRef.current.style.transform = `translate(-50%,-50%) translate3d(${cx / dpr}px,${cy / dpr}px,0)`;
        coreElRef.current.style.borderColor = hovered === "core" ? `${ACCENT.core}80` : `${ACCENT.core}30`;
        coreElRef.current.style.boxShadow = hovered === "core"
          ? `0 0 0 2px ${ACCENT.core}40, 0 0 32px ${ACCENT.core}18`
          : `0 1px 8px rgba(0,0,0,0.2)`;
      }

      /* ── position token DOM nodes ── */
      for (const n of nodes) {
        const el = nodeElsRef.current[n.id];
        if (!el) continue;
        el.style.transform = `translate(-50%,-50%) translate3d(${n.x / dpr}px,${n.y / dpr}px,0)`;
        const isHot = hovered === n.id;
        el.style.borderColor = isHot ? `${ACCENT[n.id]}A0` : `${ACCENT[n.id]}40`;
        el.style.boxShadow = isHot
          ? `0 0 0 2.5px ${ACCENT[n.id]}35, 0 6px 28px ${ACCENT[n.id]}25, 0 0 48px ${ACCENT[n.id]}12`
          : `0 1px 8px rgba(0,0,0,0.22)`;
      }

      /* ── hover card ── */
      if (cardRef.current && mouse) {
        const cssx = mouse.x / dpr;
        const cssy = mouse.y / dpr;
        const cw = 260;
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

  /* hover data */
  const hoveredData = hoveredId === "core"
    ? { id: "core", label: "theUG", role: "Operator Core", belief: "Decentralized autonomy and sovereign code.", interest: "AI Systems · Web3 Infrastructure · Autonomous Pipelines", status: "ONLINE" as const }
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
      {/* dot-grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.28,
      }} />

      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 75% 68% at 50% 50%, transparent 30%, var(--color-surface) 100%)",
      }} />

      {/* header */}
      <div className="panel-header flex items-center justify-between z-20 relative">
        <span className="panel-title">⬤ &nbsp;network_map.exe</span>
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "7.5px", color: "var(--color-online)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-online)", display: "inline-block" }} />
          <span>7 ECOSYSTEMS // LIVE</span>
        </div>
      </div>

      {/* CANVAS — z-index 1 */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%", display: "block", zIndex: 1 }} />

      {/* DOM NODES — z-index 10 — ABOVE canvas */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {/* CORE */}
        <div
          ref={coreElRef}
          className="absolute pointer-events-auto"
          style={{
            left: 0, top: 0,
            width: "96px", height: "96px",
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: `1.5px solid ${ACCENT.core}30`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "5px",
            transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
            willChange: "transform, box-shadow, border-color",
            color: ACCENT.core,
            cursor: "default",
            transition: "border-color 200ms ease, box-shadow 200ms ease",
            boxShadow: "0 1px 8px rgba(0,0,0,0.2)",
          }}
        >
          <LogoCORE px={36} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", lineHeight: 1 }}>
            theUG
          </span>
        </div>

        {/* TOKEN NODES */}
        {RAW_NODES.map(n => {
          const logoPx = Math.round(n.cssSize * 0.52);
          return (
            <div
              key={n.id}
              ref={el => { nodeElsRef.current[n.id] = el; }}
              className="absolute pointer-events-auto"
              style={{
                left: 0, top: 0,
                width: `${n.cssSize}px`, height: `${n.cssSize}px`,
                borderRadius: "50%",
                background: "var(--color-surface)",
                border: `1.5px solid ${ACCENT[n.id]}40`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: `${Math.max(3, Math.round(n.cssSize * 0.04))}px`,
                transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
                willChange: "transform, border-color, box-shadow",
                color: ACCENT[n.id],
                cursor: "grab",
                transition: "border-color 200ms ease, box-shadow 200ms ease",
                boxShadow: "0 1px 8px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {n.id === "btc"     && <LogoBTC px={logoPx} />}
                {n.id === "eth"     && <LogoETH px={logoPx} />}
                {n.id === "sol"     && <LogoSOL px={logoPx} />}
                {n.id === "sui"     && <LogoSUI px={logoPx} />}
                {n.id === "polygon" && <LogoPOLYGON px={logoPx} />}
                {n.id === "near"    && <LogoNEAR px={logoPx} />}
                {n.id === "ton"     && <LogoTON px={logoPx} />}
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: `${Math.round(n.cssSize * 0.13)}px`,
                color: "var(--color-text-secondary)",
                letterSpacing: "0.10em",
                lineHeight: 1,
                fontWeight: 500,
              }}>
                {n.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* HOVER CARD — z-index 40 */}
      <div
        ref={cardRef}
        style={{
          position: "absolute", left: 0, top: 0,
          zIndex: 40, width: "260px",
          pointerEvents: "none",
          willChange: "transform",
          transform: "translate3d(-9999px,-9999px,0)",
          opacity: hoveredData ? 1 : 0,
          visibility: hoveredData ? "visible" : "hidden",
          transition: "opacity 180ms ease",
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accent, opacity: 0.85 }} />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "15px", letterSpacing: "0.03em" }}>{hoveredData.label}</span>
                </div>
                <span style={{ fontSize: "8px", color: sc, border: `1px solid ${sc}`, padding: "2px 8px", letterSpacing: "0.10em", opacity: 0.8 }}>{hoveredData.status}</span>
              </div>
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "5px" }}>ROLE</div>
                <div style={{ fontSize: "11.5px", color: "var(--color-text-primary)", lineHeight: 1.5 }}>{hoveredData.role}</div>
              </div>
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "5px" }}>BELIEF</div>
                <div style={{ fontSize: "10.5px", color: "var(--color-text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{hoveredData.belief}&rdquo;</div>
              </div>
              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "6px" }}>INTEREST</div>
                <div style={{ fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.8 }}>{hoveredData.interest}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* legend */}
      <div className="absolute bottom-3 left-4 pointer-events-none" style={{ zIndex: 20, fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--color-text-muted)" }}>
        DRAG NODES TO ARRANGE · HOVER TO EXPLORE
      </div>
    </div>
  );
}

export const NetworkMap = memo(NetworkMapComponent);
