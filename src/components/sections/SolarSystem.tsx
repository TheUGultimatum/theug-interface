"use client";

import React, { useEffect, useRef, memo, useState, useCallback } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { RotateCcw, Zap, Radio } from "lucide-react";

export type PlanetPhysics = EcosystemData & {
  baseRadius: number;
  baseSpeed: number;
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

function shadeColor(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map(c => c + c).join("") : cleanHex, 16);
  if (isNaN(num)) return "#05070a";
  let r = (num >> 16);
  let g = ((num >> 8) & 0x00ff);
  let b = (num & 0x0000ff);
  r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent))));
  return `rgb(${r}, ${g}, ${b})`;
}

export function SolarSystem({ selectedId, onSelect }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [warpSpeed, setWarpSpeed] = useState<number>(1);
  const warpSpeedRef = useRef<number>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanWaveRef = useRef<{ radius: number; maxRadius: number; active: boolean } | null>(null);
  const dimensionsRef = useRef<{ w: number; h: number }>({ w: 1000, h: 750 });
  const prefersReducedMotionRef = useRef<boolean>(false);

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
  const rafRef = useRef<number | null>(null);
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

  // 1. WATCH THEME & REDUCED MOTION
  useEffect(() => {
    const checkTheme = () => {
      const isDay = document.documentElement.classList.contains("day-mode");
      setIsDayMode(isDay);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotionRef.current = mediaQuery.matches;
      const onMotionChange = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener("change", onMotionChange);
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener("change", onMotionChange);
      };
    }

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

    const avatarImg = new window.Image();
    avatarImg.src = "/images/avatar-sun.png";
    sunImgRef.current = avatarImg;

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

  // 4. RESIZE HANDLER (Eliminates layout thrashing in render loop)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      dimensionsRef.current = { w, h };
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

  // 5. KEYBOARD ACCESSIBILITY (Scoped to container focus)
  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
      const nextIdx = (idx + 1) % ECOSYSTEMS_DATA.length;
      onSelect(ECOSYSTEMS_DATA[nextIdx]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
      const prevIdx = (idx - 1 + ECOSYSTEMS_DATA.length) % ECOSYSTEMS_DATA.length;
      onSelect(ECOSYSTEMS_DATA[prevIdx]);
    }
  };

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

      const w = dimensionsRef.current.w;
      const h = dimensionsRef.current.h;
      const isMobile = w < 768;

      const cx = w / 2;
      const cy = h / 2;

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

      // ─── AMBIENT & ACTIVE RADAR SCAN SWEEPS ───────────────────────
      const ambientRadarR = ((time * 0.08) % (isMobile ? 380 : 640));
      ctx.save();
      ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.16)" : "rgba(0, 217, 255, 0.18)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, ambientRadarR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Manual High-Energy Radar Sweep Ping
      if (scanWaveRef.current && scanWaveRef.current.active) {
        scanWaveRef.current.radius += dt * 0.42;
        const progress = scanWaveRef.current.radius / scanWaveRef.current.maxRadius;
        if (progress >= 1) {
          scanWaveRef.current.active = false;
        } else {
          const waveAlpha = (1 - progress) * (isDay ? 0.65 : 0.85);
          ctx.save();
          ctx.strokeStyle = isDay ? `rgba(216, 67, 21, ${waveAlpha})` : `rgba(255, 123, 0, ${waveAlpha})`;
          ctx.shadowColor = isDay ? "#D84315" : "#FF7B00";
          ctx.shadowBlur = 14;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, scanWaveRef.current.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

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
      const motionMultiplier = prefersReducedMotionRef.current ? 0 : 1;
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relMouseX = (mouseRef.current.x - (cx + cam.panX)) / cam.zoom;
      const relMouseY = (mouseRef.current.y - (cy + cam.panY)) / cam.zoom;
      const worldMouseX = relMouseX * invCos - relMouseY * invSin;
      const worldMouseY = relMouseX * invSin + relMouseY * invCos;

      planetsRef.current.forEach(p => {
        if (!p.isDragging) {
          p.angle += p.baseSpeed * dt * 0.05 * warpSpeedRef.current * motionMultiplier;
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

      // 1. Warm Solar Amber & Cyber Cyan Atmospheric Halo (Warm Cosmic Energy)
      const haloR = sunCoreR * (2.6 + breathe * 0.18);
      const halo = ctx.createRadialGradient(0, 0, sunCoreR * 0.35, 0, 0, haloR);
      if (isDay) {
        halo.addColorStop(0, "rgba(255, 123, 0, 0.45)");
        halo.addColorStop(0.40, "rgba(255, 94, 58, 0.20)");
        halo.addColorStop(0.75, "rgba(0, 217, 255, 0.10)");
        halo.addColorStop(1, "transparent");
      } else {
        halo.addColorStop(0, "rgba(255, 123, 0, 0.65)");
        halo.addColorStop(0.35, "rgba(255, 94, 58, 0.35)");
        halo.addColorStop(0.70, "rgba(0, 217, 255, 0.16)");
        halo.addColorStop(1, "transparent");
      }
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Harmonic Center Orbit Rings (Counter-Rotating Celestial Bands)
      const innerOrbitR = sunCoreR + 15 + breathe * 2;
      ctx.save();
      ctx.rotate(coronaAngle.current * 0.5);
      ctx.strokeStyle = isDay ? "rgba(255, 123, 0, 0.4)" : "rgba(255, 123, 0, 0.55)";
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
        ctx.fillStyle = "#FF7B00";
        ctx.shadowColor = "#FF7B00";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Outer Counter-Rotating Micro-Dash Ring (Cyber Cyan)
      const outerOrbitR = sunCoreR + 26;
      ctx.save();
      ctx.rotate(-coronaAngle.current * 0.35);
      ctx.strokeStyle = isDay ? "rgba(0, 217, 255, 0.3)" : "rgba(0, 217, 255, 0.45)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, outerOrbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Shimmering Solar Prominence Rays (Warm Solar Amber & Cyber Cyan)
      ctx.save();
      ctx.rotate(coronaAngle.current * 0.8);
      for (let f = 0; f < 18; f++) {
        const fAngle = (f / 18) * Math.PI * 2;
        const wave = Math.sin(time * 0.004 + f * 0.8);
        const flareLen = (f % 2 === 0 ? 16 + wave * 5 : 9 + wave * 3) * (isMobile ? 0.85 : 1.1);
        ctx.strokeStyle = f % 2 === 0
          ? (isDay ? "rgba(216, 67, 21, 0.85)" : "rgba(255, 123, 0, 0.75)")
          : (isDay ? "rgba(2, 132, 199, 0.75)" : "rgba(0, 217, 255, 0.65)");
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * (pulseR + 1), Math.sin(fAngle) * (pulseR + 1));
        ctx.lineTo(Math.cos(fAngle) * (pulseR + flareLen), Math.sin(fAngle) * (pulseR + flareLen));
        ctx.stroke();
      }
      ctx.restore();

      // 4. Center Avatar Sun Portrait (Thug-Life Crown Avatar)
      const avatarImg = sunImgRef.current;
      if (avatarImg && avatarImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = isDay ? "#FFFFFF" : "#000000";
        ctx.fill();

        const imgScale = pulseR * 2.16;
        ctx.drawImage(avatarImg, -imgScale / 2, -imgScale / 2, imgScale, imgScale);
        ctx.restore();

        // Solar Amber Luminous Rim Border
        ctx.shadowColor = isDay ? "#D84315" : "#FF7B00";
        ctx.shadowBlur = isDay ? 14 : 28;
        ctx.strokeStyle = isDay ? "#D84315" : "#FF7B00";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing Cyber Cyan accent ring
        ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.85)" : "rgba(0, 217, 255, 0.85)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR - 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = isDay ? "#D84315" : "#FF7B00";
        ctx.shadowBlur = 24;
        ctx.fillStyle = isDay ? "#D84315" : "#FF7B00";
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Docked theUG_ Pill Badge Anchored At The Bottom Rim Of Portrait
      ctx.save();
      ctx.rotate(-cam.rotation);
      const badgeW = isMobile ? 74 : 88;
      const badgeH = isMobile ? 22 : 26;
      const badgeY = pulseR - (badgeH * 0.45); // Docked overlapping bottom edge

      ctx.shadowColor = isDay ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 123, 0, 0.6)";
      ctx.shadowBlur = isDay ? 8 : 12;
      ctx.fillStyle = isDay ? "#FFFFFF" : "#07090E";
      ctx.strokeStyle = isDay ? "#D84315" : "#FF7B00";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Small cyan live telemetry dot inside pill
      ctx.fillStyle = isDay ? "#0284C7" : "#00D9FF";
      ctx.shadowColor = isDay ? "#0284C7" : "#00D9FF";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-badgeW / 2 + 12, badgeY + badgeH / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // theUG_ Text
      ctx.fillStyle = isDay ? "#1A1A1E" : "#FFFFFF";
      ctx.font = `bold ${isMobile ? 11 : 12.5}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("theUG_", 4, badgeY + badgeH / 2);
      ctx.restore();

      // ─── CONSTELLATION CROSS-CHAIN BRIDGES & LINK THREADS ────────
      const CONSTELLATIONS = [
        { from: "eth", to: "base" },
        { from: "eth", to: "polygon" },
        { from: "eth", to: "hyperliquid" },
        { from: "eth", to: "btc" },
        { from: "eth", to: "sol" },
        { from: "sol", to: "sui" },
      ];

      CONSTELLATIONS.forEach(({ from, to }) => {
        const p1 = planetsRef.current.find(p => p.id === from);
        const p2 = planetsRef.current.find(p => p.id === to);
        if (!p1 || !p2) return;

        const isConnectedToSelected = selectedId === from || selectedId === to;
        const isConnectedToHovered = p1.isHovered || p2.isHovered;
        const highlight = isConnectedToSelected || isConnectedToHovered;

        ctx.save();
        ctx.lineWidth = highlight ? 1.4 : 0.65;
        ctx.strokeStyle = highlight
          ? (isDay ? "rgba(2, 132, 199, 0.60)" : "rgba(0, 217, 255, 0.65)")
          : (isDay ? "rgba(100, 116, 139, 0.10)" : "rgba(255, 255, 255, 0.08)");
        
        if (highlight) {
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -time * 0.025;
          ctx.shadowColor = isDay ? "#0284C7" : "#00D9FF";
          ctx.shadowBlur = 8;
        } else {
          ctx.setLineDash([2, 8]);
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });

      // ─── F. RENDER THE 11 PLANETARY WORLDS WITH 3D SPHERES & SATURN RINGS ─
      const sortedPlanets = [...planetsRef.current].sort((a, b) => a.z - b.z);

      sortedPlanets.forEach(p => {
        const isSelected = selectedId === p.id;
        const depthScale = lerp(0.84, 1.16, (p.z + 1) / 2);
        const radius = (isSelected ? 23 : (p.isHovered ? 20 : 17)) * (isMobile ? 0.88 : 1.0) * depthScale;
        const hasRing = p.id === "eth" || p.id === "btc" || p.id === "hype";
        const ringRx = radius * 2.15;
        const ringRy = radius * 0.60;
        const ringAngle = -0.38;

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

          const bSize = radius + 7;
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

        // 1. Tilted Planetary Rings - Back Half (drawn behind planet)
        if (hasRing) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(ringAngle);
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx, ringRy, 0, Math.PI, Math.PI * 2);
          ctx.strokeStyle = `${p.color}88`;
          ctx.lineWidth = Math.max(2.5, radius * 0.22);
          ctx.stroke();

          // Outer sharp edge
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx + 2, ringRy + 1, 0, Math.PI, Math.PI * 2);
          ctx.strokeStyle = `${p.color}44`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        // 2. 3D Spherical Planet Body with Solar Radial Illumination
        const lightDx = -p.x;
        const lightDy = -p.y;
        const lightDist = Math.hypot(lightDx, lightDy) || 1;
        const nx = lightDx / lightDist;
        const ny = lightDy / lightDist;
        const hx = p.x + nx * (radius * 0.32);
        const hy = p.y + ny * (radius * 0.32);

        const sphereGrad = ctx.createRadialGradient(hx, hy, radius * 0.06, p.x, p.y, radius);
        if (isDay) {
          sphereGrad.addColorStop(0, "#ffffff");
          sphereGrad.addColorStop(0.35, p.color);
          sphereGrad.addColorStop(0.80, shadeColor(p.color, -0.22));
          sphereGrad.addColorStop(1, shadeColor(p.color, -0.42));
        } else {
          sphereGrad.addColorStop(0, "#ffffff");
          sphereGrad.addColorStop(0.24, p.color);
          sphereGrad.addColorStop(0.70, shadeColor(p.color, -0.45));
          sphereGrad.addColorStop(1, "#030408");
        }

        ctx.save();
        if (isSelected || p.isHovered) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = isDay ? 12 : 18;
        }

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Planet Atmosphere Rim Stroke
        ctx.strokeStyle = isSelected ? p.color : (isDay ? `${p.color}dd` : `${p.color}bb`);
        ctx.lineWidth = isSelected ? 2.4 : 1.3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Centered Vector Logo
        const img = logosRef.current[p.id];
        if (img && img.complete) {
          const iconSize = radius * 1.10;
          ctx.drawImage(img, p.x - iconSize / 2, p.y - iconSize / 2, iconSize, iconSize);
        }

        // 3. Tilted Planetary Rings - Front Half (drawn in front of planet)
        if (hasRing) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(ringAngle);
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx, ringRy, 0, 0, Math.PI);
          ctx.strokeStyle = isDay ? `${p.color}ee` : `${p.color}cc`;
          ctx.lineWidth = Math.max(2.5, radius * 0.22);
          ctx.stroke();

          // Outer sharp edge
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx + 2, ringRy + 1, 0, 0, Math.PI);
          ctx.strokeStyle = isDay ? `${p.color}88` : `${p.color}66`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        // 4. Sharp Ticker Pill Badge Docked Near Planet
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-cam.rotation);

        const badgeLabel = (p.ticker || p.name).toUpperCase();
        ctx.font = `bold ${Math.round((isMobile ? 8.5 : 9.5) * depthScale)}px "IBM Plex Mono", monospace`;
        const textMetrics = ctx.measureText(badgeLabel);
        const padX = 6;
        const bgY = radius + 6;
        const badgeW = textMetrics.width + padX * 2;
        const badgeH = 14 * depthScale;

        ctx.fillStyle = isDay ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 10, 15, 0.90)";
        ctx.strokeStyle = isSelected ? p.color : (p.isHovered ? p.color : (isDay ? "rgba(100, 116, 139, 0.35)" : "rgba(255, 255, 255, 0.22)"));
        ctx.lineWidth = isSelected ? 1.6 : 1;
        if (isSelected || p.isHovered) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.roundRect(-badgeW / 2, bgY, badgeW, badgeH, 3);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isSelected ? p.color : (isDay ? "#1A1A1E" : "#FFFFFF");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, 0, bgY + (badgeH / 2));
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
    const cy = h / 2;
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

    // Check for Central Sun Hit (theUG root thesis reset)
    const sunR = w < 768 ? 42 : 50;
    const distToSun = Math.hypot(worldX, worldY);
    if (distToSun < sunR) {
      handleResetCamera();
      // Select central sun (or Bitcoin root)
      const btc = ECOSYSTEMS_DATA[0];
      if (btc) onSelect(btc);
      return;
    }

    let hitPlanet: PlanetPhysics | null = null;
    let minD = w < 768 ? 30 : 22;

    for (const p of planetsRef.current) {
      const d = Math.hypot(p.x - worldX, p.y - worldY);
      if (d < minD) {
        minD = d;
        hitPlanet = p;
      }
    }

    if (hitPlanet !== null) {
      const targetPlanet = hitPlanet as PlanetPhysics;
      interactionRef.current.dragPlanetId = targetPlanet.id;
      interactionRef.current.isSlingshot = true;
      targetPlanet.isDragging = true;
      targetPlanet.dragX = worldX;
      targetPlanet.dragY = worldY;
      onSelect(targetPlanet);
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
    const cy = h / 2;
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

  const handleRadarPing = useCallback(() => {
    setIsScanning(true);
    scanWaveRef.current = { radius: 30, maxRadius: 750, active: true };
    setTimeout(() => setIsScanning(false), 2200);
  }, []);

  const toggleWarpSpeed = useCallback(() => {
    setWarpSpeed(prev => {
      const next = prev === 1 ? 2.5 : 1;
      warpSpeedRef.current = next;
      return next;
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      className="relative w-full h-[540px] sm:h-[620px] md:h-[680px] lg:h-[750px] xl:h-[800px] overflow-hidden select-none bg-[var(--color-void)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-cyan)]"
      role="region"
      aria-label="On-Chain Conviction: Web3 Solar System with Usmaan Gani"
    >
      {/* ─────────────────────────────────────────────────────
          SUBTLE CELESTIAL CAMERA & WARP TOOLBAR (Bottom-Left on Desktop)
          ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute bottom-4 left-6 z-30 pointer-events-auto items-center gap-2">
        <button
          onClick={handleRadarPing}
          aria-label="Emit Deep-Space Radar Frequency Sweep"
          className="px-3 py-2 rounded-lg border border-[var(--color-cyan)]/40 bg-[var(--color-surface)]/90 text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/15 font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[36px] focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:outline-none"
        >
          <Radio size={13} className={isScanning ? "animate-pulse" : ""} />
          <span>RADAR PING</span>
        </button>

        <button
          onClick={toggleWarpSpeed}
          aria-label="Toggle Relativistic Orbital Warp Velocity"
          className="px-3 py-2 rounded-lg border border-[var(--color-amber)]/40 bg-[var(--color-surface)]/90 text-[var(--color-amber)] hover:bg-[var(--color-amber)]/15 font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[36px] focus-visible:ring-2 focus-visible:ring-[var(--color-amber)] focus-visible:outline-none"
        >
          <Zap size={13} className={warpSpeed > 1 ? "animate-bounce" : ""} />
          <span>{warpSpeed > 1 ? "2.5X WARP" : "1X SPEED"}</span>
        </button>

        <button
          onClick={handleResetCamera}
          aria-label="Reset Camera View to Default"
          className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:outline-none"
          title="Reset Camera View"
        >
          <RotateCcw size={14} />
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
      >
        <p>Interactive Web3 Solar System displaying Usmaan Gani (theUG) as the central sun with 11 orbiting blockchain ecosystems including Bitcoin, Ethereum, Solana, and Base.</p>
      </canvas>

      {/* ─────────────────────────────────────────────────────
          MOBILE/TABLET CONTROLS & CLEAN PLANET SELECTOR CAROUSEL
          ───────────────────────────────────────────────────── */}
      <div className="lg:hidden absolute bottom-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Quick mobile warp and radar toggles with WCAG touch sizes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRadarPing}
              aria-label="Emit Radar Sweep"
              className="px-2.5 py-1.5 rounded-lg border border-[var(--color-cyan)]/40 bg-[var(--color-surface)]/90 text-[var(--color-cyan)] font-mono text-[9px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[36px]"
            >
              <Radio size={11} className={isScanning ? "animate-pulse" : ""} />
              <span>RADAR</span>
            </button>
            <button
              onClick={toggleWarpSpeed}
              aria-label="Toggle Orbital Warp Velocity"
              className="px-2.5 py-1.5 rounded-lg border border-[var(--color-amber)]/40 bg-[var(--color-surface)]/90 text-[var(--color-amber)] font-mono text-[9px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[36px]"
            >
              <Zap size={11} className={warpSpeed > 1 ? "animate-bounce" : ""} />
              <span>{warpSpeed > 1 ? "2.5X" : "1X"}</span>
            </button>
          </div>
          <button
            onClick={handleResetCamera}
            aria-label="Reset Camera View"
            className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-text-muted)] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Reset Camera View"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Horizontal Planet Carousel with accessibility roles */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5"
          role="tablist"
          aria-label="Blockchain ecosystems"
        >
          {ECOSYSTEMS_DATA.map((eco) => {
            const isSelected = selectedId === eco.id;
            return (
              <button
                key={eco.id}
                role="tab"
                aria-selected={isSelected}
                aria-label={`Select ${eco.name}`}
                onClick={() => onSelect(eco)}
                className={`px-3 py-1.5 rounded-full font-mono text-[9.5px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] ${
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
      </div>
    </div>
  );
}

export default memo(SolarSystem);
