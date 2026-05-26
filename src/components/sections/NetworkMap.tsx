"use client";

import React, { useEffect, useRef, useState, memo, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface PhysicsNode {
  id: string;
  label: string;
  role: string;
  belief: string;
  interest: string;
  status: "ACTIVE" | "ONLINE" | "SYNCED";
  baseAngle: number;
  baseDist: number;  // px at 1× scale
  radius: number;    // px (CSS)
  tier: 1 | 2 | 3;
  x: number; y: number;
  vx: number; vy: number;
  targetX: number; targetY: number;
  angleOffset: number;
  driftPhase: number;
}

interface Packet { from: string; to: string; t: number; speed: number; }

/* ─────────────────────────────────────────────────────────────
   NODE DATA  (polar anchors, all relative to center)
───────────────────────────────────────────────────────────── */
const RAW_NODES = [
  {
    id: "btc", label: "BTC",
    role: "Security Anchor",
    belief: "The immutable reserve layer. Value without counterparty risk.",
    interest: "Store of Value · Proof of Work · Self Custody",
    status: "ONLINE" as const,
    baseAngle: 3.40, baseDist: 200, radius: 40, tier: 2 as const,
  },
  {
    id: "eth", label: "ETH",
    role: "Smart Contract Core",
    belief: "Decentralized compute coordination — the substrate for autonomous systems.",
    interest: "AI Agents · DeFi · Smart Contracts",
    status: "ACTIVE" as const,
    baseAngle: 4.85, baseDist: 105, radius: 46, tier: 1 as const,
  },
  {
    id: "polygon", label: "POLYGON",
    role: "L2 Scaling Layer",
    belief: "Aggregated liquidity at ZK speed. The modular settlement fabric.",
    interest: "ZK Rollups · EVM Scaling · Modular Infra",
    status: "SYNCED" as const,
    baseAngle: 4.25, baseDist: 158, radius: 36, tier: 2 as const,
  },
  {
    id: "sol", label: "SOL",
    role: "High-Speed Execution",
    belief: "Parallel throughput at hardware speed. Latency kills real products.",
    interest: "High TPS · Consumer DApps · NFT Infrastructure",
    status: "ACTIVE" as const,
    baseAngle: 0.38, baseDist: 118, radius: 42, tier: 1 as const,
  },
  {
    id: "sui", label: "SUI",
    role: "Parallel Object State",
    belief: "Memory-safe ownership model — the engineering thesis for next-gen chains.",
    interest: "Move Language · Object Model · Parallel Exec",
    status: "SYNCED" as const,
    baseAngle: 1.10, baseDist: 165, radius: 34, tier: 2 as const,
  },
  {
    id: "near", label: "NEAR",
    role: "Chain Abstraction",
    belief: "User-first abstraction across all chains — the AI coordination fabric.",
    interest: "Account Aggregation · NEAR AI · Interop",
    status: "ONLINE" as const,
    baseAngle: 2.55, baseDist: 152, radius: 36, tier: 2 as const,
  },
  {
    id: "ton", label: "TON",
    role: "Social & Messaging Layer",
    belief: "Consumer crypto at Telegram scale — the gateway to mass onchain adoption.",
    interest: "MiniApps · Social Infra · Telegram Ecosystem",
    status: "ONLINE" as const,
    baseAngle: 5.55, baseDist: 210, radius: 34, tier: 3 as const,
  },
];

const EDGES = [
  { a: "core", b: "btc"  },
  { a: "core", b: "eth"  },
  { a: "core", b: "sol"  },
  { a: "core", b: "near" },
  { a: "core", b: "ton"  },
  { a: "eth",  b: "polygon" },
  { a: "eth",  b: "btc"  },
  { a: "sol",  b: "sui"  },
  { a: "near", b: "sui"  },
];

/* ─────────────────────────────────────────────────────────────
   TOKEN ACCENT COLORS — muted monochrome tints
───────────────────────────────────────────────────────────── */
const ACCENT: Record<string, string> = {
  core:    "#909090",
  btc:     "#C8923A",
  eth:     "#6A8EC0",
  polygon: "#8060B0",
  sol:     "#9580D8",
  sui:     "#4E9CC8",
  near:    "#787878",
  ton:     "#3E80B8",
};

/* ─────────────────────────────────────────────────────────────
   INLINE SVG LOGOS — visible, clean, recognizable
───────────────────────────────────────────────────────────── */
const SvgBTC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="60%" height="60%">
    <path d="M16.5 9.5c.3-1.8-1.1-2.8-3-3.4l.6-2.5-1.6-.4-.6 2.3c-.4-.1-.8-.2-1.3-.3l.6-2.4-1.6-.4-.6 2.5c-.3-.1-.7-.2-1-.2l-2.1-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.7.8 1l-.8 3.3h.1l-.8 3.1c-.1.2-.4.4-.7.4l-1.2-.3-.9 1.8 2 .5c.4.1.8.2 1.1.3l-.6 2.5 1.6.4.6-2.5c.4.1.9.2 1.3.3l-.6 2.5 1.6.4.6-2.5c2.7.5 4.7.3 5.5-2.1.7-2-.1-3.1-1.5-3.9.9-.2 1.8-1 2-2.6zm-3.6 5c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.6-5.1c-.5 1.9-3.3.9-4.2.7l.8-3.3c1 .2 3.9.6 3.4 2.6z"/>
  </svg>
);

