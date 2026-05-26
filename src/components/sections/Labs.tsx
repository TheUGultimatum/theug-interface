"use client";

import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AsciiCore } from "@/components/ui/AsciiCore";

interface LabExperiment {
  id: string;
  title: string;
  status: "ONLINE" | "STANDBY" | "COMPILED" | "COMPILING";
  desc: string;
}

// Waveform drawing helper component
function LabWaveform({ active = false, frequency = 1.0, speed = 1.0 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      ctx.clearRect(0, 0, width, height);
      offset += active ? 0.08 * speed : 0.02 * speed;

      // Draw horizontal grid lines underneath
      ctx.strokeStyle = "rgba(255, 94, 58, 0.03)";
      ctx.lineWidth = 0.5;
      for (let i = 10; i < height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Overlapping sine waves for high-tech oscilloscope visualization
      const drawSine = (amp: number, freq: number, phase: number, color: string, thickness: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          // Complex mathematical compound waves
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

      // Orange wave
      drawSine(
        active ? 18 : 6,
        1.5,
        0,
        "rgba(255, 94, 58, 0.6)",
        1.2
      );

      // Cyan second overlay wave
      drawSine(
        active ? 10 : 3,
        2.5,
        Math.PI / 2,
        "rgba(0, 217, 255, 0.4)",
        0.8
      );

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, frequency, speed]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "70px", display: "block" }} />;
}

export function Labs() {
  const [activeExp, setActiveExp] = useState<string>("neural-core");
  const [coreFreq, setCoreFreq] = useState<number>(1.2);
  const [threadAlloc, setThreadAlloc] = useState<number>(4);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "› SYSTEM_STANDBY: R&D Core online.",
    "› VIRTUAL_SANDBOX: Memory maps loaded successfully at segment #0x4E9A.",
    "› READY: Core thread allocation structural diagnostics nominal."
  ]);
  const [txDeploying, setTxDeploying] = useState(false);

  const triggerDeployMock = () => {
    if (txDeploying) return;
    setTxDeploying(true);
    setSandboxLogs(prev => [
      ...prev,
      "› [0.0s] COMPILER: Initializing EVM compiler stack Solidity v0.8.24...",
      `› [0.4s] CORE: Allocation of ${threadAlloc} threads established successfully.`,
      `› [0.8s] OSCILLATOR: Scanning frequency profiles at ${coreFreq.toFixed(1)} GHz... [OK]`,
      "› [1.2s] OPTIMIZER: Completed bytecode compaction passes (200 runs).",
      "› [1.5s] TRANSMISSION: Broadcasting optimized sandbox payload..."
    ]);

    setTimeout(() => {
      const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setSandboxLogs(prev => [
        ...prev,
        `› [2.1s] TELEMETRY: Transaction mined on virtual block #8,142,089.`,
        `› [2.3s] SUCCESS: Contract deployed at ${txHash.slice(0, 14)}... [Gas: 118,472]`,
        `› [2.5s] DIAGNOSTICS: Thermal load nominal. Frequency stabilized.`
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
          <SectionLabel label="LABS.EXE" />
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
          }}
          className="labs-grid"
        >
          {/* Left Panel: Experimental Selection Dashboard */}
          <div className="flex flex-col gap-4">
            
            {/* Experiment selector menu */}
            <div className="panel hover-glow-edge panel-breathing">
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
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", fontWeight: "bold", color: activeExp === "neural-core" ? "var(--color-amber-bright)" : "var(--color-text-primary)" }}>
                      &gt; NEURAL PARTICLE SILHOUETTE
                    </span>
                    <span className="terminal-badge terminal-badge-success" style={{ fontSize: "8px" }}>ONLINE</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Artistic canvas coordinates outline mapping of dynamic character structures. Pushed aside dynamically on mouse-hover, reforming smoothly.
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
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", fontWeight: "bold", color: activeExp === "blockchain-vault" ? "var(--color-amber-bright)" : "var(--color-text-primary)" }}>
                      &gt; SOLVAULT EVM SANDBOX COMPILER
                    </span>
                    <span className="terminal-badge terminal-badge-ok" style={{ fontSize: "8px" }}>STANDBY</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Interactive Solidity multi-sig vault deployment simulator. Manipulate core frequency & processor threads to trace live oscilloscopes.
                  </p>
                </button>
              </div>
            </div>

            {/* Sandbox Operations Output */}
            <div className="panel hover-glow-edge flex-1 min-h-[200px]">
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
                  background: "rgba(5,5,5,0.45)",
                  color: "var(--color-text-secondary)"
                }}
              >
                <div className="flex flex-col gap-1">
                  {sandboxLogs.map((log, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        color: log.includes("Tx:") || log.includes("SUCCESS")
                          ? "var(--color-cyan)" 
                          : log.includes("COMPILER")
                          ? "var(--color-amber)"
                          : log.includes("OSCILLATOR") || log.includes("stabilized")
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
              <div className="panel hover-glow-edge w-full h-[320px] flex flex-col justify-between panel-breathing">
                <div className="panel-header flex items-center justify-between">
                  <span className="panel-title">SolidityVaultSandbox.sol</span>
                  <span style={{ fontSize: "8px", color: "var(--color-warning)", fontFamily: "var(--font-mono)" }}>
                    ⚠️ WARNING: TESTNET ENVIRONMENT
                  </span>
                </div>
                
                {/* Real-time Oscilloscope Waveform visualizer */}
                <div className="border-b border-[var(--color-border)]" style={{ background: "rgba(5,5,5,0.7)" }}>
                  <LabWaveform active={txDeploying} frequency={coreFreq} speed={threadAlloc / 4} />
                </div>

                <div className="panel-body flex-1 font-mono text-[9px] overflow-hidden" style={{ background: "rgba(5, 5, 5, 0.45)", padding: "10px 12px" }}>
                  <pre style={{ color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
{`contract UndergroundMultiSig {
    address[] public owners;
    uint256 public requiredConfirmations;

    constructor(address[] memory _owners) {
        owners = _owners;
        requiredConfirmations = 2;
    }
}`}
                  </pre>
                </div>

                {/* Highly dynamic sliders adjusting live waveforms */}
                <div className="px-4 py-2.5 border-t border-[var(--color-border)] flex flex-col gap-2" style={{ background: "rgba(5,5,5,0.15)" }}>
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
                    {txDeploying ? "› SIMULATING DEPLOYMENT..." : "› INITIATE COMPILE & DEPLOY"}
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
