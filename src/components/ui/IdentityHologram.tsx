"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ─────────────────────────────────────────────
   High-Fidelity ASCII Portrait Identity Scanner
   ───────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  alpha: number;
  targetAlpha: number;
  brightness: number;
  edge: number;
  revealed: boolean;
}

export function IdentityHologram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef(0);
  const scanYRef = useRef(-10);
  const isLockedRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const rafIdRef = useRef(0);
  const dimRef = useRef({ w: 460, h: 540, dpr: 1 });

  const [statusText, setStatusText] = useState("STANDBY");
  const [glitchActive, setGlitchActive] = useState(false);

  // Extended ASCII density ramp — more levels for smoother tonal gradation
  const CHARS = " .·:;-=+*#%@█";

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * dimRef.current.dpr,
      y: (e.clientY - rect.top) * dimRef.current.dpr,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  const triggerGlitch = useCallback(() => {
    if (!isLockedRef.current) return;
    setGlitchActive(true);
    particlesRef.current.forEach((p) => {
      p.x += (Math.random() - 0.5) * 50;
      p.y += (Math.random() - 0.5) * 50;
      p.vx = (Math.random() - 0.5) * 12;
      p.vy = (Math.random() - 0.5) * 12;
    });
    setTimeout(() => setGlitchActive(false), 350);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── SIZING ──
    const setupSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      dimRef.current = { w: rect.width * dpr, h: rect.height * dpr, dpr };
    };
    setupSize();
    window.addEventListener("resize", setupSize);

    // ── INTERSECTION OBSERVER ──
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          scanYRef.current = 0;
          setStatusText("SCANNING");
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(container);

    // ── IMAGE LOADING & PIXEL SAMPLING ──
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/portrait.png";

    img.onload = () => {
      const { w, h, dpr } = dimRef.current;

      // Step 1: Auto-crop whitespace — find subject bounding box
      const detectW = 200;
      const detectH = Math.round(200 * (img.height / img.width));
      const dCvs = document.createElement("canvas");
      dCvs.width = detectW;
      dCvs.height = detectH;
      const dCtx = dCvs.getContext("2d")!;
      dCtx.drawImage(img, 0, 0, detectW, detectH);
      const dData = dCtx.getImageData(0, 0, detectW, detectH).data;

      let minY = detectH, maxY = 0, minX = detectW, maxX = 0;
      for (let y = 0; y < detectH; y++) {
        for (let x = 0; x < detectW; x++) {
          const idx = (y * detectW + x) * 4;
          const r = dData[idx], g = dData[idx + 1], b = dData[idx + 2], a = dData[idx + 3];
          if (a < 20) continue;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 228) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      const sX = img.width / detectW;
      const sY = img.height / detectH;

      let cropX = 0, cropY = 0, cropW = img.width, cropH = img.height;
      if (maxY > minY && maxX > minX) {
        const padFrac = 0.03;
        const cW = (maxX - minX) * sX;
        const cH = (maxY - minY) * sY;
        cropX = Math.max(0, minX * sX - cW * padFrac);
        cropY = Math.max(0, minY * sY - cH * padFrac);
        cropW = Math.min(img.width - cropX, cW * (1 + padFrac * 2));
        cropH = Math.min(img.height - cropY, cH * (1 + padFrac * 2));
      }

      // Step 2: Sample at high density with aspect-corrected rows
      const GRID_COLS = 130;
      const GRID_ROWS = Math.round(GRID_COLS * (cropH / cropW) * 0.55);
      const sampleCvs = document.createElement("canvas");
      sampleCvs.width = GRID_COLS;
      sampleCvs.height = GRID_ROWS;
      const sCtx = sampleCvs.getContext("2d")!;
      sCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, GRID_COLS, GRID_ROWS);
      const sData = sCtx.getImageData(0, 0, GRID_COLS, GRID_ROWS).data;

      // Step 3: Compute luminance grid
      const lumGrid: number[][] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        lumGrid[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
          const idx = (y * GRID_COLS + x) * 4;
          lumGrid[y][x] = 0.299 * sData[idx] + 0.587 * sData[idx + 1] + 0.114 * sData[idx + 2];
        }
      }

      // Step 4: Sobel edge detection
      const rawEdge: number[][] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        rawEdge[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
          if (y === 0 || y === GRID_ROWS - 1 || x === 0 || x === GRID_COLS - 1) {
            rawEdge[y][x] = 0;
            continue;
          }
          const gx =
            -lumGrid[y - 1][x - 1] + lumGrid[y - 1][x + 1] +
            -2 * lumGrid[y][x - 1] + 2 * lumGrid[y][x + 1] +
            -lumGrid[y + 1][x - 1] + lumGrid[y + 1][x + 1];
          const gy =
            -lumGrid[y - 1][x - 1] - 2 * lumGrid[y - 1][x] - lumGrid[y - 1][x + 1] +
            lumGrid[y + 1][x - 1] + 2 * lumGrid[y + 1][x] + lumGrid[y + 1][x + 1];
          rawEdge[y][x] = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 200);
        }
      }

      // Step 5: Smooth edges with DOUBLE box blur — extra smooth shoulder/body contours
      // First pass: 3x3
      const blurPass1: number[][] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        blurPass1[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
          if (y < 1 || y >= GRID_ROWS - 1 || x < 1 || x >= GRID_COLS - 1) {
            blurPass1[y][x] = rawEdge[y][x];
            continue;
          }
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
              sum += rawEdge[y + dy][x + dx];
          blurPass1[y][x] = sum / 9;
        }
      }
      // Second pass: another 3x3 on the first pass result (effectively 5x5 Gaussian approximation)
      const edgeGrid: number[][] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        edgeGrid[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
          if (y < 1 || y >= GRID_ROWS - 1 || x < 1 || x >= GRID_COLS - 1) {
            edgeGrid[y][x] = blurPass1[y][x];
            continue;
          }
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
              sum += blurPass1[y + dy][x + dx];
          edgeGrid[y][x] = sum / 9;
        }
      }

      // Step 6: Build alpha mask to detect background vs subject
      // Use a flood-fill-like approach: pixels near edges that are very bright = background
      const isSubject: boolean[][] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        isSubject[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
          const idx = (y * GRID_COLS + x) * 4;
          const a = sData[idx + 3];
          const lum = lumGrid[y][x];
          const edge = edgeGrid[y][x];

          if (a < 20) {
            isSubject[y][x] = false;
          } else if (lum > 240 && edge < 0.03) {
            // Very bright + no edge = definite background
            isSubject[y][x] = false;
          } else if (lum > 225 && edge < 0.06) {
            // Bright + minimal edge = likely background  
            // But check if neighbors are subject (for shirt edges, etc.)
            isSubject[y][x] = false;
          } else {
            isSubject[y][x] = true;
          }
        }
      }

      // Step 7: Clean up isolated non-subject holes inside the face (erode+dilate)
      // Dilate subject: if a non-subject pixel is surrounded by mostly subject pixels, include it
      for (let y = 2; y < GRID_ROWS - 2; y++) {
        for (let x = 2; x < GRID_COLS - 2; x++) {
          if (!isSubject[y][x]) {
            let subjectNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (isSubject[y + dy][x + dx]) subjectNeighbors++;
              }
            }
            // If 6+ of 9 neighbors are subject, fill in this pixel
            if (subjectNeighbors >= 6) {
              isSubject[y][x] = true;
            }
          }
        }
      }

      // Step 8: Build particles
      const displayW = w * 0.92;
      const displayH = h * 0.88;
      const offsetX = (w - displayW) / 2;
      const offsetY = (h - displayH) / 2;
      const cellW = displayW / GRID_COLS;
      const cellH = displayH / GRID_ROWS;
      const fontSize = Math.max(3, Math.min(cellW, cellH) * 1.15);

      const particles: Particle[] = [];

      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          if (!isSubject[y][x]) continue;

          const lum = lumGrid[y][x];
          const edge = edgeGrid[y][x];
          const tx = offsetX + x * cellW;
          const ty = offsetY + y * cellH;

          particles.push({
            x: tx + (Math.random() - 0.5) * w * 0.6,
            y: ty + (Math.random() - 0.5) * h * 0.6,
            tx,
            ty,
            vx: 0,
            vy: 0,
            char: "",
            size: fontSize,
            alpha: 0,
            targetAlpha: 0,
            brightness: lum,
            edge,
            revealed: false,
          });
        }
      }

      particlesRef.current = particles;
    };

    // ── RENDER LOOP ──
    const render = () => {
      const { w, h, dpr } = dimRef.current;
      frameRef.current++;
      ctx.clearRect(0, 0, w, h);

      const time = frameRef.current;
      const isDay = document.documentElement.classList.contains("day-mode");
      const pList = particlesRef.current;
      if (pList.length === 0) {
        rafIdRef.current = requestAnimationFrame(render);
        return;
      }

      // ── THEME COLORS ──
      // No accent/orange dots at all — monochrome only
      const textColor = isDay ? "18,20,23" : "225,230,240";
      const scanColor = isDay ? "rgba(120,130,140,0.5)" : "rgba(255,94,58,0.55)";
      const cornerColor = isDay ? "rgba(18,20,23,0.06)" : "rgba(255,94,58,0.06)";

      // ── COMPUTE CHAR & ALPHA per particle ──
      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        const lum = p.brightness;
        const edge = p.edge;

        if (isDay) {
          // Light mode: darkness → density — STRONG visibility
          const darkness = 1 - lum / 255;
          const boosted = Math.pow(darkness, 0.6); // stronger gamma for light mode
          const charIdx = Math.min(CHARS.length - 1, Math.floor(boosted * CHARS.length));
          p.char = CHARS[charIdx];
          // Much higher base alpha for light mode readability
          p.targetAlpha = Math.min(1, 0.15 + boosted * 0.85 + edge * 0.5);
        } else {
          // Dark mode: brightness → glow
          const normB = lum / 255;
          const boosted = Math.pow(normB, 0.65);
          const charIdx = Math.min(CHARS.length - 1, Math.floor(boosted * CHARS.length));
          p.char = CHARS[charIdx];
          p.targetAlpha = Math.min(1, 0.08 + boosted * 0.85 + edge * 0.3);
        }
      }

      // ── CORNER BRACKETS ──
      ctx.strokeStyle = cornerColor;
      ctx.lineWidth = 1 * dpr;
      const pad = 15 * dpr;
      const L = 18 * dpr;
      ctx.beginPath();
      ctx.moveTo(pad, pad + L); ctx.lineTo(pad, pad); ctx.lineTo(pad + L, pad);
      ctx.moveTo(w - pad, pad + L); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad - L, pad);
      ctx.moveTo(pad, h - pad - L); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + L, h - pad);
      ctx.moveTo(w - pad, h - pad - L); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad - L, h - pad);
      ctx.stroke();

      // ── SCAN SWEEP ──
      if (hasTriggeredRef.current && !isLockedRef.current) {
        scanYRef.current += h * 0.012;
        const sy = scanYRef.current;
        ctx.save();
        ctx.strokeStyle = scanColor;
        ctx.lineWidth = 1.5 * dpr;
        ctx.shadowBlur = 8 * dpr;
        ctx.shadowColor = scanColor;
        ctx.beginPath();
        ctx.moveTo(pad, sy);
        ctx.lineTo(w - pad, sy);
        ctx.stroke();
        ctx.restore();

        if (sy >= h) {
          isLockedRef.current = true;
          setStatusText("IDENTITY MATCHED");
        }
      }

      // ── RENDER PARTICLES ──
      const locked = isLockedRef.current;
      const scanLine = scanYRef.current;
      const triggered = hasTriggeredRef.current;
      const mouse = mouseRef.current;

      ctx.textBaseline = "middle";

      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];

        if (!triggered) {
          p.x += (Math.random() - 0.5) * 0.3;
          p.y += (Math.random() - 0.5) * 0.3;
          ctx.fillStyle = `rgba(${textColor},0.08)`;
          ctx.fillRect(p.x, p.y, 1 * dpr, 1 * dpr);
          continue;
        }

        if (!locked) {
          if (p.ty <= scanLine) {
            p.revealed = true;
            p.x += (p.tx - p.x) * 0.15;
            p.y += (p.ty - p.y) * 0.15;
            p.alpha = Math.min(p.targetAlpha, p.alpha + 0.08);
          } else {
            p.x += (p.tx - p.x) * 0.06;
            p.y += (p.ty - p.y) * 0.06;
            ctx.fillStyle = `rgba(${textColor},0.04)`;
            ctx.fillRect(p.x, p.y, 1 * dpr, 1 * dpr);
            continue;
          }
        } else {
          p.revealed = true;

          const breatheX = Math.sin(time * 0.0015 + p.ty * 0.008) * 0.3 * dpr;
          const breatheY = Math.cos(time * 0.0012 + p.tx * 0.008) * 0.3 * dpr;

          const targetX = p.tx + breatheX;
          const targetY = p.ty + breatheY;

          p.vx += (targetX - p.x) * 0.025;
          p.vy += (targetY - p.y) * 0.025;
          p.vx *= 0.82;
          p.vy *= 0.82;

          if (mouse) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            const radius = 50 * dpr;
            if (mdist < radius && mdist > 0) {
              const force = (radius - mdist) / radius;
              p.vx += (mdx / mdist) * force * 3;
              p.vy += (mdy / mdist) * force * 3;
            }
          }

          p.x += p.vx;
          p.y += p.vy;

          // Subtle shimmer
          let alpha = p.targetAlpha;
          if (Math.random() > 0.997) {
            alpha *= 0.3 + Math.random() * 0.5;
          }
          p.alpha = alpha;
        }

        // Skip space/empty chars
        if (p.char.trim() === "" || p.alpha < 0.02) continue;

        // Render — pure monochrome, no accent dots
        ctx.fillStyle = `rgba(${textColor},${p.alpha})`;
        ctx.font = `bold ${p.size}px "Fira Code", "JetBrains Mono", monospace`;
        ctx.fillText(p.char, p.x, p.y);
      }

      // ── SUBTLE AMBIENT SCAN LINE (locked) ──
      if (locked) {
        const sweepY = (Math.sin(time * 0.002) * 0.5 + 0.5) * h;
        ctx.strokeStyle = `rgba(${textColor},0.012)`;
        ctx.lineWidth = 0.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(0, sweepY);
        ctx.lineTo(w, sweepY);
        ctx.stroke();
      }

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("resize", setupSize);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="panel hover-glow-edge relative w-full overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerGlitch}
      data-cursor="glitch"
      style={{
        height: "clamp(420px, 50vw, 580px)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--glow-ambient)",
      }}
    >
      {/* Header */}
      <div className="panel-header flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="panel-title flex items-center gap-2 text-system">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--color-amber)" }}
          />
          IDENTITY_SCAN.DAT
        </span>
        <span className="font-mono text-[8.5px] tracking-widest text-[var(--color-text-muted)]">
          {statusText === "IDENTITY MATCHED" ? (
            <span style={{ color: "var(--color-online)" }}>● LOCKED</span>
          ) : (
            <span style={{ color: "var(--color-warning)" }}>● {statusText}</span>
          )}
        </span>
      </div>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          filter: glitchActive
            ? "hue-rotate(60deg) contrast(180%) brightness(1.3)"
            : "none",
          transition: "filter 0.1s ease",
        }}
      />

      {/* Bottom status bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between pointer-events-none"
        style={{
          background: "linear-gradient(transparent, var(--color-surface))",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span
          className="font-mono text-[8px] tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          {statusText === "IDENTITY MATCHED"
            ? "▸ USMAAN GANI // theUG"
            : "▸ BIOMETRIC ANALYSIS"}
        </span>
        <span
          className="font-mono text-[7px] tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          ASCII_RENDER v3.1
        </span>
      </div>
    </div>
  );
}
