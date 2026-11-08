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
  Compass, 
  Pause, 
  Play, 
  Layers, 
  Activity, 
  ExternalLink,
  Shield,
  Zap,
  Target,
  Share2,
  Sliders,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";

type TokenPhysics = TokenData & {
  baseRadius: number;
  baseSpeed: number;
  angle: number;
  x: number;
  y: number;
  z: number;
  targetX?: number;
  targetY?: number;
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
  scale: number;
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
  parallaxFactor: number;
};

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function NetworkMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("base");
  const [activeNarrative, setActiveNarrative] = useState<string>("ALL");
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"ORBIT" | "CONSTELLATION">("ORBIT");

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Animation & simulation refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const tokensRef = useRef<TokenPhysics[]>([]);
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], age: 0, lifespan: 0 },
  ]);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHoveringNode: false });
  const dprRef = useRef(1);
  const waveRadius = useRef(0);
  const coreAngle = useRef(0);

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

  // 2. TOGGLE CONTINUOUS AMBIENT SOUND
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
      scale: 1.2,
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

    // Uniformly distribute angles around 360 degrees so planets never cluster
    const count = TOKENS_DATA.length;
    tokensRef.current = TOKENS_DATA.map((t, idx) => {
      const distributedAngle = (idx / count) * (Math.PI * 2) + 0.35;
      return {
        ...t,
        baseRadius: t.radius * (window.innerWidth < 768 ? 0.60 : 0.88),
        baseSpeed: t.speed,
        angle: distributedAngle,
        x: 0,
        y: 0,
        z: 0,
        isHovered: false,
        trail: []
      };
    });

    const starCount = window.innerWidth < 768 ? 65 : 140;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * 850,
        size: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.12,
        twinkleSpeed: Math.random() * 0.003 + 0.0008,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: Math.random() * 0.025 + 0.006
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

      const scale = w < 768 ? 0.60 : (w < 1200 ? 0.76 : 0.88);
      tokensRef.current.forEach(t => {
        const original = TOKENS_DATA.find(orig => orig.id === t.id);
        if (original) t.baseRadius = original.radius * scale;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 6. MAIN 120 FPS HIGH CRAFT CANVAS ANIMATION
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let isUnmounted = false;

    const render = (time: number) => {
      if (isUnmounted) return;
      const dt = Math.min(time - (lastTimeRef.current || time), 64);
      lastTimeRef.current = time;

      const w = containerRef.current?.clientWidth || 1000;
      const h = containerRef.current?.clientHeight || 750;
      const cx = w / 2;
      const cy = h / 2 - 15;

      ctx.clearRect(0, 0, w, h);

      mouseRef.current.x = lerp(mouseRef.current.x, mouseRef.current.targetX, 0.14);
      mouseRef.current.y = lerp(mouseRef.current.y, mouseRef.current.targetY, 0.14);

      const isDay = isDayMode;
      const isConstellation = viewMode === "CONSTELLATION";

      // ─── A. RADAR BACKGROUND GRID / CONCENTRIC GUIDE RINGS ─────────
      ctx.save();
      ctx.strokeStyle = isDay ? "rgba(100, 116, 139, 0.08)" : "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;

      // Crosshair lines through center
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, h - 20);
      ctx.moveTo(30, cy);
      ctx.lineTo(w - 30, cy);
      ctx.stroke();

      // Subtle diagonal reticle ticks
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.arc(cx, cy, 320, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ─── B. COSMIC STARS / PARTICLES ───────────────────────────────
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const px = (s.x + (mouseRef.current.x - cx) * s.parallaxFactor + w) % w;
        const py = (s.y + (mouseRef.current.y - cy) * s.parallaxFactor + h) % h;
        const alpha = Math.max(0.04, Math.min(s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.2, 0.85));

        ctx.fillStyle = isDay ? `rgba(71, 85, 105, ${alpha * 0.45})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── C. GRAVITATIONAL WAVES FROM OPERATOR CORE ─────────────────
      waveRadius.current = (waveRadius.current + (isPaused ? 0.08 : 0.4 * speedMultiplier)) % 380;
      for (let ring = 0; ring < 3; ring++) {
        const r = (waveRadius.current + ring * 125) % 380;
        const fade = Math.max(0, 1 - r / 380);
        ctx.strokeStyle = isDay 
          ? `rgba(2, 132, 199, ${fade * 0.14})` 
          : `rgba(0, 217, 255, ${fade * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.58, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ─── D. ORBITAL PATHS (3D ELLIPTICAL TRACKS) ───────────────────
      if (!isConstellation) {
        tokensRef.current.forEach(tok => {
          const isSelected = selectedTokenId === tok.id;
          const isHovered = tok.isHovered;
          const matchesNarrative = activeNarrative === "ALL" || tok.narrative === activeNarrative;

          ctx.beginPath();
          ctx.ellipse(cx, cy, tok.baseRadius, tok.baseRadius * 0.58, 0, 0, Math.PI * 2);

          if (isSelected) {
            ctx.strokeStyle = tok.color;
            ctx.lineWidth = 2.2;
            ctx.shadowColor = tok.color;
            ctx.shadowBlur = 18;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Radiant particle circulating along selected orbit
            const leadPhase = (time * 0.0006 * speedMultiplier) % 1;
            const leadAngle = leadPhase * Math.PI * 2;
            const lx = cx + Math.cos(leadAngle) * tok.baseRadius;
            const ly = cy + Math.sin(leadAngle) * (tok.baseRadius * 0.58);

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = tok.color;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(lx, ly, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (isHovered) {
            ctx.strokeStyle = isDay ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
          } else {
            ctx.strokeStyle = isDay
              ? `rgba(100, 116, 139, ${matchesNarrative ? 0.14 : 0.04})`
              : `rgba(255, 255, 255, ${matchesNarrative ? 0.08 : 0.02})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      // ─── E. ADVANCE PLANETARY POSITIONS ────────────────────────────
      let hoveredAny = false;

      tokensRef.current.forEach((tok, idx) => {
        if (!isPaused && !isConstellation) {
          tok.angle += tok.baseSpeed * dt * 0.06 * speedMultiplier;
        }

        const currentR = tok.baseRadius;
        const targetOrbitX = cx + Math.cos(tok.angle) * currentR;
        const targetOrbitY = cy + Math.sin(tok.angle) * (currentR * 0.58);

        // In constellation view, place in hexagonal node distribution
        const constAngle = (idx / tokensRef.current.length) * Math.PI * 2;
        const constR = 190 + (idx % 2 === 0 ? 50 : -30);
        const targetConstX = cx + Math.cos(constAngle) * constR;
        const targetConstY = cy + Math.sin(constAngle) * (constR * 0.7);

        const destX = isConstellation ? targetConstX : targetOrbitX;
        const destY = isConstellation ? targetConstY : targetOrbitY;

        tok.x = lerp(tok.x || destX, destX, 0.12);
        tok.y = lerp(tok.y || destY, destY, 0.12);
        tok.z = isConstellation ? 0 : Math.sin(tok.angle);

        // Motion trail buffer
        if (!isPaused && !isConstellation) {
          tok.trail.push({ x: tok.x, y: tok.y, alpha: 0.6 });
          if (tok.trail.length > 8) tok.trail.shift();
        }

        const dist = Math.hypot(tok.x - mouseRef.current.x, tok.y - mouseRef.current.y);
        tok.isHovered = dist < 24;
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

          const isConnectedToSelected = selectedTokenId === srcId || selectedTokenId === tgtId;
          const bridgeAlpha = isConnectedToSelected ? 0.75 : (isConstellation ? 0.35 : 0.15);

          const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
          grad.addColorStop(0, `${src.color}${Math.round(bridgeAlpha * 255).toString(16).padStart(2, "0")}`);
          grad.addColorStop(1, `${tgt.color}${Math.round(bridgeAlpha * 255).toString(16).padStart(2, "0")}`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = isConnectedToSelected ? 1.8 : 0.9;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();

          // Flowing data packets along active bridge
          if (isConnectedToSelected || isConstellation) {
            const phase = (time * 0.0012 * speedMultiplier + (src.id.charCodeAt(0) % 7)) % 1;
            const px = lerp(src.x, tgt.x, phase);
            const py = lerp(src.y, tgt.y, phase);

            ctx.fillStyle = isDay ? src.color : "#ffffff";
            ctx.shadowColor = src.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      });

      // ─── G. CENTRAL OPERATOR CORE (THE STELLAR BEACON) ────────────
      coreAngle.current += 0.012;
      const coreR = 26;

      ctx.save();
      // Corona flare rays
      ctx.translate(cx, cy);
      ctx.rotate(coreAngle.current);
      for (let f = 0; f < 8; f++) {
        const fAngle = (f / 8) * Math.PI * 2;
        ctx.strokeStyle = isDay ? "rgba(234, 88, 12, 0.18)" : "rgba(0, 217, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * (coreR + 3), Math.sin(fAngle) * (coreR + 3));
        ctx.lineTo(Math.cos(fAngle) * (coreR + 14), Math.sin(fAngle) * (coreR + 14));
        ctx.stroke();
      }
      ctx.restore();

      // Core sphere
      ctx.shadowColor = isDay ? "rgba(234, 88, 12, 0.5)" : "rgba(0, 217, 255, 0.85)";
      ctx.shadowBlur = isDay ? 20 : 36;
      ctx.fillStyle = isDay ? "#EA580C" : "#00D9FF";
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // White hot radiant center
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Operator beacon label
      ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
      ctx.font = 'bold 9px "IBM Plex Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("OPERATOR BEACON", cx, cy + coreR + 15);

      // ─── H. RENDER PLANETS (DEPTH SORTED) ──────────────────────────
      const sortedTokens = [...tokensRef.current].sort((a, b) => a.z - b.z);

      sortedTokens.forEach(tok => {
        const isSelected = selectedTokenId === tok.id;
        const matchesNarrative = activeNarrative === "ALL" || tok.narrative === activeNarrative;

        const depthScale = isConstellation ? 1.0 : lerp(0.80, 1.22, (tok.z + 1) / 2);
        const depthAlpha = matchesNarrative ? lerp(0.60, 1.0, (tok.z + 1) / 2) : 0.2;
        const radius = (isSelected ? 24 : (tok.isHovered ? 21 : 18)) * depthScale;

        // Draw particle tail
        if (!isConstellation && tok.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(tok.trail[0].x, tok.trail[0].y);
          for (let ti = 1; ti < tok.trail.length; ti++) {
            ctx.lineTo(tok.trail[ti].x, tok.trail[ti].y);
          }
          ctx.strokeStyle = `${tok.color}33`;
          ctx.lineWidth = 2.0 * depthScale;
          ctx.stroke();
        }

        // Laser telemetry vector locking to center if selected
        if (isSelected) {
          ctx.strokeStyle = `${tok.color}99`;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tok.x, tok.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Radar targeting brackets around selected planet
          ctx.strokeStyle = tok.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 14;

          const bSize = radius + 10;
          ctx.beginPath();
          // Top-left bracket
          ctx.moveTo(tok.x - bSize, tok.y - bSize + 8);
          ctx.lineTo(tok.x - bSize, tok.y - bSize);
          ctx.lineTo(tok.x - bSize + 8, tok.y - bSize);
          // Top-right bracket
          ctx.moveTo(tok.x + bSize - 8, tok.y - bSize);
          ctx.lineTo(tok.x + bSize, tok.y - bSize);
          ctx.lineTo(tok.x + bSize, tok.y - bSize + 8);
          // Bottom-left bracket
          ctx.moveTo(tok.x - bSize, tok.y + bSize - 8);
          ctx.lineTo(tok.x - bSize, tok.y + bSize);
          ctx.lineTo(tok.x - bSize + 8, tok.y + bSize);
          // Bottom-right bracket
          ctx.moveTo(tok.x + bSize - 8, tok.y + bSize);
          ctx.lineTo(tok.x + bSize, tok.y + bSize);
          ctx.lineTo(tok.x + bSize, tok.y + bSize - 8);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.save();
        ctx.globalAlpha = depthAlpha;

        // Atmospheric glowing halo
        ctx.fillStyle = isDay ? "#FFFFFF" : "#0B0C10";
        ctx.strokeStyle = isSelected ? tok.color : (isDay ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.25)");
        ctx.lineWidth = isSelected ? 2.6 : 1.2;

        if (isSelected || tok.isHovered) {
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        ctx.arc(tok.x, tok.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Centered vector logo
        const img = tokenBitmaps.current[tok.id];
        if (img && img.complete) {
          const iconSize = radius * 1.15;
          ctx.drawImage(img, tok.x - iconSize / 2, tok.y - iconSize / 2, iconSize, iconSize);
        }

        // Monospace telemetry badge
        const badgeText = `${tok.label} · ${tok.convictionScore}%`;
        ctx.font = `bold ${Math.round(9.5 * depthScale)}px "IBM Plex Mono", monospace`;
        const textMetrics = ctx.measureText(badgeText);
        const padX = 6;
        const bgY = tok.y + radius + 7;

        // Label pill background
        ctx.fillStyle = isDay ? "rgba(255, 255, 255, 0.92)" : "rgba(11, 12, 16, 0.88)";
        ctx.strokeStyle = isSelected ? tok.color : (isDay ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.15)");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
          tok.x - textMetrics.width / 2 - padX,
          bgY,
          textMetrics.width + padX * 2,
          15 * depthScale,
          3
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDay ? "#0F172A" : "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, tok.x, bgY + (7.5 * depthScale));

        ctx.restore();
      });

      // ─── I. RENDER METEORS ─────────────────────────────────────────
      meteorsRef.current.forEach(m => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx * speedMultiplier;
        m.y += m.vy * speedMultiplier;

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        if (m.trail.length > 12) m.trail.shift();

        // Trail line
        ctx.beginPath();
        ctx.moveTo(m.trail[0].x, m.trail[0].y);
        for (let i = 1; i < m.trail.length; i++) {
          ctx.lineTo(m.trail[i].x, m.trail[i].y);
        }
        ctx.strokeStyle = `${m.color}88`;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Meteor Head
        const img = memeBitmaps.current[m.id];
        if (img && img.complete) {
          ctx.save();
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 16;
          ctx.drawImage(img, m.x - 14, m.y - 14, 28, 28);
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
  }, [isDayMode, isPaused, speedMultiplier, selectedTokenId, activeNarrative, viewMode]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickedTokenId = null;
    let minD = 36;

    tokensRef.current.forEach(tok => {
      const d = Math.hypot(tok.x - x, tok.y - y);
      if (d < minD) {
        minD = d;
        clickedTokenId = tok.id;
      }
    });

    if (clickedTokenId) {
      setSelectedTokenId(clickedTokenId);
      playBlip(640, 0.1);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
  };

  return (
    <section 
      id="onchain"
      ref={containerRef}
      className="relative w-full overflow-hidden select-none border-b border-[var(--color-border)]"
      style={{
        minHeight: "750px",
        height: "clamp(750px, 82vw, 920px)",
        background: isDayMode ? "#F8FAFC" : "var(--color-void)",
      }}
    >
      {/* ─────────────────────────────────────────────────────
          TOP CONTROL STRIP: CINEMATIC RADAR HEADERS
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-cyan)] animate-pulse shadow-[0_0_8px_var(--color-cyan)]" />
          <span className="text-[10.5px] text-[var(--color-cyan)] tracking-[0.2em] font-mono uppercase font-bold">
            OBSERVATORY RADAR // CELESTIAL CONVICTION MAP
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-wider text-[var(--color-text-primary)]">
          ONCHAIN CONVICTIONS
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] font-sans max-w-md mt-0.5">
          Planetary execution engines, tokenized stock L2s, and high-frequency orderbook architectures.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          TOP RIGHT CONTROLS: VIEW MODE, SPEED, METEOR, SOUND
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 md:top-8 md:right-12 z-30 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md p-1 font-mono text-[10px]">
          <button
            onClick={() => {
              setViewMode("ORBIT");
              playBlip(540, 0.08);
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === "ORBIT"
                ? "bg-[var(--color-cyan)] text-black font-bold shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Compass size={11} />
            <span>ORBITS</span>
          </button>
          <button
            onClick={() => {
              setViewMode("CONSTELLATION");
              playBlip(620, 0.08);
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === "CONSTELLATION"
                ? "bg-[var(--color-cyan)] text-black font-bold shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Share2 size={11} />
            <span>CONSTELLATION</span>
          </button>
        </div>

        {/* Speed multiplier & pause */}
        <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md p-1 font-mono text-[10px]">
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              playBlip(480, 0.06);
            }}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            title={isPaused ? "Resume orbits" : "Pause orbits"}
          >
            {isPaused ? <Play size={12} className="text-[var(--color-online)]" /> : <Pause size={12} />}
          </button>

          <span className="h-3 w-[1px] bg-[var(--color-border)] mx-1" />

          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                setSpeedMultiplier(spd);
                setIsPaused(false);
                playBlip(500 + spd * 100, 0.06);
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                speedMultiplier === spd && !isPaused
                  ? "bg-[var(--color-amber)] text-black font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Meteor shower launcher */}
        <button
          onClick={triggerMeteor}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md hover:border-[var(--color-amber)] text-[var(--color-text-primary)] hover:text-[var(--color-amber)] font-mono text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={12} className="text-[var(--color-amber)]" />
          <span className="hidden sm:inline">LAUNCH METEOR</span>
        </button>

        {/* Audio hum */}
        <button
          onClick={toggleAmbientSound}
          className={`p-2 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
            isSoundActive
              ? "border-[var(--color-cyan)] bg-[rgba(0,217,255,0.15)] text-[var(--color-cyan)] shadow-[0_0_16px_rgba(0,217,255,0.3)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)]/95 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
          title={isSoundActive ? "Mute audio drone" : "Activate 55Hz space drone"}
        >
          {isSoundActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
          NARRATIVE FILTER TABS
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-24 left-6 md:top-24 md:left-12 z-30 flex items-center gap-1.5 overflow-x-auto scrollbar-none pointer-events-auto max-w-[calc(100vw-48px)]">
        {[
          { id: "ALL", label: "ALL ECOSYSTEMS" },
          { id: "CONSUMER_L2", label: "CONSUMER L2 & RWAs" },
          { id: "HIGH_THROUGHPUT", label: "HIGH-THROUGHPUT & PERPS" },
          { id: "DEFI_CONSENSUS", label: "DEFI & LIQUIDITY" },
          { id: "SETTLEMENT", label: "BASE SETTLEMENT" },
        ].map((narrative) => (
          <button
            key={narrative.id}
            onClick={() => {
              setActiveNarrative(narrative.id);
              playBlip(550, 0.05);
            }}
            className={`px-3 py-1 rounded-full font-mono text-[9px] tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeNarrative === narrative.id
                ? "bg-[var(--color-amber)] text-black font-bold shadow-[0_0_12px_rgba(255,94,58,0.3)]"
                : "bg-[var(--color-surface)]/95 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {narrative.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────
          INTERACTIVE CANVAS SURFACE
          ───────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="absolute inset-0 cursor-crosshair"
        style={{ width: "100%", height: "100%", zIndex: 1 }}
      />

      {/* ─────────────────────────────────────────────────────
          FLOATING DOCKED HOLOGRAPHIC TELEMETRY CARD
          ───────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-20 left-6 md:bottom-24 md:left-12 z-30 w-[calc(100vw-48px)] sm:w-[410px] p-5 rounded-xl border border-[var(--color-border-bright)] shadow-2xl backdrop-blur-xl font-mono pointer-events-auto transition-all"
        style={{
          background: isDayMode ? "rgba(255, 255, 255, 0.96)" : "rgba(12, 12, 16, 0.94)",
          borderLeft: `4px solid ${activeToken.color}`,
        }}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)] mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 border"
              style={{ background: `${activeToken.color}18`, borderColor: `${activeToken.color}50` }}
            >
              <img src={`/logos/${activeToken.id}.svg`} alt={activeToken.label} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                {activeToken.name} [{activeToken.label}]
              </h3>
              <span className="text-[9px] text-[var(--color-text-muted)] tracking-wider">
                {activeToken.tier || "LAYER 1"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase"
              style={{
                color: activeToken.color,
                background: `${activeToken.color}15`,
                border: `1px solid ${activeToken.color}40`,
              }}
            >
              {activeToken.convictionScore}% CONVICTION
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-[var(--color-text-secondary)] font-sans leading-relaxed mb-3">
          {activeToken.thesis}
        </p>

        {/* Telemetry specs grid */}
        <div className="grid grid-cols-2 gap-2 text-[9px] pt-2 border-t border-[var(--color-border)]">
          <div>
            <span className="text-[var(--color-text-muted)] block text-[8.5px]">THROUGHPUT:</span>
            <span className="text-[var(--color-cyan)] font-bold text-[10px]">{activeToken.tps || "High"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)] block text-[8.5px]">FINALITY:</span>
            <span className="text-[var(--color-online)] font-bold text-[10px]">{activeToken.finality || "Fast"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[var(--color-text-muted)] block text-[8.5px]">CONSENSUS ARCHITECTURE:</span>
            <span className="text-[var(--color-text-primary)] truncate block font-bold">{activeToken.consensus || "PoS"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[var(--color-text-muted)] block text-[8.5px]">KEY ECOSYSTEM PROTOCOLS:</span>
            <span className="text-[var(--color-amber)] truncate block font-semibold">{activeToken.ecosystemHighlight}</span>
          </div>
        </div>

        {/* Operator commentary */}
        <div
          className="mt-3 p-2.5 rounded text-[10.5px] font-sans italic"
          style={{
            background: `${activeToken.color}08`,
            borderLeft: `2px solid ${activeToken.color}`,
            color: "var(--color-text-primary)",
          }}
        >
          {activeToken.comment}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          BOTTOM INTERACTIVE TOKEN PILLS (QUICK SELECTOR)
          ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-6 right-6 md:left-12 md:right-12 z-30 flex items-center gap-2 overflow-x-auto scrollbar-none pointer-events-auto pb-1">
        <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider shrink-0 hidden md:inline">
          TARGET LOCK:
        </span>
        {TOKENS_DATA.map((tok) => {
          const isSelected = selectedTokenId === tok.id;
          return (
            <button
              key={tok.id}
              onClick={() => {
                setSelectedTokenId(tok.id);
                playBlip(620, 0.08);
              }}
              className={`px-3 py-1 rounded-full font-mono text-[9.5px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[var(--color-elevated)] border-2 font-bold shadow-lg"
                  : "bg-[var(--color-surface)]/95 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              style={{
                borderColor: isSelected ? tok.color : undefined,
                color: isSelected ? (isDayMode ? "#000000" : "#ffffff") : undefined,
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tok.color }} />
              <span>{tok.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default memo(NetworkMap);
