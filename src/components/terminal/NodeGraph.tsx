"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  isCenter?: boolean;
  vx: number;
  vy: number;
}

const INITIAL_NODES: Node[] = [
  { id: "center", label: "theUG", x: 50, y: 50, isCenter: true, vx: 0, vy: 0 },
  { id: "ai",     label: "AI AGENTS",   x: 78, y: 18, vx: 0.015, vy: 0.008 },
  { id: "infra",  label: "INFRA",       x: 82, y: 68, vx: -0.01, vy: 0.012 },
  { id: "web3",   label: "WEB3",        x: 62, y: 88, vx: 0.008, vy: -0.015 },
  { id: "tools",  label: "TOOLING",     x: 20, y: 72, vx: 0.012, vy: -0.008 },
  { id: "exp",    label: "EXPERIMENTS", x: 22, y: 28, vx: -0.008, vy: 0.012 },
];

export function NodeGraph() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES.map(n => ({ ...n })));
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Particle state for "Obsidian-like" travelling data dot
  const [particle, setParticle] = useState({ edgeIndex: 0, progress: 0 });
  
  const rafRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>(INITIAL_NODES.map(n => ({ ...n })));
  const particleRef = useRef({ edgeIndex: 0, progress: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const outerNodes = INITIAL_NODES.filter(n => !n.isCenter);
    
    const animate = () => {
      // 1. Drifting Nodes
      nodesRef.current = nodesRef.current.map((node) => {
        if (node.isCenter) return node;
        let { x, y, vx, vy } = node;
        const orig = INITIAL_NODES.find(n => n.id === node.id)!;

        // Slow drift from origin
        x += vx;
        y += vy;

        // Gentle spring back toward origin to stay in bounds
        const dx = orig.x - x;
        const dy = orig.y - y;
        vx += dx * 0.0003;
        vy += dy * 0.0003;

        // Reactive Mouse Repulsion
        if (mouseRef.current) {
          const dxMouse = x - mouseRef.current.x;
          const dyMouse = y - mouseRef.current.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 20) { // Interaction radius
            const force = (20 - distMouse) * 0.001;
            vx += (dxMouse / distMouse) * force;
            vy += (dyMouse / distMouse) * force;
          }
        }

        // Extremely light damping for smooth float
        vx *= 0.999;
        vy *= 0.999;

        // Bounds
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));

        return { ...node, x, y, vx, vy };
      });
      setNodes([...nodesRef.current]);
      
      // 2. Traveling particle
      let { edgeIndex, progress } = particleRef.current;
      progress += 0.0025; // Speed of particle
      
      if (progress >= 1) {
        progress = 0;
        // Pick a random edge for next travel
        edgeIndex = Math.floor(Math.random() * outerNodes.length);
      }
      
      particleRef.current = { edgeIndex, progress };
      setParticle({ ...particleRef.current });
      
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const center = nodes.find(n => n.isCenter)!;
  const outer = nodes.filter(n => !n.isCenter);
  
  // Calculate particle position
  const activeOuterNode = outer[particle.edgeIndex] || outer[0];
  const particleX = center.x + (activeOuterNode.x - center.x) * particle.progress;
  const particleY = center.y + (activeOuterNode.y - center.y) * particle.progress;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseRef.current = { x, y };
  };

  return (
    <div 
      style={{ width: "100%", height: "100%", minHeight: "160px", position: "relative" }} 
      data-cursor="crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = null; }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Connection lines */}
        {outer.map((node) => {
          const isHov = hovered === node.id;
          return (
            <line
              key={`line-${node.id}`}
              x1={center.x} y1={center.y}
              x2={node.x} y2={node.y}
              stroke={isHov ? "rgba(255, 94, 58, 0.45)" : "rgba(85, 85, 85, 0.3)"}
              strokeWidth={isHov ? "0.5" : "0.2"}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Traveling Particle */}
        {activeOuterNode && particle.progress > 0 && particle.progress < 1 && (
          <circle
            cx={particleX}
            cy={particleY}
            r="0.8"
            fill="var(--color-amber-bright)"
            style={{ filter: "drop-shadow(0 0 2px var(--color-amber))" }}
          />
        )}

        {/* Outer nodes */}
        {outer.map((node) => {
          const isHov = hovered === node.id;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "none" }}
            >
              {/* Interaction area */}
              <circle
                cx={node.x} cy={node.y} r="5"
                fill="transparent"
              />
              <circle
                cx={node.x} cy={node.y}
                r={isHov ? "2.8" : "1.8"}
                fill={isHov ? "var(--color-amber)" : "rgba(85,85,85,0.7)"}
                style={{ transition: "r 0.2s, fill 0.2s" }}
              />
              {isHov && (
                <circle
                  cx={node.x} cy={node.y} r="4"
                  fill="none"
                  stroke="rgba(255, 94, 58, 0.4)"
                  strokeWidth="0.5"
                >
                  <animate attributeName="r" values="3; 6; 3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.8; 0; 0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={node.x}
                y={node.y - 4.5}
                textAnchor="middle"
                fill={isHov ? "rgba(255, 94, 58, 0.9)" : "rgba(136,136,136,0.9)"}
                fontSize="3"
                fontFamily="var(--font-mono), monospace"
                style={{ transition: "fill 0.2s", userSelect: "none" }}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Center node */}
        <g>
          <circle cx={center.x} cy={center.y} r="10" fill="transparent" />
          <circle cx={center.x} cy={center.y} r="6" fill="none" stroke="rgba(255, 94, 58, 0.2)" strokeWidth="0.4">
            <animate attributeName="r" values="5.5;7;5.5" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx={center.x} cy={center.y} r="3.2" fill="var(--color-amber)" opacity="0.9" />
          <circle cx={center.x} cy={center.y} r="1.5" fill="var(--color-text-primary)" />
          <text
            x={center.x} y={center.y + 3.5}
            textAnchor="middle"
            fill="var(--color-text-primary)"
            fontSize="2.6"
            fontFamily="var(--font-mono), monospace"
            fontWeight="600"
            style={{ userSelect: "none" }}
          >
            UG
          </text>
        </g>
      </svg>
    </div>
  );
}
