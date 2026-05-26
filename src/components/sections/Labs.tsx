"use client";

import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AsciiCore } from "@/components/ui/AsciiCore";

// Waveform drawing helper component
function LabWaveform({ active = false, frequency = 1.0, speed = 1.0 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isIntersectingRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport Intersection observer to pause frames when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = 70);

    const handleResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.width = canvasRef.current.clientWidth;
        height = canvasRef.current.height = 70;
      }
    };
    window.addEventListener("resize", handleResize);

    let rafId: number;
    let offset = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);

      // Freeze execution if tab is inactive OR canvas is offscreen
      if (document.hidden || !isIntersectingRef.current) return;

      ctx.clearRect(0, 0, width, height);
      offset += active ? 0.08 * speed : 0.02 * speed;

      // Draw horizontal grid lines
      ctx.strokeStyle = "rgba(128, 128, 128, 0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 10; i < height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Overlapping sine waves
      const drawSine = (amp: number, freq: number, phase: number, color: string, thickness: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = height / 2 + 
                    Math.sin(x * 0.015 * freq * frequency + offset + phase) * amp + 
                    Math.sin(x * 0.005 * freq + offset * 0.5) * (amp * 0.25);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      drawSine(active ? 18 : 6, 1.5, 0, "rgba(255, 94, 58, 0.6)", 1.2);
      drawSine(active ? 10 : 3, 2.5, Math.PI / 2, "rgba(0, 217, 255, 0.4)", 0.8);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [active, frequency, speed]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "70px", display: "block" }} />;
}

