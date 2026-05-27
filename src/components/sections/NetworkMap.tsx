// @ts-nocheck
"use client";

import React, { useEffect, useRef, memo, useState } from "react";
import { 
  TOKENS_DATA, 
  METEOR_TYPES, 
  ECOSYSTEM_RELATIONSHIPS, 
  CATEGORY_LABELS, 
  mobileConfig, 
  tabletConfig, 
  desktopConfig 
} from "@/config/networkData";

const DEBUG_PERF = process.env.NODE_ENV === "development";

// Types
type TokenState = {
  id: string;
  label: string;
  color: string;
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
  wobbleSpeed: number;
  wobbleAmount: number;
  ellipseFactor: number;
  breatheSpeed: number;
  breatheAmount: number;
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

function CosmicEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Performance and State Refs
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const rareMeteorCooldown = useRef<number>(0); 
  const isTouchDeviceRef = useRef<boolean>(false);
  const reduceMotionRef = useRef<boolean>(false);
  
  // Dynamic scaling multipliers based on FPS
  const particleScaleRef = useRef<number>(1.0);
  const recentFps = useRef<number[]>([]);

  // Config mapping
  const configRef = useRef(desktopConfig);
  const dprRef = useRef(1);

  const [hasEntered, setHasEntered] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ fps: 0, scale: 1 });
  const [canvasError, setCanvasError] = useState(false);
  const tokensRef = useRef<TokenState[]>([]);
  const starsRef = useRef<Star[]>([]);
  
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
  const telemetryRef = useRef<HTMLDivElement>(null);
  
  // Telemetry DOM nodes
  const tTitle = useRef<HTMLDivElement>(null);
  const tRole = useRef<HTMLDivElement>(null);
  const tThesis = useRef<HTMLDivElement>(null);
  const tStrengths = useRef<HTMLDivElement>(null);
  const tSector = useRef<HTMLDivElement>(null);
  const tComment = useRef<HTMLDivElement>(null);
  
  const telemetryDataRef = useRef({
    id: null as string | null, x: 0, y: 0, alpha: 0, 
    label: "", role: "", thesis: "", strengths: "", sector: "", comment: ""
  });

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false, downId: null as string | null });
  const globalRareGlow = useRef<{ active: boolean, color: string, alpha: number }>({ active: false, color: "", alpha: 0 });

  // 1. IRONCLAD HYDRATION & INITIALIZATION
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect touch and reduced motion
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dprRef.current = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR at 1.5 to save GPU

    // Determine hardware config
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;
    
    if (isMobile) configRef.current = mobileConfig;
    else if (isTablet) configRef.current = tabletConfig;
    else configRef.current = desktopConfig;

    // Mobile GPU Safety (low concurrency devices)
    if (isMobile && (navigator.hardwareConcurrency || 4) <= 4) {
      configRef.current = { ...mobileConfig, particleDensity: 0.2, meteorSpawnRate: 0.0001, blurSpread: 0.2 };
    }

    // Preload Images
    METEOR_TYPES.forEach(m => {
      const img = new Image();
      img.src = `/meme/${m.file}`;
      preloadedMemes.current[m.id] = img;
    });

    tokensRef.current = TOKENS_DATA.map(t => {
      let startAngle = Math.random() * Math.PI * 2;
      if (t.id === 'sol') startAngle = 1.0;
      if (t.id === 'sui') startAngle = 1.1; 
      if (t.id === 'eth') startAngle = 3.0;
      if (t.id === 'polygon') startAngle = 3.1;

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

    // Debounced Resize
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
      }, 150);
    };
    resize();
    window.addEventListener("resize", resize);

    const numStars = configRef.current.starCount;
    const stars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1000),
        y: Math.random() * (window.innerHeight || 800),
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.002 + 0.0005,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxFactor: Math.random() * 0.04 + 0.01 
      });
    }
    starsRef.current = stars;
    rareMeteorCooldown.current = performance.now() + 15000;

    return () => {
       window.removeEventListener("resize", resize);
       clearTimeout(resizeTimeout);
    };
  }, []);

  // Intersection Observer for entry pulse
  useEffect(() => {
    if (typeof window === "undefined" || canvasError) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasEntered) {
         setHasEntered(true);
         if (!reduceMotionRef.current) {
            globalRareGlow.current = { active: true, color: "#0ff", alpha: 0.8 };
         }
      }
    }, { threshold: 0.3 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [hasEntered, canvasError]);

  const spawnMeteor = (width: number, height: number, time: number) => {
    if (reduceMotionRef.current) return;
    const slotIdx = meteorsData.current.findIndex(m => !m.active);
    if (slotIdx === -1) return;

    const isRareTime = time > rareMeteorCooldown.current;
    const isRare = isRareTime && Math.random() < 0.25; 
    
    if (isRare) {
       rareMeteorCooldown.current = time + 30000 + Math.random() * 15000; 
       globalRareGlow.current = { active: true, color: "", alpha: 0.6 };
    }

    const m = meteorsData.current[slotIdx];
    const typePool = isRare ? METEOR_TYPES.filter(t => t.id === 'doge' || t.id === 'pepe') : METEOR_TYPES;
    const type = typePool[Math.floor(Math.random() * typePool.length)];
    
    if (isRare) globalRareGlow.current.color = type.color;

    m.active = true;
    m.id = type.id;
    m.color = type.color;
    m.isRare = isRare;
    m.alpha = 0; 
    m.scale = isRare ? 1.8 : 0.8 + Math.random() * 0.4;
    m.trail = [];
    m.age = 0;
    m.lifespan = isRare ? 8000 : 5000; 

    const edge = Math.floor(Math.random() * 4); 
    const speedBase = isRare ? (1.0 + Math.random() * 0.5) : (0.12 + Math.random() * 0.1);
    
    if (edge === 0) {
      m.x = Math.random() * width; m.y = -50;
      m.vx = (Math.random() - 0.5) * speedBase; m.vy = Math.random() * speedBase + 0.1;
    } else if (edge === 1) {
      m.x = width + 50; m.y = Math.random() * height;
      m.vx = -(Math.random() * speedBase + 0.1); m.vy = (Math.random() - 0.5) * speedBase;
    } else if (edge === 2) {
      m.x = Math.random() * width; m.y = height + 50;
      m.vx = (Math.random() - 0.5) * speedBase; m.vy = -(Math.random() * speedBase + 0.1);
    } else {
      m.x = -50; m.y = Math.random() * height;
      m.vx = (Math.random() * speedBase + 0.1); m.vy = (Math.random() - 0.5) * speedBase;
    }

    const imgEl = meteorImgRefs.current[slotIdx];
    if (imgEl && preloadedMemes.current[m.id]) {
       imgEl.src = preloadedMemes.current[m.id].src;
    }
  };

  // 2. MAIN RAF LOOP
  useEffect(() => {
    if (typeof window === "undefined" || canvasError) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let isUnmounted = false;

    const animate = (time: number) => {
      if (isUnmounted) return;
      
      const dt = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;
      
      // Auto-scale FPS
      if (dt > 0) {
         recentFps.current.push(1000 / dt);
         if (recentFps.current.length > 30) recentFps.current.shift();
         const avgFps = recentFps.current.reduce((a, b) => a + b, 0) / recentFps.current.length;
         if (avgFps < 40) particleScaleRef.current = Math.max(0.3, particleScaleRef.current - 0.01);
         else if (avgFps > 55) particleScaleRef.current = Math.min(1.0, particleScaleRef.current + 0.01);
         if (DEBUG_PERF && Math.random() < 0.1) setDebugInfo({ fps: Math.round(avgFps), scale: particleScaleRef.current });
      }

      const width = canvas.width / dprRef.current;
      const height = canvas.height / dprRef.current;
      const cx = width / 2;
      const cy = height / 2;

      const spawnChance = configRef.current.meteorSpawnRate * particleScaleRef.current;
      if (Math.random() < spawnChance * dt) spawnMeteor(width, height, time);

      mouseRef.current.x = lerp(mouseRef.current.x, mouseRef.current.targetX, 0.08);
      mouseRef.current.y = lerp(mouseRef.current.y, mouseRef.current.targetY, 0.08);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const parallaxX = (isTouchDeviceRef.current || reduceMotionRef.current) ? 0 : (mx - cx) * -0.07;
      const parallaxY = (isTouchDeviceRef.current || reduceMotionRef.current) ? 0 : (my - cy) * -0.07;

      const driftX = reduceMotionRef.current ? 0 : Math.sin(time * 0.0001) * 30;
      const driftY = reduceMotionRef.current ? 0 : Math.cos(time * 0.00015) * 20;

      // Clear for AppShell background
      ctx.clearRect(0, 0, width, height);

      const fogX = cx + driftX * 0.5 + parallaxX * 0.5;
      const fogY = cy + driftY * 0.5 + parallaxY * 0.5;
      
      // Radar Sweep
      if (!reduceMotionRef.current) {
        ctx.save();
        ctx.translate(fogX, fogY);
        const sweepAngle = (time * 0.0005) % (Math.PI * 2);
        ctx.rotate(sweepAngle);
        const sweepGrad = ctx.createConicGradient(0, 0, 0);
        sweepGrad.addColorStop(0, "rgba(0, 255, 255, 0)");
        sweepGrad.addColorStop(0.1, `rgba(0, 255, 255, ${0.03 * configRef.current.blurSpread})`);
        sweepGrad.addColorStop(1, "rgba(0, 255, 255, 0)");
        ctx.fillStyle = sweepGrad;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0, Math.max(width, height), 0, 0.5); ctx.fill();
        
        ctx.strokeStyle = "rgba(0, 255, 255, 0.02)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0,0, 150, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0, 300, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      // Stars
      const activeStars = Math.floor(starsRef.current.length * particleScaleRef.current);
      for (let i = 0; i < activeStars; i++) {
        const star = starsRef.current[i];
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.baseAlpha * twinkle;
        let sx = star.x + driftX * star.parallaxFactor + parallaxX * star.parallaxFactor;
        let sy = star.y + driftY * star.parallaxFactor + parallaxY * star.parallaxFactor;
        if (sx < 0) sx += width; if (sx > width) sx -= width;
        if (sy < 0) sy += height; if (sy > height) sy -= height;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath(); ctx.arc(sx, sy, star.size, 0, Math.PI * 2); ctx.fill();
      }

      // Meteors
      meteorsData.current.forEach((m, idx) => {
        if (!m.active) {
           const el = meteorDOMRefs.current[idx];
           if (el) el.style.visibility = "hidden";
           return;
        }

        m.age += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        if (m.age < 500) m.alpha = Math.min(0.6, (m.age / 500) * 0.6);
        else if (m.age > m.lifespan - 1000) m.alpha = Math.max(0, ((m.lifespan - m.age) / 1000) * 0.6);
        else m.alpha = 0.6;

        if (!isTouchDeviceRef.current) {
          const distToMouse = Math.hypot(m.x - mx, m.y - my);
          if (distToMouse < 60 && !m.isRare) {
             m.vx = lerp(m.vx, m.vx * 0.95, 0.1);
             m.vy = lerp(m.vy, m.vy * 0.95, 0.1);
          }
        }

        m.trail.push({ x: m.x, y: m.y, alpha: m.alpha });
        const maxTrail = m.isRare ? 50 : 20;
        if (m.trail.length > maxTrail * particleScaleRef.current) m.trail.shift();

        if (m.trail.length > 1) {
           ctx.beginPath();
           ctx.moveTo(m.trail[0].x, m.trail[0].y);
           for (let i = 1; i < m.trail.length; i++) {
              ctx.lineTo(m.trail[i].x, m.trail[i].y);
              m.trail[i].alpha *= 0.9; 
           }
           const trailGrad = ctx.createLinearGradient(m.trail[0].x, m.trail[0].y, m.x, m.y);
           trailGrad.addColorStop(0, "rgba(0,0,0,0)");
           trailGrad.addColorStop(1, `${m.color}AA`);
           ctx.strokeStyle = trailGrad;
           ctx.lineWidth = m.isRare ? 6 : 2;
           ctx.lineCap = "round";
           ctx.stroke();
        }

        if (m.age >= m.lifespan || m.x < -200 || m.x > width + 200 || m.y < -200 || m.y > height + 200) {
           m.alpha -= 0.05 * dt;
           if (m.alpha <= 0) m.active = false;
        }

        const el = meteorDOMRefs.current[idx];
        if (el) {
           el.style.visibility = "visible";
           const angle = Math.atan2(m.vy, m.vx);
           const currentScale = m.scale * (0.5 + (m.alpha * 0.5)); 
           el.style.transform = `translate3d(${m.x - 16}px, ${m.y - 16}px, 0) scale(${currentScale}) rotate(${angle}rad)`;
           el.style.opacity = m.alpha.toString();
           el.style.boxShadow = `0 0 20px ${m.color}88, inset 0 0 10px ${m.color}44`;
        }
      });

      if (globalRareGlow.current.active) {
          globalRareGlow.current.alpha = Math.max(0, globalRareGlow.current.alpha - 0.005);
          if (globalRareGlow.current.alpha <= 0) globalRareGlow.current.active = false;
      }

      // Core Sun
      ctx.save();
      const sunPx = cx + parallaxX * 0.2;
      const sunPy = cy + parallaxY * 0.2;
      ctx.translate(sunPx, sunPy);
      
      const coreBloom = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
      coreBloom.addColorStop(0, "rgba(255, 150, 50, 0.5)");
      coreBloom.addColorStop(0.3, "rgba(0, 200, 255, 0.15)");
      coreBloom.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreBloom;
      ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill();

      const pulseScale = reduceMotionRef.current ? 1 : Math.sin(time * 0.001) * 0.05 + 1;
      const sunRadius = (window.innerWidth < 768 ? 35 : 45) * pulseScale;
      
      const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sunRadius);
      sunGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      sunGrad.addColorStop(0.2, "rgba(200, 240, 255, 0.9)");
      sunGrad.addColorStop(0.8, "rgba(0, 150, 255, 0.5)");
      sunGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath(); ctx.arc(0, 0, sunRadius, 0, Math.PI * 2); ctx.fill();

      if (!reduceMotionRef.current) {
        const rotRing1 = time * 0.0002;
        const rotRing2 = -time * 0.00015;
        ctx.strokeStyle = "rgba(0, 200, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([15, 25]);
        ctx.rotate(rotRing1);
        ctx.beginPath(); ctx.arc(0, 0, sunRadius + 15, 0, Math.PI * 2); ctx.stroke();
        ctx.rotate(-rotRing1 + rotRing2);
        ctx.setLineDash([5, 40]);
        ctx.strokeStyle = "rgba(255, 150, 50, 0.3)";
        ctx.beginPath(); ctx.arc(0, 0, sunRadius + 25, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // Category Labels Float
      CATEGORY_LABELS.forEach((cat, idx) => {
         const r = cat.radius * configRef.current.radiusScale;
         const a = cat.angle + (reduceMotionRef.current ? 0 : time * 0.0001);
         const lx = sunPx + Math.cos(a) * r;
         const ly = sunPy + Math.sin(a) * (r * 0.95);
         
         const depthRatio = (ly - sunPy) / r;
         const scale = 1 + (depthRatio * 0.2);
         const opacity = Math.max(0.05, 0.4 + (depthRatio * 0.4));
         
         const el = labelRefs.current[idx];
         if (el) {
            el.style.transform = `translate3d(${lx}px, ${ly}px, 0) scale(${scale})`;
            el.style.opacity = opacity.toString();
            el.style.zIndex = depthRatio < 0 ? "5" : "15";
         }
      });

      // Planets
      let hoveredTokenId: string | null = null;
      let minHoverDist = Infinity;

      if (!isTouchDeviceRef.current) {
        tokensRef.current.forEach(tok => {
          if (!tok.isDragging) {
             const dist = Math.hypot(mx - tok.x, my - tok.y);
             if (dist < 40 && dist < minHoverDist) {
                minHoverDist = dist;
                hoveredTokenId = tok.id;
             }
          }
        });
      }
      if (mouseRef.current.downId) hoveredTokenId = mouseRef.current.downId;

      const sortedTokens = [...tokensRef.current].sort((a, b) => a.y - b.y);

      sortedTokens.forEach(tok => {
        tok.isHovered = (tok.id === hoveredTokenId);
        const relatedIds = ECOSYSTEM_RELATIONSHIPS[hoveredTokenId || ""] || [];
        const isRelated = relatedIds.includes(tok.id);

        const step = dt * (tok.isHovered ? tok.baseSpeed * 0.3 : tok.baseSpeed);
        tok.angle += step;

        const wobble = reduceMotionRef.current ? 0 : Math.sin(time * tok.wobbleSpeed) * tok.wobbleAmount;
        const breathe = reduceMotionRef.current ? 0 : Math.sin(time * tok.breatheSpeed) * tok.breatheAmount;
        const effRadius = tok.baseRadius + wobble + breathe;
        
        let orbitX = sunPx + Math.cos(tok.angle) * effRadius;
        let orbitY = sunPy + Math.sin(tok.angle) * (effRadius * tok.ellipseFactor);

        const depthRatio = (orbitY - sunPy) / (tok.baseRadius);
        const ringBaseOpacity = Math.max(0.01, 0.08 + (depthRatio * 0.07)); 
        
        ctx.beginPath();
        ctx.ellipse(sunPx, sunPy, effRadius, effRadius * tok.ellipseFactor, 0, 0, Math.PI * 2);
        
        if (tok.isHovered || isRelated) {
          ctx.strokeStyle = `${tok.color}${isRelated ? '33' : '55'}`;
        } else {
          const dimFactor = hoveredTokenId ? 0.2 : 1;
          ctx.strokeStyle = `${tok.color}${Math.floor(ringBaseOpacity * 255 * dimFactor).toString(16).padStart(2, '0')}`;
        }
        ctx.lineWidth = 1;
        ctx.stroke();

        if (tok.isDragging && tok.dragX !== null && tok.dragY !== null) {
          tok.vx = (tok.dragX - tok.x) * 0.15; 
          tok.vy = (tok.dragY - tok.y) * 0.15;
          tok.x += tok.vx; tok.y += tok.vy;
          ctx.beginPath(); ctx.moveTo(orbitX, orbitY); ctx.lineTo(tok.x, tok.y);
          ctx.strokeStyle = `${tok.color}66`; ctx.lineWidth = 1; ctx.stroke();
        } else {
          if (Math.abs(tok.vx) > 0.1 || Math.abs(tok.vy) > 0.1) {
            tok.x += tok.vx; tok.y += tok.vy;
            tok.vx *= 0.85; tok.vy *= 0.85;
            tok.vx += (orbitX - tok.x) * 0.05;
            tok.vy += (orbitY - tok.y) * 0.05;
          } else {
            tok.x = orbitX; tok.y = orbitY;
          }
        }

        tok.trail.push({ x: tok.x, y: tok.y, alpha: 1.0 });
        if (tok.trail.length > Math.floor(25 * particleScaleRef.current)) tok.trail.shift();

        if (tok.trail.length > 1) {
           ctx.beginPath();
           ctx.moveTo(tok.trail[0].x, tok.trail[0].y);
           for (let i = 1; i < tok.trail.length; i++) {
              ctx.lineTo(tok.trail[i].x, tok.trail[i].y);
              tok.trail[i].alpha -= 0.04;
           }
           const trailGrad = ctx.createLinearGradient(tok.trail[0].x, tok.trail[0].y, tok.x, tok.y);
           trailGrad.addColorStop(0, "rgba(0,0,0,0)");
           const trailEndOpacity = tok.isHovered ? 'cc' : (isRelated ? '77' : '44');
           trailGrad.addColorStop(1, `${tok.color}${trailEndOpacity}`);
           ctx.strokeStyle = trailGrad;
           ctx.lineWidth = 1.5;
           ctx.stroke();
        }

        const el = domRefs.current[tok.id];
        if (el) {
          const depthScale = 1 + (depthRatio * 0.1); 
          let scale = depthScale;
          if (tok.isHovered || tok.isDragging) scale *= 1.15;
          const zIndex = tok.isHovered || tok.isDragging ? 40 : (depthRatio < 0 ? 10 : 20);
          
          tok.rotation = reduceMotionRef.current ? 0 : Math.sin(time * 0.0005 + tok.angle) * 5; 
          
          el.style.transform = `translate3d(${tok.x - 24}px, ${tok.y - 24}px, 0) scale(${scale}) rotate(${tok.rotation}deg)`;
          el.style.zIndex = zIndex.toString();
          
          const dimFactor = (hoveredTokenId && !tok.isHovered && !isRelated) ? 0.3 : 1;
          const brightness = Math.max(0.1, (0.7 + (depthRatio * 0.4))) * dimFactor;
          
          let ambientGlow = "";
          if (globalRareGlow.current.active) {
            ambientGlow = `, 0 0 15px ${globalRareGlow.current.color}${Math.floor(globalRareGlow.current.alpha * 255).toString(16).padStart(2,'0')}`;
          }

          if (tok.isHovered) {
             el.style.boxShadow = `0 0 25px ${tok.color}66, inset 0 0 10px ${tok.color}88${ambientGlow}`;
             el.style.borderColor = tok.color;
             el.style.opacity = "1";
             el.style.filter = "brightness(1.2)";
          } else if (isRelated) {
             el.style.boxShadow = `0 0 15px ${tok.color}33, inset 0 0 8px ${tok.color}44${ambientGlow}`;
             el.style.borderColor = `rgba(255,255,255,0.4)`;
             el.style.opacity = brightness.toString();
             el.style.filter = "brightness(1.1)";
          } else {
             const idleGlowAlpha = reduceMotionRef.current ? "11" : Math.floor((0.2 + (Math.sin(time * tok.breatheSpeed) * 0.1)) * 255).toString(16).padStart(2,'0');
             el.style.boxShadow = `0 0 15px ${tok.color}${idleGlowAlpha}, inset 0 0 8px rgba(255,255,255,0.03)${ambientGlow}`;
             el.style.borderColor = `rgba(255,255,255,${0.1 * brightness})`;
             el.style.opacity = brightness.toString();
             el.style.filter = "brightness(1)";
          }
        }
      });

      // Telemetry Data Population
      if (hoveredTokenId) {
        const hoverTok = tokensRef.current.find(t => t.id === hoveredTokenId);
        if (hoverTok) {
          const tData = telemetryDataRef.current;
          tData.id = hoverTok.id;
          tData.label = hoverTok.label;
          tData.role = hoverTok.role;
          tData.thesis = hoverTok.thesis;
          tData.strengths = hoverTok.strengths;
          tData.sector = hoverTok.sector;
          tData.comment = hoverTok.comment;

          if (window.innerWidth < 768) {
             tData.x = 20;
             tData.y = height - 280; 
          } else {
             const cardWidth = 280;
             const cardHeight = 300;
             let tX = hoverTok.x + 35;
             let tY = hoverTok.y - 35;
             
             if (tX + cardWidth > width - 20) tX = hoverTok.x - cardWidth - 35;
             if (tY + cardHeight > height - 20) tY = height - cardHeight - 20;
             if (tY < 20) tY = 20;
             
             if (tData.alpha === 0) {
                tData.x = tX;
                tData.y = tY + 20;
             } else {
                tData.x = lerp(tData.x, tX, 0.2);
                tData.y = lerp(tData.y, tY, 0.2);
             }
          }
          tData.alpha = Math.min(tData.alpha + 0.1, 1);
        }
      } else {
        telemetryDataRef.current.alpha = Math.max(telemetryDataRef.current.alpha - 0.1, 0);
      }

      if (telemetryRef.current) {
         const tData = telemetryDataRef.current;
         if (tData.alpha <= 0.01) {
            telemetryRef.current.style.opacity = "0";
         } else {
            telemetryRef.current.style.opacity = tData.alpha.toString();
            const blur = (1 - tData.alpha) * 10;
            const translateY = (1 - tData.alpha) * 10;
            telemetryRef.current.style.transform = `translate3d(${tData.x}px, ${tData.y + translateY}px, 0)`;
            telemetryRef.current.style.filter = `blur(${blur}px)`;
            
            if (tTitle.current) tTitle.current.textContent = tData.label;
            if (tRole.current) tRole.current.textContent = `ROLE: ${tData.role}`;
            if (tThesis.current) tThesis.current.textContent = tData.thesis;
            if (tStrengths.current) tStrengths.current.textContent = `STRENGTHS: ${tData.strengths}`;
            if (tSector.current) tSector.current.textContent = `SECTOR: ${tData.sector}`;
            if (tComment.current) tComment.current.textContent = tData.comment;
         }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Offscreen render pause
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      isUnmounted = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [hasEntered, canvasError]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let closestId = null;
    let minD = 40;
    tokensRef.current.forEach(tok => {
      const d = Math.hypot(tok.x - x, tok.y - y);
      if (d < minD) { minD = d; closestId = tok.id; }
    });

    if (closestId) {
      mouseRef.current.downId = closestId;
      mouseRef.current.isDown = true;
      const tok = tokensRef.current.find(t => t.id === closestId);
      if (tok) { tok.isDragging = true; tok.dragX = x; tok.dragY = y; }
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
    e.currentTarget.releasePointerCapture(e.pointerId);
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
      style={{ height: "clamp(600px, 80vw, 850px)", background: "transparent" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {DEBUG_PERF && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 px-2 py-1 font-mono text-[10px] text-green-400 border border-green-500/30">
          FPS: {debugInfo.fps} | Scale: {debugInfo.scale.toFixed(2)}
        </div>
      )}

      {/* Cinematic Header Overlay */}
      <div className="absolute top-6 left-6 md:top-12 md:left-12 z-40 pointer-events-none" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
         <h2 className="text-xl md:text-2xl font-bold tracking-[0.3em] text-[var(--color-text-primary)] mb-2" style={{ textShadow: "0 0 20px var(--color-cyan-glow)" }}>ONCHAIN CONVICTIONS //</h2>
         <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] max-w-[280px] md:max-w-md leading-relaxed mb-4 text-balance">Infrastructure layers I actively monitor, build around, and believe will shape the next internet stack.</p>
         <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[9px] md:text-[10px] tracking-widest opacity-80">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[var(--color-cyan)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-cyan)]"/> ACTIVE ECOSYSTEMS: {TOKENS_DATA.length}</span>
            <span className="hidden md:inline text-[var(--color-text-muted)]">|</span>
            <span className="text-[var(--color-amber)]">SIGNAL STRENGTH: STABLE</span>
            <span className="hidden md:inline text-[var(--color-text-muted)]">|</span>
            <span className="text-[var(--color-online)]">NETWORK STATUS: ONLINE</span>
         </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: "100%", height: "100%", zIndex: 1 }} />

      {/* Operator Node Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 z-10 pointer-events-none text-center mix-blend-screen">
         <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] text-[var(--color-cyan)] opacity-70" style={{ textShadow: "0 0 10px var(--color-cyan-glow)" }}>theug.operator_node</span>
      </div>

      {/* Floating Category Labels */}
      {CATEGORY_LABELS.map((cat, idx) => (
        <div 
          key={cat.text}
          ref={el => { if (el) labelRefs.current[idx] = el; }}
          className="absolute left-0 top-0 font-mono text-[8px] md:text-[9px] tracking-widest text-[var(--color-text-secondary)] pointer-events-none mix-blend-screen will-change-transform"
        >
           [{cat.text}]
        </div>
      ))}

      {METEOR_TYPES.map((_, idx) => (
        <div
          key={`meteor-${idx}`}
          ref={el => { if (el) meteorDOMRefs.current[idx] = el; }}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(10, 15, 25, 0.4)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            willChange: "transform, opacity, visibility",
            zIndex: 10, visibility: "hidden", pointerEvents: "none"
          }}
        >
          <img
            ref={el => { if (el) meteorImgRefs.current[idx] = el; }}
            src={`/meme/${METEOR_TYPES[idx].file}`} alt={METEOR_TYPES[idx].id} className="pointer-events-none"
            style={{ width: "18px", height: "18px", display: "block" }}
          />
        </div>
      ))}

      {TOKENS_DATA.map(tok => (
        <div
          key={tok.id}
          ref={el => { if (el) domRefs.current[tok.id] = el; }}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--color-surface)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "box-shadow var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast)", 
            willChange: "transform, opacity", zIndex: 20,
            cursor: mouseRef.current.downId === tok.id ? "grabbing" : "grab"
          }}
        >
          <img
            src={`/logos/${tok.id}.svg`} alt={tok.label} className="pointer-events-none"
            style={{ width: "24px", height: "24px", display: "block" }}
          />
        </div>
      ))}

      {/* Intelligence Log / Telemetry */}
      <div
        ref={telemetryRef}
        className="w-[calc(100vw-40px)] md:w-[280px]"
        style={{
          position: "absolute", left: 0, top: 0, padding: "20px",
          background: "var(--color-surface)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--color-border-bright)", borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px var(--color-cyan-glow)",
          zIndex: 9999, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)",
          opacity: 0, willChange: "transform, opacity, filter", pointerEvents: "none",
          display: "flex", flexDirection: "column", gap: "12px"
        }}
      >
        <div style={{
          position: "absolute", inset: 0, borderRadius: "12px", pointerEvents: "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.01) 2px, rgba(0,255,255,0.01) 4px)"
        }} />
        
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
           <div ref={tTitle} style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", textShadow: "0 0 10px rgba(255,255,255,0.1)" }} />
           <div ref={tRole} style={{ fontSize: "10px", color: "var(--color-cyan)", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }} />
        </div>
        
        <div>
           <div style={{ fontSize: "9px", color: "var(--color-text-muted)", marginBottom: "4px", letterSpacing: "1px" }}>OPERATOR THESIS</div>
           <div ref={tThesis} style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.5, textWrap: "balance" }} />
        </div>
        
        <div>
           <div style={{ fontSize: "9px", color: "var(--color-text-muted)", marginBottom: "4px", letterSpacing: "1px" }}>KEY METRICS</div>
           <div ref={tStrengths} style={{ fontSize: "11px", color: "var(--color-text-primary)" }} />
           <div ref={tSector} style={{ fontSize: "11px", color: "var(--color-text-primary)", marginTop: "2px" }} />
        </div>
        
        <div style={{ marginTop: "4px", padding: "10px", background: "var(--color-cyan-glow)", borderRadius: "6px", borderLeft: "2px solid var(--color-cyan)" }}>
           <div ref={tComment} style={{ fontSize: "11px", color: "var(--color-text-primary)", fontStyle: "italic", textWrap: "balance" }} />
        </div>
      </div>
    </section>
  );
}

export const NetworkMap = memo(CosmicEcosystem);
