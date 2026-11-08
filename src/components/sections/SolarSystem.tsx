// @ts-nocheck
"use client";

import React, { useEffect, useRef, memo, useState, useCallback } from "react";
import { ECOSYSTEMS_DATA, EcosystemData } from "@/config/networkData";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Compass,
  Zap,
  Radio,
  Eye,
  Crosshair
} from "lucide-react";

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

type MemeComet = {
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

const MEME_COMET_TYPES = [
  { id: "doge", name: "DOGE", color: "#FBBF24", file: "doge.svg" },
  { id: "pepe", name: "PEPE", color: "#22C55E", file: "pepe.svg" },
  { id: "shiba", name: "SHIB", color: "#F97316", file: "shiba.svg" },
  { id: "pengu", name: "PUDGY", color: "#38BDF8", file: "pengu.png" },
];

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function SolarSystem({ selectedId, onSelect }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Variant Mode: 1 (hyper-core), 2 (cyber-radar), 3 (minimal-void)
  const [variantMode, setVariantMode] = useState<"hyper-core" | "cyber-radar" | "minimal-void">("hyper-core");
  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(120);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);

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
  const pulseRadius = useRef(0);
  const radarSweepAngle = useRef(0);

  // Animation refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const planetsRef = useRef<PlanetPhysics[]>([]);
  const starsRef = useRef<Star[]>([]);
  const logosRef = useRef<Record<string, HTMLImageElement>>({});
  const memeBitmaps = useRef<Record<string, HTMLImageElement>>({});
  const sunImgRef = useRef<HTMLImageElement | null>(null);

  // Meme Comets Pool (4 slots)
  const cometsRef = useRef<MemeComet[]>([
    { active: false, id: "doge", name: "DOGE", color: "#FBBF24", file: "doge.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "pepe", name: "PEPE", color: "#22C55E", file: "pepe.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "shiba", name: "SHIB", color: "#F97316", file: "shiba.svg", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "pengu", name: "PUDGY", color: "#38BDF8", file: "pengu.png", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
  ]);

  // Audio feedback synthesizer
  const playSoundBlip = useCallback((freq = 560, duration = 0.08) => {
    if (!isSoundActive) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [isSoundActive]);

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

  // 2. TOGGLE AMBIENT DRONE
  const toggleSound = () => {
    if (!isSoundActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        setIsSoundActive(true);
      } catch {}
    } else {
      try {
        audioCtxRef.current?.close();
      } catch {}
      setIsSoundActive(false);
    }
  };

  // 3. LAUNCH MEME COIN COMET
  const triggerMemeComet = useCallback(() => {
    const slot = cometsRef.current.find(m => !m.active);
    if (!slot) return;

    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 750;

    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -60 : w + 60;
    const startY = Math.random() * (h * 0.45);

    const targetX = w * (0.15 + Math.random() * 0.7);
    const targetY = h * 0.55 + Math.random() * (h * 0.45);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = 8.5 + Math.random() * 5.0;
    const meme = MEME_COMET_TYPES[Math.floor(Math.random() * MEME_COMET_TYPES.length)];

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
      trail: [],
      age: 0,
      lifespan: 140
    });

    playSoundBlip(780, 0.12);
  }, [playSoundBlip]);

  // Periodic automatic meme coin comets flyby (every 3.6 seconds)
  useEffect(() => {
    const cometInterval = setInterval(() => {
      triggerMemeComet();
    }, 3600);
    return () => clearInterval(cometInterval);
  }, [triggerMemeComet]);

  // 4. PRELOAD PLANET ASSETS & SETUP PHYSICS
  useEffect(() => {
    if (typeof window === "undefined") return;

    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

    ECOSYSTEMS_DATA.forEach(eco => {
      const img = new window.Image();
      img.src = `/logos/${eco.id}.svg`;
      logosRef.current[eco.id] = img;
    });

    // Preload meme coin comets
    MEME_COMET_TYPES.forEach(m => {
      const img = new window.Image();
      img.src = `/meme/${m.file}`;
      memeBitmaps.current[m.id] = img;
    });

    // Preload pookie face central sun
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

    const starCount = isMobile ? 65 : 140;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * 900,
        size: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.1,
        twinkleSpeed: Math.random() * 0.003 + 0.0008,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // 5. RESIZE HANDLER
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

  // 6. KEYBOARD ACCESSIBILITY (Left/Right arrow keys cycle worlds)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
        const nextIdx = (idx + 1) % ECOSYSTEMS_DATA.length;
        onSelect(ECOSYSTEMS_DATA[nextIdx]);
        playSoundBlip(580, 0.06);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const idx = ECOSYSTEMS_DATA.findIndex(p => p.id === selectedId);
        const prevIdx = (idx - 1 + ECOSYSTEMS_DATA.length) % ECOSYSTEMS_DATA.length;
        onSelect(ECOSYSTEMS_DATA[prevIdx]);
        playSoundBlip(520, 0.06);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onSelect, playSoundBlip]);

  // Reset Camera View
  const handleResetCamera = () => {
    cameraRef.current.targetZoom = 1.0;
    cameraRef.current.targetRotation = 0;
    cameraRef.current.targetPanX = 0;
    cameraRef.current.targetPanY = 0;
    playSoundBlip(480, 0.08);
  };

  const handleZoom = (delta: number) => {
    cameraRef.current.targetZoom = Math.max(0.55, Math.min(2.0, cameraRef.current.targetZoom + delta));
    playSoundBlip(540, 0.06);
  };

  // 7. MAIN 120 FPS PURE CANVAS SOLAR SYSTEM RENDERER
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

      frameCountRef.current++;
      if (time - lastFpsUpdateRef.current >= 600) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
        setFps(Math.min(120, Math.max(60, measuredFps)));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = time;
      }

      const w = containerRef.current?.clientWidth || 1000;
      const h = containerRef.current?.clientHeight || 750;
      const isMobile = w < 768;

      const cx = w / 2;
      const cy = h / 2 - (isMobile ? 25 : 10);

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

      // ─── A. STARFIELD PARTICLES ─────────────────────────────────
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = Math.max(0.04, Math.min(s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.2, 0.85));
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

      // ─── VARIANT 2: CYBERNETIC RADAR BACKGROUND GRID ───
      if (variantMode === "cyber-radar") {
        radarSweepAngle.current += 0.02 * speedMultiplier;
        // Concentric Range Rings
        ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.15)" : "rgba(0, 217, 255, 0.14)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        [120, 240, 360, 480].forEach(r => {
          ctx.beginPath();
          ctx.arc(0, 0, r * (isMobile ? 0.65 : 1.0), 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // 8 Radial Azimuth Axis Lines
        ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.08)" : "rgba(0, 217, 255, 0.08)";
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 550, Math.sin(ang) * 550);
          ctx.stroke();
        }

        // Rotating Green/Cyan Radar Scanner Sweep
        const sweepGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 450);
        sweepGrad.addColorStop(0, "rgba(0, 217, 255, 0.25)");
        sweepGrad.addColorStop(1, "transparent");
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 450, radarSweepAngle.current, radarSweepAngle.current + 0.35);
        ctx.closePath();
        ctx.fill();
      } else if (variantMode === "minimal-void") {
        // ─── VARIANT 3: MINIMALIST VOID BACKGROUND RINGS ───
        ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.08)" : "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 0.6;
        [150, 320, 480].forEach(r => {
          ctx.beginPath();
          ctx.arc(0, 0, r * (isMobile ? 0.60 : 0.95), 0, Math.PI * 2);
          ctx.stroke();
        });
      } else {
        // ─── VARIANT 1: LUMINOUS HYPER-CORE COORDINATE RINGS ───
        ctx.strokeStyle = isDay ? "rgba(22, 163, 74, 0.12)" : "rgba(0, 255, 102, 0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]);
        [90, 200, 320, 440].forEach(r => {
          ctx.beginPath();
          ctx.arc(0, 0, r * (isMobile ? 0.60 : 0.95), 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Neon Solar Pulse Waves
        pulseRadius.current = (pulseRadius.current + (isPaused ? 0.06 : 0.42 * speedMultiplier)) % 380;
        for (let ring = 0; ring < 3; ring++) {
          const r = (pulseRadius.current + ring * 125) % 380;
          const fade = Math.max(0, 1 - r / 380);
          ctx.strokeStyle = isDay 
            ? `rgba(22, 163, 74, ${fade * 0.18})` 
            : `rgba(0, 255, 102, ${fade * 0.16})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * tilt, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ─── C. ORBITAL TRACKS ──────────────────────────────────────
      planetsRef.current.forEach(p => {
        const isSelected = selectedId === p.id;
        const isHovered = p.isHovered;

        ctx.beginPath();
        ctx.ellipse(0, 0, p.baseRadius, p.baseRadius * tilt, 0, 0, Math.PI * 2);

        if (isSelected) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = variantMode === "minimal-void" ? 1.8 : 2.4;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = variantMode === "minimal-void" ? 8 : 18;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Flowing energy photon on selected orbit
          const leadPhase = (time * 0.0006 * speedMultiplier) % 1;
          const leadAngle = leadPhase * Math.PI * 2;
          const lx = Math.cos(leadAngle) * p.baseRadius;
          const ly = Math.sin(leadAngle) * (p.baseRadius * tilt);

          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(lx, ly, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isHovered) {
          ctx.strokeStyle = isDay ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.45)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          ctx.strokeStyle = variantMode === "minimal-void"
            ? (isDay ? "rgba(100, 116, 139, 0.10)" : "rgba(255, 255, 255, 0.04)")
            : (isDay ? "rgba(100, 116, 139, 0.14)" : "rgba(255, 255, 255, 0.065)");
          ctx.lineWidth = variantMode === "minimal-void" ? 0.6 : 0.85;
          ctx.stroke();
        }
      });

      // ─── D. ADVANCE PLANETS & KINETIC SLINGSHOT ──────────────────
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relMouseX = (mouseRef.current.x - (cx + cam.panX)) / cam.zoom;
      const relMouseY = (mouseRef.current.y - (cy + cam.panY)) / cam.zoom;
      const worldMouseX = relMouseX * invCos - relMouseY * invSin;
      const worldMouseY = relMouseX * invSin + relMouseY * invCos;

      planetsRef.current.forEach(p => {
        if (!isPaused && !p.isDragging) {
          p.angle += p.baseSpeed * dt * 0.06 * speedMultiplier;
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

        if (!isPaused) {
          p.trail.push({ x: p.x, y: p.y, alpha: 0.5 });
          if (p.trail.length > 8) p.trail.shift();
        }

        const hitDist = Math.hypot(p.x - worldMouseX, p.y - worldMouseY);
        p.isHovered = hitDist < (isMobile ? 26 : 22);
      });

      // ─── E. THE CENTRAL SUN: theUG_ (POOKIE FACE SUN) ───────────
      coronaAngle.current += 0.012;
      const sunCoreR = isMobile ? 38 : 48;

      if (variantMode === "cyber-radar") {
        // ── VARIANT 2: CYBERNETIC RADAR SUN ──
        ctx.save();
        ctx.rotate(coronaAngle.current * 0.7);
        ctx.strokeStyle = isDay ? "rgba(2, 132, 199, 0.45)" : "rgba(0, 217, 255, 0.55)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR + 12, 0, Math.PI * 2);
        ctx.stroke();

        // 4 Axis Cardinal Crosshairs (000°, 090°, 180°, 270°)
        for (let a = 0; a < 4; a++) {
          const ang = (a * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * (sunCoreR + 4), Math.sin(ang) * (sunCoreR + 4));
          ctx.lineTo(Math.cos(ang) * (sunCoreR + 22), Math.sin(ang) * (sunCoreR + 22));
          ctx.stroke();
        }
        ctx.restore();

        // Holographic Cyan Edge Glow
        ctx.shadowColor = "#00D9FF";
        ctx.shadowBlur = isDay ? 18 : 32;
        ctx.strokeStyle = "#00D9FF";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (variantMode === "minimal-void") {
        // ── VARIANT 3: MINIMALIST VOID SUN ──
        const halo = ctx.createRadialGradient(0, 0, sunCoreR * 0.6, 0, 0, sunCoreR * 2.2);
        halo.addColorStop(0, isDay ? "rgba(20, 24, 39, 0.25)" : "rgba(255, 255, 255, 0.35)");
        halo.addColorStop(0.5, isDay ? "rgba(20, 24, 39, 0.08)" : "rgba(255, 255, 255, 0.1)");
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isDay ? "rgba(0,0,0,0.35)" : "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR + 2, 0, Math.PI * 2);
        ctx.stroke();

      } else {
        // ── VARIANT 1: LUMINOUS HYPER-CORE SUN (DEFAULT) ──
        // Outer Neon-Lime Coronal Glow Ring
        const outerGlow = ctx.createRadialGradient(0, 0, sunCoreR * 0.5, 0, 0, sunCoreR * 2.8);
        outerGlow.addColorStop(0, isDay ? "rgba(22, 163, 74, 0.45)" : "rgba(0, 255, 102, 0.55)");
        outerGlow.addColorStop(0.5, isDay ? "rgba(16, 185, 129, 0.18)" : "rgba(0, 255, 102, 0.2)");
        outerGlow.addColorStop(1, "transparent");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 12 Rotating Solar Flares
        ctx.save();
        ctx.rotate(coronaAngle.current);
        for (let f = 0; f < 12; f++) {
          const fAngle = (f / 12) * Math.PI * 2;
          const flareLen = (f % 2 === 0 ? 18 : 10) * (isMobile ? 0.8 : 1.1);
          ctx.strokeStyle = isDay ? "rgba(22, 163, 74, 0.35)" : "rgba(204, 255, 0, 0.45)";
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(Math.cos(fAngle) * (sunCoreR + 2), Math.sin(fAngle) * (sunCoreR + 2));
          ctx.lineTo(Math.cos(fAngle) * (sunCoreR + flareLen), Math.sin(fAngle) * (sunCoreR + flareLen));
          ctx.stroke();
        }
        ctx.restore();

        // 8 Counter-Rotating Inner Energy Halo
        ctx.save();
        ctx.rotate(-coronaAngle.current * 0.85);
        for (let f = 0; f < 8; f++) {
          const fAngle = (f / 8) * Math.PI * 2 + 0.2;
          ctx.strokeStyle = isDay ? "rgba(5, 150, 105, 0.4)" : "rgba(0, 255, 102, 0.4)";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(fAngle) * (sunCoreR + 3), Math.sin(fAngle) * (sunCoreR + 3));
          ctx.lineTo(Math.cos(fAngle) * (sunCoreR + 13), Math.sin(fAngle) * (sunCoreR + 13));
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Pookie Face Central Sun Body (Circular Clipped)
      const pookieImg = sunImgRef.current;
      if (pookieImg && pookieImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR, 0, Math.PI * 2);
        ctx.clip();

        // Dark background base
        ctx.fillStyle = "#000000";
        ctx.fill();

        // Centered face portrait
        const imgScale = sunCoreR * 2.35;
        ctx.drawImage(pookieImg, -imgScale / 2, -imgScale / 2 + (sunCoreR * 0.08), imgScale, imgScale);
        ctx.restore();

        // Radiant Solar Ring Border
        const borderColor = variantMode === "cyber-radar" ? "#00D9FF" : (variantMode === "minimal-void" ? "#FFFFFF" : (isDay ? "#16A34A" : "#00FF66"));
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = isDay ? 18 : 30;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Fallback luminous neon-lime core if image is loading
        ctx.shadowColor = isDay ? "rgba(22, 163, 74, 0.6)" : "rgba(0, 255, 102, 0.9)";
        ctx.shadowBlur = isDay ? 22 : 38;
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sunCoreR);
        coreGrad.addColorStop(0, "#FFFFFF");
        coreGrad.addColorStop(0.3, isDay ? "#A7F3D0" : "#CCFF00");
        coreGrad.addColorStop(0.75, isDay ? "#16A34A" : "#00FF66");
        coreGrad.addColorStop(1, isDay ? "#065F46" : "#04381C");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, sunCoreR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Sun Core Identity Typography
      ctx.save();
      ctx.rotate(-cam.rotation);

      const labelY = sunCoreR + (isMobile ? 18 : 22);
      ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
      ctx.font = `bold ${isMobile ? 9.5 : 11}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("USMAAN GANI", 0, labelY);

      ctx.fillStyle = variantMode === "cyber-radar" ? "#00D9FF" : (variantMode === "minimal-void" ? (isDay ? "#475569" : "#CBD5E1") : (isDay ? "#16A34A" : "#00FF66"));
      ctx.font = `bold ${isMobile ? 7.5 : 8.5}px "IBM Plex Mono", monospace`;
      ctx.fillText("theUG_ // WEB3 CREATOR", 0, labelY + (isMobile ? 13 : 15));

      ctx.restore();

      // ─── F. RENDER THE 11 WORLDS (DEPTH-SORTED) ──────────────────
      const sortedPlanets = [...planetsRef.current].sort((a, b) => a.z - b.z);

      sortedPlanets.forEach(p => {
        const isSelected = selectedId === p.id;
        const depthScale = lerp(0.82, 1.18, (p.z + 1) / 2);
        const radius = (isSelected ? 23 : (p.isHovered ? 20 : 17)) * (isMobile ? 0.88 : 1.0) * depthScale;

        // Slingshot elastic tether
        if (p.isDragging) {
          const naturalOrbitX = Math.cos(p.angle) * p.baseRadius;
          const naturalOrbitY = Math.sin(p.angle) * (p.baseRadius * tilt);
          ctx.strokeStyle = `${p.color}cc`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(naturalOrbitX, naturalOrbitY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Particle comet dust
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let ti = 1; ti < p.trail.length; ti++) {
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
          }
          ctx.strokeStyle = `${p.color}38`;
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }

        // Selected Reticle & Sun Laser Lock Line
        if (isSelected) {
          ctx.strokeStyle = `${p.color}88`;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // 4-corner holographic targeting reticle
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;

          const bSize = radius + 8;
          ctx.beginPath();
          ctx.moveTo(p.x - bSize, p.y - bSize + 6);
          ctx.lineTo(p.x - bSize, p.y - bSize);
          ctx.lineTo(p.x - bSize + 6, p.y - bSize);

          ctx.moveTo(p.x + bSize - 6, p.y - bSize);
          ctx.lineTo(p.x + bSize, p.y - bSize);
          ctx.lineTo(p.x + bSize, p.y - bSize + 6);

          ctx.moveTo(p.x - bSize, p.y + bSize - 6);
          ctx.lineTo(p.x - bSize, p.y + bSize);
          ctx.lineTo(p.x - bSize + 6, p.y + bSize);

          ctx.moveTo(p.x + bSize - 6, p.y + bSize);
          ctx.lineTo(p.x + bSize, p.y + bSize);
          ctx.lineTo(p.x + bSize, p.y + bSize - 6);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Planet Sphere
        ctx.save();
        ctx.fillStyle = isDay ? "#FFFFFF" : "#0D0E12";
        ctx.strokeStyle = isSelected ? p.color : (isDay ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.25)");
        ctx.lineWidth = isSelected ? 2.6 : 1.2;

        if (isSelected || p.isHovered) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vector Logo
        const img = logosRef.current[p.id];
        if (img && img.complete) {
          const iconSize = radius * 1.15;
          ctx.drawImage(img, p.x - iconSize / 2, p.y - iconSize / 2, iconSize, iconSize);
        }

        // Upright readable tag badge
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-cam.rotation);

        const badgeLabel = p.ticker ? `${p.name} · ${p.ticker}` : p.name;
        ctx.font = `bold ${Math.round((isMobile ? 8.5 : 9.5) * depthScale)}px "IBM Plex Mono", monospace`;
        const textMetrics = ctx.measureText(badgeLabel);
        const padX = 5;
        const bgY = radius + 6;

        ctx.fillStyle = isDay ? "rgba(255, 255, 255, 0.95)" : "rgba(13, 14, 18, 0.90)";
        ctx.strokeStyle = isSelected ? p.color : (isDay ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.15)");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
          -textMetrics.width / 2 - padX,
          bgY,
          textMetrics.width + padX * 2,
          14 * depthScale,
          3
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, 0, bgY + (7 * depthScale));
        ctx.restore();

        ctx.restore();
      });

      // ─── G. MEME COIN METEORITES / COMETS PASSING BY ───────────────
      cometsRef.current.forEach(m => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx * speedMultiplier;
        m.y += m.vy * speedMultiplier;

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        if (m.trail.length > 12) m.trail.shift();

        // 1. Blazing Comet Tail
        if (m.trail.length > 1) {
          ctx.save();
          const tailGrad = ctx.createLinearGradient(m.trail[0].x, m.trail[0].y, m.x, m.y);
          tailGrad.addColorStop(0, "transparent");
          tailGrad.addColorStop(0.5, `${m.color}40`);
          tailGrad.addColorStop(1, `${m.color}ee`);

          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = variantMode === "minimal-void" ? 1.8 : 3.2;
          ctx.shadowColor = m.color;
          ctx.shadowBlur = variantMode === "minimal-void" ? 6 : 14;

          ctx.beginPath();
          ctx.moveTo(m.trail[0].x, m.trail[0].y);
          for (let i = 1; i < m.trail.length; i++) {
            ctx.lineTo(m.trail[i].x, m.trail[i].y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // 2. Comet Head & Meme Avatar
        const mImg = memeBitmaps.current[m.id];
        ctx.save();
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 16;

        if (mImg && mImg.complete) {
          const mSize = 26;
          ctx.drawImage(mImg, m.x - mSize / 2, m.y - mSize / 2, mSize, mSize);
        } else {
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Cyber-Radar Mode: Tactical HUD Lead Vector Line
        if (variantMode === "cyber-radar") {
          ctx.strokeStyle = `${m.color}aa`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.vx * 6, m.y + m.vy * 6);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = m.color;
          ctx.font = `bold 8px "IBM Plex Mono", monospace`;
          ctx.fillText(`[${m.name} // COMET]`, m.x + 14, m.y - 6);
        }

        ctx.restore();

        if (m.age >= m.lifespan || m.x < -120 || m.x > w + 120 || m.y > h + 120) {
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
  }, [isDayMode, isPaused, speedMultiplier, selectedId, variantMode]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - (w < 768 ? 25 : 10);
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
    let minD = w < 768 ? 32 : 24;

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
      playSoundBlip(640, 0.08);
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
    const cy = h / 2 - (w < 768 ? 25 : 10);
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
        playSoundBlip(720, 0.12);
      }
    }
    interactionRef.current.isPointerDown = false;
    interactionRef.current.dragPlanetId = null;
    interactionRef.current.isSlingshot = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0012;
    cameraRef.current.targetZoom = Math.max(0.55, Math.min(2.0, cameraRef.current.targetZoom + zoomDelta));
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[580px] sm:h-[640px] md:h-[720px] lg:h-[760px] overflow-hidden select-none border-b border-[var(--color-border)] rounded-2xl"
      aria-label="Interactive Web3 Solar System: TheUG Conviction Universe"
    >
      {/* ─────────────────────────────────────────────────────
          TOP HUD CONTROLS: 3 VARIANTS + TELEMETRY + ACTIONS
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 md:top-4 md:left-6 md:right-6 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: System Status & 3 Variant Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coordinates readout */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span className="font-mono text-[9.5px] text-[var(--color-text-primary)] font-bold tracking-wider">
              {fps} FPS // SOLARIS
            </span>
          </div>

          {/* 3 INTERACTIVE SOLAR SYSTEM VARIANTS */}
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border-bright)] bg-[var(--color-surface)]/95 backdrop-blur-md p-1 shadow-lg">
            <button
              onClick={() => { setVariantMode("hyper-core"); playSoundBlip(520, 0.08); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                variantMode === "hyper-core"
                  ? "bg-[rgba(0,255,102,0.18)] text-[var(--color-online)] border border-[var(--color-online)] font-bold shadow-[0_0_12px_rgba(0,255,102,0.35)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              title="Variant 1: Luminous Neon-Lime Solar Core & Fiery Comets"
            >
              <Sparkles size={11} className={variantMode === "hyper-core" ? "text-[var(--color-online)] animate-spin" : ""} />
              <span>1: HYPER-CORE</span>
            </button>

            <button
              onClick={() => { setVariantMode("cyber-radar"); playSoundBlip(640, 0.08); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                variantMode === "cyber-radar"
                  ? "bg-[rgba(0,217,255,0.18)] text-[var(--color-cyan)] border border-[var(--color-cyan)] font-bold shadow-[0_0_12px_rgba(0,217,255,0.35)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              title="Variant 2: Cybernetic Planetary Radar HUD & Target Reticles"
            >
              <Crosshair size={11} className={variantMode === "cyber-radar" ? "text-[var(--color-cyan)] animate-pulse" : ""} />
              <span>2: CYBER-RADAR</span>
            </button>

            <button
              onClick={() => { setVariantMode("minimal-void"); playSoundBlip(760, 0.08); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                variantMode === "minimal-void"
                  ? "bg-[var(--color-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-bright)] font-bold shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              title="Variant 3: Celestial Void Minimalist & Clean Diamond Orbits"
            >
              <Eye size={11} />
              <span>3: VOID-MINIMAL</span>
            </button>
          </div>
        </div>

        {/* Right: Actions & Comet Summoner */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Launch Meme Coin Comet */}
          <button
            onClick={() => { triggerMemeComet(); playSoundBlip(880, 0.12); }}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--color-amber)]/60 bg-[rgba(234,88,12,0.12)] text-[var(--color-amber-bright)] hover:bg-[rgba(234,88,12,0.22)] text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(234,88,12,0.25)] font-bold"
            title="Launch meme coin comet (Doge / Pepe / Shib / Pengu)"
          >
            <Zap size={12} className="animate-pulse" />
            <span className="hidden sm:inline">LAUNCH</span> COMET
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            title="Reset Solar View"
          >
            <RotateCcw size={13} />
          </button>

          {/* Zoom In/Out */}
          <div className="hidden sm:flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-0.5">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              playSoundBlip(480, 0.06);
            }}
            className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md text-[var(--color-text-primary)] cursor-pointer"
            title={isPaused ? "Resume orbits" : "Pause orbits"}
          >
            {isPaused ? <Play size={13} className="text-[var(--color-online)]" /> : <Pause size={13} />}
          </button>

          {/* Audio Hum */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              isSoundActive
                ? "border-[var(--color-cyan)] bg-[rgba(0,217,255,0.15)] text-[var(--color-cyan)] shadow-[0_0_12px_rgba(0,217,255,0.25)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
            title={isSoundActive ? "Mute audio drone" : "Activate 55Hz space drone"}
          >
            {isSoundActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          CANVAS SURFACE: 120 FPS PLANETARY MOTION
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
          BOTTOM INTERACTIVE QUICK SELECTOR (CAROUSEL)
          ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 md:left-8 md:right-8 z-30 flex items-center gap-1.5 overflow-x-auto scrollbar-none pointer-events-auto pb-0.5">
        <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider shrink-0 hidden md:inline">
          ORBIT TARGET:
        </span>
        {ECOSYSTEMS_DATA.map((eco) => {
          const isSelected = selectedId === eco.id;
          return (
            <button
              key={eco.id}
              onClick={() => {
                onSelect(eco);
                playSoundBlip(620, 0.08);
              }}
              className={`px-2.5 py-1 rounded-full font-mono text-[9px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[var(--color-surface)] border-2 font-bold shadow-md"
                  : "bg-[var(--color-surface)]/85 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
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
