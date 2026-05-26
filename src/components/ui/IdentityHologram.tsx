"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  tx: number; // Target X coordinate
  ty: number; // Target Y coordinate
  vx: number;
  vy: number;
  char: string;
  originalChar: string;
  size: number;
  alpha: number;
  targetAlpha: number;
  brightness: number;
  isAccent: boolean;
  gridX: number;
  gridY: number;
}

interface AmbientParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  char: string;
}

type RevealStage = "particles" | "wireframe" | "reconstruction" | "locked";

export function IdentityHologram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reveal State Machine
  const [revealStage, setRevealStage] = useState<RevealStage>("particles");
  const [glitchActive, setGlitchActive] = useState(false);
  const [hudStatus, setHudStatus] = useState("INITIALIZING");
  const [faceMatchRate, setFaceMatchRate] = useState(0);

  // Synchronous refs for 60fps canvas drawing loop
  const stageRef = useRef<RevealStage>("particles");
  const particlesRef = useRef<Particle[]>([]);
  const ambientRef = useRef<AmbientParticle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef(0);
  const scanProgressRef = useRef(0); // Y pos of horizontal laser scanner sweep
  const bootTimeRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  // Keep stageRef synced
  useEffect(() => {
    stageRef.current = revealStage;
  }, [revealStage]);

  // Increment facial match rate once active
  useEffect(() => {
    if (revealStage === "reconstruction") {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 8) + 4;
        if (current >= 99) {
          current = 99.8;
          clearInterval(interval);
        }
        setFaceMatchRate(current);
      }, 80);
      return () => clearInterval(interval);
    }
  }, [revealStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = 460);
    let height = (canvas.height = 540);
    let dpr = 1;

    // Premium dense ASCII character shading ramp
    const CHARS_RAMP = [".", ":", "-", "=", "+", "*", "D", "Q", "0", "O", "8", "B", "&", "%", "#", "@"];

    // Viewport-triggered scroll observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          bootTimeRef.current = Date.now();
          // Stage 1: Particles
          setRevealStage("particles");
          setHudStatus("ANALYZING ENVIRONMENT");

          // Stage 2: Transition to Wireframe after 1.2s
          setTimeout(() => {
            setRevealStage("wireframe");
            setHudStatus("CALIBRATING HUD COORDS");
            
            // Stage 3: Transition to Reconstruction after another 1.4s
            setTimeout(() => {
              setRevealStage("reconstruction");
              setHudStatus("RECONSTRUCTING DATA");
              scanProgressRef.current = 0;
            }, 1400);

          }, 1200);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;
        width = canvasRef.current.width = rect.width;
        height = canvasRef.current.height = rect.height;
        
        canvasRef.current.width = rect.width * dpr;
        canvasRef.current.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // 1. Initialize ambient floating binary/dot data
    const initAmbientParticles = () => {
      const list: AmbientParticle[] = [];
      const chars = ["0", "1", "+", "·", "x", "*", "•"];
      for (let i = 0; i < 60; i++) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(0.4 + Math.random() * 0.8),
          size: 4 + Math.random() * 5,
          alpha: 0.04 + Math.random() * 0.12,
          char: chars[Math.floor(Math.random() * chars.length)]
        });
      }
      ambientRef.current = list;
    };
    initAmbientParticles();

    // 2. Load and sample /images/portrait.png
    const img = new Image();
    img.src = "/images/portrait.png";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Draw onto a temporary detection canvas to identify the subject's bounding box
      // and mathematically crop out all empty top background/headspace.
      const detectW = 100;
      const detectH = Math.floor(100 * (img.height / img.width));
      const detectCanvas = document.createElement("canvas");
      detectCanvas.width = detectW;
      detectCanvas.height = detectH;
      const detectCtx = detectCanvas.getContext("2d");
      
      let cropX = 0;
      let cropY = 0;
      let cropW = img.width;
      let cropH = img.height;

      if (detectCtx) {
        detectCtx.drawImage(img, 0, 0, detectW, detectH);
        const detectData = detectCtx.getImageData(0, 0, detectW, detectH).data;

        let minY = detectH;
        let maxY = 0;
        let minX = detectW;
        let maxX = 0;

        for (let y = 0; y < detectH; y++) {
          for (let x = 0; x < detectW; x++) {
            const idx = (y * detectW + x) * 4;
            const r = detectData[idx];
            const g = detectData[idx + 1];
            const b = detectData[idx + 2];
            const a = detectData[idx + 3];

            if (a > 15) {
              const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
              // Detect non-white subject pixels
              if (brightness < 238) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
          }
        }

        // Convert back to original image dimensions if subject detected
        if (maxY > minY && maxX > minX) {
          const scaleToOrigX = img.width / detectW;
          const scaleToOrigY = img.height / detectH;

          const contentX = minX * scaleToOrigX;
          const contentY = minY * scaleToOrigY;
          const contentW = (maxX - minX) * scaleToOrigX;
          const contentH = (maxY - minY) * scaleToOrigY;

          // Add a tight 3.5% padding for high-fidelity alignment
          const padY = contentH * 0.035;
          const padX = contentW * 0.035;

          cropX = Math.max(0, contentX - padX);
          cropY = Math.max(0, contentY - padY);
          cropW = Math.min(img.width - cropX, contentW + padX * 2);
          cropH = Math.min(img.height - cropY, contentH + padY * 2);
        }
      }

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Lock sampling grid to a highly detailed 90x116 aspect ratio (no stretch or squish)
      const sampleW = 90;
      const sampleH = 116;
      tempCanvas.width = sampleW;
      tempCanvas.height = sampleH;

      // Draw cropped subject to the sample grid canvas
      tempCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, sampleW, sampleH);

      const imgData = tempCtx.getImageData(0, 0, sampleW, sampleH);
      const data = imgData.data;

      const particles: Particle[] = [];

      // Calculate perfect scale factors to display the ASCII reconstruction sharply
      // Face is shifted upwards and fills the height beautifully (zero empty headroom)
      const displayW = width * 0.88;
      const displayH = height * 0.84;
      const offsetX = (width - displayW) / 2;
      const offsetY = 45; // Start exactly below header, fully utilizing canvas height

      const scaleX = displayW / sampleW;
      const scaleY = displayH / sampleH;

      // Parse pixels and construct high-fidelity ASCII mapping particles
      for (let y = 0; y < sampleH; y++) {
        for (let x = 0; x < sampleW; x++) {
          const idx = (y * sampleW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Skip pure white/transparent background pixels of the photo
          if (a < 15) continue;
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          if (brightness > 235) continue; // Exclude photo background contour

          // Target grid coordinates
          const tx = offsetX + x * scaleX;
          const ty = offsetY + y * scaleY;

          // Accents: ~4% glowing orange/red dots
          const isAccent = Math.random() > 0.96;

          particles.push({
            // Scatter coordinates randomly across edges for Stage 1 particles
            x: Math.random() * width,
            y: Math.random() * height,
            tx,
            ty,
            vx: 0,
            vy: 0,
            char: "", // resolved in state machine
            originalChar: "", // resolved in state machine
            size: 5.6, // locked font size to keep facial features crisp and clear
            alpha: 0,
            targetAlpha: 0, // calculated based on theme mapping
            brightness,
            isAccent,
            gridX: x,
            gridY: y
          });
        }
      }

      particlesRef.current = particles;
    };

    let rafId: number;

    const render = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, width, height);

      const time = frameRef.current;
      const stage = stageRef.current;
      const isDay = document.documentElement.classList.contains("day-mode");

      // ── COLOR CONFIGURATION (Day/Night Theme Tuning) ──
      const baseAlphaColor = isDay ? "rgba(18, 20, 23, " : "rgba(240, 243, 250, ";
      const hudColor = isDay ? "rgba(18, 20, 23, 0.08)" : "rgba(255, 94, 58, 0.08)";
      const orangeAccent = isDay ? "rgba(216, 67, 21, 0.85)" : "rgba(255, 94, 58, 0.85)";

      // Recalibrate target alpha and characters based on Day Mode vs Dark Mode
      particlesRef.current.forEach((p) => {
        if (isDay) {
          // LIGHT MODE: Inverted Darkness Mapping (Dark pixels = solid black; Bright skin = light gray)
          const d_norm = 1 - p.brightness / 235;
          const idx = Math.min(CHARS_RAMP.length - 1, Math.floor(d_norm * CHARS_RAMP.length));
          p.originalChar = CHARS_RAMP[idx];
          
          // High opacity for hair/beard/shadows, very low opacity for skin
          p.targetAlpha = 0.06 + d_norm * 0.90;
        } else {
          // DARK MODE: Direct Brightness Mapping (Skin highlights = bright white; Shadows/hair = dim gray/dark)
          const b_norm = p.brightness / 235;
          const idx = Math.min(CHARS_RAMP.length - 1, Math.floor(b_norm * CHARS_RAMP.length));
          p.originalChar = CHARS_RAMP[idx];
          
          // High opacity for skin highlights, very faint opacity for hair/beard to let the background be dark
          p.targetAlpha = 0.12 + b_norm * 0.82;
        }
      });

      // ── STAGE 1: Render background ambient floating nodes ──
      ambientRef.current.forEach((ap) => {
        ap.x += ap.vx;
        ap.y += ap.vy;
        if (ap.y < 0) {
          ap.y = height;
          ap.x = Math.random() * width;
        }
        ctx.fillStyle = isDay ? `rgba(18, 20, 23, ${ap.alpha})` : `rgba(255, 94, 58, ${ap.alpha * 1.6})`;
        ctx.font = `${ap.size}px monospace`;
        ctx.fillText(ap.char, ap.x, ap.y);
      });

      // ── STAGE 2: Render HUD Biometric Vector Guides ──
      ctx.strokeStyle = hudColor;
      ctx.lineWidth = 0.6;
      
      // Face Frame Corner Guides
      const pad = 28;
      ctx.beginPath();
      ctx.moveTo(pad, pad + 20); ctx.lineTo(pad, pad); ctx.lineTo(pad + 20, pad);
      ctx.moveTo(width - pad, pad + 20); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - 20, pad);
      ctx.moveTo(pad, height - pad - 20); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + 20, height - pad);
      ctx.moveTo(width - pad, height - pad - 20); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - 20, height - pad);
      ctx.stroke();

      if (stage === "wireframe" || stage === "reconstruction" || stage === "locked") {
        // Biometric targeting circles
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 10, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 10, 96, 0, Math.PI * 2);
        ctx.stroke();

        // Horizontal and vertical HUD crosshairs
        ctx.beginPath();
        ctx.moveTo(35, height / 2 - 10); ctx.lineTo(width - 35, height / 2 - 10);
        ctx.moveTo(width / 2, 35); ctx.lineTo(width / 2, height - 35);
        ctx.stroke();
      }

      // ── STAGE 3: Biometric Reveal State Machine ──

      const pList = particlesRef.current;

      if (stage === "particles") {
        // Stage 1: Cloud of glowing floating points
        pList.forEach((p) => {
          // Slowly drift randomly
          p.x += (Math.random() - 0.5) * 0.6;
          p.y += (Math.random() - 0.5) * 0.6;
          p.alpha = 0.45;

          // Renders just as small floating dots
          ctx.fillStyle = isDay ? "rgba(18, 20, 23, 0.4)" : "rgba(255, 94, 58, 0.5)";
          ctx.fillRect(p.x, p.y, 1.5, 1.5);
        });
      } 
      
      else if (stage === "wireframe") {
        // Stage 2: Pull points into a faint wireframe face silhouette
        pList.forEach((p) => {
          // Fast spring force towards target grid positions
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.x += dx * 0.08;
          p.y += dy * 0.08;
          p.alpha = 0.35;

          // Render as subtle wireframe grid coordinates
          ctx.fillStyle = isDay ? "rgba(18, 20, 23, 0.25)" : "rgba(0, 217, 255, 0.25)";
          ctx.fillRect(p.x, p.y, 1.2, 1.2);
        });

        // Grid lines linking adjacent points
        ctx.strokeStyle = isDay ? "rgba(18, 20, 23, 0.02)" : "rgba(0, 217, 255, 0.04)";
        ctx.beginPath();
        for (let i = 0; i < pList.length; i += 28) {
          if (pList[i+1]) {
            ctx.moveTo(pList[i].x, pList[i].y);
            ctx.lineTo(pList[i+1].x, pList[i+1].y);
          }
        }
        ctx.stroke();
      } 
      
      else if (stage === "reconstruction") {
        // Stage 3: Scanning laser sweeps down, morphing points into high-density ASCII characters
        scanProgressRef.current += 3.8;
        const scanY = scanProgressRef.current;

        // Laser Scan Sweep Line
        ctx.strokeStyle = orangeAccent;
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = orangeAccent;
        ctx.beginPath();
        ctx.moveTo(35, scanY);
        ctx.lineTo(width - 35, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        pList.forEach((p) => {
          if (p.ty <= scanY) {
            // Reveal particle characters row-by-row
            p.char = p.originalChar;
            p.alpha = Math.min(p.targetAlpha, p.alpha + 0.06);

            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.x += dx * 0.12;
            p.y += dy * 0.12;
          } else {
            // Keep as dots below laser scanner
            ctx.fillStyle = isDay ? "rgba(18, 20, 23, 0.15)" : "rgba(255, 94, 58, 0.25)";
            ctx.fillRect(p.x, p.y, 1.2, 1.2);
            
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.x += dx * 0.04;
            p.y += dy * 0.04;
          }

          if (p.char && p.alpha > 0) {
            ctx.fillStyle = p.isAccent ? orangeAccent : `${baseAlphaColor}${p.alpha})`;
            ctx.font = `bold ${p.size}px var(--font-mono), monospace`;
            ctx.fillText(p.char, p.x, p.y);
          }
        });

        if (scanY >= height - 35) {
          setRevealStage("locked");
          setHudStatus("NEURAL IDENTITY MATCHED");
        }
      } 
      
      else if (stage === "locked") {
        // Stage 4: Scanner is locked. Face is 100% recognizable, crisp, and interactive
        pList.forEach((p) => {
          p.char = p.originalChar;

          // Lock alpha to targetAlpha with a micro-shimmer
          let target = p.targetAlpha;
          if (Math.random() > 0.995) {
            target = p.targetAlpha * (0.4 + Math.random() * 0.4);
          }
          if (p.alpha < target) p.alpha += 0.04;
          if (p.alpha > target) p.alpha -= 0.04;

          // 1. Precise target spring force (breathing wave is locked to a maximum of 1px to prevent any distortion)
          const breatheX = Math.sin(time * 0.002 + p.gridY * 0.12) * 0.4;
          const breatheY = Math.cos(time * 0.0016 + p.gridX * 0.12) * 0.4;

          const targetX = p.tx + breatheX;
          const targetY = p.ty + breatheY;

          const dx = targetX - p.x;
          const dy = targetY - p.y;

          p.vx += dx * 0.024;
          p.vy += dy * 0.024;

          p.vx *= 0.80; // High damping to snap-back perfectly
          p.vy *= 0.80;

          // 2. Cursor hover dispersion (deflects slightly on hover, snaps back tightly)
          if (mouseRef.current) {
            const mdx = p.x - mouseRef.current.x;
            const mdy = p.y - mouseRef.current.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            
            const radius = 55;
            if (mdist < radius) {
              const force = (radius - mdist) / radius;
              // Deflection coordinates with tight boundaries to prevent warping face shape
              p.vx += (mdx / mdist) * force * 3.5;
              p.vy += (mdy / mdist) * force * 3.5;
              p.alpha *= 0.65; // subtle fade on hover
            }
          }

          p.x += p.vx;
          p.y += p.vy;

          // Render high-definition text particle
          ctx.fillStyle = p.isAccent ? orangeAccent : `${baseAlphaColor}${p.alpha})`;
          ctx.font = `bold ${p.size}px var(--font-mono), monospace`;
          ctx.fillText(p.char, p.x, p.y);
        });

        // Ambient Scanner Sweep Line
        const sweepY = (Math.sin(time * 0.003) * 0.5 + 0.5) * (height - 90) + 45;
        ctx.strokeStyle = isDay ? "rgba(18, 20, 23, 0.015)" : "rgba(255, 94, 58, 0.022)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(35, sweepY);
        ctx.lineTo(width - 35, sweepY);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = null;
  };

  const triggerGlitch = () => {
    if (revealStage !== "locked") return;
    setGlitchActive(true);
    
    // Quick scramble coordinates
    particlesRef.current.forEach((p) => {
      p.x += (Math.random() - 0.5) * 60;
      p.y += (Math.random() - 0.5) * 60;
      p.vx = (Math.random() - 0.5) * 15;
      p.vy = (Math.random() - 0.5) * 15;
      p.char = ["0", "1", "@", "#", "%", "B", "8"][Math.floor(Math.random() * 7)];
    });

    setTimeout(() => {
      setGlitchActive(false);
      particlesRef.current.forEach((p) => {
        p.char = p.originalChar;
      });
    }, 420);
  };

  return (
    <div
      ref={containerRef}
      className="panel hover-glow-edge relative w-full h-[540px] overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerGlitch}
      data-cursor="glitch"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--glow-ambient)"
      }}
    >
      {/* HUD Header Bar */}
      <div className="panel-header flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="panel-title flex items-center gap-2 text-system">
          <span className="inline-block w-2 h-2 bg-[var(--color-amber)] rounded-full animate-pulse" />
          ASCII_IDENTITY.DAT
        </span>
        <span className="font-mono text-[8.5px] tracking-widest text-[var(--color-text-muted)]">
          {revealStage === "locked" ? (
            <span className="text-[var(--color-online)]">● IDENTITY_SYNC [ACTIVE]</span>
          ) : (
            <span className="text-[var(--color-warning)]">● {hudStatus}</span>
          )}
        </span>
      </div>

      {/* HTML absolute positioning overlays for Neural biometric workstation feel */}
      <div className="absolute top-14 left-6 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col gap-0.5 opacity-75">
        <span className="text-[var(--color-text-secondary)] font-bold text-[8px]">● CORE PROFILE</span>
        <span>ID: USMAAN GANI // theUG</span>
        <span>MODEL: RECONSTRUCTED MATRIX</span>
      </div>
      
      <div className="absolute top-14 right-6 pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col items-end gap-0.5 opacity-75">
        <span className="text-[var(--color-text-secondary)] font-bold text-[8px]">● SIGNAL STABILITY</span>
        <span>STABLE // 100% LATENCY LINK</span>
        <span>BAUD: 115200 KBPS</span>
      </div>

      {/* Mid Left Biometric matching node */}
      <div className="absolute left-6 top-[40%] pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col gap-0.5 opacity-75">
        <span className="text-[var(--color-text-secondary)] font-bold text-[8px]">● FACE MATCH</span>
        <span className="text-[var(--color-amber-bright)] font-bold tracking-widest text-[10px]">
          {revealStage === "particles" ? "0.0%" : `${faceMatchRate}%`}
        </span>
      </div>

      {/* Mid Right AI telemetry engine status */}
      <div className="absolute right-6 top-[40%] pointer-events-none font-mono text-[7px] text-[var(--color-text-muted)] flex flex-col items-end gap-0.5 opacity-75">
        <span className="text-[var(--color-text-secondary)] font-bold text-[8px]">● AI RECONSTRUCTION</span>
        <span className="text-[var(--color-online)] font-bold text-[9px]">
          {revealStage === "locked" ? "COMPLETED" : "PROCESSING..."}
        </span>
      </div>

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block animate-screen-flicker"
        style={{
          filter: glitchActive
            ? "skewX(-16deg) contrast(250%) invert(20%) hue-rotate(90deg)"
            : "none",
          transition: "filter 0.08s ease"
        }}
      />

      <div className="absolute inset-0 pointer-events-none border border-[rgba(255,94,58,0.015)]" />

      {/* Bottom matching cyber bar status */}
      <div 
        className="absolute bottom-4 left-0 right-0 px-6 py-2 border-y border-[rgba(255,94,58,0.08)] backdrop-blur-md flex items-center justify-between pointer-events-none animate-fade-in-up"
        style={{
          background: "rgba(5, 5, 5, 0.85)"
        }}
      >
        <span 
          className="font-mono text-[9.5px] font-bold tracking-widest"
          style={{
            color: "var(--color-amber-bright)"
          }}
        >
          {revealStage === "locked" ? (
            <span className="animate-pulse">&gt; IDENTITY MATCHED // USMAAN GANI</span>
          ) : (
            <span>&gt; BIOMETRIC_SCANNER: SECURING CRANIAL MATRIX...</span>
          )}
        </span>
        <span className="font-mono text-[8px] text-[var(--color-text-muted)]">
          SECURE_PORT
        </span>
      </div>
    </div>
  );
}