const SvgETH = () => (
  <svg viewBox="0 0 24 24" fill="none" width="60%" height="60%">
    <path d="M12 2L5 12.5l7 4 7-4L12 2z" fill="currentColor" opacity="0.9"/>
    <path d="M12 2L5 12.5l7-3.8 7 3.8L12 2z" fill="currentColor" opacity="0.4"/>
    <path d="M5 14l7 4 7-4-7 6-7-6z" fill="currentColor" opacity="0.8"/>
  </svg>
);

const SvgSOL = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="62%" height="62%">
    <path d="M4 17.5h13.5l-2.5 2.5H4l2.5-2.5z" opacity="1"/>
    <path d="M4 11h16l-2.5 2.5H4L6.5 11z" opacity="0.7"/>
    <path d="M4 4h13.5L15 6.5H4L6.5 4z" opacity="0.5"/>
  </svg>
);

const SvgSUI = () => (
  <svg viewBox="0 0 24 24" fill="none" width="60%" height="60%">
    <path d="M12 3c-4 0-7 3.8-7 8.5 0 2.6 1 4.9 2.8 6.5L12 22l4.2-4c1.8-1.6 2.8-3.9 2.8-6.5C19 6.8 16 3 12 3z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <circle cx="12" cy="11.5" r="2.5" fill="currentColor"/>
  </svg>
);

const SvgPOLYGON = () => (
  <svg viewBox="0 0 24 24" fill="none" width="60%" height="60%">
    <path d="M15.5 9l-3.5-2-3.5 2v4l3.5 2 3.5-2V9z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8.5 9L5 11v4l3.5 2V9zM15.5 9l3.5 2v4l-3.5 2V9z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6"/>
  </svg>
);

const SvgNEAR = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="58%" height="58%">
    <path d="M6 4h3.2l6.6 10V4H19v16h-3.2L9.2 10V20H6V4z"/>
  </svg>
);

