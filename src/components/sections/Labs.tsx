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
      if (document.hidden || !isIntersectingRef.current) return;

      ctx.clearRect(0, 0, width, height);
      offset += active ? 0.08 * speed : 0.02 * speed;

      ctx.strokeStyle = "rgba(128, 128, 128, 0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 10; i < height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

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

const LAB_MODULES = [
  {
    id: "neural-core",
    title: "> LOCAL LLM INFERENCE CORE",
    status: "ONLINE",
    badgeClass: "terminal-badge-success",
    desc: "Real-time attention-map and neural parameter visualization using high-performance particle morphing physics. Hover to scatter, click to pulse.",
    tag: "AI / TENSORS",
  },
  {
    id: "blockchain-vault",
    title: "> NODE TELEMETRY SANDBOX",
    status: "ACTIVE",
    badgeClass: "terminal-badge-ok",
    desc: "Interactive Solidity multi-sig contract and blockchain node simulation. Adjust core telemetry indicators to visualize active server waveforms.",
    tag: "EVM / INFRA",
  },
  {
    id: "zk-prover",
    title: "> ZERO-KNOWLEDGE PROVER LAB",
    status: "ONLINE",
    badgeClass: "terminal-badge-success",
    desc: "Client-side Groth16 / Plonk zk-SNARK proof generator with polynomial commitment verification & live constraint benchmarking.",
    tag: "CRYPTOGRAPHY",
  },
  {
    id: "agent-swarm",
    title: "> AUTONOMOUS AGENT SWARM MEMORY",
    status: "STANDBY",
    badgeClass: "terminal-badge-ok",
    desc: "Context compaction pipeline, vector embeddings buffer, and peer consensus coordination for local autonomous agent teams.",
    tag: "AGENTS / LLM",
  },
  {
    id: "evm-lab",
    title: "> EVM BYTECODE DISASSEMBLER",
    status: "BETA",
    badgeClass: "terminal-badge-warning",
    desc: "Low-level opcode execution profiler and gas consumption visualizer for Solidity smart contract optimization.",
    tag: "BYTECODE",
  },
];

