// @ts-nocheck
"use client";

import React, { useEffect, useRef, memo, useState, useCallback } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { RotateCcw } from "lucide-react";

type PlanetPhysics = EcosystemData & {
  angle: number;
  x: number;
  y: number;
  z: number;
  isDragging: boolean;
  dragX: number;
  dragY: number;
  vx: number;
  vy: number;
  isHovered: boolean;
  trail: { x: number; y: number; alpha: number }[];
};

type MemeAsteroid = {
  active: boolean;
  id: string;
  name: string;
  color: string;
  file: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  trail: { x: number; y: number; alpha: number }[];
  age: number;
  lifespan: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
};

interface SolarSystemProps {
  selectedId: string;
  onSelect: (ecosystem: EcosystemData) => void;
}

// 5 Iconic Meme Tokens as Falling Asteroids / Comets
const MEME_ASTEROID_TYPES = [
  { id: "bonk", name: "BONK", color: "#F47D20", file: "bonk.svg" },
  { id: "pengu", name: "PENGU", color: "#38BDF8", file: "pengu.png" },
  { id: "shiba", name: "SHIB", color: "#FFA409", file: "shiba.svg" },
  { id: "doge", name: "DOGE", color: "#C3A634", file: "doge.svg" },
  { id: "pepe", name: "PEPE", color: "#22C55E", file: "pepe.svg" },
];

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function SolarSystem({ selectedId, onSelect }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDayMode, setIsDayMode] = useState<boolean>(false);

  // Camera & Gesture navigation
  const cameraRef = useRef({
    zoom: 1.0,
    targetZoom: 1.0,
    rotation: 0,
    targetRotation: 0,
    rotationVelocity: 0,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
  });

  const interactionRef = useRef({
    isPointerDown: false,
    startX: 0,
    startY: 0,
    dragPlanetId: null as string | null,
    isSlingshot: false,
    hasMoved: false,
  });

  const mouseRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const coronaAngle = useRef(0);

  // Animation refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const planetsRef = useRef<PlanetPhysics[]>([]);
  const starsRef = useRef<Star[]>([]);
  const logosRef = useRef<Record<string, HTMLImageElement>>({});
  const memeBitmaps = useRef<Record<string, HTMLImageElement>>({});
  const sunImgRef = useRef<HTMLImageElement | null>(null);

  // Pool of falling meme asteroids (5 active concurrent slots)
  const asteroidsRef = useRef<MemeAsteroid[]>([
    { active: false, id: "bonk", name: "BONK", color: "#F47D20", file: "bonk.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 24, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "pengu", name: "PENGU", color: "#38BDF8", file: "pengu.png", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 24, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "shiba", name: "SHIB", color: "#FFA409", file: "shiba.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 24, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "doge", name: "DOGE", color: "#C3A634", file: "doge.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 24, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "pepe", name: "PEPE", color: "#22C55E", file: "pepe.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 24, trail: [], age: 0, lifespan: 0 },
  ]);

  // 1. WATCH THEME
  useEffect(() => {
    const checkTheme = () => {
      const isDay = document.documentElement.classList.contains("day-mode");
      setIsDayMode(isDay);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 2. SPAWN FALLING MEME ASTEROIDS / COMETS NEAR PLANETS
  const spawnMemeAsteroid = useCallback(() => {
    const slot = asteroidsRef.current.find(m => !m.active);
    if (!slot) return;

    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 750;

    // Fall diagonally across the orbits (from upper-left or upper-right)
    const fromLeft = Math.random() > 0.45;
    const startX = fromLeft ? -40 - Math.random() * 80 : w + 40 + Math.random() * 80;
    const startY = Math.random() * (h * 0.45);

    // Aim toward the middle-lower region near the orbiting planets
    const targetX = w * (0.2 + Math.random() * 0.6);
    const targetY = h * 0.6 + Math.random() * (h * 0.4);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = 5.5 + Math.random() * 3.5;
    const meme = MEME_ASTEROID_TYPES[Math.floor(Math.random() * MEME_ASTEROID_TYPES.length)];

    Object.assign(slot, {
      active: true,
      id: meme.id,
      name: meme.name,
      color: meme.color,
      file: meme.file,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      alpha: 1.0,
      size: 22 + Math.random() * 6,
      trail: [],
      age: 0,
      lifespan: 160 + Math.floor(Math.random() * 40)
    });
  }, []);

  // Natural continuous falling asteroids cadence (every 2.8 seconds)
  useEffect(() => {
    // Initial burst
    spawnMemeAsteroid();
    const timer = setInterval(() => {
      spawnMemeAsteroid();
    }, 2800);
    return () => clearInterval(timer);
  }, [spawnMemeAsteroid]);

  // 3. PRELOAD PLANET & MEME ASSETS
  useEffect(() => {
    if (typeof window === "undefined") return;

    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

    ECOSYSTEMS_DATA.forEach(eco => {
      const img = new window.Image();
      img.src = `/logos/${eco.id}.svg`;
      logosRef.current[eco.id] = img;
    });

    MEME_ASTEROID_TYPES.forEach(m => {
      const img = new window.Image();
      img.src = `/meme/${m.file}`;
      memeBitmaps.current[m.id] = img;
    });

    const pookieImg = new window.Image();
    pookieImg.src = "/images/pookie-sun.png";
    sunImgRef.current = pookieImg;

    const isMobile = window.innerWidth < 768;
    const count = ECOSYSTEMS_DATA.length;

    planetsRef.current = ECOSYSTEMS_DATA.map((eco, idx) => {
      const goldenAngle = (idx / count) * (Math.PI * 2) + 0.45;
      return {
        ...eco,
        baseRadius: eco.radius * (isMobile ? 0.46 : 0.82),
        baseSpeed: eco.speed * (isMobile ? 1.15 : 1.0),
        angle: goldenAngle,
        x: 0,
        y: 0,
        z: 0,
        isDragging: false,
        dragX: 0,
        dragY: 0,
        vx: 0,
        vy: 0,
        isHovered: false,
        trail: []
      };
    });

    const starCount = isMobile ? 55 : 110;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * 900,
        size: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.35 + 0.08,
        twinkleSpeed: Math.random() * 0.0025 + 0.0006,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // 4. RESIZE HANDLER
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = dprRef.current;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);

      const isMobile = w < 768;
      const scale = isMobile ? 0.46 : (w < 1200 ? 0.70 : 0.82);
      planetsRef.current.forEach(p => {
        const original = ECOSYSTEMS_DATA.find(orig => orig.id === p.id);
        if (original) p.baseRadius = original.radius * scale;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 5. KEYBOARD ACCESSIBILITY
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
        const nextIdx = (idx + 1) % ECOSYSTEMS_DATA.length;
        onSelect(ECOSYSTEMS_DATA[nextIdx]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
        const prevIdx = (idx - 1 + ECOSYSTEMS_DATA.length) % ECOSYSTEMS_DATA.length;
        onSelect(ECOSYSTEMS_DATA[prevIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onSelect]);

  const handleResetCamera = () => {
    cameraRef.current.targetZoom = 1.0;
    cameraRef.current.targetRotation = 0;
    cameraRef.current.targetPanX = 0;
    cameraRef.current.targetPanY = 0;
  };

  // 6. MAIN 120 FPS PURE CANVAS SOLAR SYSTEM (VOID MINIMAL)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let isUnmounted = false;

    const render = (time: number) => {
      if (isUnmounted) return;
      const rawDt = time - (lastTimeRef.current || time);
      lastTimeRef.current = time;
      const dt = Math.min(rawDt, 32);

      const w = containerRef.current?.clientWidth || 1000;
      const h = containerRef.current?.clientHeight || 750;
      const isMobile = w < 768;

      const cx = w / 2;
      const cy = h / 2 - (isMobile ? 20 : 10);

      ctx.clearRect(0, 0, w, h);

      const cam = cameraRef.current;
      cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.12);
      cam.panX = lerp(cam.panX, cam.targetPanX, 0.12);
      cam.panY = lerp(cam.panY, cam.targetPanY, 0.12);

      if (!interactionRef.current.isPointerDown && Math.abs(cam.rotationVelocity) > 0.0001) {
        cam.targetRotation += cam.rotationVelocity;
        cam.rotationVelocity *= 0.94;
      }
      cam.rotation = lerp(cam.rotation, cam.targetRotation, 0.15);

      const isDay = isDayMode;
      const tilt = isMobile ? 0.72 : 0.60;

      // ─── A. STARFIELD (DELICATE, QUIET TWINKLE) ─────────────────
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = Math.max(0.04, Math.min(s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.15, 0.75));
        ctx.fillStyle = isDay ? `rgba(71, 85, 105, ${alpha * 0.35})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── B. TRANSFORM CAMERA ────────────────────────────────────
      ctx.save();
      ctx.translate(cx + cam.panX, cy + cam.panY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.rotate(cam.rotation);

      // Fine, quiet void guide rings
      ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.07)" : "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.6;
      [140, 280, 440].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r * (isMobile ? 0.60 : 0.95), 0, Math.PI * 2);
        ctx.stroke();
      });

      // ─── C. REFINED ELLIPTICAL ORBITS ───────────────────────────
      planetsRef.current.forEach(p => {
        const isSelected = selectedId === p.id;
        const isHovered = p.isHovered;

        ctx.beginPath();
        ctx.ellipse(0, 0, p.baseRadius, p.baseRadius * tilt, 0, 0, Math.PI * 2);

        if (isSelected) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Flowing energy photon on selected orbit
          const leadPhase = (time * 0.0005) % 1;
          const leadAngle = leadPhase * Math.PI * 2;
          const lx = Math.cos(leadAngle) * p.baseRadius;
          const ly = Math.sin(leadAngle) * (p.baseRadius * tilt);

          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(lx, ly, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isHovered) {
          ctx.strokeStyle = isDay ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.12)" : "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      });

      // ─── D. ADVANCE PLANETS & KINETIC MOTION ─────────────────────
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relMouseX = (mouseRef.current.x - (cx + cam.panX)) / cam.zoom;
      const relMouseY = (mouseRef.current.y - (cy + cam.panY)) / cam.zoom;
      const worldMouseX = relMouseX * invCos - relMouseY * invSin;
      const worldMouseY = relMouseX * invSin + relMouseY * invCos;

      planetsRef.current.forEach(p => {
        if (!p.isDragging) {
          p.angle += p.baseSpeed * dt * 0.05;
        }

        const naturalOrbitX = Math.cos(p.angle) * p.baseRadius;
        const naturalOrbitY = Math.sin(p.angle) * (p.baseRadius * tilt);

        if (p.isDragging) {
          p.x = p.dragX;
          p.y = p.dragY;
        } else if (Math.hypot(p.vx, p.vy) > 0.1) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx = lerp(p.vx, (naturalOrbitX - p.x) * 0.16, 0.2);
          p.vy = lerp(p.vy, (naturalOrbitY - p.y) * 0.16, 0.2);
        } else {
          p.x = naturalOrbitX;
          p.y = naturalOrbitY;
          p.vx = 0;
          p.vy = 0;
        }

        p.z = Math.sin(p.angle);

        p.trail.push({ x: p.x, y: p.y, alpha: 0.4 });
        if (p.trail.length > 6) p.trail.shift();

        const hitDist = Math.hypot(p.x - worldMouseX, p.y - worldMouseY);
        p.isHovered = hitDist < (isMobile ? 26 : 22);
      });

      // ─── E. REDESIGNED CENTRAL SUN & INNER CELESTIAL ORBITS ───────────
      coronaAngle.current += 0.012;
      const sunCoreR = isMobile ? 40 : 48;
      const breathe = Math.sin(time * 0.0025);
      const pulseR = sunCoreR * (1 + breathe * 0.04);

      // 1. Dual-Tone Chromatic Atmospheric Halo (Cosmic Cyan & Violet Aura)
      const haloR = sunCoreR * (2.5 + breathe * 0.15);
      const halo = ctx.createRadialGradient(0, 0, sunCoreR * 0.4, 0, 0, haloR);
      if (isDay) {
        halo.addColorStop(0, "rgba(2, 132, 199, 0.45)");
        halo.addColorStop(0.45, "rgba(124, 58, 237, 0.18)");
        halo.addColorStop(0.8, "rgba(16, 185, 129, 0.08)");
        halo.addColorStop(1, "transparent");
      } else {
        halo.addColorStop(0, "rgba(0, 229, 255, 0.55)");
        halo.addColorStop(0.35, "rgba(168, 85, 247, 0.28)");
        halo.addColorStop(0.75, "rgba(0, 255, 102, 0.12)");
        halo.addColorStop(1, "transparent");
      }
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Harmonic Center Orbit Rings (Counter-Rotating Celestial Bands)
      // Inner Orbit Track
      const innerOrbitR = sunCoreR + 14 + breathe * 2;
      ctx.save();
      ctx.rotate(coronaAngle.current * 0.5);
      ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.4)" : "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, innerOrbitR, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Celestial Energy Beads on the Center Ring
      for (let b = 0; b < 3; b++) {
        const beadAngle = (b / 3) * Math.PI * 2;
        const bx = Math.cos(beadAngle) * innerOrbitR;
        const by = Math.sin(beadAngle) * innerOrbitR;
        ctx.fillStyle = isDay ? "#0284C7" : "#00E5FF";
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Outer Counter-Rotating Micro-Dash Ring
      const outerOrbitR = sunCoreR + 25;
      ctx.save();
      ctx.rotate(-coronaAngle.current * 0.35);
      ctx.strokeStyle = isDay ? "rgba(124, 58, 237, 0.3)" : "rgba(168, 85, 247, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, outerOrbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Shimmering Solar Prominence Rays (Breathe & Flare)
      ctx.save();
      ctx.rotate(coronaAngle.current * 0.8);
      for (let f = 0; f < 16; f++) {
        const fAngle = (f / 16) * Math.PI * 2;
        const wave = Math.sin(time * 0.004 + f * 0.8);
        const flareLen = (f % 2 === 0 ? 14 + wave * 4 : 8 + wave * 2) * (isMobile ? 0.8 : 1.05);
        ctx.strokeStyle = isDay
          ? (f % 2 === 0 ? "rgba(2, 132, 199, 0.35)" : "rgba(124, 58, 237, 0.3)")
          : (f % 2 === 0 ? "rgba(0, 229, 255, 0.55)" : "rgba(168, 85, 247, 0.45)");
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * (pulseR + 1), Math.sin(fAngle) * (pulseR + 1));
        ctx.lineTo(Math.cos(fAngle) * (pulseR + flareLen), Math.sin(fAngle) * (pulseR + flareLen));
        ctx.stroke();
      }
      ctx.restore();

      // 4. Center Pookie Face Sun Portrait
      const pookieImg = sunImgRef.current;
      if (pookieImg && pookieImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#000000";
        ctx.fill();

        const imgScale = pulseR * 2.35;
        ctx.drawImage(pookieImg, -imgScale / 2, -imgScale / 2 + (pulseR * 0.08), imgScale, imgScale);
        ctx.restore();

        // Dual-Color Chromatic Luminous Rim Border (Electric Cyan & Neon Violet)
        ctx.shadowColor = isDay ? "#0284C7" : "#00E5FF";
        ctx.shadowBlur = isDay ? 14 : 26;
        ctx.strokeStyle = isDay ? "#0284C7" : "#00E5FF";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing thin accent ring
        ctx.strokeStyle = isDay ? "rgba(124, 58, 237, 0.6)" : "rgba(168, 85, 247, 0.8)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#00E5FF";
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Identity Label Underneath Sun
      ctx.save();
      ctx.rotate(-cam.rotation);
      const labelY = pulseR + (isMobile ? 18 : 22);
      ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
      ctx.font = `bold ${isMobile ? 9.5 : 11}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("USMAAN GANI", 0, labelY);

      ctx.fillStyle = isDay ? "#0284C7" : "#00E5FF";
      ctx.font = `bold ${isMobile ? 7.5 : 8.5}px "IBM Plex Mono", monospace`;
      ctx.fillText("theUG_ // WEB3 BUILDER", 0, labelY + (isMobile ? 13 : 15));
      ctx.restore();

      // ─── F. RENDER THE 11 PLANETARY WORLDS ────────────────────────
      const sortedPlanets = [...planetsRef.current].sort((a, b) => a.z - b.z);

      sortedPlanets.forEach(p => {
        const isSelected = selectedId === p.id;
        const depthScale = lerp(0.84, 1.16, (p.z + 1) / 2);
        const radius = (isSelected ? 22 : (p.isHovered ? 19 : 16)) * (isMobile ? 0.88 : 1.0) * depthScale;

        // Slingshot elastic tether line if dragging
        if (p.isDragging) {
          const naturalOrbitX = Math.cos(p.angle) * p.baseRadius;
          const naturalOrbitY = Math.sin(p.angle) * (p.baseRadius * tilt);
          ctx.strokeStyle = `${p.color}aa`;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(naturalOrbitX, naturalOrbitY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selected Sun Laser Lock Line
        if (isSelected) {
          ctx.strokeStyle = `${p.color}66`;
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // 4-corner targeting bracket reticle
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.6;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;

          const bSize = radius + 6;
          ctx.beginPath();
          ctx.moveTo(p.x - bSize, p.y - bSize + 5);
          ctx.lineTo(p.x - bSize, p.y - bSize);
          ctx.lineTo(p.x - bSize + 5, p.y - bSize);

          ctx.moveTo(p.x + bSize - 5, p.y - bSize);
          ctx.lineTo(p.x + bSize, p.y - bSize);
          ctx.lineTo(p.x + bSize, p.y - bSize + 5);

          ctx.moveTo(p.x - bSize, p.y + bSize - 5);
          ctx.lineTo(p.x - bSize, p.y + bSize);
          ctx.lineTo(p.x - bSize + 5, p.y + bSize);

          ctx.moveTo(p.x + bSize - 5, p.y + bSize);
          ctx.lineTo(p.x + bSize, p.y + bSize);
          ctx.lineTo(p.x + bSize, p.y + bSize - 5);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Planet Sphere Body
        ctx.save();
        ctx.fillStyle = isDay ? "#FFFFFF" : "#0D0E12";
        ctx.strokeStyle = isSelected ? p.color : (isDay ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.22)");
        ctx.lineWidth = isSelected ? 2.2 : 1.2;

        if (isSelected || p.isHovered) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Centered Vector Logo
        const img = logosRef.current[p.id];
        if (img && img.complete) {
          const iconSize = radius * 1.15;
          ctx.drawImage(img, p.x - iconSize / 2, p.y - iconSize / 2, iconSize, iconSize);
        }

        // Planet Text Badge
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-cam.rotation);

        const badgeLabel = p.ticker ? `${p.name} · ${p.ticker}` : p.name;
        ctx.font = `bold ${Math.round((isMobile ? 8.5 : 9.5) * depthScale)}px "IBM Plex Mono", monospace`;
        const textMetrics = ctx.measureText(badgeLabel);
        const padX = 5;
        const bgY = radius + 5;

        ctx.fillStyle = isDay ? "rgba(255, 255, 255, 0.95)" : "rgba(13, 14, 18, 0.90)";
        ctx.strokeStyle = isSelected ? p.color : (isDay ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.15)");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
          -textMetrics.width / 2 - padX,
          bgY,
          textMetrics.width + padX * 2,
          13 * depthScale,
          3
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, 0, bgY + (6.5 * depthScale));
        ctx.restore();

        ctx.restore();
      });

      // ─── G. ANIMATED FALLING MEME ASTEROIDS / COMETS ─────────────
      // Bonk, Pengu, Shiba, Doge, Pepe gliding across the space near planets
      asteroidsRef.current.forEach(m => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx;
        m.y += m.vy;

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        if (m.trail.length > 10) m.trail.shift();

        // Soft, elegant comet tail
        if (m.trail.length > 1) {
          ctx.save();
          const tailGrad = ctx.createLinearGradient(m.trail[0].x, m.trail[0].y, m.x, m.y);
          tailGrad.addColorStop(0, "transparent");
          tailGrad.addColorStop(0.6, `${m.color}35`);
          tailGrad.addColorStop(1, `${m.color}cc`);

          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = 2.0;
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.moveTo(m.trail[0].x, m.trail[0].y);
          for (let i = 1; i < m.trail.length; i++) {
            ctx.lineTo(m.trail[i].x, m.trail[i].y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // Asteroid Meme Token Head
        const mImg = memeBitmaps.current[m.id];
        ctx.save();
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 12;

        if (mImg && mImg.complete) {
          const mSize = m.size;
          ctx.drawImage(mImg, m.x - mSize / 2, m.y - mSize / 2, mSize, mSize);
        } else {
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (m.age >= m.lifespan || m.x < -100 || m.x > w + 100 || m.y > h + 100) {
          m.active = false;
        }
      });

      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(render);

    return () => {
      isUnmounted = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDayMode, selectedId]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - (w < 768 ? 20 : 10);
    const cam = cameraRef.current;

    const invCos = Math.cos(-cam.rotation);
    const invSin = Math.sin(-cam.rotation);
    const relX = (clientX - (cx + cam.panX)) / cam.zoom;
    const relY = (clientY - (cy + cam.panY)) / cam.zoom;
    const worldX = relX * invCos - relY * invSin;
    const worldY = relX * invSin + relY * invCos;

    interactionRef.current.isPointerDown = true;
    interactionRef.current.startX = clientX;
    interactionRef.current.startY = clientY;
    interactionRef.current.hasMoved = false;

    let hitPlanet: PlanetPhysics | null = null;
    let minD = w < 768 ? 30 : 22;

    planetsRef.current.forEach(p => {
      const d = Math.hypot(p.x - worldX, p.y - worldY);
      if (d < minD) {
        minD = d;
        hitPlanet = p;
      }
    });

    if (hitPlanet) {
      interactionRef.current.dragPlanetId = hitPlanet.id;
      interactionRef.current.isSlingshot = true;
      hitPlanet.isDragging = true;
      hitPlanet.dragX = worldX;
      hitPlanet.dragY = worldY;
      onSelect(hitPlanet);
    } else {
      interactionRef.current.dragPlanetId = null;
      interactionRef.current.isSlingshot = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    mouseRef.current.x = clientX;
    mouseRef.current.y = clientY;

    if (!interactionRef.current.isPointerDown) return;

    const dx = clientX - interactionRef.current.startX;
    const dy = clientY - interactionRef.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      interactionRef.current.hasMoved = true;
    }

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - (w < 768 ? 20 : 10);
    const cam = cameraRef.current;

    if (interactionRef.current.isSlingshot && interactionRef.current.dragPlanetId) {
      const p = planetsRef.current.find(tok => tok.id === interactionRef.current.dragPlanetId);
      if (p) {
        const invCos = Math.cos(-cam.rotation);
        const invSin = Math.sin(-cam.rotation);
        const relX = (clientX - (cx + cam.panX)) / cam.zoom;
        const relY = (clientY - (cy + cam.panY)) / cam.zoom;
        p.dragX = relX * invCos - relY * invSin;
        p.dragY = relX * invSin + relY * invCos;
      }
    } else {
      const prevRelX = interactionRef.current.startX - cx;
      const prevRelY = interactionRef.current.startY - cy;
      const curRelX = clientX - cx;
      const curRelY = clientY - cy;

      const prevAngle = Math.atan2(prevRelY, prevRelX);
      const curAngle = Math.atan2(curRelY, curRelX);
      const deltaAngle = curAngle - prevAngle;

      cam.targetRotation += deltaAngle;
      cam.rotationVelocity = deltaAngle * 0.8;

      interactionRef.current.startX = clientX;
      interactionRef.current.startY = clientY;
    }
  };

  const handlePointerUp = () => {
    if (interactionRef.current.isSlingshot && interactionRef.current.dragPlanetId) {
      const p = planetsRef.current.find(tok => tok.id === interactionRef.current.dragPlanetId);
      if (p) {
        const tilt = canvasRef.current && canvasRef.current.width < 768 ? 0.72 : 0.60;
        const naturalOrbitX = Math.cos(p.angle) * p.baseRadius;
        const naturalOrbitY = Math.sin(p.angle) * (p.baseRadius * tilt);
        p.isDragging = false;
        p.vx = (naturalOrbitX - p.dragX) * 0.28;
        p.vy = (naturalOrbitY - p.dragY) * 0.28;
      }
    }
    interactionRef.current.isPointerDown = false;
    interactionRef.current.dragPlanetId = null;
    interactionRef.current.isSlingshot = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0012;
    cameraRef.current.targetZoom = Math.max(0.65, Math.min(1.8, cameraRef.current.targetZoom + zoomDelta));
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[540px] sm:h-[600px] md:h-[680px] lg:h-[720px] overflow-hidden select-none border border-[var(--color-border)] rounded-2xl bg-[var(--color-void)]"
      aria-label="On-Chain Conviction: Web3 Solar System with Usmaan Gani"
    >
      {/* ─────────────────────────────────────────────────────
          CLEAN, PEACEFUL TOP OVERLAY (NO BUTTON CLUTTER)
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)]" />
          <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-widest uppercase">
            SOLAR SYSTEM // 11 ORBITING WORLDS
          </span>
        </div>

        {/* Small subtle camera reset if user drags */}
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] pointer-events-auto transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
          120 FPS PURE CANVAS SOLAR SYSTEM SURFACE
          ───────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
        style={{ width: "100%", height: "100%", zIndex: 1 }}
      />

      {/* ─────────────────────────────────────────────────────
          BOTTOM CLEAN PLANET SELECTOR CAROUSEL
          ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-6 z-30 flex items-center gap-1.5 overflow-x-auto scrollbar-none pointer-events-auto pb-0.5">
        {ECOSYSTEMS_DATA.map((eco) => {
          const isSelected = selectedId === eco.id;
          return (
            <button
              key={eco.id}
              onClick={() => onSelect(eco)}
              className={`px-2.5 py-1 rounded-full font-mono text-[9px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[var(--color-surface)] border-2 font-bold shadow-md"
                  : "bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              style={{
                borderColor: isSelected ? eco.color : undefined,
                color: isSelected ? (isDayMode ? "#000000" : "#ffffff") : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: eco.color }} />
              <span>{eco.ticker ? `${eco.name} [${eco.ticker}]` : eco.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default memo(SolarSystem);
