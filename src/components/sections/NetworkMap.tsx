"use client";

import React, { useEffect, useRef, useState, memo } from "react";

interface NetworkNode {
  id: string;
  name: string;
  role: string;
  status: string;
  focus: string;
  belief: string;
  color: string;
  baseAngle: number;
  distance: number;
  label: string;
  // Physics states
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetX: number;
  targetY: number;
  angleOffset: number;
  pulsePhase: number;
  driftOffset: number;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

interface TravelingPacket {
  from: string;
  to: string;
  progress: number;
  speed: number;
}

// 1. OFFICIAL MONOCHROME PROCESS TOKEN SVGs (LOW-SATURATION STYLIZED GRADIENTS)
const LOGO_SVGS: { [key: string]: string } = {
  btc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="transparent" stroke="%23B38A53" stroke-width="2"/><path d="M38 27.6c.5-3.1-1.9-4.8-5.1-5.9l1-4.2-2.6-.6-1 4c-.7-.2-1.4-.3-2.1-.5l1-4.1-2.6-.6-1 4.2c-.6-.1-1.1-.3-1.7-.4l-3.6-.9-.7 2.8s1.9.4 1.9.5c1 .3 1.3 1 1.2 1.6l-1.2 5.1c.1 0 .2 0 .3.1l-1.2 4.9c-.1.2-.4.5-1 .3 0 0-1.9-.5-1.9-.5l-1.3 3 3.4.9c.6.2 1.3.3 2 .5l-1 4.2 2.6.6 1-4.1c.7.2 1.4.3 2 .5l-1 4.1 2.6.6 1.1-4.3c4.5.8 7.9.5 9.3-3.6.9-3.3-.4-5.2-2.8-6.4 1.8-.4 3.1-1.6 3.4-4.1zm-6 9.3c-.8 3.3-6.4 1.5-8.2 1.1l1.5-5.9c1.8.4 7.6 1.3 6.7 4.8zm.8-9.5c-.7 3-5.4 1.5-6.9 1.1l1.3-5.4c1.5.4 6.3 1.1 5.6 4.3z" fill="%23B38A53"/></svg>`,
  eth: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><path d="M16 3L15.8 3.5v17.4l.2.2 8-4.7L16 3z" fill="%237D92A0"/><path d="M16 3L8 16.4l8 4.7V3z" fill="%234A5568"/><path d="M16 22.3l-.1.1v6.3l.1.3 8-11.3-8 4.6z" fill="%237D92A0"/><path d="M16 29V22.3l-8-4.6L16 29z" fill="%234A5568"/><path d="M16 21.1l8-4.7-8-3.6v8.3z" fill="%232D3748"/><path d="M16 21.1V12.8L8 16.4l8 4.7z" fill="%234A5568"/></svg>`,
  sol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 398 332" fill="none"><path d="M64.6 2c-3.3 0-6.4 1.8-8.1 4.7L3.7 94.7c-2.4 4.1-.7 9.4 3.7 11.2l58.1 24.3c3.3 1.4 7 .7 9.4-1.8l52.8-54.8c1.7-1.8 2.7-4.2 2.7-6.7V2.1H64.6z" fill="%237B6CA8"/><path d="M333.4 330c3.3 0 6.4-1.8 8.1-4.7l52.8-88c2.4-4.1.7-9.4-3.7-11.2l-58.1-24.3c-3.3-1.4-7-.7-9.4 1.8l-52.8 54.8c-1.7 1.8-2.7 4.2-2.7 6.7v64.9h65.8z" fill="%238C7CA5"/><path d="M3.7 237.3c-2.4 4.1-.7 9.4 3.7 11.2l58.1 24.3c3.3 1.4 7 .7 9.4-1.8l52.8-54.8c1.7-1.8 2.7-4.2 2.7-6.7v-64.9H64.6c-3.3 0-6.4 1.8-8.1 4.7l-52.8 88z" fill="%235C8C9E"/></svg>`,
  sui: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none"><path d="M192.5 125.8c-2.4-7.3-6.6-14-12.2-19.5L128 54 75.7 106.3c-5.6 5.5-9.8 12.2-12.2 19.5-2.9 8.8-3.4 18.1-1.4 27.2 2.7 12 9.7 22.7 19.8 29.8 11.2 7.8 24.8 11.2 38.1 9.8 13.3 1.4 26.9-2 38.1-9.8 10.1-7.1 17.1-17.8 19.8-29.8 2-9.1 1.5-18.4-1.4-27.2z" fill="%23618DA8"/><path d="M128 54v149.2c13.3 1.4 26.9-2 38.1-9.8 10.1-7.1 17.1-17.8 19.8-29.8 2-9.1 1.5-18.4-1.4-27.2-2.4-7.3-6.6-14-12.2-19.5L128 54z" fill="%233A5E78"/></svg>`,
  polygon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" fill="none"><path d="M16.14,9.68a2.38,2.38,0,0,0-2.38,0L8.6,12.65a2.39,2.39,0,0,0-1.19,2.06v5.93a2.39,2.39,0,0,0,1.19,2.07l5.16,3a2.38,2.38,0,0,0,2.38,0l2.36-1.36v-2.8L15,23.36a.79.79,0,0,1-.8,0l-5.16-3a.79.79,0,0,1-.4-.69V13.75a.79.79,0,0,1,.4-.68l5.16-3a.79.79,0,0,1,.8,0l5.16,3a.79.79,0,0,1,.4.68v4l2.78-1.61V13.75A2.39,2.39,0,0,0,22.14,11.68l-5.16-3A2.38,2.38,0,0,0,16.14,9.68Z" fill="%23756294"/><path d="M27.4,19.26a2.38,2.38,0,0,0-2.38,0l-2.36,1.36v2.8l3.55-2.05a.79.79,0,0,1,.8,0l5.16,3a.79.79,0,0,1,.4.68v5.93a.79.79,0,0,1-.4.69l-5.16,3a.79.79,0,0,1-.8,0l-5.16-3a.79.79,0,0,1-.4-.69v-4l-2.78,1.61v4.36a2.39,2.39,0,0,0,1.19,2.07l5.16,3a2.38,2.38,0,0,0,2.38,0l5.16-3a2.39,2.39,0,0,0,1.19-2.07V24.32a2.39,2.39,0,0,0-1.19-2.06l-5.16-3Z" fill="%23756294"/></svg>`,
  near: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><path d="M6.5,7.5 L6.5,24.5 L10.5,24.5 L10.5,14 L20.5,24.5 L24.5,24.5 L24.5,7.5 L20.5,7.5 L20.5,18 L10.5,7.5 Z" fill="%238A8A8A"/></svg>`,
  ton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.8 5.8l-1.92 9.07c-.14.65-.53.81-1.07.5l-2.92-2.15-1.41 1.36c-.16.16-.29.29-.59.29l.21-2.99 5.44-4.91c.24-.21-.05-.33-.37-.12l-6.73 4.24-2.9-.91c-.63-.2-.64-.63.13-.93l11.32-4.36c.52-.19.98.12.8.96z" fill="%234D8BB5"/></svg>`,
  core: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/><circle cx="32" cy="32" r="18" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M32 20v24M20 32h24M23.5 23.5l17 17M23.5 40.5l17-17" stroke="currentColor" stroke-width="1.5"/><circle cx="32" cy="32" r="6" fill="currentColor"/></svg>`
};

const CORE_NODE_DATA = {
  id: "core",
  name: "theUG",
  role: "Operator Core Infrastructure",
  status: "ONLINE",
  focus: "Systems, Web3 & Autonomous Pipelines",
  belief: "Decentralized Autonomy & Sovereign Code",
  color: "var(--color-text-primary)",
  baseAngle: 0,
  distance: 0,
  label: "CORE_NODE"
};

const ECOSYSTEM_NODES = [
  {
    id: "btc",
    name: "BTC",
    role: "Digital Gold & Security Settlement",
    status: "ONLINE",
    focus: "Store of Value / Security Anchor",
    belief: "Digital Reserve Layer",
    color: "var(--color-amber)",
    baseAngle: 3.4, // radians (~195 degrees)
    distance: 180,
    label: "SECURITY_LAYER"
  },
  {
    id: "eth",
    name: "ETH",
    role: "Smart Contract Infrastructure",
    status: "ACTIVE",
    focus: "AI Agents / Automation Cores",
    belief: "Decentralized Compute Coordination",
    color: "var(--color-cyan)",
    baseAngle: 4.8, // radians (~275 degrees)
    distance: 100,
    label: "AI_AUTOMATION"
  },
  {
    id: "polygon",
    name: "POLYGON",
    role: "Scaling & Aggregation",
    status: "SYNCED",
    focus: "Multi-Chain Zero-Knowledge Layers",
    belief: "Aggregated Liquidity & Modular Scaling",
    color: "var(--color-text-secondary)",
    baseAngle: 4.2, // radians (~240 degrees)
    distance: 145,
    label: "L2_INFRA"
  },
  {
    id: "sol",
    name: "SOL",
    role: "High-Speed Execution Core",
    status: "ACTIVE",
    focus: "Parallel Transaction Pipelines",
    belief: "High Throughput Parallel Execution",
    color: "var(--color-amber-bright)",
    baseAngle: 0.35, // radians (~20 degrees)
    distance: 115,
    label: "HIGH_SPEED_EXECUTION"
  },
  {
    id: "sui",
    name: "SUI",
    role: "Parallel Core Research",
    status: "SYNCED",
    focus: "Object-Model State Topology",
    belief: "Memory-Safe Parallel Execution",
    color: "var(--color-text-secondary)",
    baseAngle: 1.05, // radians (~60 degrees)
    distance: 150,
    label: "PARALLEL_STATE"
  },
  {
    id: "near",
    name: "NEAR",
    role: "Chain Abstraction Core",
    status: "ONLINE",
    focus: "User-Aggregation Protocols",
    belief: "Consumer-Grade Chain Abstraction",
    color: "var(--color-text-secondary)",
    baseAngle: 2.5, // radians (~145 degrees)
    distance: 140,
    label: "CHAIN_ABSTRACTION"
  },
  {
    id: "ton",
    name: "TON",
    role: "Social Telegram Layer",
    status: "ONLINE",
    focus: "Social Scaling & Bot Integration",
    belief: "Mass Consumer Social Scaling",
    color: "var(--color-cyan)",
    baseAngle: 5.5, // radians (~315 degrees)
    distance: 185,
    label: "MESSAGING_LAYER"
  }
];

const CONNECTIONS = [
  { from: "core", to: "btc" },
  { from: "core", to: "eth" },
  { from: "core", to: "polygon" },
  { from: "core", to: "sol" },
  { from: "core", to: "sui" },
  { from: "core", to: "near" },
  { from: "core", to: "ton" },
  // Interconnects
  { from: "eth", to: "polygon" },
  { from: "sol", to: "sui" },
  { from: "btc", to: "eth" },
  { from: "near", to: "sui" }
];

// Contextual space monospace labels coordinates calculated at midpoints between nodes
const LABELS_DATA = [
  { text: "SECURITY_LAYER", node1: "core", node2: "btc", offset: 0.55 },
  { text: "AI_AUTOMATION", node1: "core", node2: "eth", offset: 0.55 },
  { text: "L2_INFRA", node1: "eth", node2: "polygon", offset: 0.5 },
  { text: "HIGH_SPEED_EXECUTION", node1: "sol", node2: "sui", offset: 0.5 },
  { text: "CHAIN_ABSTRACTION", node1: "core", node2: "near", offset: 0.65 },
  { text: "MESSAGING_LAYER", node1: "core", node2: "ton", offset: 0.55 }
];

function NetworkMapComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [inView, setInView] = useState(false);