export function Labs() {
  const [activeExp, setActiveExp] = useState<string>("neural-core");
  const [coreFreq, setCoreFreq] = useState<number>(1.2);
  const [threadAlloc, setThreadAlloc] = useState<number>(4);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "› SYSTEM_STANDBY: R&D Local Telemetry online.",
    "› INFRA_SANDBOX: Segment registers pre-mapped successfully at segment #0x4E9A.",
    "› READY: Inference thread core mapping diagnostics nominal."
  ]);
  const [txDeploying, setTxDeploying] = useState(false);

  const triggerDeployMock = () => {
    if (txDeploying) return;
    setTxDeploying(true);
    setSandboxLogs(prev => [
      ...prev,
      "› [0.0s] INFERENCE: Loading quantized Llama-3-8B model on GPU-0...",
      `› [0.4s] TELEMETRY: Allocating ${threadAlloc} inference threads on local core.`,
      `› [0.8s] OSCILLATOR: Adjusting inference sampling window at ${coreFreq.toFixed(1)} GHz...`,
      "› [1.2s] PIPELINE: Routing workspace prompts through automated node routing...",
      "› [1.5s] DEPLOY: Processing local attention vectors..."
    ]);

    setTimeout(() => {
      const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setSandboxLogs(prev => [
        ...prev,
        `› [2.1s] TELEMETRY: Processed input tokens in model segment #8,142,089.`,
        `› [2.3s] SUCCESS: Vector query output successfully mapped at segment ${txHash.slice(0, 14)}...`,
        `› [2.5s] DIAGNOSTICS: Local inference stable. Telemetry frequency nominal.`
      ]);
      setTxDeploying(false);
    }, 2800);
  };

  const clearSandbox = () => {
    setSandboxLogs(["› Telemetry logs wiped."]);
  };

  return (
    <section
      id="labs"
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Section Label */}
        <div data-cursor="VIEW">
          <SectionLabel label="LABS.SH" />
          <p className="text-system" style={{ marginTop: "4px" }}>
            UNDERGROUND R&D CHAMBER · EXPERIMENTAL SYSTEM SANDBOXES
          </p>
        </div>

        {/* Labs Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(24px, 4vw, 48px)",
            marginTop: "clamp(32px, 4vh, 48px)",
            alignItems: "start",
          }}
          className="labs-grid"
        >
          {/* Left Panel: Experimental Selection Dashboard */}
          <div className="flex flex-col gap-4">
            
            {/* Experiment selector menu */}
            <div className="panel hover-glow-edge" style={{ contain: "layout paint style" }}>
              <div className="panel-header flex items-center justify-between">
                <span className="panel-title">labs_manifest.json</span>
                <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)" }}>
                  R&D MODULE ACTIVE
                </span>
              </div>
              
              <div className="panel-body flex flex-col gap-2.5" style={{ padding: "14px" }}>
                <button
                  onClick={() => setActiveExp("neural-core")}
                  className="flex flex-col gap-1 text-left p-3.5 border transition-all duration-200"
                  style={{
                    background: activeExp === "neural-core" ? "rgba(255, 94, 58, 0.05)" : "transparent",
                    borderColor: activeExp === "neural-core" ? "var(--color-amber)" : "var(--color-border)",
                    boxShadow: activeExp === "neural-core" ? "0 0 12px var(--color-amber-glow)" : "none",
                    borderRadius: "2px",
                  }}
                  data-cursor="CLICK"
                >
                  <div className="flex justify-between items-center w-full">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold", color: activeExp === "neural-core" ? "var(--color-amber-bright)" : "var(--color-text-primary)" }}>
                      &gt; LOCAL LLM INFERENCE CORE
                    </span>
                    <span className="terminal-badge terminal-badge-success" style={{ fontSize: "8px" }}>ONLINE</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.5" }}>
                    Real-time attention-map and neural parameter visualization using high-performance particle morphing physics. Hover to scatter, click to pulse.
                  </p>
                </button>

                <button
                  onClick={() => setActiveExp("blockchain-vault")}
                  className="flex flex-col gap-1 text-left p-3.5 border transition-all duration-200"
                  style={{
                    background: activeExp === "blockchain-vault" ? "rgba(255, 94, 58, 0.05)" : "transparent",
                    borderColor: activeExp === "blockchain-vault" ? "var(--color-amber)" : "var(--color-border)",
                    boxShadow: activeExp === "blockchain-vault" ? "0 0 12px var(--color-amber-glow)" : "none",
                    borderRadius: "2px",
                  }}
                  data-cursor="CLICK"
                >
                  <div className="flex justify-between items-center w-full">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold", color: activeExp === "blockchain-vault" ? "var(--color-amber-bright)" : "var(--color-text-primary)" }}>
                      &gt; NODE TELEMETRY SANDBOX
                    </span>
                    <span className="terminal-badge terminal-badge-ok" style={{ fontSize: "8px" }}>STANDBY</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: "1.5" }}>
                    Interactive Solidity multi-sig contract and blockchain node simulation. Adjust core telemetry indicators to visualize active server waveforms.
                  </p>
                </button>
              </div>
            </div>

            {/* Sandbox Operations Output */}
            <div className="panel hover-glow-edge flex-1 min-h-[200px]" style={{ contain: "layout paint style" }}>
              <div className="panel-header flex items-center justify-between">
                <span className="panel-title">sandbox_telemetry_terminal.log</span>
                <button 
                  onClick={clearSandbox}
                  style={{ background: "none", border: "none", fontSize: "9px", color: "var(--color-text-muted)", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  [CLEAR]
                </button>
              </div>
              <div 
                className="panel-body font-mono text-[10px] overflow-y-auto max-h-[155px]"
                style={{
                  background: "var(--color-elevated)",
                  color: "var(--color-text-secondary)"
                }}
              >
                <div className="flex flex-col gap-1">
                  {sandboxLogs.map((log, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        color: log.includes("SUCCESS")
                          ? "var(--color-cyan)" 
                          : log.includes("INFERENCE")
                          ? "var(--color-amber)"
                          : log.includes("OSCILLATOR") || log.includes("stable")
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)" 
                      }}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Interactive Active Lab Component */}
          <div className="flex items-center justify-center">
            {activeExp === "neural-core" ? (
              <div className="w-full">
                <AsciiCore />
              </div>
            ) : (
              <div className="panel hover-glow-edge w-full h-[320px] flex flex-col justify-between" style={{ contain: "layout paint style" }}>
                <div className="panel-header flex items-center justify-between">
                  <span className="panel-title">NodeSignalSandbox.sh</span>
                  <span style={{ fontSize: "8px", color: "var(--color-warning)", fontFamily: "var(--font-mono)" }}>
                    ⚠️ WARNING: TESTNET ENVIRONMENT
                  </span>
                </div>
                
                {/* Real-time Oscilloscope Waveform visualizer */}
                <div className="border-b border-[var(--color-border)]" style={{ background: "var(--color-elevated)" }}>
                  <LabWaveform active={txDeploying} frequency={coreFreq} speed={threadAlloc / 4} />
                </div>

                <div className="panel-body flex-1 font-mono text-[9px] overflow-hidden" style={{ background: "var(--color-elevated)", padding: "10px 12px" }}>
                  <pre style={{ color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
{`contract NodeSignalSandbox {
    address[] public validatorNodes;
    uint256 public activeCoreFrequency;

    constructor(address[] memory _nodes) {
        validatorNodes = _nodes;
        activeCoreFrequency = 2400; // MHz
    }
}`}
                  </pre>
                </div>

                {/* Highly dynamic sliders adjusting live waveforms */}
                <div className="px-4 py-2.5 border-t border-[var(--color-border)] flex flex-col gap-2" style={{ background: "var(--color-elevated)" }}>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span style={{ color: "var(--color-text-muted)" }}>CORE FREQUENCY:</span>
                    <span style={{ color: "var(--color-amber-bright)" }}>{coreFreq.toFixed(1)} GHz</span>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.1" 
                      value={coreFreq} 
                      onChange={(e) => setCoreFreq(parseFloat(e.target.value))}
                      style={{ width: "70px", accentColor: "var(--color-amber)" }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span style={{ color: "var(--color-text-muted)" }}>THREAD ALLOCATION:</span>
                    <span style={{ color: "var(--color-cyan)" }}>{threadAlloc} THREADS</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="8" 
                      step="1" 
                      value={threadAlloc} 
                      onChange={(e) => setThreadAlloc(parseInt(e.target.value))}
                      style={{ width: "70px", accentColor: "var(--color-cyan)" }}
                    />
                  </div>
                </div>

                <div className="panel-body border-t border-[var(--color-border)] flex gap-2 items-center justify-between" style={{ padding: "10px 12px" }}>
                  <button 
                    onClick={triggerDeployMock}
                    disabled={txDeploying}
                    className="btn-primary py-2.5 text-[10px]"
                    style={{ flex: 1, textAlign: "center" }}
                    data-cursor="CLICK"
                  >
                    {txDeploying ? "› SIMULATING TELEMETRY..." : "› INITIATE COMPILE & SIMULATE"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .labs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
