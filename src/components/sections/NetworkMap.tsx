// @ts-nocheck
"use client";

import React, { useEffect, useRef, memo, useState, useCallback } from "react";
import { 
  TOKENS_DATA, 
  METEOR_TYPES, 
  ECOSYSTEM_RELATIONSHIPS, 
  CATEGORY_LABELS, 
  mobileConfig, 
  tabletConfig, 
  desktopConfig,
  TokenData 
} from "@/config/networkData";
import { 
  Zap, 
  Activity, 
  Radio, 
  Maximize2, 
  RotateCw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  ExternalLink 
} from "lucide-react";

type TokenState = TokenData & {
  baseRadius: number;
  baseSpeed: number;
  angle: number;
  x: number;
  y: number;
  dragX: number | null;
  dragY: number | null;
  vx: number;
  vy: number;
  isDragging: boolean;
  isHovered: boolean;
  trail: { x: number; y: number; alpha: number }[];
  rotation: number;
};

type MeteorState = {
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
  isRare: boolean;
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

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export function NetworkMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation and State Refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const rareMeteorCooldown = useRef<number>(0); 
  const isTouchDeviceRef = useRef<boolean>(false);
  const reduceMotionRef = useRef<boolean>(false);
  const configRef = useRef(desktopConfig);
  const dprRef = useRef(1);

  const [hasEntered, setHasEntered] = useState(false);
  const [canvasError, setCanvasError] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);
  const [activeTelemetry, setActiveTelemetry] = useState<TokenData | null>(null);

  const tokensRef = useRef<TokenState[]>([]);
  const starsRef = useRef<Star[]>([]);
  const speedRef = useRef<number>(1.0);
  speedRef.current = speedMultiplier;

  // Audio Context Ref for synthetic ambient hum
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Meteor pool
  const meteorsData = useRef<MeteorState[]>([
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], isRare: false, age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], isRare: false, age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], isRare: false, age: 0, lifespan: 0 },
    { active: false, id: "", color: "", x: 0, y: 0, vx: 0, vy: 0, alpha: 0, scale: 1, trail: [], isRare: false, age: 0, lifespan: 0 }
  ]);
  const meteorDOMRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null]);
  const meteorImgRefs = useRef<Array<HTMLImageElement | null>>([null, null, null, null]);
  const preloadedMemes = useRef<Record<string, HTMLImageElement>>({});

  const domRefs = useRef<Record<string, HTMLDivElement>>({});
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false, downId: null as string | null });
  const globalRareGlow = useRef<{ active: boolean, color: string, alpha: number }>({ active: false, color: "", alpha: 0 });

  // Gravitational pulse wave tracker
  const waveRadius = useRef(0);

  // 1. SOUND GENERATION TOGGLE
  const toggleAmbientSound = () => {
    if (!isSoundActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A hum (55Hz)
        gain.gain.setValueAtTime(0.015, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsSoundActive(true);
      } catch (err) {
        console.warn("Audio Context init blocked:", err);
      }
    } else {
      try {
        oscillatorRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {}
      setIsSoundActive(false);
    }
  };

  // 2. MANUAL METEOR TRIGGER
  const triggerManualMeteor = useCallback(() => {
    const slotIdx = meteorsData.current.findIndex(m => !m.active);
    if (slotIdx === -1) return;

    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 800;

    const isLeft = Math.random() > 0.5;
    const startX = isLeft ? -40 : w + 40;
    const startY = Math.random() * (h * 0.4);

    const targetX = w * (0.3 + Math.random() * 0.4);
    const targetY = h * 0.6 + Math.random() * (h * 0.4);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = 8.5 + Math.random() * 4.0;

    const randomMeme = METEOR_TYPES[Math.floor(Math.random() * METEOR_TYPES.length)];

    meteorsData.current[slotIdx] = {
      active: true,
      id: randomMeme.id,
      color: randomMeme.color,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      alpha: 1.0,
      scale: 1.25,
      trail: [],
      isRare: true,
      age: 0,
      lifespan: 160
    };

    globalRareGlow.current = { active: true, color: randomMeme.color, alpha: 0.6 };
  }, []);

  // 3. SELECT TOKEN FOR SPOTLIGHT
  const handleSelectToken = (tokenId: string) => {
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null);
      setActiveTelemetry(null);
    } else {
      setSelectedTokenId(tokenId);
      const found = TOKENS_DATA.find(t => t.id === tokenId);
      if (found) setActiveTelemetry(found);
    }
  };

  // 4. CANVAS MOUNT & LIFECYCLE
  useEffect(() => {
    if (typeof window === "undefined") return;

    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dprRef.current = Math.min(window.devicePixelRatio || 1, 1.5);

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;
    
    if (isMobile) configRef.current = mobileConfig;
    else if (isTablet) configRef.current = tabletConfig;
    else configRef.current = desktopConfig;

    // Preload meme images
    METEOR_TYPES.forEach(m => {
      const img = new Image();
      img.src = `/meme/${m.file}`;
      preloadedMemes.current[m.id] = img;
    });

    // Initialize tokens
    tokensRef.current = TOKENS_DATA.map(t => {
      let startAngle = Math.random() * Math.PI * 2;
      if (t.id === 'sol') startAngle = 1.0;
      if (t.id === 'sui') startAngle = 1.1; 
      if (t.id === 'eth') startAngle = 3.0;
      if (t.id === 'polygon') startAngle = 3.1;
      if (t.id === 'base') startAngle = 3.4;

      return {
        ...t,
        baseRadius: t.radius * configRef.current.radiusScale,
        baseSpeed: reduceMotionRef.current ? t.speed * 0.3 : t.speed,
        angle: startAngle,
        x: 0, y: 0, dragX: null, dragY: null, vx: 0, vy: 0,
        isDragging: false, isHovered: false, trail: [], rotation: 0
      };
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
       setCanvasError(true);
       return;
    }

    // Resize handler
    let resizeTimeout: NodeJS.Timeout;
    const resize = () => {
      if (!containerRef.current || !canvas) return;
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        const w = containerRef.current!.clientWidth;
        const h = containerRef.current!.clientHeight;
        canvas.width = w * dprRef.current;
        canvas.height = h * dprRef.current;
        ctx.scale(dprRef.current, dprRef.current);
        
        const m = w < 768;
        const t = w >= 768 && w < 1280;
        const newConfig = m ? mobileConfig : (t ? tabletConfig : desktopConfig);
        
        if (configRef.current.radiusScale !== newConfig.radiusScale) {
           configRef.current = newConfig;
           tokensRef.current.forEach(tok => {
              const orig = TOKENS_DATA.find(td => td.id === tok.id);
              if (orig) tok.baseRadius = orig.radius * newConfig.radiusScale;
           });
        }
      }, 120);
    };
    resize();
    window.addEventListener("resize", resize);

    // Populate cosmic stars
    const numStars = configRef.current.starCount;
    const stars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 900),
        size: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.002 + 0.0005,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: Math.random() * 0.03 + 0.01 
      });
    }
    starsRef.current = stars;
    rareMeteorCooldown.current = performance.now() + 12000;

    return () => {
       window.removeEventListener("resize", resize);
       clearTimeout(resizeTimeout);
       try {
         oscillatorRef.current?.stop();
         audioCtxRef.current?.close();
       } catch {}
    };
  }, []);

  // Intersection Observer for initial entrance pulse
  useEffect(() => {
    if (typeof window === "undefined" || canvasError) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasEntered) {
         setHasEntered(true);
         if (!reduceMotionRef.current) {
            globalRareGlow.current = { active: true, color: "#00d9ff", alpha: 0.9 };
         }
      }
    }, { threshold: 0.25 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [hasEntered, canvasError]);

  // 5. ANIMATION LOOP
  useEffect(() => {
    if (!canvasRef.current || canvasError) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isUnmounted = false;

    const animate = (time: number) => {
      if (isUnmounted) return;
      const dt = Math.min((time - (lastTimeRef.current || time)), 100);
      lastTimeRef.current = time;

      const width = containerRef.current?.clientWidth || 1000;
      const height = containerRef.current?.clientHeight || 800;

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // A. MOUSE SMOOTHING
      mouseRef.current.x = lerp(mouseRef.current.x, mouseRef.current.targetX, 0.12);
      mouseRef.current.y = lerp(mouseRef.current.y, mouseRef.current.targetY, 0.12);

      // B. DRAW PARALLAX TWINKLING STARS
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const parallaxX = (mouseRef.current.x - centerX) * s.parallaxFactor;
        const parallaxY = (mouseRef.current.y - centerY) * s.parallaxFactor;
        const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.25;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(alpha, 0.85))})`;
        ctx.beginPath();
        ctx.arc((s.x + parallaxX + width) % width, (s.y + parallaxY + height) % height, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. CONCENTRIC GRAVITATIONAL WAVES FROM OPERATOR CORE
      waveRadius.current = (waveRadius.current + 0.4 * speedRef.current) % 360;
      for (let ring = 0; ring < 3; ring++) {
        const r = (waveRadius.current + ring * 120) % 360;
        const alpha = Math.max(0, 1 - r / 360) * 0.08;
        ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // D. DRAW DYNAMIC ORBITAL RINGS
      tokensRef.current.forEach(tok => {
        const isSelected = selectedTokenId === tok.id;
        const isHovered = tok.isHovered;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          tok.baseRadius,
          tok.baseRadius * tok.ellipseFactor,
          0,
          0,
          Math.PI * 2
        );

        if (isSelected) {
          ctx.strokeStyle = tok.color;
          ctx.lineWidth = 2.0;
          ctx.shadowColor = tok.color;
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (isHovered) {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.35)`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // E. DRAW INTER-ECOSYSTEM BRIDGES (ETH <-> BASE <-> POLYGON, SOL <-> SUI)
      const tokenMap = new Map(tokensRef.current.map(t => [t.id, t]));
      ctx.lineWidth = 1.0;

      Object.entries(ECOSYSTEM_RELATIONSHIPS).forEach(([sourceId, targets]) => {
        const src = tokenMap.get(sourceId);
        if (!src) return;

        targets.forEach(tgtId => {
          const tgt = tokenMap.get(tgtId);
          if (!tgt) return;

          const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
          grad.addColorStop(0, `${src.color}44`);
          grad.addColorStop(1, `${tgt.color}44`);

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();

          // Flowing data packet photon
          const packetPhase = (time * 0.0015 * speedRef.current + (src.id.charCodeAt(0) % 5)) % 1;
          const px = lerp(src.x, tgt.x, packetPhase);
          const py = lerp(src.y, tgt.y, packetPhase);

          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = src.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // F. UPDATE & RENDER PLANETARY TOKENS
      tokensRef.current.forEach(tok => {
        if (!tok.isDragging) {
          // Advance angle based on orbital speed and user speed multiplier
          tok.angle += tok.baseSpeed * dt * 0.06 * speedRef.current;
        }

        const breathe = Math.sin(time * tok.breatheSpeed) * tok.breatheAmount;
        const currentR = tok.baseRadius + breathe;

        const targetX = centerX + Math.cos(tok.angle) * currentR;
        const targetY = centerY + Math.sin(tok.angle) * (currentR * tok.ellipseFactor);

        if (tok.isDragging && tok.dragX !== null && tok.dragY !== null) {
          tok.x = lerp(tok.x, tok.dragX, 0.3);
          tok.y = lerp(tok.y, tok.dragY, 0.3);
        } else {
          tok.x = lerp(tok.x, targetX, 0.15);
          tok.y = lerp(tok.y, targetY, 0.15);
        }

        // Check hover
        const distToMouse = Math.hypot(tok.x - mouseRef.current.x, tok.y - mouseRef.current.y);
        tok.isHovered = distToMouse < 28;

        // Position DOM icon node
        const dom = domRefs.current[tok.id];
        if (dom) {
          dom.style.transform = `translate3d(${tok.x - 24}px, ${tok.y - 24}px, 0)`;

          const isSelected = selectedTokenId === tok.id;
          if (isSelected) {
            dom.style.borderColor = tok.color;
            dom.style.boxShadow = `0 0 24px ${tok.color}, inset 0 0 12px ${tok.color}`;
          } else if (tok.isHovered) {
            dom.style.borderColor = "var(--color-amber)";
            dom.style.boxShadow = `0 0 18px rgba(255,94,58,0.5)`;
          } else {
            dom.style.borderColor = "var(--color-border)";
            dom.style.boxShadow = "none";
          }
        }

        // Draw targeted laser lock if selected
        if (selectedTokenId === tok.id) {
          ctx.strokeStyle = `rgba(0, 217, 255, 0.4)`;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(tok.x, tok.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Targeting bracket ring
          ctx.strokeStyle = tok.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(tok.x, tok.y, 32, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // G. METEORS PASS (MEMETIC METEORS)
      if (Math.random() < configRef.current.meteorSpawnRate * speedRef.current) {
        // Natural meteor spawn
        const slotIdx = meteorsData.current.findIndex(m => !m.active);
        if (slotIdx !== -1) {
          const isLeft = Math.random() > 0.5;
          const startX = isLeft ? -30 : width + 30;
          const startY = Math.random() * (height * 0.4);
          const targetX = width * (0.2 + Math.random() * 0.6);
          const targetY = height * 0.5 + Math.random() * (height * 0.5);
          const angle = Math.atan2(targetY - startY, targetX - startX);
          const velocity = 7.0 + Math.random() * 3.5;
          const randomMeme = METEOR_TYPES[Math.floor(Math.random() * METEOR_TYPES.length)];

          meteorsData.current[slotIdx] = {
            active: true,
            id: randomMeme.id,
            color: randomMeme.color,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1.0,
            scale: 1.0,
            trail: [],
            isRare: false,
            age: 0,
            lifespan: 140
          };
        }
      }

      // Update meteors
      meteorsData.current.forEach((m, idx) => {
        if (!m.active) return;
        m.age++;
        m.x += m.vx * speedRef.current;
        m.y += m.vy * speedRef.current;
        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        if (m.trail.length > 14) m.trail.shift();

        // Draw meteor blazing tail
        for (let t = 0; t < m.trail.length; t++) {
          const pt = m.trail[t];
          const trailAlpha = (t / m.trail.length) * 0.5 * m.alpha;
          ctx.fillStyle = m.color;
          ctx.globalAlpha = trailAlpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (t / m.trail.length) * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Position DOM icon for meteor
        const dom = meteorDOMRefs.current[idx];
        if (dom) {
          if (m.age >= m.lifespan || m.x < -100 || m.x > width + 100 || m.y > height + 100) {
            m.active = false;
            dom.style.visibility = "hidden";
          } else {
            dom.style.visibility = "visible";
            dom.style.transform = `translate3d(${m.x - 16}px, ${m.y - 16}px, 0) scale(${m.scale})`;
          }
        }
      });

      // H. GLOBAL AMBIENT FLASH (ON ENTRY OR RARE EVENT)
      if (globalRareGlow.current.active) {
        ctx.fillStyle = globalRareGlow.current.color;
        ctx.globalAlpha = globalRareGlow.current.alpha * 0.08;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
        globalRareGlow.current.alpha *= 0.94;
        if (globalRareGlow.current.alpha < 0.01) globalRareGlow.current.active = false;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      isUnmounted = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedTokenId, canvasError]);

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let closestId = null;
    let minD = 36;
    tokensRef.current.forEach(tok => {
      const d = Math.hypot(tok.x - x, tok.y - y);
      if (d < minD) { minD = d; closestId = tok.id; }
    });

    if (closestId) {
      mouseRef.current.downId = closestId;
      mouseRef.current.isDown = true;
      const tok = tokensRef.current.find(t => t.id === closestId);
      if (tok) { tok.isDragging = true; tok.dragX = x; tok.dragY = y; }
      handleSelectToken(closestId);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;

    if (mouseRef.current.isDown && mouseRef.current.downId) {
       const tok = tokensRef.current.find(t => t.id === mouseRef.current.downId);
       if (tok) { tok.dragX = x; tok.dragY = y; }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (mouseRef.current.downId) {
      const tok = tokensRef.current.find(t => t.id === mouseRef.current.downId);
      if (tok) tok.isDragging = false;
    }
    mouseRef.current.isDown = false;
    mouseRef.current.downId = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (canvasError) {
    return (
      <section className="relative w-full h-[850px] bg-[var(--color-void)] flex items-center justify-center border-t border-[var(--color-border)]">
        <p className="font-mono text-sm text-[var(--color-text-muted)]">CANVAS_RENDER_FAILED // VISUALIZATION_OFFLINE</p>
      </section>
    );
  }

  return (
    <section 
      id="onchain"
      ref={containerRef}
      className="relative w-full overflow-hidden select-none touch-none border-t border-b border-[var(--color-border)]" 
      style={{ height: "clamp(640px, 85vw, 880px)", background: "transparent" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ─────────────────────────────────────────────────────
          TOP CINEMATIC HUD BAR: TITLE & LIVE TELEMETRY
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-6 left-6 md:top-10 md:left-12 z-40 pointer-events-none" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] animate-pulse shadow-[0_0_8px_var(--color-cyan)]" />
          <span className="text-[10px] text-[var(--color-cyan)] tracking-[0.25em] uppercase font-bold">
            OBSERVATORY RADAR // ACTIVE TELEMETRY
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-[var(--color-text-primary)] mb-1" style={{ textShadow: "0 0 24px rgba(0,217,255,0.4)" }}>
          ONCHAIN CONVICTIONS
        </h2>
        <p className="text-[11px] text-[var(--color-text-secondary)] max-w-sm md:max-w-md leading-relaxed">
          Planetary state machines, execution engines, and settlement layers monitored by Usmaan Gani.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          TOP RIGHT CONTROLS: SPEED, SOUND & METEOR BUTTONS
          ───────────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 md:top-10 md:right-12 z-40 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Speed multiplier selector */}
        <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-1 font-mono text-[10px]">
          <span className="px-2 text-[var(--color-text-muted)] flex items-center gap-1">
            <RotateCw size={11} /> SPEED:
          </span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeedMultiplier(spd)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                speedMultiplier === spd
                  ? "bg-[var(--color-cyan)] text-black font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Meteor shower trigger button */}
        <button
          onClick={triggerManualMeteor}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md hover:border-[var(--color-amber)] text-[var(--color-text-primary)] hover:text-[var(--color-amber)] font-mono text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,94,58,0.15)]"
          title="Fire memetic meteor pulse across canvas"
        >
          <Sparkles size={12} className="text-[var(--color-amber)]" />
          <span className="hidden sm:inline">LAUNCH METEOR</span>
        </button>

        {/* Ambient audio toggle */}
        <button
          onClick={toggleAmbientSound}
          className={`p-2 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
            isSoundActive
              ? "border-[var(--color-cyan)] bg-[rgba(0,217,255,0.15)] text-[var(--color-cyan)] shadow-[0_0_16px_rgba(0,217,255,0.3)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
          title={isSoundActive ? "Mute ambient audio" : "Activate synthetic 55Hz space hum"}
        >
          {isSoundActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
          INTERACTIVE TOKEN PILLS (QUICK SPOTLIGHT SELECTOR)
          ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 z-40 flex items-center justify-between gap-3 pointer-events-auto overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-wider shrink-0 hidden md:inline">
            SELECT NODE:
          </span>
          {TOKENS_DATA.map((tok) => {
            const isSelected = selectedTokenId === tok.id;
            return (
              <button
                key={tok.id}
                onClick={() => handleSelectToken(tok.id)}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[var(--color-elevated)] border-2 font-bold shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                    : "bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)]"
                }`}
                style={{
                  borderColor: isSelected ? tok.color : undefined,
                  color: isSelected ? "#ffffff" : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: tok.color }}
                />
                <span>{tok.label}</span>
              </button>
            );
          })}
        </div>

        {selectedTokenId && (
          <button
            onClick={() => {
              setSelectedTokenId(null);
              setActiveTelemetry(null);
            }}
            className="px-3 py-1.5 rounded font-mono text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-amber)] shrink-0 cursor-pointer"
          >
            ✕ CLEAR FOCUS
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
          CANVAS SURFACE
          ───────────────────────────────────────────────────── */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%", zIndex: 1 }} />

      {/* Operator Node Core Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 z-10 pointer-events-none text-center mix-blend-screen">
        <div className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] text-[var(--color-cyan)] opacity-80" style={{ textShadow: "0 0 12px var(--color-cyan-glow)" }}>
          theug.operator_node // BASELINE
        </div>
      </div>

      {/* Category Sector Tags */}
      {CATEGORY_LABELS.map((cat, idx) => (
        <div 
          key={cat.text}
          ref={el => { if (el) labelRefs.current[idx] = el; }}
          className="absolute left-0 top-0 font-mono text-[8px] md:text-[9px] tracking-widest text-[var(--color-text-muted)] pointer-events-none mix-blend-screen will-change-transform opacity-60"
        >
           [{cat.text}]
        </div>
      ))}

      {/* Memetic Meteor Floating DOM Nodes */}
      {METEOR_TYPES.map((m, idx) => (
        <div
          key={`meteor-${idx}`}
          ref={el => { if (el) meteorDOMRefs.current[idx] = el; }}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(10, 15, 25, 0.65)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            border: `1px solid ${m.color}66`,
            boxShadow: `0 0 16px ${m.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            willChange: "transform, opacity, visibility",
            zIndex: 10, visibility: "hidden", pointerEvents: "none"
          }}
        >
          <img
            ref={el => { if (el) meteorImgRefs.current[idx] = el; }}
            src={`/meme/${m.file}`} alt={m.id} className="pointer-events-none"
            style={{ width: "20px", height: "20px", display: "block" }}
          />
        </div>
      ))}

      {/* Planetary Token Interactive Nodes */}
      {TOKENS_DATA.map(tok => (
        <div
          key={tok.id}
          ref={el => { if (el) domRefs.current[tok.id] = el; }}
          onClick={() => handleSelectToken(tok.id)}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 50, height: 50, borderRadius: "50%",
            background: "var(--color-surface)",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "box-shadow 0.2s, border-color 0.2s, transform 0.1s", 
            willChange: "transform", zIndex: 20,
            cursor: "pointer"
          }}
          title={`Click to inspect ${tok.label} conviction thesis`}
        >
          <img
            src={`/logos/${tok.id}.svg`} alt={tok.label} className="pointer-events-none"
            style={{ width: "26px", height: "26px", display: "block" }}
          />
        </div>
      ))}

      {/* ─────────────────────────────────────────────────────
          HOLOGRAPHIC DOCKED TELEMETRY CARD (WHEN TOKEN CLICKED)
          ───────────────────────────────────────────────────── */}
      {activeTelemetry && (
        <div
          className="absolute top-24 right-6 md:top-28 md:right-12 z-50 w-[calc(100vw-48px)] sm:w-[340px] p-5 rounded-xl border border-[var(--color-border-bright)] shadow-[0_16px_48px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-fade-in font-mono"
          style={{
            background: "linear-gradient(180deg, rgba(16,16,22,0.95) 0%, rgba(8,8,12,0.98) 100%)",
            borderLeft: `3px solid ${activeTelemetry.color}`,
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: activeTelemetry.color }} />
              <span className="font-bold text-sm text-[var(--color-text-primary)]">
                {activeTelemetry.label} // {activeTelemetry.tier || "LAYER 1"}
              </span>
            </div>
            <button
              onClick={() => setActiveTelemetry(null)}
              className="text-[var(--color-text-muted)] hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block mb-0.5">
                OPERATOR THESIS
              </span>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-sans">
                {activeTelemetry.thesis}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)] text-[10px]">
              <div>
                <span className="text-[var(--color-text-muted)] block text-[8.5px]">THROUGHPUT:</span>
                <span className="text-[var(--color-cyan)] font-bold">{activeTelemetry.tps || "High"}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block text-[8.5px]">FINALITY:</span>
                <span className="text-[var(--color-online)] font-bold">{activeTelemetry.finality || "Fast"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-muted)] block text-[8.5px]">CONSENSUS:</span>
                <span className="text-[var(--color-text-primary)] truncate block">{activeTelemetry.consensus || "PoS"}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[rgba(0,217,255,0.06)] border border-[rgba(0,217,255,0.15)] mt-1">
              <span className="text-[8px] text-[var(--color-cyan)] uppercase tracking-wider block font-bold mb-0.5">
                OPERATOR COMMENTARY
              </span>
              <p className="text-[10px] text-[var(--color-text-primary)] italic">
                {activeTelemetry.comment}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(NetworkMap);
