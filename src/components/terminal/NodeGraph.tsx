"use client";

import { useEffect, useRef, memo } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  isCenter?: boolean;
  vx: number;
  vy: number;
  pulseSize?: number;
  targetPulse?: number;
  baseX: number;
  baseY: number;
}

interface PulseParticle {
  id: number;
  edgeId: string;
  progress: number;
  speed: number;
  size: number;
  color: string;
}

const INITIAL_NODES: Omit<Node, "vx" | "vy" | "pulseSize" | "targetPulse">[] = [
  { id: "center", label: "AI CORE",      x: 50, y: 50, baseX: 50, baseY: 50, isCenter: true },
  { id: "ai",     label: "NEURAL AGENTS", x: 80, y: 20, baseX: 80, baseY: 20 },
  { id: "infra",  label: "EDGE CLUSTERS", x: 84, y: 70, baseX: 84, baseY: 70 },
  { id: "web3",   label: "DEFI PROTOCOL", x: 62, y: 88, baseX: 62, baseY: 88 },
  { id: "tools",  label: "SYSTEM TOOLS",  x: 18, y: 74, baseX: 18, baseY: 74 },
  { id: "exp",    label: "UNDERGROUND",   x: 20, y: 26, baseX: 20, baseY: 26 },
];

function NodeGraphComponent() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mutable references for high-performance physics loops
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<PulseParticle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const nextParticleId = useRef(0);
  const isVisibleRef = useRef(true);

  const spawnPulse = (edgeId: string, isFast = false) => {
    const id = nextParticleId.current++;
    const isCyan = Math.random() > 0.7;
    const color = isCyan ? "var(--color-cyan)" : "var(--color-amber-bright)";
    const newPulse: PulseParticle = {
      id,
      edgeId,
      progress: 0,
      speed: isFast ? (0.012 + Math.random() * 0.01) : (0.0035 + Math.random() * 0.004),
      size: 0.8 + Math.random() * 0.7,
      color
    };
    particlesRef.current.push(newPulse);
  };

  useEffect(() => {
    // 1. Initialize Nodes
    const initialized = INITIAL_NODES.map(n => ({
      ...n,
      vx: 0,
      vy: 0,
      pulseSize: 1,
      targetPulse: 1
    }));
    nodesRef.current = initialized;

    const outerNodes = initialized.filter(n => !n.isCenter);

    // 2. Viewport intersection observer to pause rendering calculations when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    // 3. Dynamic spawner intervals
    const spawner = setInterval(() => {
      if (!isVisibleRef.current || document.hidden) return;
      if (particlesRef.current.length < 12) {
        const randNode = outerNodes[Math.floor(Math.random() * outerNodes.length)];
        spawnPulse(`center-${randNode.id}`);
      }
    }, 1100);

    let time = 0;
    let rafId = 0;

    // ── NATIVE DOM GRAPHICS ANIMATION LOOP (0% React Render overhead) ──
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (!isVisibleRef.current || document.hidden) return;
      time += 0.02;

      const hovered = hoveredRef.current;
      const svg = svgRef.current;
      if (!svg) return;

      // 1. Force-directed spring physics & breathing calculations
      nodesRef.current.forEach((node) => {
        if (node.isCenter) {
          const breathing = 1.0 + Math.sin(time * 2.5) * 0.08;
          node.pulseSize = node.pulseSize! + (node.targetPulse! * breathing - node.pulseSize!) * 0.15;
          node.targetPulse = node.targetPulse! > 1 ? node.targetPulse! - 0.05 : 1;

          // Mutate AI Core layer radii directly in the DOM
          const cL1 = svg.querySelector("#center-layer-1");
          const cL2 = svg.querySelector("#center-layer-2");
          if (cL1) cL1.setAttribute("r", (7.2 * node.pulseSize).toString());
          if (cL2) cL2.setAttribute("r", (5.4 * node.pulseSize).toString());
          return;
        }

        // Lissajous breathing drift
        const driftX = Math.sin(time * 0.8 + node.baseX) * 1.5;
        const driftY = Math.cos(time * 1.1 + node.baseY) * 1.5;
        const tx = node.baseX + driftX;
        const ty = node.baseY + driftY;

        // Spring pulling forces
        node.vx += (tx - node.x) * 0.0016;
        node.vy += (ty - node.y) * 0.0016;

        // Mouse Attraction
        if (mouseRef.current) {
          const dxMouse = node.x - mouseRef.current.x;
          const dyMouse = node.y - mouseRef.current.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          
          if (distMouse < 26) {
            const force = (26 - distMouse) * 0.004;
            node.vx -= (dxMouse / distMouse) * force;
            node.vy -= (dyMouse / distMouse) * force;
          }
        }

        // Neighbor Attraction when node is hovered
        if (hovered && hovered !== node.id) {
          const hoveredNode = nodesRef.current.find(n => n.id === hovered);
          if (hoveredNode) {
            const dx = hoveredNode.x - node.x;
            const dy = hoveredNode.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 70) {
              const pull = (70 - dist) * 0.0006;
              node.vx += (dx / dist) * pull;
              node.vy += (dy / dist) * pull;
            }
          }
        }

        // Friction damping
        node.vx *= 0.90;
        node.vy *= 0.90;

        node.x += node.vx;
        node.y += node.vy;

        // Caps boundaries
        node.x = Math.max(10, Math.min(90, node.x));
        node.y = Math.max(10, Math.min(90, node.y));

        // Breathing size updates
        const scaleSpeed = hovered === node.id ? 0.25 : 0.15;
        const breathing = 1.0 + Math.sin(time * 3 + node.baseX) * 0.05;
        node.pulseSize = node.pulseSize! + (node.targetPulse! * breathing - node.pulseSize!) * scaleSpeed;
        node.targetPulse = node.targetPulse! > 1 ? node.targetPulse! - 0.05 : 1;

        // Mutate peripheral node coordinates & style classes directly in the DOM
        const circle = svg.querySelector(`#node-circle-${node.id}`);
        const ring = svg.querySelector(`#node-ring-${node.id}`);
        const text = svg.querySelector(`#node-text-${node.id}`);
        const edgeOuter = svg.querySelector(`#edge-outer-${node.id}`);
        const edgeInner = svg.querySelector(`#edge-inner-${node.id}`);
        const edgeDash = svg.querySelector(`#edge-dash-${node.id}`);

        const isHov = hovered === node.id;
        const scale = node.pulseSize;

        if (circle) {
          circle.setAttribute("cx", node.x.toString());
          circle.setAttribute("cy", node.y.toString());
          circle.setAttribute("r", (isHov ? 2.5 * scale : 1.5 * scale).toString());
          circle.setAttribute("fill", isHov ? "var(--color-amber)" : "var(--color-text-secondary)");
          circle.setAttribute("style", isHov ? "filter: url(#neon-glow);" : "filter: none;");
        }
        if (ring) {
          ring.setAttribute("cx", node.x.toString());
          ring.setAttribute("cy", node.y.toString());
          ring.setAttribute("r", (isHov ? 5.2 : 3.2).toString());
          ring.setAttribute("stroke", isHov ? "var(--color-amber-bright)" : "var(--color-border-bright)");
          ring.setAttribute("stroke-dasharray", isHov ? "2, 3" : "none");
          ring.setAttribute("style", `opacity: ${isHov ? 0.95 : 0.25}; transition: r 0.3s, opacity 0.3s; transform-origin: ${node.x}px ${node.y}px; animation: ${isHov ? "spin 8s linear infinite" : "none"};`);
        }
        if (text) {
          text.setAttribute("x", node.x.toString());
          text.setAttribute("y", (node.y - 5.5).toString());
          text.setAttribute("fill", isHov ? "var(--color-amber-bright)" : "var(--color-text-secondary)");
          text.setAttribute("font-weight", isHov ? "bold" : "normal");
        }
        if (edgeOuter) {
          edgeOuter.setAttribute("x2", node.x.toString());
          edgeOuter.setAttribute("y2", node.y.toString());
          edgeOuter.setAttribute("stroke", isHov ? "var(--color-amber-bright)" : "var(--color-cyan)");
          edgeOuter.setAttribute("stroke-width", isHov ? "0.9" : "0.3");
          edgeOuter.setAttribute("style", `opacity: ${isHov ? 0.9 : 0.15}; filter: ${isHov ? "url(#neon-glow)" : "none"}; transition: stroke 0.3s, stroke-width 0.3s, opacity 0.3s;`);
        }
        if (edgeInner) {
          edgeInner.setAttribute("x2", node.x.toString());
          edgeInner.setAttribute("y2", node.y.toString());
          edgeInner.setAttribute("style", `opacity: ${isHov ? 0.95 : 0.4};`);
        }
        if (edgeDash) {
          edgeDash.setAttribute("x2", node.x.toString());
          edgeDash.setAttribute("y2", node.y.toString());
          edgeDash.setAttribute("style", `display: ${isHov ? "block" : "none"};`);
        }
      });

      // 2. Pulse particle streams inside the pre-rendered pool (15 slots)
      const centerNode = nodesRef.current.find(n => n.isCenter);
      particlesRef.current = particlesRef.current
        .map((p) => {
          return { ...p, progress: p.progress + p.speed };
        })
        .filter((p) => {
          if (p.progress >= 1) {
            // Trigger target scaling spike upon arrival
            const nodeId = p.edgeId.split("-")[1];
            nodesRef.current = nodesRef.current.map((n) => {
              if (n.id === nodeId) return { ...n, targetPulse: 1.5 };
              return n;
            });
            return false;
          }
          return true;
        });

      const poolSize = 15;
      for (let i = 0; i < poolSize; i++) {
        const halo = svg.querySelector(`#pulse-halo-${i}`);
        const core = svg.querySelector(`#pulse-core-${i}`);
        const p = particlesRef.current[i];

        if (p && halo && core && centerNode) {
          const targetNode = nodesRef.current.find(n => n.id === p.edgeId.split("-")[1]);
          if (targetNode) {
            const px = centerNode.x + (targetNode.x - centerNode.x) * p.progress;
            const py = centerNode.y + (targetNode.y - centerNode.y) * p.progress;

            halo.setAttribute("cx", px.toString());
            halo.setAttribute("cy", py.toString());
            halo.setAttribute("r", (p.size * 1.5).toString());
            halo.setAttribute("fill", p.color);
            halo.setAttribute("style", "opacity: 0.35; filter: url(#neon-glow); display: block;");

            core.setAttribute("cx", px.toString());
            core.setAttribute("cy", py.toString());
            core.setAttribute("r", (p.size * 0.7).toString());
            core.setAttribute("style", "display: block;");
          }
        } else {
          if (halo) halo.setAttribute("style", "display: none;");
          if (core) core.setAttribute("style", "display: none;");
        }
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(spawner);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseRef.current = { x, y };
  };

  const handleGraphClick = () => {
    const center = nodesRef.current.find(n => n.isCenter);
    const outer = nodesRef.current.filter(n => !n.isCenter);
    if (!center) return;

    // Pulse broadcast
    outer.forEach((node) => {
      spawnPulse(`center-${node.id}`, true);
      spawnPulse(`center-${node.id}`, true);
    });

    nodesRef.current = nodesRef.current.map((n) => {
      if (n.isCenter) return { ...n, targetPulse: 2.2 };
      return n;
    });
  };

  const centerNode = INITIAL_NODES.find(n => n.isCenter);
  const outerNodes = INITIAL_NODES.filter(n => !n.isCenter);
  if (!centerNode) return null;

  return (
    <div 
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: "185px", position: "relative" }} 
      data-cursor="crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = null; }}
      onClick={handleGraphClick}
    >
      <div 
        className="absolute top-1 left-2 font-mono pointer-events-none select-none flex flex-col gap-0.5"
        style={{ fontSize: "7px", color: "var(--color-text-muted)" }}
      >
        <span>INTELLIGENT MATRIX V3</span>
        <span>DAEMONS: ACTIVE [8]</span>
        <span>LATENCY: 12ms // FLOW ONLINE</span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 1. Connection lines (Direct DOM modified) */}
        {outerNodes.map((node) => (
          <g key={`edge-${node.id}`}>
            <line
              id={`edge-outer-${node.id}`}
              x1={centerNode.x} y1={centerNode.y}
              x2={node.x} y2={node.y}
              stroke="var(--color-cyan)"
              strokeWidth="0.3"
              style={{ opacity: 0.15 }}
            />
            <line
              id={`edge-inner-${node.id}`}
              x1={centerNode.x} y1={centerNode.y}
              x2={node.x} y2={node.y}
              stroke="var(--color-text-primary)"
              strokeWidth="0.12"
              style={{ opacity: 0.4 }}
            />
            <line
              id={`edge-dash-${node.id}`}
              x1={centerNode.x} y1={centerNode.y}
              x2={node.x} y2={node.y}
              stroke="var(--color-amber)"
              strokeWidth="0.8"
              strokeDasharray="4, 10"
              style={{ display: "none" }}
            >
              <animate attributeName="stroke-dashoffset" values="60;0" dur="1.5s" repeatCount="indefinite" />
            </line>
          </g>
        ))}

        {/* 2. Traveling Pulse Energy Particles Pool (15 elements) */}
        {[...Array(15)].map((_, i) => (
          <g key={`pulse-slot-${i}`}>
            <circle
              id={`pulse-halo-${i}`}
              cx="0" cy="0" r="0"
              fill="var(--color-cyan)"
              style={{ display: "none" }}
            />
            <circle
              id={`pulse-core-${i}`}
              cx="0" cy="0" r="0"
              fill="#ffffff"
              style={{ display: "none" }}
            />
          </g>
        ))}

        {/* 3. Peripheral Floating Nodes */}
        {outerNodes.map((node) => (
          <g
            key={node.id}
            onMouseEnter={() => { hoveredRef.current = node.id; }}
            onMouseLeave={() => { hoveredRef.current = null; }}
            style={{ cursor: "none" }}
          >
            {/* Hover Trigger Zone */}
            <circle cx={node.x} cy={node.y} r="7.5" fill="transparent" />

            {/* Orbit Dash Ring */}
            <circle
              id={`node-ring-${node.id}`}
              cx={node.x} cy={node.y}
              r="3.2"
              fill="none"
              stroke="var(--color-border-bright)"
              strokeWidth="0.3"
              style={{ opacity: 0.25 }}
            />

            {/* Center Core Dot */}
            <circle
              id={`node-circle-${node.id}`}
              cx={node.x} cy={node.y}
              r="1.5"
              fill="var(--color-text-secondary)"
            />

            {/* Node Text Label */}
            <text
              id={`node-text-${node.id}`}
              x={node.x}
              y={node.y - 5.5}
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize="2.8"
              fontFamily="var(--font-mono), monospace"
              style={{ userSelect: "none", letterSpacing: "0.06em" }}
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* 4. Center AI Core Node (Direct DOM modified) */}
        <g style={{ cursor: "none" }}>
          <circle cx={centerNode.x} cy={centerNode.y} r="12" fill="transparent" />

          {/* AI Core: revolving dash ring */}
          <circle
            id="center-layer-1"
            cx={centerNode.x}
            cy={centerNode.y}
            r="7.2"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="0.4"
            strokeDasharray="4, 4"
            style={{ 
              opacity: 0.45, 
              filter: "url(#neon-glow)",
              transformOrigin: `${centerNode.x}px ${centerNode.y}px`,
              animation: "spin 15s linear infinite"
            }}
          />

          {/* AI Core: reverse counter-revolving orange ring */}
          <circle
            id="center-layer-2"
            cx={centerNode.x}
            cy={centerNode.y}
            r="5.4"
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth="0.35"
            strokeDasharray="2, 6"
            style={{ 
              opacity: 0.6, 
              filter: "url(#neon-glow)",
              transformOrigin: `${centerNode.x}px ${centerNode.y}px`,
              animation: "spin 6s linear infinite reverse"
            }}
          />

          {/* AI Core: central breathing node */}
          <circle
            id="center-layer-3"
            cx={centerNode.x}
            cy={centerNode.y}
            r="3.5"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="0.75"
            style={{ 
              filter: "url(#neon-glow)",
              opacity: 0.9
            }}
          />
          <circle
            cx={centerNode.x}
            cy={centerNode.y}
            r="1.5"
            fill="var(--color-text-primary)"
          />

          <text
            x={centerNode.x}
            y={centerNode.y + 4.2}
            textAnchor="middle"
            fill="var(--color-cyan)"
            fontSize="2.4"
            fontFamily="var(--font-mono), monospace"
            fontWeight="bold"
            style={{ userSelect: "none", letterSpacing: "0.08em" }}
          >
            CORE
          </text>
        </g>
      </svg>
    </div>
  );
}

export const NodeGraph = memo(NodeGraphComponent);
