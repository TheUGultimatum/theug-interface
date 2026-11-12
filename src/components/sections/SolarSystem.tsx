"use client";

import React, { useEffect, useRef, memo, useState, useCallback } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { RotateCcw } from "lucide-react";

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
  trail: { x: number; y: number; alpha: number; size?: number }[];
};

type MemeCelestialKind = "comet" | "meteor";

type MemeAsteroid = {
  active: boolean;
  id: string;
  name: string;
  kind: MemeCelestialKind;
  color: string;
  secondaryColor: string;
  label: string;
  file: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  trail: { x: number; y: number; alpha: number; size?: number }[];
  age: number;
  lifespan: number;
};

type MemeParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  shape: "spark" | "frost" | "ember";
  age: number;
  lifespan: number;
};

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  hasFlare: boolean;
};

interface SolarSystemProps {
  selectedId: string;
  onSelect: (ecosystem: EcosystemData) => void;
}

// 5 Iconic Meme Tokens as Falling Comets (Pengu cold comet, Pepe neon comet) & Meteors (Doge fire, Shiba blazing, Bonk kinetic)
const MEME_ASTEROID_TYPES = [
  {
    id: "pengu",
    name: "PENGU",
    kind: "comet" as const,
    color: "#38BDF8",
    secondaryColor: "#E0F2FE",
    label: "COLD COMET",
    file: "pengu.png",
    speedMin: 4.2,
    speedMax: 6.2,
  },
  {
    id: "pepe",
    name: "PEPE",
    kind: "comet" as const,
    color: "#22C55E",
    secondaryColor: "#86EFAC",
    label: "NEON COMET",
    file: "pepe.svg",
    speedMin: 4.6,
    speedMax: 6.8,
  },
  {
    id: "doge",
    name: "DOGE",
    kind: "meteor" as const,
    color: "#FFA409",
    secondaryColor: "#FDE047",
    label: "FIRE METEOR",
    file: "doge.svg",
    speedMin: 7.5,
    speedMax: 11.0,
  },
  {
    id: "shiba",
    name: "SHIB",
    kind: "meteor" as const,
    color: "#FF4500",
    secondaryColor: "#FFA07A",
    label: "BLAZING METEOR",
    file: "shiba.svg",
    speedMin: 7.8,
    speedMax: 11.5,
  },
  {
    id: "bonk",
    name: "BONK",
    kind: "meteor" as const,
    color: "#F47D20",
    secondaryColor: "#FED7AA",
    label: "KINETIC METEOR",
    file: "bonk.svg",
    speedMin: 6.5,
    speedMax: 9.5,
  },
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

  // Pool of falling meme comets & meteors (16 active concurrent slots)
  const asteroidsRef = useRef<MemeAsteroid[]>(
    Array.from({ length: 16 }, () => ({
      active: false,
      id: "pengu",
      name: "PENGU",
      kind: "comet",
      color: "#38BDF8",
      secondaryColor: "#E0F2FE",
      label: "COLD COMET",
      file: "pengu.png",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      alpha: 0,
      size: 26,
      trail: [],
      age: 0,
      lifespan: 0,
    }))
  );
  const particlesRef = useRef<MemeParticle[]>([]);

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

  // 2. SPAWN MEME COMETS & METEORS ACROSS THE 3D CELESTIAL STAGE
  const spawnMemeAsteroid = useCallback(() => {
    const slot = asteroidsRef.current.find(m => !m.active);
    if (!slot) return;

    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 750;

    // Pick a meme token: Pengu cold comet, Pepe neon comet, Doge fire meteor, Shiba blazing meteor, Bonk kinetic meteor
    const meme = MEME_ASTEROID_TYPES[Math.floor(Math.random() * MEME_ASTEROID_TYPES.length)];

    // Diverse, dynamic trajectories across the celestial viewport
    const trajectoryMode = Math.random();
    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;

    if (trajectoryMode < 0.45) {
      // Upper-left to bottom-right across the system
      startX = -60 - Math.random() * 80;
      startY = Math.random() * (h * 0.45);
      targetX = w * 0.4 + Math.random() * (w * 0.65);
      targetY = h * 0.7 + Math.random() * (h * 0.5);
    } else if (trajectoryMode < 0.80) {
      // Upper-right to bottom-left across the system
      startX = w + 60 + Math.random() * 80;
      startY = Math.random() * (h * 0.45);
      targetX = -40 + Math.random() * (w * 0.55);
      targetY = h * 0.7 + Math.random() * (h * 0.5);
    } else {
      // High steep overhead descent
      startX = w * 0.15 + Math.random() * (w * 0.7);
      startY = -50;
      targetX = startX + (Math.random() > 0.5 ? 1 : -1) * (w * 0.35 + 100);
      targetY = h + 80;
    }

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = meme.speedMin + Math.random() * (meme.speedMax - meme.speedMin);

    Object.assign(slot, {
      active: true,
      id: meme.id,
      name: meme.name,
      kind: meme.kind,
      color: meme.color,
      secondaryColor: meme.secondaryColor,
      label: meme.label,
      file: meme.file,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      alpha: 1.0,
      size: meme.kind === "comet" ? (26 + Math.random() * 6) : (24 + Math.random() * 5),
      trail: [],
      age: 0,
      lifespan: meme.kind === "comet" ? 180 + Math.floor(Math.random() * 60) : 140 + Math.floor(Math.random() * 40),
    });
  }, []);

  // Natural high-frequency meme showers & meteor flurries
  useEffect(() => {
    // Initial burst of showers
    spawnMemeAsteroid();
    const t1 = setTimeout(spawnMemeAsteroid, 250);
    const t2 = setTimeout(spawnMemeAsteroid, 500);

    // Continuous shower cadence (every 750ms)
    const cadenceTimer = setInterval(() => {
      spawnMemeAsteroid();
    }, 750);

    // Mini meteor/comet shower clusters every 6.5s
    const showerTimer = setInterval(() => {
      spawnMemeAsteroid();
      setTimeout(spawnMemeAsteroid, 120);
      setTimeout(spawnMemeAsteroid, 260);
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(cadenceTimer);
      clearInterval(showerTimer);
    };
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

    // Deep 3D Starfield across 3 depth planes (z: 0.1 distant to 1.0 foreground hero stars)
    const starCount = isMobile ? 140 : 280;
    const stars: Star[] = [];
    const w = window.innerWidth || 1400;
    const h = 1000;

    for (let i = 0; i < starCount; i++) {
      const z = Math.random();
      const isHero = z > 0.86;
      let color = "#FFFFFF";
      const roll = Math.random();
      if (roll < 0.16) color = "#38BDF8"; // Icy cyan star
      else if (roll < 0.32) color = "#FDE68A"; // Warm stellar amber
      else if (roll < 0.42) color = "#C4B5FD"; // Cosmic lavender

      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        size: isHero ? Math.random() * 1.3 + 1.8 : (z > 0.4 ? Math.random() * 0.9 + 0.9 : Math.random() * 0.5 + 0.35),
        baseAlpha: isHero ? Math.random() * 0.3 + 0.65 : (z > 0.4 ? Math.random() * 0.3 + 0.32 : Math.random() * 0.2 + 0.10),
        twinkleSpeed: Math.random() * 0.003 + 0.0008,
        twinkleOffset: Math.random() * Math.PI * 2,
        color,
        hasFlare: isHero && Math.random() > 0.35,
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
      const scale = isMobile ? 0.48 : (w < 1200 ? 0.72 : 0.88);
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

  const handleResetCamera = useCallback(() => {
    cameraRef.current.targetZoom = 1.0;
    cameraRef.current.targetRotation = 0;
    cameraRef.current.targetPanX = 0;
    cameraRef.current.targetPanY = 0;
  }, []);
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

      // ─── A. DEEP 3D COSMIC VOID & ATMOSPHERIC NEBULAE ──────────
      // Authentic deep black space (#030508) in both dark and light modes
      ctx.fillStyle = "#030508";
      ctx.fillRect(0, 0, w, h);

      // Deep space volumetric nebula clouds (subtle 3D depth)
      const n1 = ctx.createRadialGradient(w * 0.22, h * 0.28, 0, w * 0.22, h * 0.28, w * 0.44);
      n1.addColorStop(0, "rgba(99, 102, 241, 0.08)");
      n1.addColorStop(0.5, "rgba(79, 70, 229, 0.03)");
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      const n2 = ctx.createRadialGradient(w * 0.78, h * 0.68, 0, w * 0.78, h * 0.68, w * 0.40);
      n2.addColorStop(0, "rgba(6, 182, 212, 0.07)");
      n2.addColorStop(0.5, "rgba(14, 165, 233, 0.02)");
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      const n3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.28);
      n3.addColorStop(0, "rgba(245, 158, 11, 0.045)");
      n3.addColorStop(0.6, "rgba(234, 88, 12, 0.015)");
      n3.addColorStop(1, "transparent");
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      // ─── B. MULTI-LAYER 3D PARALLAX STARFIELD ───────────────────
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // 3D Parallax: deeper stars shift subtly with camera rotation
        const parallaxX = Math.sin(cam.rotation * 0.35) * (s.z * 18);
        const parallaxY = Math.cos(cam.rotation * 0.35) * (s.z * 10);
        const sx = (s.x + parallaxX + w) % w;
        const sy = (s.y + parallaxY + h) % h;

        const alpha = Math.max(0.06, Math.min(s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.22, 1.0));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point cross diffraction spikes for foreground hero stars
        if (s.hasFlare && alpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.65;
          const flareLen = s.size * 3.2;
          ctx.beginPath();
          ctx.moveTo(sx - flareLen, sy);
          ctx.lineTo(sx + flareLen, sy);
          ctx.moveTo(sx, sy - flareLen);
          ctx.lineTo(sx, sy + flareLen);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      // ─── C. TRANSFORM CAMERA FOR ORBITS & PLANETS ───────────────
      ctx.save();
      ctx.translate(cx + cam.panX, cy + cam.panY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.rotate(cam.rotation);

      // Fine, quiet void guide rings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
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
      const motionMultiplier = prefersReducedMotionRef.current ? 0 : 1;
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relMouseX = (mouseRef.current.x - (cx + cam.panX)) / cam.zoom;
      const relMouseY = (mouseRef.current.y - (cy + cam.panY)) / cam.zoom;
      const worldMouseX = relMouseX * invCos - relMouseY * invSin;
      const worldMouseY = relMouseX * invSin + relMouseY * invCos;

      planetsRef.current.forEach(p => {
        if (!p.isDragging) {
          p.angle += p.baseSpeed * dt * 0.05 * motionMultiplier;
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

      // ─── E. CENTRAL SUN (LOCKED & FIXED UPRIGHT IN THE CENTER) ───────────
      // The Central Sun never rotates with camera rotation — stays strictly upright and locked in the center
      ctx.save();
      ctx.rotate(-cam.rotation);

      coronaAngle.current += 0.012;
      const sunCoreR = isMobile ? 40 : 48;
      const breathe = Math.sin(time * 0.0025);
      const pulseR = sunCoreR * (1 + breathe * 0.04);

      // 1. Warm Solar Amber & Cyber Cyan Atmospheric Halo (Warm Cosmic Energy)
      const haloR = sunCoreR * (2.6 + breathe * 0.18);
      const halo = ctx.createRadialGradient(0, 0, sunCoreR * 0.35, 0, 0, haloR);
      halo.addColorStop(0, "rgba(255, 123, 0, 0.65)");
      halo.addColorStop(0.35, "rgba(255, 94, 58, 0.35)");
      halo.addColorStop(0.70, "rgba(0, 217, 255, 0.16)");
      halo.addColorStop(1, "transparent");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Harmonic Center Orbit Rings (Counter-Rotating Celestial Bands)
      const innerOrbitR = sunCoreR + 15 + breathe * 2;
      ctx.save();
      ctx.rotate(coronaAngle.current * 0.5);
      ctx.strokeStyle = "rgba(255, 123, 0, 0.55)";
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
      ctx.strokeStyle = "rgba(0, 217, 255, 0.45)";
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
          ? "rgba(255, 123, 0, 0.75)"
          : "rgba(0, 217, 255, 0.65)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * (pulseR + 1), Math.sin(fAngle) * (pulseR + 1));
        ctx.lineTo(Math.cos(fAngle) * (pulseR + flareLen), Math.sin(fAngle) * (pulseR + flareLen));
        ctx.stroke();
      }
      ctx.restore();

      // 4. Center Avatar Sun Portrait (Thug-Life Crown Avatar - Stays Fixed Upright)
      const avatarImg = sunImgRef.current;
      if (avatarImg && avatarImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#000000";
        ctx.fill();

        const imgScale = pulseR * 2.16;
        ctx.drawImage(avatarImg, -imgScale / 2, -imgScale / 2, imgScale, imgScale);
        ctx.restore();

        // Solar Amber Luminous Rim Border
        ctx.shadowColor = "#FF7B00";
        ctx.shadowBlur = 28;
        ctx.strokeStyle = "#FF7B00";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing Cyber Cyan accent ring
        ctx.strokeStyle = "rgba(0, 217, 255, 0.85)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR - 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = "#FF7B00";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#FF7B00";
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Docked theUG_ Pill Badge Anchored At The Bottom Rim Of Portrait (Upright)
      ctx.save();
      const badgeW = isMobile ? 74 : 88;
      const badgeH = isMobile ? 22 : 26;
      const badgeY = pulseR - (badgeH * 0.45); // Docked overlapping bottom edge

      ctx.shadowColor = "rgba(255, 123, 0, 0.6)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#07090E";
      ctx.strokeStyle = "#FF7B00";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Small cyan live telemetry dot inside pill
      ctx.fillStyle = "#00D9FF";
      ctx.shadowColor = "#00D9FF";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-badgeW / 2 + 12, badgeY + badgeH / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // theUG_ Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${isMobile ? 11 : 12.5}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("theUG_", 4, badgeY + badgeH / 2);
      ctx.restore();

      ctx.restore(); // End Section E (Restores camera transform)

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

        ctx.fillStyle = "rgba(8, 10, 15, 0.92)";
        ctx.strokeStyle = isSelected ? p.color : (p.isHovered ? p.color : "rgba(255, 255, 255, 0.22)");
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

        ctx.fillStyle = isSelected ? p.color : "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, 0, bgY + (badgeH / 2));
        ctx.restore();

        ctx.restore();
      });

      // Restore camera space so Meme Showers render across the celestial screen viewport
      ctx.restore();

      // ─── G. MEME SHOWERS: COMETS & METEORS ─────────────────────────
      // Pengu (Cold Comet), Pepe (Neon Comet), Doge (Fire Meteor), Shiba (Blazing Meteor), Bonk (Kinetic Meteor)
      asteroidsRef.current.forEach(m => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx;
        m.y += m.vy;

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha, size: m.size });
        const maxTrail = m.kind === "comet" ? 22 : 16;
        if (m.trail.length > maxTrail) m.trail.shift();

        // High-frequency particle emission based on token type
        if (particlesRef.current.length < 130) {
          if (m.id === "pengu") {
            // Cold Frost Crystals (Cyan & Ice-White)
            particlesRef.current.push({
              x: m.x - m.vx * 0.4 + (Math.random() - 0.5) * 6,
              y: m.y - m.vy * 0.4 + (Math.random() - 0.5) * 6,
              vx: -m.vx * 0.14 + (Math.random() - 0.5) * 0.6,
              vy: -m.vy * 0.14 + (Math.random() - 0.5) * 0.6,
              alpha: 0.9,
              size: Math.random() * 2.2 + 1.2,
              color: Math.random() > 0.4 ? "#38BDF8" : "#E0F2FE",
              shape: "frost",
              age: 0,
              lifespan: 26 + Math.floor(Math.random() * 12),
            });
          } else if (m.id === "pepe") {
            // Neon Emerald Plasma Sparks
            particlesRef.current.push({
              x: m.x - m.vx * 0.4 + (Math.random() - 0.5) * 6,
              y: m.y - m.vy * 0.4 + (Math.random() - 0.5) * 6,
              vx: -m.vx * 0.12 + (Math.random() - 0.5) * 0.6,
              vy: -m.vy * 0.12 + (Math.random() - 0.5) * 0.6,
              alpha: 0.85,
              size: Math.random() * 2.0 + 0.8,
              color: Math.random() > 0.35 ? "#22C55E" : "#86EFAC",
              shape: "spark",
              age: 0,
              lifespan: 24 + Math.floor(Math.random() * 10),
            });
          } else if (m.id === "doge") {
            // Blazing Golden Fire Embers
            for (let k = 0; k < 2; k++) {
              particlesRef.current.push({
                x: m.x - m.vx * 0.4 + (Math.random() - 0.5) * 8,
                y: m.y - m.vy * 0.4 + (Math.random() - 0.5) * 8,
                vx: -m.vx * 0.18 + (Math.random() - 0.5) * 1.0,
                vy: -m.vy * 0.18 + (Math.random() - 0.5) * 1.0,
                alpha: 0.95,
                size: Math.random() * 2.4 + 1.0,
                color: Math.random() > 0.5 ? "#FFA409" : (Math.random() > 0.5 ? "#FDE047" : "#FFFFFF"),
                shape: "ember",
                age: 0,
                lifespan: 22 + Math.floor(Math.random() * 10),
              });
            }
          } else if (m.id === "shiba") {
            // Crackling Crimson Fire Sparks
            for (let k = 0; k < 2; k++) {
              particlesRef.current.push({
                x: m.x - m.vx * 0.4 + (Math.random() - 0.5) * 8,
                y: m.y - m.vy * 0.4 + (Math.random() - 0.5) * 8,
                vx: -m.vx * 0.18 + (Math.random() - 0.5) * 1.0,
                vy: -m.vy * 0.18 + (Math.random() - 0.5) * 1.0,
                alpha: 0.95,
                size: Math.random() * 2.5 + 1.0,
                color: Math.random() > 0.5 ? "#FF4500" : (Math.random() > 0.5 ? "#EF4444" : "#FDE047"),
                shape: "ember",
                age: 0,
                lifespan: 22 + Math.floor(Math.random() * 10),
              });
            }
          } else {
            // Heavy Kinetic Orange Particles
            particlesRef.current.push({
              x: m.x - m.vx * 0.4 + (Math.random() - 0.5) * 6,
              y: m.y - m.vy * 0.4 + (Math.random() - 0.5) * 6,
              vx: -m.vx * 0.12 + (Math.random() - 0.5) * 0.6,
              vy: -m.vy * 0.12 + (Math.random() - 0.5) * 0.6,
              alpha: 0.85,
              size: Math.random() * 2.2 + 1.0,
              color: "#F47D20",
              shape: "spark",
              age: 0,
              lifespan: 20 + Math.floor(Math.random() * 10),
            });
          }
        }

        // 1. Draw glowing tapered comet / meteor tail
        const trailLen = m.trail.length;
        if (trailLen > 1) {
          ctx.save();
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 10;

          for (let i = 0; i < trailLen - 1; i++) {
            const progress = (i + 1) / trailLen;
            const p1 = m.trail[i];
            const p2 = m.trail[i + 1];

            ctx.strokeStyle = m.kind === "comet"
              ? (m.id === "pengu" ? `rgba(56, 189, 248, ${progress * 0.85})` : `rgba(34, 197, 94, ${progress * 0.85})`)
              : (m.id === "shiba" ? `rgba(255, 69, 0, ${progress * 0.9})` : `rgba(255, 164, 9, ${progress * 0.9})`);

            ctx.lineWidth = Math.max(0.8, progress * (m.kind === "comet" ? 3.6 : 4.8));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Inner incandescent core streak
          ctx.strokeStyle = m.secondaryColor;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          const startIdx = Math.floor(trailLen * 0.45);
          ctx.moveTo(m.trail[startIdx].x, m.trail[startIdx].y);
          for (let i = startIdx + 1; i < trailLen; i++) {
            ctx.lineTo(m.trail[i].x, m.trail[i].y);
          }
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // 2. Draw Meme Token Head with Custom Shockwave
        ctx.save();
        ctx.translate(m.x, m.y);

        const auraR = m.size * 0.75;
        const aura = ctx.createRadialGradient(0, 0, m.size * 0.15, 0, 0, auraR);
        if (m.kind === "comet") {
          aura.addColorStop(0, `${m.secondaryColor}bb`);
          aura.addColorStop(0.5, `${m.color}66`);
          aura.addColorStop(1, "transparent");
        } else {
          aura.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          aura.addColorStop(0.4, `${m.secondaryColor}cc`);
          aura.addColorStop(0.75, `${m.color}77`);
          aura.addColorStop(1, "transparent");
        }
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, auraR, 0, Math.PI * 2);
        ctx.fill();

        const mImg = memeBitmaps.current[m.id];
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 12;

        if (mImg && mImg.complete) {
          const mSize = m.size;
          ctx.drawImage(mImg, -mSize / 2, -mSize / 2, mSize, mSize);
        } else {
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(0, 0, m.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Micro telemetry label pill
        const tag = `${m.name} // ${m.label}`;
        ctx.font = 'bold 7.5px "IBM Plex Mono", monospace';
        const tw = ctx.measureText(tag).width;
        const tagY = -m.size * 0.55 - 11;
        ctx.fillStyle = "rgba(3, 5, 8, 0.88)";
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(-tw / 2 - 4, tagY, tw + 8, 11, 2.5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = m.secondaryColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tag, 0, tagY + 5.5);

        ctx.restore();

        if (m.age >= m.lifespan || m.x < -120 || m.x > w + 120 || m.y > h + 120) {
          m.active = false;
        }
      });

      // 3. Draw and update particle system (frost crystals, sparks, embers)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.93;
        p.age++;

        if (p.age >= p.lifespan || p.alpha <= 0.03) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (p.shape === "frost") {
          // 4-point crystalline frost diamond
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size * 0.6, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size * 0.6, p.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Incandescent spark / ember point
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

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
      // eslint-disable-next-line react-hooks/immutability
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

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      className="relative w-full h-[580px] sm:h-[660px] md:h-[720px] lg:h-[780px] xl:h-[840px] 2xl:h-[880px] overflow-hidden select-none bg-[#030508] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-cyan)]"
      role="region"
      aria-label="On-Chain Conviction: Web3 Solar System with Usmaan Gani"
    >
      {/* ─────────────────────────────────────────────────────
          SUBTLE CELESTIAL CAMERA RESET (Bottom-Left on Desktop)
          ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute bottom-4 left-6 z-30 pointer-events-auto items-center gap-2">
        <button
          onClick={handleResetCamera}
          aria-label="Reset Camera View to Default"
          className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/70 text-zinc-300 hover:text-white hover:border-white/35 transition-colors cursor-pointer min-h-[32px] flex items-center gap-1.5 text-[10px] font-mono font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:outline-none backdrop-blur-md"
          title="Reset Camera View"
        >
          <RotateCcw size={12} />
          <span>RESET VIEW</span>
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
        <div className="flex items-center justify-end">
          <button
            onClick={handleResetCamera}
            aria-label="Reset Camera View"
            className="px-2 py-1 rounded-md border border-white/15 bg-black/75 text-zinc-300 cursor-pointer text-[9px] font-mono flex items-center gap-1 min-h-[28px]"
            title="Reset Camera View"
          >
            <RotateCcw size={11} />
            <span>RESET</span>
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
                    ? "bg-zinc-900 border-2 font-bold shadow-md text-white"
                    : "bg-black/75 border border-white/15 text-zinc-400 hover:text-white"
                }`}
                style={{
                  borderColor: isSelected ? eco.color : undefined,
                  color: isSelected ? "#ffffff" : undefined,
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