export function Labs() {
  const [activeExp, setActiveExp] = useState<string>("neural-core");
  const [coreFreq, setCoreFreq] = useState<number>(1.2);
  const [threadAlloc, setThreadAlloc] = useState<number>(4);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    "› SYSTEM_STANDBY: R&D Local Telemetry online.",
    "› INFRA_SANDBOX: Segment registers pre-mapped successfully at segment #0x4E9A.",
    "› READY: Inference thread core mapping diagnostics nominal.",
  ]);
  const [txDeploying, setTxDeploying] = useState(false);
  const [zkProving, setZkProving] = useState(false);
  const [zkHash, setZkHash] = useState<string | null>(null);
  const [swarmCompaction, setSwarmCompaction] = useState<number>(78);
  const [evmStep, setEvmStep] = useState<number>(0);

  const triggerDeployMock = () => {
    if (txDeploying) return;
    setTxDeploying(true);
    setSandboxLogs(prev => [
      ...prev,
      "› [0.0s] INFERENCE: Loading quantized model on GPU-0...",
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

  const triggerZkProof = () => {
    if (zkProving) return;
    setZkProving(true);
    setSandboxLogs(prev => [
      ...prev,
      "› [0.0s] ZK-SNARK: Compiling R1CS constraints circuit...",
      "› [0.2s] WITNESS: Synthesizing private inputs into arithmetic witness...",
      "› [0.5s] PROVER: Evaluating Groth16 elliptic curve pairings..."
    ]);

    setTimeout(() => {
      const hash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setZkHash(hash);
      setSandboxLogs(prev => [
        ...prev,
        `› [0.9s] SUCCESS: Zero-knowledge proof generated in 42.4ms!`,
        `› [1.1s] PROOF HASH: ${hash.slice(0, 24)}... verified valid.`
      ]);
      setZkProving(false);
    }, 1200);
  };

  const clearSandbox = () => {
    setSandboxLogs(["› Telemetry logs wiped."]);
  };

  const renderActiveWorkbench = () => {
    switch (activeExp) {
      case "neural-core":
        return (
          <div className="w-full">
            <AsciiCore />
          </div>
        );
      case "blockchain-vault":
        return (
          <div className="panel hover-glow-edge w-full h-[360px] flex flex-col justify-between" style={{ contain: "layout paint style" }}>
            <div className="panel-header flex items-center justify-between">
              <span className="panel-title">NodeSignalSandbox.sh</span>
              <span style={{ fontSize: "8px", color: "var(--color-warning)", fontFamily: "var(--font-mono)" }}>
                ⚠️ WARNING: TESTNET ENVIRONMENT
              </span>
            </div>
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
        activeCoreFrequency = ${Math.round(coreFreq * 2000)}; // MHz
    }
}`}
              </pre>
            </div>
            <div className="px-4 py-2 border-t border-[var(--color-border)] flex flex-col gap-2" style={{ background: "var(--color-elevated)" }}>
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
            <div className="panel-body border-t border-[var(--color-border)] flex gap-2 items-center justify-between" style={{ padding: "8px 12px" }}>
              <button 
                onClick={triggerDeployMock}
                disabled={txDeploying}
                className="btn-primary py-2 text-[10px]"
                style={{ flex: 1, textAlign: "center" }}
                data-cursor="CLICK"
              >
                {txDeploying ? "› SIMULATING TELEMETRY..." : "› INITIATE COMPILE & SIMULATE"}
              </button>
            </div>
          </div>
        );
      case "zk-prover":
        return (
          <div className="panel hover-glow-edge w-full h-[360px] flex flex-col justify-between" style={{ contain: "layout paint style" }}>
            <div className="panel-header flex items-center justify-between">
              <span className="panel-title">ZkCircuitProver.circom</span>
              <span style={{ fontSize: "8px", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
                ● SNARK PROVER ENGINE
              </span>
            </div>
            <div className="panel-body flex-1 font-mono text-[9.5px] p-4 flex flex-col justify-between" style={{ background: "var(--color-elevated)" }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span style={{ color: "var(--color-text-muted)" }}>SCHEME:</span>
                  <span style={{ color: "var(--color-cyan)" }}>Groth16 (BN254 Curve)</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span style={{ color: "var(--color-text-muted)" }}>CONSTRAINTS:</span>
                  <span style={{ color: "var(--color-amber)" }}>2,412 Non-Linear Equalities</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span style={{ color: "var(--color-text-muted)" }}>BENCHMARK PROVE TIME:</span>
                  <span style={{ color: "var(--color-online-bright)" }}>~42.4 ms (WASM SIMD)</span>
                </div>
                {zkHash && (
                  <div className="p-2 rounded border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 mt-1">
                    <span className="text-[8px] text-[var(--color-cyan)] block">PROOF COMMITMENT:</span>
                    <span className="text-[9px] text-white truncate block">{zkHash}</span>
                  </div>
                )}
              </div>
              <button
                onClick={triggerZkProof}
                disabled={zkProving}
                className="btn-primary py-2.5 text-[10px] w-full"
                data-cursor="CLICK"
              >
                {zkProving ? "› COMPUTING POLYNOMIAL WITNESS..." : "› GENERATE ZERO-KNOWLEDGE PROOF"}
              </button>
            </div>
          </div>
        );
      case "agent-swarm":
        return (
          <div className="panel hover-glow-edge w-full h-[360px] flex flex-col justify-between" style={{ contain: "layout paint style" }}>
            <div className="panel-header flex items-center justify-between">
              <span className="panel-title">SwarmContextCompactor.rs</span>
              <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)" }}>
                ● 4 PEER WORKERS ACTIVE
              </span>
            </div>
            <div className="panel-body flex-1 font-mono text-[9.5px] p-4 flex flex-col justify-between" style={{ background: "var(--color-elevated)" }}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>COMPACTION RATIO:</span>
                  <span style={{ color: "var(--color-amber-bright)" }}>{swarmCompaction}% SAVINGS</span>
                </div>
                <div className="w-full bg-[var(--color-void)] h-3 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${swarmCompaction}%`,
                      background: "linear-gradient(90deg, var(--color-cyan) 0%, var(--color-amber) 100%)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-[var(--color-text-muted)]">
                  <span>RAW TOKENS: 128,000</span>
                  <span>COMPACTED BUFFER: 28,160</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono mt-2">
                  <span style={{ color: "var(--color-text-muted)" }}>AGGRESSION FACTOR:</span>
                  <input 
                    type="range" 
                    min="40" 
                    max="95" 
                    value={swarmCompaction} 
                    onChange={(e) => setSwarmCompaction(parseInt(e.target.value))}
                    style={{ width: "100px", accentColor: "var(--color-amber)" }}
                  />
                </div>
              </div>
              <div className="p-2 border border-[var(--color-border)] rounded text-[8.5px] text-[var(--color-text-secondary)]">
                › Swarm memory ring verified: 0 dropped consensus blocks across all peer channels.
              </div>
            </div>
          </div>
        );
      case "evm-lab":
        const opcodes = ["PUSH1 0x40", "MSTORE", "CALLVALUE", "DUP1", "ISZERO", "PUSH2 0x0010", "JUMPI", "REVERT"];
        return (
          <div className="panel hover-glow-edge w-full h-[360px] flex flex-col justify-between" style={{ contain: "layout paint style" }}>
            <div className="panel-header flex items-center justify-between">
              <span className="panel-title">EvmBytecodeInspector.hex</span>
              <span style={{ fontSize: "8px", color: "var(--color-warning)", fontFamily: "var(--font-mono)" }}>
                ● CANARY EXECUTION
              </span>
            </div>
            <div className="panel-body flex-1 font-mono text-[9px] p-3 flex flex-col justify-between" style={{ background: "var(--color-elevated)" }}>
              <div className="flex flex-col gap-1.5 overflow-hidden">
                <span className="text-[8px] text-[var(--color-text-muted)] block mb-1">DISASSEMBLED OPCODES:</span>
                {opcodes.map((op, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${
                      idx === evmStep % opcodes.length 
                        ? "bg-[var(--color-amber)]/15 border border-[var(--color-amber)] text-white font-bold" 
                        : "text-[var(--color-text-secondary)] opacity-75"
                    }`}
                  >
                    <span>[{idx.toString(16).padStart(2, "0").toUpperCase()}] {op}</span>
                    <span className="text-[7.5px] text-[var(--color-cyan)]">GAS: {idx === 0 ? 3 : 2}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setEvmStep(s => s + 1)}
                className="btn-primary py-2 text-[10px] w-full mt-2"
                data-cursor="CLICK"
              >
                › STEP NEXT OPCODE (PC: 0x{(evmStep % opcodes.length).toString(16).toUpperCase()})
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="labs"
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 48px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div data-impeccable-session="d4f0123a">
        <style data-impeccable-css="d4f0123a">{`
          @scope ([data-impeccable-variant="1"]) {
            :scope .labs-module-btn:hover {
              border-color: var(--color-amber) !important;
              transform: translateX(2px);
            }
          }
          @scope ([data-impeccable-variant="2"]) {
            :scope .labs-module-btn {
              border-radius: 6px !important;
            }
          }
          @scope ([data-impeccable-variant="3"]) {
            :scope .labs-manifest-container {
              border-left: 3px solid var(--color-amber) !important;
            }
          }
        `}</style>
        
        {/* VARIANT 1: Cyberpunk Deep Tech Suite with 5 R&D Modules & Interactive Workbenches */}
        <div data-impeccable-variant="1" style={{ display: "contents" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <div data-cursor="VIEW">
              <SectionLabel label="LABS.SH" />
              <p className="text-system" style={{ marginTop: "4px" }}>
                UNDERGROUND R&D CHAMBER · 5 EXPERIMENTAL SYSTEM SANDBOXES
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: "clamp(24px, 4vw, 48px)",
                marginTop: "clamp(32px, 4vh, 48px)",
                alignItems: "start",
              }}
              className="labs-grid"
            >
              {/* Left Column: 5 R&D Modules */}
              <div className="flex flex-col gap-4">
                <div className="panel hover-glow-edge labs-manifest-container" style={{ contain: "layout paint style" }}>
                  <div className="panel-header flex items-center justify-between">
                    <span className="panel-title">labs_manifest.json</span>
                    <span style={{ fontSize: "8px", color: "var(--color-online)", fontFamily: "var(--font-mono)" }}>
                      5 R&D MODULES REGISTERED
                    </span>
                  </div>
                  
                  <div className="panel-body flex flex-col gap-2" style={{ padding: "12px" }}>
                    {LAB_MODULES.map((mod) => {
                      const isSelected = activeExp === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => setActiveExp(mod.id)}
                          className="labs-module-btn flex flex-col gap-1 text-left p-3 border transition-all duration-200"
                          style={{
                            background: isSelected ? "rgba(255, 94, 58, 0.06)" : "transparent",
                            borderColor: isSelected ? "var(--color-amber)" : "var(--color-border)",
                            boxShadow: isSelected ? "0 0 14px var(--color-amber-glow)" : "none",
                            borderRadius: "2px",
                          }}
                          data-cursor="CLICK"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span style={{ 
                              fontFamily: "var(--font-mono)", 
                              fontSize: "11px", 
                              fontWeight: "bold", 
                              color: isSelected ? "var(--color-amber-bright)" : "var(--color-text-primary)" 
                            }}>
                              {mod.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[7.5px] font-mono text-[var(--color-text-muted)] border border-[var(--color-border)] px-1 py-0.5 rounded">
                                {mod.tag}
                              </span>
                              <span className={`terminal-badge ${mod.badgeClass}`} style={{ fontSize: "8px" }}>
                                {mod.status}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontSize: "10.5px", color: "var(--color-text-secondary)", marginTop: "2px", lineHeight: "1.4" }}>
                            {mod.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sandbox Operations Output */}
                <div className="panel hover-glow-edge flex-1 min-h-[160px]" style={{ contain: "layout paint style" }}>
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
                    className="panel-body font-mono text-[10px] overflow-y-auto max-h-[140px]"
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
                              : log.includes("INFERENCE") || log.includes("ZK-SNARK")
                              ? "var(--color-amber)"
                              : log.includes("OSCILLATOR") || log.includes("stable") || log.includes("PROVER")
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

              {/* Right Column: Dynamic Interactive Workbench */}
              <div className="flex items-start justify-center sticky top-24">
                {renderActiveWorkbench()}
              </div>
            </div>
          </div>
        </div>

        {/* VARIANT 2: Tactical Matrix Grid */}
        <div data-impeccable-variant="2" style={{ display: "none" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <div data-cursor="VIEW">
              <SectionLabel label="LABS.SH // MATRIX" />
              <p className="text-system" style={{ marginTop: "4px" }}>
                TACTICAL R&D MATRIX · MULTI-CORE WORKSPACE
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {LAB_MODULES.map((mod) => (
                <div 
                  key={mod.id} 
                  onClick={() => setActiveExp(mod.id)}
                  className="panel p-4 border border-[var(--color-border)] hover:border-[var(--color-cyan)] cursor-pointer transition-all flex flex-col justify-between h-[180px]"
                  style={{ background: activeExp === mod.id ? "rgba(0, 217, 255, 0.05)" : "var(--color-surface)" }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] font-mono text-[var(--color-cyan)]">{mod.tag}</span>
                      <span className={`terminal-badge ${mod.badgeClass}`} style={{ fontSize: "8px" }}>{mod.status}</span>
                    </div>
                    <h4 className="font-mono text-xs font-bold text-white mb-1.5">{mod.title}</h4>
                    <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="text-[9px] font-mono text-[var(--color-amber)] flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                    <span>EXECUTE MODULE</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VARIANT 3: Terminal Hacker Monolith */}
        <div data-impeccable-variant="3" style={{ display: "none" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <div data-cursor="VIEW">
              <SectionLabel label="LABS.SH // CLI" />
              <p className="text-system" style={{ marginTop: "4px" }}>
                HEADLESS CLI DECK · ZERO-GRAPHICS KERNEL RUNNER
              </p>
            </div>
            <div className="panel mt-8 p-6 font-mono text-xs border border-[var(--color-amber)] bg-black">
              <div className="text-[var(--color-amber)] mb-4 pb-2 border-b border-[var(--color-border)]">
                theUG@kernel-r&d:~$ labs --list-active-experiments
              </div>
              <div className="space-y-3">
                {LAB_MODULES.map((mod, idx) => (
                  <div 
                    key={mod.id} 
                    onClick={() => setActiveExp(mod.id)}
                    className="flex items-center justify-between p-2 hover:bg-white/5 cursor-pointer"
                  >
                    <span>[0{idx + 1}] {mod.title}</span>
                    <span className="text-[var(--color-online)]">{mod.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Variants: insert below this line */}
        {/* impeccable-variants-end d4f0123a */}
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
