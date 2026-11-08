// @ts-nocheck
"use client";

import React, { useEffect, useRef, memo, useState, useCallback, useMemo } from "react";
import { 
  TOKENS_DATA, 
  METEOR_TYPES, 
  ECOSYSTEM_RELATIONSHIPS, 
  TokenData 
} from "@/config/networkData";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw,
  Zap,
  ZoomIn,
  ZoomOut,
  X,
  Compass,
  ArrowUpRight
} from "lucide-react";

type TokenPhysics = TokenData & {
  baseRadius: number;
  baseSpeed: number;
  angle: number;
  x: number;
  y: number;
  z: number;
  // Slingshot / dragging physics
  isDragging: boolean;
  dragX: number;
  dragY: number;
  vx: number;
  vy: number;
  isHovered: boolean;
  trail: { x: number; y: number; alpha: number }[];
};

type Meteor = {
  active: boolean;
  id: string;
  color: string;
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

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function NetworkMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("base");
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [fpsDisplay, setFpsDisplay] = useState<number>(120);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Camera & Gesture Navigation Refs
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

  // Drag interaction states
  const interactionRef = useRef({
    isPointerDown: false,
    startX: 0,
    startY: 0,
    dragTokenId: null as string | null,
    isSlingshot: false,
    hasMoved: false,
  });

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHoveringNode: false });
  const dprRef = useRef(1);
  const waveRadius = useRef(0);
  const coreAngle = useRef(0);

  // Animation & simulation refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const tokensRef = useRef<TokenPhysics[]>([]);
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, trail: [], age: 0, lifespan: 0 },
  ]);

  // Preloaded image bitmaps
  const tokenBitmaps = useRef<Record<string, HTMLImageElement>>({});
  const memeBitmaps = useRef<Record<string, HTMLImageElement>>({});

  // Active selected token object
  const activeToken = useMemo(() => {
    return TOKENS_DATA.find(t => t.id === selectedTokenId) || TOKENS_DATA[0];
  }, [selectedTokenId]);

  // Sound feedback blip
  const playBlip = useCallback((freq = 520, duration = 0.08) => {
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
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [isSoundActive]);

  // 1. WATCH THEME (DAY VS NIGHT)
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

  // 2. AMBIENT AUDIO TOGGLE
  const toggleAmbientSound = () => {
    if (!isSoundActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        setIsSoundActive(true);
      } catch (err) {
        console.warn("Audio blocked:", err);
      }
    } else {
      try {
        oscRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {}
      setIsSoundActive(false);
    }
  };

  // 3. LAUNCH METEOR
  const triggerMeteor = useCallback(() => {
    const slot = meteorsRef.current.find(m => !m.active);
    if (!slot) return;

    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 750;

    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -40 : w + 40;
    const startY = Math.random() * (h * 0.4);

    const targetX = w * (0.2 + Math.random() * 0.6);
    const targetY = h * 0.6 + Math.random() * (h * 0.4);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = 8.5 + Math.random() * 4.0;
    const meme = METEOR_TYPES[Math.floor(Math.random() * METEOR_TYPES.length)];

    Object.assign(slot, {
      active: true,
      id: meme.id,
      color: meme.color,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      alpha: 1.0,
      trail: [],
      age: 0,
      lifespan: 140
    });

    playBlip(780, 0.12);
  }, [playBlip]);

  // 4. PRELOAD ASSETS & SETUP PHYSICS
  useEffect(() => {
    if (typeof window === "undefined") return;

    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

    TOKENS_DATA.forEach(t => {
      const img = new window.Image();
      img.src = `/logos/${t.id}.svg`;
      tokenBitmaps.current[t.id] = img;
    });

    METEOR_TYPES.forEach(m => {
      const img = new window.Image();
      img.src = `/meme/${m.file}`;
      memeBitmaps.current[m.id] = img;
    });

    const isMobile = window.innerWidth < 768;
    const count = TOKENS_DATA.length;

    tokensRef.current = TOKENS_DATA.map((t, idx) => {
      const goldenAngle = (idx / count) * (Math.PI * 2) + 0.35;
      return {
        ...t,
        baseRadius: t.radius * (isMobile ? 0.46 : 0.78),
        baseSpeed: t.speed * (isMobile ? 1.2 : 1.0),
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

    const starCount = isMobile ? 60 : 130;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * 900,
        size: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.12,
        twinkleSpeed: Math.random() * 0.003 + 0.0008,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // 5. RESIZE LISTENER
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
      const scale = isMobile ? 0.46 : (w < 1200 ? 0.68 : 0.78);
      tokensRef.current.forEach(t => {
        const original = TOKENS_DATA.find(orig => orig.id === t.id);
        if (original) t.baseRadius = original.radius * scale;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset Camera View
  const resetCamera = () => {
    cameraRef.current.targetZoom = 1.0;
    cameraRef.current.targetRotation = 0;
    cameraRef.current.targetPanX = 0;
    cameraRef.current.targetPanY = 0;
    playBlip(440, 0.08);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    cameraRef.current.targetZoom = Math.max(0.55, Math.min(2.2, cameraRef.current.targetZoom + delta));
    playBlip(550, 0.06);
  };

  // 6. MAIN 120 FPS PURE CANVAS SOLAR SYSTEM ENGINE
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
      // Clamp dt to preserve smooth 120 FPS physics
      const dt = Math.min(rawDt, 32);

      // FPS Counter calculation
      frameCountRef.current++;
      if (time - lastFpsUpdateRef.current >= 600) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
        setFpsDisplay(Math.min(120, Math.max(60, measuredFps)));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = time;
      }

      const w = containerRef.current?.clientWidth || 1000;
      const h = containerRef.current?.clientHeight || 750;
      const isMobile = w < 768;

      // Center with slight vertical offset for telemetry
      const cx = w / 2;
      const cy = h / 2 - (isMobile ? 35 : 15);

      ctx.clearRect(0, 0, w, h);

      // Smooth camera interpolation
      const cam = cameraRef.current;
      cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.12);
      cam.panX = lerp(cam.panX, cam.targetPanX, 0.12);
      cam.panY = lerp(cam.panY, cam.targetPanY, 0.12);

      // Rotation inertia & deceleration
      if (!interactionRef.current.isPointerDown && Math.abs(cam.rotationVelocity) > 0.0001) {
        cam.targetRotation += cam.rotationVelocity;
        cam.rotationVelocity *= 0.94;
      }
      cam.rotation = lerp(cam.rotation, cam.targetRotation, 0.15);

      const isDay = isDayMode;

      // ─── A. COSMIC STARS BACKGROUND ───────────────────────────────
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = Math.max(0.04, Math.min(s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.2, 0.85));
        ctx.fillStyle = isDay ? `rgba(71, 85, 105, ${alpha * 0.35})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── B. APPLY CAMERA TRANSFORM (PAN, ZOOM, ROTATION) ───────────
      ctx.save();
      ctx.translate(cx + cam.panX, cy + cam.panY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.rotate(cam.rotation);

      // Radial coordinate rings from center
      ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.07)" : "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      [80, 180, 300, 420].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r * (isMobile ? 0.65 : 1), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // ─── C. PULSING GRAVITATIONAL WAVES FROM SUN ───────────────────
      waveRadius.current = (waveRadius.current + (isPaused ? 0.06 : 0.45 * speedMultiplier)) % 360;
      for (let ring = 0; ring < 3; ring++) {
        const r = (waveRadius.current + ring * 120) % 360;
        const fade = Math.max(0, 1 - r / 360);
        ctx.strokeStyle = isDay 
          ? `rgba(2, 132, 199, ${fade * 0.15})` 
          : `rgba(0, 217, 255, ${fade * 0.12})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        // Dynamic tilt ratio: 0.62 on desktop, slightly rounder 0.72 on mobile for portrait visibility
        const tiltFactor = isMobile ? 0.72 : 0.62;
        ctx.ellipse(0, 0, r, r * tiltFactor, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ─── D. ORBITAL PATHS (3D ELLIPTICAL TRACKS) ───────────────────
      const tiltFactor = isMobile ? 0.72 : 0.62;

      tokensRef.current.forEach(tok => {
        const isSelected = selectedTokenId === tok.id;
        const isHovered = tok.isHovered;

        ctx.beginPath();
        ctx.ellipse(0, 0, tok.baseRadius, tok.baseRadius * tiltFactor, 0, 0, Math.PI * 2);

        if (isSelected) {
          ctx.strokeStyle = tok.color;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Glowing photon packet circulating on selected orbit
          const leadPhase = (time * 0.0006 * speedMultiplier) % 1;
          const leadAngle = leadPhase * Math.PI * 2;
          const lx = Math.cos(leadAngle) * tok.baseRadius;
          const ly = Math.sin(leadAngle) * (tok.baseRadius * tiltFactor);

          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(lx, ly, 3.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isHovered) {
          ctx.strokeStyle = isDay ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.45)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.12)" : "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // ─── E. ADVANCE PLANET POSITIONS & SLINGSHOT PHYSICS ───────────
      let hoveredAny = false;

      // Inverse mouse position back to untransformed space for hover tests
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relMouseX = (mouseRef.current.x - (cx + cam.panX)) / cam.zoom;
      const relMouseY = (mouseRef.current.y - (cy + cam.panY)) / cam.zoom;
      const worldMouseX = relMouseX * invCos - relMouseY * invSin;
      const worldMouseY = relMouseX * invSin + relMouseY * invCos;

      tokensRef.current.forEach(tok => {
        if (!isPaused && !tok.isDragging) {
          tok.angle += tok.baseSpeed * dt * 0.06 * speedMultiplier;
        }

        const naturalOrbitX = Math.cos(tok.angle) * tok.baseRadius;
        const naturalOrbitY = Math.sin(tok.angle) * (tok.baseRadius * tiltFactor);

        if (tok.isDragging) {
          // Follow drag with slingshot offset
          tok.x = tok.dragX;
          tok.y = tok.dragY;
        } else if (Math.hypot(tok.vx, tok.vy) > 0.1) {
          // Slingshot release spring-back physics
          tok.x += tok.vx;
          tok.y += tok.vy;
          tok.vx = lerp(tok.vx, (naturalOrbitX - tok.x) * 0.15, 0.2);
          tok.vy = lerp(tok.vy, (naturalOrbitY - tok.y) * 0.15, 0.2);
        } else {
          tok.x = naturalOrbitX;
          tok.y = naturalOrbitY;
          tok.vx = 0;
          tok.vy = 0;
        }

        tok.z = Math.sin(tok.angle);

        // Motion trail buffer
        if (!isPaused) {
          tok.trail.push({ x: tok.x, y: tok.y, alpha: 0.5 });
          if (tok.trail.length > 7) tok.trail.shift();
        }

        const hitDist = Math.hypot(tok.x - worldMouseX, tok.y - worldMouseY);
        tok.isHovered = hitDist < (isMobile ? 26 : 22);
        if (tok.isHovered) hoveredAny = true;
      });

      mouseRef.current.isHoveringNode = hoveredAny;

      // ─── F. INTER-ECOSYSTEM VECTOR BRIDGES ─────────────────────────
      const tokenMap = new Map(tokensRef.current.map(t => [t.id, t]));
      Object.entries(ECOSYSTEM_RELATIONSHIPS).forEach(([srcId, targets]) => {
        const src = tokenMap.get(srcId);
        if (!src) return;

        targets.forEach(tgtId => {
          const tgt = tokenMap.get(tgtId);
          if (!tgt) return;

          const isConnected = selectedTokenId === srcId || selectedTokenId === tgtId;
          const bridgeAlpha = isConnected ? 0.65 : 0.12;

          const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
          grad.addColorStop(0, `${src.color}${Math.round(bridgeAlpha * 255).toString(16).padStart(2, "0")}`);
          grad.addColorStop(1, `${tgt.color}${Math.round(bridgeAlpha * 255).toString(16).padStart(2, "0")}`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = isConnected ? 1.6 : 0.8;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();

          // Packet flow along connected bridge
          if (isConnected) {
            const phase = (time * 0.0012 * speedMultiplier + (src.id.charCodeAt(0) % 5)) % 1;
            const px = lerp(src.x, tgt.x, phase);
            const py = lerp(src.y, tgt.y, phase);

            ctx.fillStyle = isDay ? src.color : "#ffffff";
            ctx.shadowColor = src.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      });

      // ─── G. CENTRAL OPERATOR STAR (THE SUN) ────────────────────────
      coreAngle.current += 0.015;
      const sunR = isMobile ? 22 : 28;

      ctx.save();
      // Corona flares
      ctx.rotate(coreAngle.current);
      for (let f = 0; f < 8; f++) {
        const fAngle = (f / 8) * Math.PI * 2;
        ctx.strokeStyle = isDay ? "rgba(234, 88, 12, 0.2)" : "rgba(0, 217, 255, 0.28)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * (sunR + 2), Math.sin(fAngle) * (sunR + 2));
        ctx.lineTo(Math.cos(fAngle) * (sunR + 12), Math.sin(fAngle) * (sunR + 12));
        ctx.stroke();
      }
      ctx.restore();

      // Glowing Sun Core
      ctx.shadowColor = isDay ? "rgba(234, 88, 12, 0.55)" : "rgba(0, 217, 255, 0.85)";
      ctx.shadowBlur = isDay ? 18 : 34;
      ctx.fillStyle = isDay ? "#EA580C" : "#00D9FF";
      ctx.beginPath();
      ctx.arc(0, 0, sunR, 0, Math.PI * 2);
      ctx.fill();

      // White fusion hot spot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, sunR * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ─── H. RENDER PLANETS (DEPTH SORTED) ──────────────────────────
      const sortedTokens = [...tokensRef.current].sort((a, b) => a.z - b.z);

      sortedTokens.forEach(tok => {
        const isSelected = selectedTokenId === tok.id;
        const depthScale = lerp(0.82, 1.18, (tok.z + 1) / 2);
        const radius = (isSelected ? 23 : (tok.isHovered ? 20 : 17)) * (isMobile ? 0.88 : 1.0) * depthScale;

        // Slingshot elastic tether line if dragging
        if (tok.isDragging) {
          const naturalOrbitX = Math.cos(tok.angle) * tok.baseRadius;
          const naturalOrbitY = Math.sin(tok.angle) * (tok.baseRadius * tiltFactor);
          ctx.strokeStyle = `${tok.color}aa`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(naturalOrbitX, naturalOrbitY);
          ctx.lineTo(tok.x, tok.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Particle trail
        if (tok.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(tok.trail[0].x, tok.trail[0].y);
          for (let ti = 1; ti < tok.trail.length; ti++) {
            ctx.lineTo(tok.trail[ti].x, tok.trail[ti].y);
          }
          ctx.strokeStyle = `${tok.color}35`;
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }

        // Laser vector lock if selected
        if (isSelected) {
          ctx.strokeStyle = `${tok.color}88`;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(tok.x, tok.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Radar bracket reticles
          ctx.strokeStyle = tok.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 12;

          const bSize = radius + 8;
          ctx.beginPath();
          // 4 corner targeting brackets
          ctx.moveTo(tok.x - bSize, tok.y - bSize + 6);
          ctx.lineTo(tok.x - bSize, tok.y - bSize);
          ctx.lineTo(tok.x - bSize + 6, tok.y - bSize);

          ctx.moveTo(tok.x + bSize - 6, tok.y - bSize);
          ctx.lineTo(tok.x + bSize, tok.y - bSize);
          ctx.lineTo(tok.x + bSize, tok.y - bSize + 6);

          ctx.moveTo(tok.x - bSize, tok.y + bSize - 6);
          ctx.lineTo(tok.x - bSize, tok.y + bSize);
          ctx.lineTo(tok.x - bSize + 6, tok.y + bSize);

          ctx.moveTo(tok.x + bSize - 6, tok.y + bSize);
          ctx.lineTo(tok.x + bSize, tok.y + bSize);
          ctx.lineTo(tok.x + bSize, tok.y + bSize - 6);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Planet body
        ctx.save();
        ctx.fillStyle = isDay ? "#FFFFFF" : "#0D0E12";
        ctx.strokeStyle = isSelected ? tok.color : (isDay ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.25)");
        ctx.lineWidth = isSelected ? 2.5 : 1.2;

        if (isSelected || tok.isHovered) {
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 16;
        }

        ctx.beginPath();
        ctx.arc(tok.x, tok.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Centered Vector Logo
        const img = tokenBitmaps.current[tok.id];
        if (img && img.complete) {
          const iconSize = radius * 1.15;
          ctx.drawImage(img, tok.x - iconSize / 2, tok.y - iconSize / 2, iconSize, iconSize);
        }

        // Counter-rotate text so planet badges stay upright and readable!
        ctx.save();
        ctx.translate(tok.x, tok.y);
        ctx.rotate(-cam.rotation);

        const badgeText = `${tok.label} · ${tok.convictionScore}%`;
        ctx.font = `bold ${Math.round((isMobile ? 8.5 : 9.5) * depthScale)}px "IBM Plex Mono", monospace`;
        const textMetrics = ctx.measureText(badgeText);
        const padX = 5;
        const bgY = radius + 6;

        ctx.fillStyle = isDay ? "rgba(255, 255, 255, 0.95)" : "rgba(13, 14, 18, 0.90)";
        ctx.strokeStyle = isSelected ? tok.color : (isDay ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.15)");
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
        ctx.fillText(badgeText, 0, bgY + (7 * depthScale));
        ctx.restore();

        ctx.restore();
      });

      // RESTORE CAMERA TRANSFORM
      ctx.restore();

      // ─── I. RENDER METEORS IN SCREEN SPACE ─────────────────────────
      meteorsRef.current.forEach(m => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx * speedMultiplier;
        m.y += m.vy * speedMultiplier;

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        if (m.trail.length > 10) m.trail.shift();

        // Trail line
        ctx.beginPath();
        ctx.moveTo(m.trail[0].x, m.trail[0].y);
        for (let i = 1; i < m.trail.length; i++) {
          ctx.lineTo(m.trail[i].x, m.trail[i].y);
        }
        ctx.strokeStyle = `${m.color}88`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Meteor Head
        const img = memeBitmaps.current[m.id];
        if (img && img.complete) {
          ctx.save();
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 14;
          ctx.drawImage(img, m.x - 13, m.y - 13, 26, 26);
          ctx.restore();
        }

        if (m.age >= m.lifespan || m.x < -80 || m.x > w + 80 || m.y > h + 80) {
          m.active = false;
        }
      });

      rafRef.current = requestAnimationFrame(render);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(render);

    return () => {
      isUnmounted = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDayMode, isPaused, speedMultiplier, selectedTokenId]);

  // Pointer & Gesture Interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - (w < 768 ? 35 : 15);
    const cam = cameraRef.current;

    // Transform click to world coordinate system
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

    // Check if clicked directly on a planet for tactile slingshot / lock
    let hitPlanet: TokenPhysics | null = null;
    let minD = w < 768 ? 34 : 26;

    tokensRef.current.forEach(tok => {
      const d = Math.hypot(tok.x - worldX, tok.y - worldY);
      if (d < minD) {
        minD = d;
        hitPlanet = tok;
      }
    });

    if (hitPlanet) {
      interactionRef.current.dragTokenId = hitPlanet.id;
      interactionRef.current.isSlingshot = true;
      hitPlanet.isDragging = true;
      hitPlanet.dragX = worldX;
      hitPlanet.dragY = worldY;
      setSelectedTokenId(hitPlanet.id);
      setShowTelemetry(true);
      playBlip(640, 0.09);
    } else {
      interactionRef.current.dragTokenId = null;
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

    const cam = cameraRef.current;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - (w < 768 ? 35 : 15);

    if (interactionRef.current.isSlingshot && interactionRef.current.dragTokenId) {
      // Move dragged planet in world coordinates
      const invCos = Math.cos(-cam.rotation);
      const invSin = Math.sin(-cam.rotation);
      const relX = (clientX - (cx + cam.panX)) / cam.zoom;
      const relY = (clientY - (cy + cam.panY)) / cam.zoom;
      const worldX = relX * invCos - relY * invSin;
      const worldY = relX * invSin + relY * invCos;

      const tok = tokensRef.current.find(t => t.id === interactionRef.current.dragTokenId);
      if (tok) {
        tok.dragX = worldX;
        tok.dragY = worldY;
      }
    } else {
      // Free drag gesture: Rotate the planetary system around the sun with angular delta
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
    if (interactionRef.current.isSlingshot && interactionRef.current.dragTokenId) {
      const tok = tokensRef.current.find(t => t.id === interactionRef.current.dragTokenId);
      if (tok) {
        tok.isDragging = false;
        // Release slingshot impulse velocity
        const tiltFactor = (containerRef.current?.clientWidth || 1000) < 768 ? 0.72 : 0.62;
        const naturalX = Math.cos(tok.angle) * tok.baseRadius;
        const naturalY = Math.sin(tok.angle) * (tok.baseRadius * tiltFactor);
        tok.vx = (naturalX - tok.dragX) * 0.22;
        tok.vy = (naturalY - tok.dragY) * 0.22;
        playBlip(720, 0.1);
      }
    }
    interactionRef.current.isPointerDown = false;
    interactionRef.current.dragTokenId = null;
    interactionRef.current.isSlingshot = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    cameraRef.current.targetZoom = Math.max(0.55, Math.min(2.2, cameraRef.current.targetZoom + zoomDelta));
  };

  return (
    <section 
      id="onchain"
      ref={containerRef}
      className="relative w-full h-[calc(100vh-52px)] min-h-[580px] overflow-hidden select-none"
      style={{
        background: isDayMode ? "#F8FAFC" : "#07080B",
      }}
    >
      {/* ─────────────────────────────────────────────────────
          TOP CONTROL STRIP: STATUS & CONTROLS
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Radar Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md pointer-events-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span className="text-[10px] text-[var(--color-text-primary)] font-mono font-bold tracking-wider">
              {fpsDisplay} FPS // SOLAR SYSTEM
            </span>
          </div>

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] pointer-events-auto transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Zoom buttons */}
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
              playBlip(480, 0.06);
            }}
            className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md text-[var(--color-text-primary)] cursor-pointer"
            title={isPaused ? "Resume orbits" : "Pause orbits"}
          >
            {isPaused ? <Play size={13} className="text-[var(--color-online)]" /> : <Pause size={13} />}
          </button>

          {/* Meteor Launcher */}
          <button
            onClick={triggerMeteor}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md text-[var(--color-text-primary)] hover:text-[var(--color-amber)] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
            title="Launch Memetic Meteor"
          >
            <Sparkles size={12} className="text-[var(--color-amber)]" />
            <span className="hidden sm:inline">METEOR</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAmbientSound}
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              isSoundActive
                ? "border-[var(--color-cyan)] bg-[rgba(0,217,255,0.15)] text-[var(--color-cyan)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-muted)]"
            }`}
            title={isSoundActive ? "Mute drone" : "55Hz space drone"}
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
          SLIDING HOLOGRAPHIC TELEMETRY CARD (RESPONSIVE)
          ───────────────────────────────────────────────────── */}
      {showTelemetry && activeToken && (
        <div
          className="absolute z-30 transition-all duration-300 font-mono pointer-events-auto
            bottom-16 left-3 right-3 sm:right-auto sm:left-6 md:left-8 sm:w-[360px] md:w-[380px]
            p-4 sm:p-5 rounded-xl border border-[var(--color-border-bright)] shadow-2xl backdrop-blur-xl"
          style={{
            background: isDayMode ? "rgba(255, 255, 255, 0.96)" : "rgba(10, 11, 15, 0.94)",
            borderLeft: `4px solid ${activeToken.color}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center p-1 border"
                style={{ background: `${activeToken.color}18`, borderColor: `${activeToken.color}50` }}
              >
                <img src={`/logos/${activeToken.id}.svg`} alt={activeToken.label} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[var(--color-text-primary)]">
                  {activeToken.name} [{activeToken.label}]
                </h3>
                <span className="text-[8.5px] text-[var(--color-text-muted)] tracking-wider">
                  {activeToken.tier || "LAYER 1"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                style={{
                  color: activeToken.color,
                  background: `${activeToken.color}15`,
                  border: `1px solid ${activeToken.color}40`,
                }}
              >
                {activeToken.convictionScore}% CONVICTION
              </span>
              <button
                onClick={() => setShowTelemetry(false)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Thesis */}
          <p className="text-[11px] text-[var(--color-text-secondary)] font-sans leading-relaxed mb-2.5">
            {activeToken.thesis}
          </p>

          {/* Telemetry specs */}
          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] pt-2 border-t border-[var(--color-border)]">
            <div>
              <span className="text-[var(--color-text-muted)] block text-[7.5px]">THROUGHPUT</span>
              <span className="text-[var(--color-cyan)] font-bold">{activeToken.tps || "High"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] block text-[7.5px]">FINALITY</span>
              <span className="text-[var(--color-online)] font-bold">{activeToken.finality || "Fast"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[var(--color-text-muted)] block text-[7.5px]">CONSENSUS MODEL</span>
              <span className="text-[var(--color-text-primary)] truncate block font-semibold">{activeToken.consensus || "PoS"}</span>
            </div>
          </div>

          {/* Quote */}
          <div
            className="mt-2.5 p-2 rounded text-[9.5px] font-sans italic"
            style={{
              background: `${activeToken.color}08`,
              borderLeft: `2px solid ${activeToken.color}`,
              color: "var(--color-text-primary)",
            }}
          >
            {activeToken.comment}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          BOTTOM INTERACTIVE QUICK SWITCHER CAROUSEL
          ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 md:left-8 md:right-8 z-30 flex items-center gap-1.5 overflow-x-auto scrollbar-none pointer-events-auto pb-0.5">
        <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider shrink-0 hidden md:inline">
          ORBIT TARGET:
        </span>
        {TOKENS_DATA.map((tok) => {
          const isSelected = selectedTokenId === tok.id;
          return (
            <button
              key={tok.id}
              onClick={() => {
                setSelectedTokenId(tok.id);
                setShowTelemetry(true);
                playBlip(620, 0.08);
              }}
              className={`px-2.5 py-1 rounded-full font-mono text-[9px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[var(--color-surface)] border-2 font-bold shadow-md"
                  : "bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              style={{
                borderColor: isSelected ? tok.color : undefined,
                color: isSelected ? (isDayMode ? "#000000" : "#ffffff") : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tok.color }} />
              <span>{tok.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default memo(NetworkMap);