  // SVG images cache loading
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // High performance coordinates, physics, particles, and sweeps
  const nodesRef = useRef<NetworkNode[]>([]);
  const particlesRef = useRef<DustParticle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const dragNodeRef = useRef<NetworkNode | null>(null);
  const dragVelocityRef = useRef({ vx: 0, vy: 0 });
  const dimRef = useRef({ w: 800, h: 500, dpr: 1 });
  const isMobileRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const sweepAngleRef = useRef(0);

  // Viewport lazy-load viewport guard
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

  // Pre-load SVGs on mount
  useEffect(() => {
    let loaded = 0;
    const entries = Object.entries(LOGO_SVGS);
    const total = entries.length;

    entries.forEach(([key, svg]) => {
      const img = new Image();
      // Safe dynamic replacement of currentColor for day/night-mode evaluation
      const isDay = document.documentElement.classList.contains("day-mode");
      const currentColorHex = isDay ? "%23111215" : "%23ECEFF4";
      const stylizedSvg = svg.replace(/currentColor/g, currentColorHex);

      img.onload = () => {
        loaded++;
        if (loaded === total) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === total) setImagesLoaded(true);
      };
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(stylizedSvg)}`;
      imagesRef.current[key] = img;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect mobile touch screen for adaptive sizing
    isMobileRef.current = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Coordinate grid dust initialization
    const initializeParticles = (w: number, h: number) => {
      const list = [];
      const particleCount = isMobileRef.current ? 12 : 25;
      for (let i = 0; i < particleCount; i++) {
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12 * dimRef.current.dpr,
          vy: (Math.random() - 0.5) * 0.12 * dimRef.current.dpr,
          radius: (Math.random() * 1.2 + 0.6) * dimRef.current.dpr,
          alpha: Math.random() * 0.35 + 0.1,
          phase: Math.random() * Math.PI * 2
        });
      }
      particlesRef.current = list;
    };

    // Build ecosystem layout
    const initializeNodes = (w: number, h: number) => {
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. CORE NODE
      const coreNode: NetworkNode = {
        ...CORE_NODE_DATA,
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        radius: isMobileRef.current ? 26 : 34,
        targetX: centerX,
        targetY: centerY,
        angleOffset: 0,
        pulsePhase: 0,
        driftOffset: 0
      };

      // 2. TOKEN ECOSYSTEMS
      const tokenNodes: NetworkNode[] = ECOSYSTEM_NODES.map((n, idx) => {
        const radAngle = n.baseAngle;
        const tx = centerX + Math.cos(radAngle) * n.distance;
        const ty = centerY + Math.sin(radAngle) * n.distance;
        return {
          ...n,
          x: tx + (Math.random() - 0.5) * 30,
          y: ty + (Math.random() - 0.5) * 30,
          vx: 0,
          vy: 0,
          radius: isMobileRef.current ? 16 : 22,
          targetX: tx,
          targetY: ty,
          angleOffset: 0,
          pulsePhase: Math.random() * Math.PI * 2,
          driftOffset: idx * 4
        };
      });

      nodesRef.current = [coreNode, ...tokenNodes];
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
            initializeParticles(width * dpr, height * dpr);
          } else {
            // Recenter coordinates proportionally
            const centerX = width * dpr / 2;
            const centerY = height * dpr / 2;
            nodesRef.current.forEach((n) => {
              if (n.id === "core") {
                n.targetX = centerX;
                n.targetY = centerY;
                n.x = centerX;
                n.y = centerY;
              } else {
                const radAngle = n.baseAngle + n.angleOffset;
                n.targetX = centerX + Math.cos(radAngle) * n.distance;
                n.targetY = centerY + Math.sin(radAngle) * n.distance;
              }
            });
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse coordinates tracking (No React re-renders!)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dimRef.current.dpr;
      const y = (e.clientY - rect.top) * dimRef.current.dpr;

      // Track relative throw velocity when active drag is running
      if (dragNodeRef.current && mouseRef.current) {
        const dx = x - mouseRef.current.x;
        const dy = y - mouseRef.current.y;
        dragVelocityRef.current = { vx: dx, vy: dy };
      }

      mouseRef.current = { x, y, px: e.clientX - rect.left, py: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
      if (dragNodeRef.current) {
        dragNodeRef.current.vx = dragVelocityRef.current.vx;
        dragNodeRef.current.vy = dragVelocityRef.current.vy;
        dragNodeRef.current = null;
      }
      setHoveredNode(null);
    };

    const handleMouseDown = () => {
      const mouse = mouseRef.current;
      if (!mouse) return;
      // Loop backwards to prioritize core and high-tier orbits
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const node = nodesRef.current[i];
        if (node.id === "core") continue; // Core node is static
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius * 1.5) {
          dragNodeRef.current = node;
          dragVelocityRef.current = { vx: 0, vy: 0 };
          break;
        }
      }
    };

    const handleMouseUp = () => {
      if (dragNodeRef.current) {
        // Transfer throw velocity to damp spring
        dragNodeRef.current.vx = dragVelocityRef.current.vx;
        dragNodeRef.current.vy = dragVelocityRef.current.vy;
        dragNodeRef.current = null;
      }
    };

    // Mobile touch helpers
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) * dimRef.current.dpr;
      const y = (t.clientY - rect.top) * dimRef.current.dpr;

      if (dragNodeRef.current && mouseRef.current) {
        const dx = x - mouseRef.current.x;
        const dy = y - mouseRef.current.y;
        dragVelocityRef.current = { vx: dx, vy: dy };
      }

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

    // Traveling light data packets along edges
    let packetTimer = 0;
    let packets: TravelingPacket[] = [];

    // Animation frame render loop
    let frameId = 0;
    let time = 0;

    const render = () => {
      frameId = requestAnimationFrame(render);

      // Freeze threads when tab is inactive OR canvas is offscreen
      if (document.hidden || !inView) return;

      const { w, h, dpr } = dimRef.current;
      time++;
      ctx.clearRect(0, 0, w, h);

      const isDay = document.documentElement.classList.contains("day-mode");
      const mouse = mouseRef.current;
      const nodeList = nodesRef.current;
      const centerX = w / 2;
      const centerY = h / 2;

      // ── 1. SPAWN TRAFFIC DATA PACKETS ──
      packetTimer++;
      if (packetTimer > (isMobileRef.current ? 140 : 65)) {
        packetTimer = 0;
        if (nodeList.length > 1) {
          const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
          packets.push({
            from: conn.from,
            to: conn.to,
            progress: 0,
            speed: 0.007 + Math.random() * 0.009
          });
        }
      }

      // Update data packet trajectories
      packets = packets.filter((p) => {
        p.progress += p.speed;
        return p.progress < 1.0;
      });

      // ── 2. ATMOSPHERIC radialGradient HAZE & SWEETS ──
      ctx.save();
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, Math.max(w, h) * 0.55);
      if (isDay) {
        bgGlow.addColorStop(0, "rgba(214, 207, 193, 0.12)");
        bgGlow.addColorStop(1, "rgba(252, 250, 247, 0)");
      } else {
        bgGlow.addColorStop(0, "rgba(0, 217, 255, 0.025)");
        bgGlow.addColorStop(1, "rgba(3, 5, 8, 0)");
      }
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Radar scanning sweeps
      if (!reducedMotionRef.current) {
        sweepAngleRef.current = (sweepAngleRef.current + 0.0016) % (Math.PI * 2);
      }
      ctx.save();
      const sweepGlow = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, Math.max(w, h) * 0.65);
      if (isDay) {
        sweepGlow.addColorStop(0, "rgba(17, 18, 21, 0.008)");
        sweepGlow.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        sweepGlow.addColorStop(0, "rgba(0, 217, 255, 0.007)");
        sweepGlow.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, Math.max(w, h) * 0.65, sweepAngleRef.current, sweepAngleRef.current + 0.22);
      ctx.closePath();
      ctx.fillStyle = sweepGlow;
      ctx.fill();
      ctx.restore();

      // ── 3. DRAW DUST PARTICLES ──
      for (const p of particlesRef.current) {
        if (!reducedMotionRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.005;
        }

        // Bound resets
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + Math.sin(p.phase) * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDay
          ? `rgba(17, 18, 21, ${currentAlpha * 0.25})`
          : `rgba(255, 255, 255, ${currentAlpha * 0.3})`;
        ctx.fill();
      }

      // ── 4. PHYSICS ORBITS, SPRING PARALLAX & SNAP COILS ──
      for (let i = 0; i < nodeList.length; i++) {
        const n = nodeList[i];

        if (n.id === "core") {
          n.x = centerX;
          n.y = centerY;
          n.vx = 0;
          n.vy = 0;
          continue;
        }

        if (n === dragNodeRef.current && mouse) {
          // Locked cursor dragging
          n.vx = 0;
          n.vy = 0;
          n.x = mouse.x;
          n.y = mouse.y;
        } else {
          // Slow dynamic rotation orbit around core anchor
          if (!reducedMotionRef.current) {
            n.angleOffset += 0.0005;
          }

          // Computes polar spring targets dynamically from core
          const radAngle = n.baseAngle + n.angleOffset;
          // Drifts slightly in radius to feel floating
          const driftRadius = n.distance + (reducedMotionRef.current ? 0 : Math.sin(time * 0.01 + n.driftOffset) * 4 * dpr);
          n.targetX = centerX + Math.cos(radAngle) * driftRadius;
          n.targetY = centerY + Math.sin(radAngle) * driftRadius;

          // Elastic spring coils pull to anchors
          n.vx += (n.targetX - n.x) * 0.024;
          n.vy += (n.targetY - n.y) * 0.024;

          // Verlet Repulsion bounds (preventing overlapping)
          for (let j = 0; j < nodeList.length; j++) {
            if (i === j) continue;
            const other = nodeList[j];
            const dx = n.x - other.x;
            const dy = n.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (n.radius + other.radius) * 2.3;
            if (dist < minDist && dist > 0) {
              const pushForce = Math.max(0, minDist - dist) * 0.022;
              n.vx += (dx / dist) * pushForce;
              n.vy += (dy / dist) * pushForce;
            }
          }

          // Pointer magnetic attraction pulls (Desktop only)
          if (!isMobileRef.current && mouse) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const magnetRadius = 130 * dpr;
            if (dist < magnetRadius && dist > 0) {
              const pull = ((magnetRadius - dist) / magnetRadius) * 0.24;
              n.vx += (mouse.x - n.x) * pull * 0.045;
              n.vy += (mouse.y - n.y) * pull * 0.045;
            }
          }

          // Buttery spring dampening & static snaps
          n.vx *= 0.93;
          n.vy *= 0.93;

          if (Math.abs(n.vx) < 0.005) n.vx = 0;
          if (Math.abs(n.vy) < 0.005) n.vy = 0;

          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // Check hovered node coordinates
      let currentHover: NetworkNode | null = null;
      if (mouse) {
        for (const n of nodeList) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < n.radius * 1.4) {
            currentHover = n;
            break;
          }
        }
      }

      if (currentHover !== hoveredNode) {
        setHoveredNode(currentHover);
      }

      // 3D Matrix Translation of hover card using GPU transforms
      if (currentHover && cardRef.current) {
        const scaleX = mouse!.px;
        const scaleY = mouse!.py;
        cardRef.current.style.transform = `translate3d(${scaleX + 16}px, ${scaleY - 140}px, 0)`;
        cardRef.current.style.opacity = "1";
        cardRef.current.style.visibility = "visible";
      } else if (cardRef.current) {
        cardRef.current.style.opacity = "0";
        cardRef.current.style.visibility = "hidden";
      }

      // ── 5. DRAW INFRASTRUCTURE LINES (ELEGANT & THIN) ──
      for (const conn of CONNECTIONS) {
        const fromNode = nodeList.find((n) => n.id === conn.from);
        const toNode = nodeList.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) continue;

        const isConnectionHovered = currentHover && (currentHover.id === conn.from || currentHover.id === conn.to);

        ctx.lineWidth = (isConnectionHovered ? 1.0 : 0.5) * dpr;
        if (isDay) {
          ctx.strokeStyle = isConnectionHovered
            ? "rgba(17, 18, 21, 0.15)"
            : "rgba(17, 18, 21, 0.045)";
        } else {
          ctx.strokeStyle = isConnectionHovered
            ? "rgba(255, 255, 255, 0.16)"
            : "rgba(255, 255, 255, 0.05)";
        }

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }

      // Draw dynamic packet traffic pulses along edges
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

        // Elegant packet trailing light
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
          px - (toNode.x - fromNode.x) * 0.045,
          py - (toNode.y - fromNode.y) * 0.045
        );
        ctx.strokeStyle = isDay ? "rgba(214, 158, 83, 0.35)" : "rgba(0, 217, 255, 0.35)";
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();
      }

      // ── 6. DRAW STRETCHING MONOSPACE CONTEXTUAL LABELS ──
      for (const label of LABELS_DATA) {
        const n1 = nodeList.find((n) => n.id === label.node1);
        const n2 = nodeList.find((n) => n.id === label.node2);
        if (n1 && n2) {
          const lx = n1.x + (n2.x - n1.x) * label.offset;
          const ly = n1.y + (n2.y - n1.y) * label.offset;

          ctx.save();
          ctx.font = `600 ${Math.round(8 * dpr)}px var(--font-mono), monospace`;
          ctx.fillStyle = isDay ? "rgba(53, 59, 71, 0.3)" : "rgba(180, 190, 200, 0.3)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label.text, lx, ly - 6 * dpr);
          ctx.restore();
        }
      }

      // ── 7. DRAW NODES & BREATHING HALL GRADIENTS ──
      for (const n of nodeList) {
        const isNodeHovered = currentHover?.id === n.id;

        // Custom static locked core drawing vs dynamic floaters
        if (n.id === "core") {
          // BREATHE GLOW PULSE
          n.pulsePhase += 0.012;
          const coreGlowRadius = n.radius * (2.2 + Math.sin(n.pulsePhase) * 0.2);

          const coreGlow = ctx.createRadialGradient(n.x, n.y, n.radius * 0.5, n.x, n.y, coreGlowRadius);
          if (isDay) {
            coreGlow.addColorStop(0, "rgba(17, 18, 21, 0.04)");
            coreGlow.addColorStop(1, "rgba(0,0,0,0)");
          } else {
            coreGlow.addColorStop(0, "rgba(0, 217, 255, 0.06)");
            coreGlow.addColorStop(1, "rgba(0,0,0,0)");
          }
          ctx.fillStyle = coreGlow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, coreGlowRadius, 0, Math.PI * 2);
          ctx.fill();

          // DYNAMIC OUTER DASHED RING
          ctx.save();
          ctx.strokeStyle = isDay ? "rgba(17, 18, 21, 0.12)" : "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 1.0 * dpr;
          ctx.setLineDash([4 * dpr, 6 * dpr]);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 1.45, time * 0.003, time * 0.003 + Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // CROSS-HAIR TELEMETRY CORNERS
          ctx.save();
          ctx.strokeStyle = isDay ? "rgba(17, 18, 21, 0.2)" : "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 1.0 * dpr;
          const cornerLen = 5 * dpr;
          const gap = n.radius * 1.25;
          // Top-Left
          ctx.beginPath();
          ctx.moveTo(n.x - gap, n.y - gap + cornerLen);
          ctx.lineTo(n.x - gap, n.y - gap);
          ctx.lineTo(n.x - gap + cornerLen, n.y - gap);
          ctx.stroke();
          // Top-Right
          ctx.beginPath();
          ctx.moveTo(n.x + gap, n.y - gap + cornerLen);
          ctx.lineTo(n.x + gap, n.y - gap);
          ctx.lineTo(n.x + gap - cornerLen, n.y - gap);
          ctx.stroke();
          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(n.x - gap, n.y + gap - cornerLen);
          ctx.lineTo(n.x - gap, n.y + gap);
          ctx.lineTo(n.x - gap + cornerLen, n.y + gap);
          ctx.stroke();
          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(n.x + gap, n.y + gap - cornerLen);
          ctx.lineTo(n.x + gap, n.y + gap);
          ctx.lineTo(n.x + gap - cornerLen, n.y + gap);
          ctx.stroke();
          ctx.restore();
        } else {
          // Standard Floater hal glow breathing
          n.pulsePhase += 0.015;
          const glowRadius = n.radius * (isNodeHovered ? 2.5 : 1.9 + Math.sin(n.pulsePhase) * 0.15);

          const gradient = ctx.createRadialGradient(n.x, n.y, n.radius * 0.4, n.x, n.y, glowRadius);
          if (isDay) {
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.012)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          } else {
            const glowColor = n.id === "btc" || n.id === "sol" ? "rgba(255, 140, 50, 0.07)" : "rgba(0, 217, 255, 0.045)";
            gradient.addColorStop(0, glowColor);
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          }
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outlines rings
        ctx.strokeStyle = isNodeHovered
          ? (n.id === "btc" || n.id === "sol" ? "var(--color-amber-bright)" : "var(--color-cyan)")
          : (isDay ? "var(--color-border)" : "var(--color-border-bright)");
        ctx.lineWidth = (isNodeHovered ? 1.8 : 1.0) * dpr;

        ctx.fillStyle = isDay ? "var(--color-surface)" : "var(--color-void)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // ── 8. RENDER REAL CONTEXTUAL TOKEN LOGOS (PRELOAD CACHE) ──
        ctx.save();
        const img = imagesRef.current[n.id];
        if (img && img.complete && img.naturalWidth !== 0) {
          // Draw standard image
          ctx.drawImage(img, n.x - n.radius * 0.55, n.y - n.radius * 0.55, n.radius * 1.1, n.radius * 1.1);
        } else {
          // Grayscale typography fallback
          ctx.font = `bold ${Math.round(n.radius * 0.75)}px var(--font-mono), monospace`;
          ctx.fillStyle = isNodeHovered
            ? (n.id === "btc" || n.id === "sol" ? "var(--color-amber-bright)" : "var(--color-cyan)")
            : (isDay ? "var(--color-text-secondary)" : "var(--color-text-muted)");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(n.name, n.x, n.y);
        }
        ctx.restore();

        // Micro-Telemetry Scanning Flag (Desktop only)
        if (!isMobileRef.current && n.id !== "core") {
          ctx.save();
          ctx.font = `500 ${Math.round(6.5 * dpr)}px var(--font-mono), monospace`;
          ctx.fillStyle = isDay ? "rgba(17, 18, 21, 0.28)" : "rgba(255, 255, 255, 0.25)";
          ctx.textAlign = "left";
          // Prints live shifting coordinate flags next to floating nodes
          const coordText = `[${Math.round(n.x)}, ${Math.round(n.y)}]`;
          ctx.fillText(coordText, n.x + n.radius * 1.15, n.y + 2 * dpr);
          ctx.restore();
        }
      }
    };

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
  }, [inView, imagesLoaded]);

  return (
    <div
      ref={containerRef}
      className="panel relative w-full overflow-hidden group select-none h-[420px] md:h-[500px]"
      style={{
        background: "var(--color-surface)",
        contain: "layout paint style"
      }}
    >
      {/* Background Obsidian CSS Dot-Grid */}
      <div
        className="absolute inset-0 bg-grid opacity-[0.22] dark:opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Telemetry Monospace Coordinates */}
      <div className="absolute top-3 left-4 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col gap-0.5 z-10">
        <span>SYS.MONITOR // ONCHAIN_TOPOLOGY_MAP</span>
        <span>GRID_COORD // 73E.51N</span>
      </div>

      <div className="absolute top-3 right-4 pointer-events-none font-mono text-[7.5px] text-[var(--color-online)] flex items-center gap-1.5 z-10 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)]" />
        <span>NEURAL_MAP // SYNCED</span>
      </div>

      <div className="panel-header flex items-center justify-between z-10 relative">
        <span className="panel-title">⬤ &nbsp;network_map.exe</span>
        <span
          style={{
            fontSize: "8.5px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em"
          }}
        >
          theUG OPERATOR REALM // 7 ECOSYSTEMS
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

      {/* Absolute HTML Telemetry Overlay Card */}
      <div
        ref={cardRef}
        className="absolute pointer-events-none z-30 font-mono text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] p-4 flex flex-col gap-2.5 transition-opacity transition-visibility duration-200"
        style={{
          width: "230px",
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
              <span style={{ color: "var(--color-text-primary)", fontWeight: "bold" }}>Ecosystem: {hoveredNode.name}</span>
              <span style={{
                color: hoveredNode.status === "ACTIVE" || hoveredNode.status === "ONLINE" ? "var(--color-online-bright)" : "var(--color-text-muted)",
                fontSize: "8px",
                border: `1px solid ${hoveredNode.status === "ACTIVE" || hoveredNode.status === "ONLINE" ? "var(--color-online)" : "var(--color-border)"}44`,
                padding: "1px 5px",
                background: "rgba(0,0,0,0.03)"
              }}>[ {hoveredNode.status} ]</span>
            </div>

            <div className="flex flex-col gap-1.5 text-[9.5px]">
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>ROLE: </span>
                <span style={{ color: "var(--color-text-secondary)" }}>{hoveredNode.role}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>INTEREST: </span>
                <span style={{ color: "var(--color-text-secondary)" }}>{hoveredNode.focus}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>BELIEF: </span>
                <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>&quot;{hoveredNode.belief}&quot;</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-3 left-4 pointer-events-none font-mono text-[7px] flex flex-col gap-0.5 text-[var(--color-text-muted)] z-10">
        <span>CLICK + DRAG TO ARRANGE DRAGGABLE TOPOLOGY</span>
        <span>HOVER NODE TO ENGAGE TELEMETRY TRANSMISSION</span>
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] z-10">
        <span>VERLET_REPULSION // Hooke&apos;s_Orbits</span>
      </div>
    </div>
  );
}

export const NetworkMap = memo(NetworkMapComponent);