const SvgTON = () => (
  <svg viewBox="0 0 24 24" fill="none" width="60%" height="60%">
    <path d="M12 3L3 9.5l3.5 11.5h11L21 9.5 12 3z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M12 3v18M7 9.5h10" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const SvgCORE = () => (
  <svg viewBox="0 0 32 32" fill="none" width="52%" height="52%">
    <circle cx="16" cy="16" r="4.5" fill="currentColor" opacity="0.9"/>
    <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none"/>
    <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M8.3 8.3l2.8 2.8M20.9 20.9l2.8 2.8M8.3 23.7l2.8-2.8M20.9 11.1l2.8-2.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const LOGO: Record<string, React.ReactNode> = {
  core: <SvgCORE />, btc: <SvgBTC />, eth: <SvgETH />, sol: <SvgSOL />,
  sui: <SvgSUI />, polygon: <SvgPOLYGON />, near: <SvgNEAR />, ton: <SvgTON />,
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
function NetworkMapComponent() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const coreElRef  = useRef<HTMLDivElement>(null);
  const nodeElsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [inView,    setInView]    = useState(false);

  // all mutable physics state in refs — zero React writes inside RAF
  const nodesRef    = useRef<PhysicsNode[]>([]);
  const corePosRef  = useRef({ x: 0, y: 0 });
  const dimRef      = useRef({ w: 900, h: 500, dpr: 1 });
  const mouseRef    = useRef<{ x: number; y: number } | null>(null);
  const dragRef     = useRef<PhysicsNode | null>(null);
  const dragVelRef  = useRef({ vx: 0, vy: 0 });
  const mobileRef   = useRef(false);
  const rmRef       = useRef(false);       // reduced motion
  const sweepRef    = useRef(0);

  // viewport guard — pauses RAF when offscreen
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // stable initNodes so we can call it from ResizeObserver
  const initNodes = useCallback((w: number, h: number) => {
    const cx = w / 2, cy = h / 2;
    corePosRef.current = { x: cx, y: cy };
    const scale = Math.min(w / 900, h / 520);
    nodesRef.current = RAW_NODES.map((d, i) => {
      const dist = d.baseDist * scale;
      const tx   = cx + Math.cos(d.baseAngle) * dist;
      const ty   = cy + Math.sin(d.baseAngle) * dist;
      return {
        ...d,
        x: tx + (Math.random() - 0.5) * 16,
        y: ty + (Math.random() - 0.5) * 16,
        vx: 0, vy: 0,
        targetX: tx, targetY: ty,
        angleOffset: 0,
        driftPhase: i * 0.85,
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

    /* ─── resize ─── */
    let firstResize = true;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width < 1 || height < 1) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = width  * dpr;
        canvas.height = height * dpr;
        canvas.style.width  = `${width}px`;
        canvas.style.height = `${height}px`;
        dimRef.current = { w: width * dpr, h: height * dpr, dpr };

        if (firstResize) { firstResize = false; initNodes(width * dpr, height * dpr); }
        else {
          const scale = Math.min(width / 900, height / 520);
          const cx    = (width * dpr) / 2;
          const cy    = (height * dpr) / 2;
          corePosRef.current = { x: cx, y: cy };
          nodesRef.current.forEach(n => {
            const dist   = n.baseDist * scale * dpr;
            const a      = n.baseAngle + n.angleOffset;
            n.targetX    = cx + Math.cos(a) * dist;
            n.targetY    = cy + Math.sin(a) * dist;
          });
        }
      }
    });
    ro.observe(wrap);

    /* ─── pointer events ─── */
    const px = (cx: number) => (cx - canvas.getBoundingClientRect().left) * dimRef.current.dpr;
    const py = (cy: number) => (cy - canvas.getBoundingClientRect().top)  * dimRef.current.dpr;

    const onMove = (e: MouseEvent) => {
      const x = px(e.clientX), y = py(e.clientY);
      if (dragRef.current && mouseRef.current) {
        dragVelRef.current = { vx: x - mouseRef.current.x, vy: y - mouseRef.current.y };
      }
      mouseRef.current = { x, y };
    };
    const onLeave = () => {
      if (dragRef.current) { dragRef.current.vx = dragVelRef.current.vx; dragRef.current.vy = dragVelRef.current.vy; dragRef.current = null; }
      mouseRef.current = null;
      setHoveredId(null);
    };
    const pickNode = () => {
      const m = mouseRef.current;
      if (!m) return;
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        const hitR = (n.radius + 8) * dimRef.current.dpr;
        if ((n.x - m.x) ** 2 + (n.y - m.y) ** 2 < hitR * hitR) {
          dragRef.current = n; dragVelRef.current = { vx: 0, vy: 0 }; break;
        }
      }
    };
    const relNode = () => {
      if (dragRef.current) { dragRef.current.vx = dragVelRef.current.vx; dragRef.current.vy = dragVelRef.current.vy; dragRef.current = null; }
    };

    // touch
    const tPos = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      const x = px(t.clientX), y = py(t.clientY);
      if (dragRef.current && mouseRef.current) dragVelRef.current = { vx: x - mouseRef.current.x, vy: y - mouseRef.current.y };
      mouseRef.current = { x, y };
    };
    const tStart = (e: TouchEvent) => { if (!e.touches.length) return; tPos(e); pickNode(); };

    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousedown",  pickNode);
    window.addEventListener("mouseup",    relNode);
    canvas.addEventListener("touchmove",  tPos,   { passive: true });
    canvas.addEventListener("touchstart", tStart, { passive: true });
    window.addEventListener("touchend",   relNode);

    /* ─── packets ─── */
    let packets: Packet[] = [];
    let pTimer = 0;

    /* ─── RAF ─── */
    let raf = 0, tick = 0;
    let prevHover: string | null = null;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || !inView) return;

      const { w, h, dpr } = dimRef.current;
      tick++;
      ctx.clearRect(0, 0, w, h);

      const isDay  = document.documentElement.classList.contains("day-mode");
      const mouse  = mouseRef.current;
      const nodes  = nodesRef.current;
      const { x: cx, y: cy } = corePosRef.current;
      const scale  = Math.min(w / (900 * dpr), h / (520 * dpr));

      /* ── spawn packets ── */
      pTimer++;
      if (pTimer > (mobileRef.current ? 150 : 72)) {
        pTimer = 0;
        const e = EDGES[Math.floor(Math.random() * EDGES.length)];
        packets.push({ from: e.a, to: e.b, t: 0, speed: 0.007 + Math.random() * 0.009 });
      }
      packets = packets.filter(p => { p.t += p.speed; return p.t < 1; });

      /* ── atmosphere ── */
      const atm = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.62);
      if (isDay) {
        atm.addColorStop(0,   "rgba(200,195,185,0.10)");
        atm.addColorStop(0.6, "rgba(200,195,185,0.03)");
        atm.addColorStop(1,   "rgba(255,255,255,0)");
      } else {
        atm.addColorStop(0,   "rgba(0,200,255,0.022)");
        atm.addColorStop(0.5, "rgba(60,100,200,0.008)");
        atm.addColorStop(1,   "rgba(0,0,0,0)");
      }
      ctx.fillStyle = atm;
      ctx.fillRect(0, 0, w, h);

      /* ── radar sweep ── */
      if (!rmRef.current) sweepRef.current = (sweepRef.current + 0.0010) % (Math.PI * 2);
      const sA = sweepRef.current;
      ctx.save();
      ctx.globalAlpha = isDay ? 0.018 : 0.013;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Math.max(w, h) * 0.75, sA, sA + 0.18);
      ctx.closePath();
      ctx.fillStyle = isDay ? "#1a1a1a" : "#00d9ff";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      /* ── physics ── */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n === dragRef.current && mouse) {
          n.vx = 0; n.vy = 0; n.x = mouse.x; n.y = mouse.y;
        } else {
          if (!rmRef.current) n.angleOffset += 0.0003;
          const dist = n.baseDist * scale * dpr;
          const a    = n.baseAngle + n.angleOffset;
          const drift = rmRef.current ? 0 : Math.sin(tick * 0.009 + n.driftPhase) * 4.5 * dpr;
          n.targetX  = cx + Math.cos(a) * (dist + drift);
          n.targetY  = cy + Math.sin(a) * (dist + drift);

          // spring to anchor
          n.vx += (n.targetX - n.x) * 0.020;
          n.vy += (n.targetY - n.y) * 0.020;

          // inter-node repulsion
          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            const o  = nodes[j];
            const dx = n.x - o.x, dy = n.y - o.y;
            const d2 = dx*dx + dy*dy;
            const minD = (n.radius + o.radius + 20) * dpr;
            if (d2 < minD * minD && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = (minD - d) / minD * 0.030;
              n.vx += (dx/d) * f; n.vy += (dy/d) * f;
            }
          }

          // magnetic pull toward cursor (desktop)
          if (!mobileRef.current && mouse) {
            const dx = n.x - mouse.x, dy = n.y - mouse.y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            const mr = 160 * dpr;
            if (d < mr && d > 0.01) {
              const pull = ((mr - d) / mr) * 0.18;
              n.vx += (mouse.x - n.x) * pull * 0.038;
              n.vy += (mouse.y - n.y) * pull * 0.038;
            }
          }

          n.vx *= 0.915; n.vy *= 0.915;
          if (Math.abs(n.vx) < 0.004) n.vx = 0;
          if (Math.abs(n.vy) < 0.004) n.vy = 0;
          n.x += n.vx; n.y += n.vy;
        }
      }

      /* ── resolve node position into a lookup ── */
      const pos: Record<string, { x: number; y: number }> = { core: { x: cx, y: cy } };
      for (const n of nodes) pos[n.id] = { x: n.x, y: n.y };

      /* ── hover detection ── */
      let hovered: string | null = null;
      if (mouse) {
        const dc = Math.sqrt((cx - mouse.x) ** 2 + (cy - mouse.y) ** 2);
        if (dc < 52 * dpr) { hovered = "core"; }
        else {
          for (const n of nodes) {
            const dx = n.x - mouse.x, dy = n.y - mouse.y;
            if (dx*dx + dy*dy < (n.radius + 10) * dpr * ((n.radius + 10) * dpr)) { hovered = n.id; break; }
          }
        }
      }
      if (hovered !== prevHover) { prevHover = hovered; setHoveredId(hovered); }

      /* ── draw edges ── */
      for (const edge of EDGES) {
        const fp = pos[edge.a], tp = pos[edge.b];
        if (!fp || !tp) continue;
        const isActive = hovered === edge.a || hovered === edge.b;

        const gl = ctx.createLinearGradient(fp.x, fp.y, tp.x, tp.y);
        if (isDay) {
          gl.addColorStop(0, isActive ? "rgba(15,15,20,0.28)" : "rgba(15,15,20,0.08)");
          gl.addColorStop(1, isActive ? "rgba(15,15,20,0.12)" : "rgba(15,15,20,0.03)");
        } else {
          const aCol = isActive ? "rgba(0,217,255,0.30)" : "rgba(0,217,255,0.07)";
          const bCol = isActive ? "rgba(120,160,255,0.15)" : "rgba(120,160,255,0.02)";
          gl.addColorStop(0, aCol); gl.addColorStop(1, bCol);
        }

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth  = (isActive ? 1.4 : 0.8) * dpr;
        ctx.strokeStyle = gl as unknown as string;
        if (!isActive) ctx.setLineDash([3 * dpr, 5 * dpr]);
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
        ctx.arc(px2, py2, 2.4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isDay ? "rgba(180,110,30,0.75)" : "rgba(0,217,255,0.72)";
        ctx.fill();

        // comet tail
        const tail = Math.max(0, p.t - 0.07);
        const tx3 = fp.x + (tp.x - fp.x) * tail;
        const ty3 = fp.y + (tp.y - fp.y) * tail;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(tx3, ty3);
        ctx.lineWidth   = 1.8 * dpr;
        ctx.strokeStyle = isDay ? "rgba(180,110,30,0.22)" : "rgba(0,217,255,0.22)";
        ctx.stroke();
      }

      /* ── position core DOM node ── */
      if (coreElRef.current) {
        const cssCx = cx / dpr;
        const cssCy = cy / dpr;
        coreElRef.current.style.transform = `translate(-50%,-50%) translate3d(${cssCx}px,${cssCy}px,0)`;
        coreElRef.current.style.boxShadow = hovered === "core"
          ? `0 0 0 2px ${ACCENT.core}60, 0 0 28px ${ACCENT.core}20`
          : `0 0 0 1px rgba(255,255,255,0.08)`;
      }

      /* ── position token DOM nodes ── */
      for (const n of nodes) {
        const el = nodeElsRef.current[n.id];
        if (!el) continue;
        const cssx = n.x / dpr;
        const cssy = n.y / dpr;
        el.style.transform = `translate(-50%,-50%) translate3d(${cssx}px,${cssy}px,0)`;

        const isHot = hovered === n.id;
        el.style.borderColor = isHot ? `${ACCENT[n.id]}80` : `${ACCENT[n.id]}28`;
        el.style.boxShadow   = isHot
          ? `0 0 0 2px ${ACCENT[n.id]}30, 0 4px 24px ${ACCENT[n.id]}22, 0 0 40px ${ACCENT[n.id]}10`
          : "0 0 0 1px rgba(255,255,255,0.05)";
      }

      /* ── position hover card ── */
      if (cardRef.current && mouse) {
        const cssx = mouse.x / dpr;
        const cssy = mouse.y / dpr;
        // keep card within bounds
        const cardW = 248;
        const offX  = (cssx + cardW + 24 > w / dpr) ? -(cardW + 12) : 18;
        const offY  = Math.max(-cssy + 12, Math.min(0, h / dpr - cssy - 200));
        cardRef.current.style.transform = `translate3d(${cssx + offX}px,${cssy + offY - 160}px,0)`;
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousedown",  pickNode);
      window.removeEventListener("mouseup",    relNode);
      canvas.removeEventListener("touchmove",  tPos);
      canvas.removeEventListener("touchstart", tStart);
      window.removeEventListener("touchend",   relNode);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, initNodes]);

  /* hover data */
  const hoveredData = hoveredId === "core"
    ? { id: "core", label: "theUG", role: "Operator Core", belief: "Decentralized autonomy and sovereign code.", interest: "AI Systems · Web3 Infra · Autonomous Pipelines", status: "ONLINE" as const }
    : RAW_NODES.find(n => n.id === hoveredId) ?? null;

  const statusColor = (s: string) =>
    s === "ACTIVE" ? "#52e8ff" : s === "ONLINE" ? "#52e8ff" : "#666677";

  return (
    <div
      ref={wrapRef}
      className="panel relative w-full overflow-hidden select-none"
      style={{ height: "clamp(440px,54vw,560px)", background: "var(--color-surface)", contain: "layout paint style", cursor: "crosshair" }}
    >
      {/* CSS dot-grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.32,
      }} />

      {/* vignette fade */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 72% 64% at 50% 52%, transparent 35%, var(--color-surface) 100%)",
      }} />

      {/* panel header */}
      <div className="panel-header flex items-center justify-between z-20 relative">
        <span className="panel-title">⬤ &nbsp;network_map.exe</span>
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "7.5px", color: "var(--color-online)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-online)", display: "inline-block" }} />
          <span>7 ECOSYSTEMS // LIVE</span>
        </div>
      </div>

      {/* Canvas — edges, packets, atmosphere */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%", display: "block" }} />

      {/* ── DOM LAYER — real token nodes ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>

        {/* CORE NODE */}
        <div
          ref={coreElRef}
          className="absolute pointer-events-auto"
          style={{
            left: 0, top: 0,
            width: "78px", height: "78px",
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border-bright)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "4px",
            transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
            willChange: "transform, box-shadow",
            color: ACCENT.core,
            cursor: "default",
          }}
        >
          <SvgCORE />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--color-text-muted)", letterSpacing: "0.1em", lineHeight: 1 }}>
            theUG
          </span>
        </div>

        {/* TOKEN NODES */}
        {RAW_NODES.map(n => (
          <div
            key={n.id}
            ref={el => { nodeElsRef.current[n.id] = el; }}
            className="absolute pointer-events-auto"
            style={{
              left: 0, top: 0,
              width:  `${n.radius * 2}px`,
              height: `${n.radius * 2}px`,
              borderRadius: "50%",
              background: "var(--color-surface)",
              border: `1px solid ${ACCENT[n.id]}28`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "3px",
              transform: "translate(-50%,-50%) translate3d(-9999px,-9999px,0)",
              willChange: "transform, border-color, box-shadow",
              color: ACCENT[n.id],
              cursor: "grab",
              transition: "border-color 200ms ease, box-shadow 200ms ease",
            }}
          >
            {LOGO[n.id]}
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: `${Math.round(n.radius * 0.22)}px`,
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              lineHeight: 1,
              userSelect: "none",
            }}>
              {n.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── HOVER TELEMETRY CARD ── */}
      <div
        ref={cardRef}
        style={{
          position: "absolute",
          left: 0, top: 0,
          zIndex: 40,
          width: "248px",
          pointerEvents: "none",
          willChange: "transform",
          transform: "translate3d(-9999px,-9999px,0)",
          opacity: hoveredData ? 1 : 0,
          visibility: hoveredData ? "visible" : "hidden",
          transition: "opacity 180ms ease",
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border-bright)",
          padding: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {hoveredData && (() => {
          const accent = ACCENT[hoveredData.id];
          return (
            <div style={{ fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.8 }} />
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "14px", letterSpacing: "0.02em" }}>
                    {hoveredData.label}
                  </span>
                </div>
                <span style={{ fontSize: "8px", color: statusColor(hoveredData.status), border: `1px solid ${statusColor(hoveredData.status)}30`, padding: "2px 6px", letterSpacing: "0.1em" }}>
                  {hoveredData.status}
                </span>
              </div>

              {/* role */}
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.10em", marginBottom: "4px" }}>ROLE</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-primary)", lineHeight: 1.5 }}>{hoveredData.role}</div>
              </div>

              {/* belief */}
              <div>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.10em", marginBottom: "4px" }}>BELIEF</div>
                <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", lineHeight: 1.65, fontStyle: "italic" }}>
                  &ldquo;{hoveredData.belief}&rdquo;
                </div>
              </div>

              {/* interest */}
              <div style={{ paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: "7.5px", color: "var(--color-text-muted)", letterSpacing: "0.10em", marginBottom: "5px" }}>INTEREST</div>
                <div style={{ fontSize: "9.5px", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
                  {hoveredData.interest.split("·").map((s, i) => (
                    <span key={i} style={{ display: "inline-block", marginRight: "4px" }}>
                      {i > 0 && <span style={{ opacity: 0.4, marginRight: "4px" }}>·</span>}
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* bottom legend */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none" style={{
        fontFamily: "var(--font-mono)", fontSize: "7px",
        color: "var(--color-text-muted)",
        display: "flex", flexDirection: "column", gap: "2px",
      }}>
        <span>DRAG NODES TO ARRANGE · HOVER TO EXPLORE</span>
      </div>
    </div>
  );
}

export const NetworkMap = memo(NetworkMapComponent);
