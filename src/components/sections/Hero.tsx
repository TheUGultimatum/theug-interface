"use client";

import { useEffect, useState, useRef, memo } from "react";
import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { NodeGraph } from "@/components/terminal/NodeGraph";

/* ─── Typewriter hook ────────────────────────────────────── */
function useTypewriter(lines: string[], startDelay = 0) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const typeChar = (lineIdx: number, charIdx: number) => {
      if (cancelled) return;
      if (lineIdx >= lines.length) { setDone(true); return; }
      
      const line = lines[lineIdx];
      const isCommand = line.startsWith("$");
      const isStatus = line.includes("[OK]");

      // Simulate network/execution delay before showing status
      if (isStatus && charIdx === 0) {
        let loadCount = 0;
        const loaderChars = ["\\", "|", "/", "-"];
        const loadInterval = setInterval(() => {
          if (cancelled) return clearInterval(loadInterval);
          setLoadingStep(`  [${loaderChars[loadCount % 4]}] ${line.replace("  [OK] ", "")}`);
          loadCount++;
        }, 80);

        timeout = setTimeout(() => {
          clearInterval(loadInterval);
          if (cancelled) return;
          setLoadingStep("");
          setDisplayedLines(prev => [...prev, line]);
          timeout = setTimeout(() => typeChar(lineIdx + 1, 0), 100);
        }, 400 + Math.random() * 600);
        return;
      }

      if (charIdx <= line.length) {
        setCurrentLine(line.slice(0, charIdx));
        // Add realistic typing variance: sometimes pause slightly
        const charDelay = isCommand ? (20 + Math.random() * 30 + (Math.random() > 0.9 ? 100 : 0)) : 10;
        timeout = setTimeout(() => typeChar(lineIdx, charIdx + 1), charDelay);
      } else {
        setDisplayedLines(prev => [...prev, line]);
        setCurrentLine("");
        // Pause after a command is typed before executing
        const endDelay = isCommand ? 400 : 80;
        timeout = setTimeout(() => typeChar(lineIdx + 1, 0), endDelay);
      }
    };

    timeout = setTimeout(() => typeChar(0, 0), startDelay);
    return () => { cancelled = true; clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { displayedLines, currentLine, loadingStep, done };
}

/* ─── Terminal ───────────────────────────────────────────── */
const BOOT_SEQUENCE = [
  "$ system_init --env=production",
  "  [OK] environment loaded",
  "  [OK] modules: 47 loaded",
  "  [OK] neural network connected",
  "  [OK] ai_engine v2.4.1 online",
  "  [OK] automation_daemon started",
  "  [OK] all systems nominal",
  "$ whoami",
  "  usmaan.gani // theUG",
  "  role: independent builder",
  "  focus: ai·automation·web3",
];

function Terminal() {
  const { displayedLines, currentLine, loadingStep, done } = useTypewriter(BOOT_SEQUENCE, 400);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Interactive Terminal State
  const [history, setHistory] = useState<{ type: "cmd" | "out", text: string }[]>([]);
  const [input, setInput] = useState("");
  const [cmdIndex, setCmdIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionStartRef = useRef(Date.now());
  
  // Auto-demo state
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);

  useEffect(() => {
    if (!done || hasInteracted || isAutoTyping || history.length > 0) return;
    const timeout = setTimeout(() => {
      setIsAutoTyping(true);
      const demoCmd = "help";
      let i = 0;
      const typeInterval = setInterval(() => {
        setInput(demoCmd.slice(0, i + 1));
        i++;
        if (i >= demoCmd.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            // Can't easily call executeCommand without being inside an effect wrapper, 
            // so we will manually trigger it here
            setHistory(prev => [
              ...prev,
              { type: "cmd", text: demoCmd },
              { type: "out", text: "Available commands:\nhelp, whoami, skills, projects, socials, contact, clear, date, uptime, stack" }
            ]);
            setInput("");
            setIsAutoTyping(false);
          }, 400);
        }
      }, 100);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [done, hasInteracted, isAutoTyping, history.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines, currentLine, loadingStep, history, input]);

  // Focus input when user clicks anywhere in the terminal
  const handleTerminalClick = () => {
    if (done && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    let output = "";
    const lowerCmd = trimmed.toLowerCase();
    
    switch(lowerCmd) {
      case "help":
        output = "Available commands:\n  help     - List all available terminal commands\n  whoami   - Display active engineer identification\n  skills   - Output diagnostic skill visual metrics\n  projects - Show portfolio products & details\n  admin    - Access project management admin console\n  socials  - Link outbound transmission vectors\n  contact  - Open immediate communications link\n  clear    - Clear console screen buffer\n  date     - Show current standard system date\n  uptime   - Fetch host active runtime timer\n  stack    - Output active engineering stack details\n  matrix   - Sync binary translation streams\n  neocore  - Test active core thermal loads\n  glitch   - Trigger interface theme calibration";
        break;
      case "admin":
        output = "› [AUTH: UPLINKING TO SECURE COMMAND CONSOLE]\n› Redirecting to /admin ...";
        setTimeout(() => {
          window.location.href = "/admin";
        }, 600);
        break;
      case "about":
        output = "Scrolling to about section...";
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "projects":
        output = "Loading active project matrix...\n- Agentic Workflows Sandbox: Python / LangChain / Docker\n- DeFi Liquidity Matrix     : Solidity / Hardhat / React\n- Industrial Telemetry Board: Go / InfluxDB / Next.js\n- Frictional AI Core Node   : Python / PyTorch / WASM\n(Use standard anchor navigation or scroll to explore details)";
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "skills":
        output = "Executing core diagnostics:\nAI/LLM Engineering    [██████████████████░░] 90%\nBackend / APIs        [█████████████████░░░] 85%\nFrontend / Systems UI [████████████████░░░░] 80%\nWeb3 / Contracts      [███████████████░░░░░] 78%\nDevOps / Infrastructure [██████████████░░░░░░] 72%";
        break;
      case "stack":
        output = "Active Engineering Stack:\n  Languages   : Python, TypeScript, Node.js, Solidity, HTML/CSS\n  Libraries   : OpenAI SDK, LangChain, Next.js, React, Framer Motion\n  Deployment  : Docker, AWS, PostgreSQL, Redis, Linux Core, Git";
        break;
      case "contact":
        output = "Opening comms channel...";
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "time":
        output = new Date().toLocaleTimeString();
        break;
      case "date":
        output = new Date().toDateString();
        break;
      case "clear":
        setHistory([]);
        return;
      case "whoami":
        output = "usmaan.gani // theUG\n---------------------------------------\nrole  : independent builder & systems engineer\nfocus : artificial intelligence · automation · web3\nbase  : India · UTC+5:30\nstatus: active workspace / client operations";
        break;
      case "socials":
        output = "Outbound Vectors:\n  GitHub   : https://github.com/TheUGultimatum\n  X        : https://x.com/Usmaangani252\n  LinkedIn : https://www.linkedin.com/in/usmaan-gani/";
        break;
      case "uptime": {
        const diffMs = Date.now() - sessionStartRef.current;
        const totalSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        output = `portfolio uptime: 247d 18h 32m ${mins}m ${secs}s (session active)`;
        break;
      }
      case "resume":
        output = "Initiating resume download sequence... (simulated)";
        break;
      case "matrix":
        output = "› INITIATING NEURAL CODES TRANSLATION MATRIX:\n  10101100101010110101011011001010101101\n  01101001100110110010101011010101101100\n  10110010101011010101101100101010110101\n  00101010110101011011001010101101010110\n  › BINARY DATA STREAM NOMINAL. SYSTEM SECURE.";
        break;
      case "neocore":
        output = "› [SYS.OVERLOAD: ACTIVE TRIGGER DETECTED]\n  › Rerouting thread metrics to sub-clusters...\n  › Compacting local caches: 2.1GB virtual space index freed.\n  › Diagnostics frequency stable at 4.2 GHz. Cores nominal.";
        break;
      case "glitch": {
        output = "› [DIAGNOSTIC CRITICAL FLASH DETECTED]\n  › Flickering interface theme parameters for color calibration...";
        const el = document.documentElement;
        const currentIsDay = el.classList.contains("day-mode");
        const flashTheme = (delayMs: number) => {
          setTimeout(() => {
            el.classList.toggle("day-mode");
          }, delayMs);
        };
        flashTheme(100);
        flashTheme(250);
        flashTheme(400);
        flashTheme(600);
        flashTheme(800);
        flashTheme(1050);
        setTimeout(() => {
          if (currentIsDay) {
            el.classList.add("day-mode");
          } else {
            el.classList.remove("day-mode");
          }
        }, 1300);
        break;
      }
      default:
        output = `command not found: '${trimmed}'. Type 'help' for options.`;
    }

    setHistory(prev => [
      ...prev,
      { type: "cmd", text: trimmed },
      { type: "out", text: output }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    if (e.key === "Enter") {
      executeCommand(input);
      setCmdHistory(prev => [input, ...prev]);
      setCmdIndex(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdIndex < cmdHistory.length - 1) {
        const nextIdx = cmdIndex + 1;
        setCmdIndex(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdIndex > 0) {
        const prevIdx = cmdIndex - 1;
        setCmdIndex(prevIdx);
        setInput(cmdHistory[prevIdx]);
      } else if (cmdIndex === 0) {
        setCmdIndex(-1);
        setInput("");
      }
    }
  };

  const getLineColor = (line: string) => {
    if (line.startsWith("$")) return "var(--color-amber)";
    if (line.includes("[OK]")) return "var(--color-online-bright)";
    return "var(--color-text-secondary)";
  };

  return (
    <div 
      className="panel hover-glow-edge" 
      data-cursor="text" 
      style={{ flex: 1, cursor: "text" }}
      onClick={handleTerminalClick}
    >
      <div className="panel-header">
        <div className="panel-controls">
          <span className="panel-dot panel-dot-red" />
          <span className="panel-dot panel-dot-yellow" />
          <span className="panel-dot panel-dot-green" />
        </div>
        <span className="panel-title">workspace.sh</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "8px", color: done ? "var(--color-online)" : "var(--color-warning)", letterSpacing: "0.1em" }}>
          {done ? "● READY" : "○ BOOTING"}
        </span>
      </div>

      <div
        ref={scrollRef}
        style={{
          padding: "12px 14px",
          minHeight: "180px",
          maxHeight: "220px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
        }}
      >
        {/* Boot Sequence */}
        {displayedLines.map((line, i) => (
          <div key={`boot-${i}`} style={{
            fontFamily: "var(--font-mono)", fontSize: "11px",
            color: getLineColor(line), lineHeight: 1.65, whiteSpace: "pre",
          }}>
            {line}
          </div>
        ))}

        {/* Loading Spinner Step */}
        {loadingStep && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "11px",
            color: "var(--color-text-muted)", lineHeight: 1.65, whiteSpace: "pre",
          }}>
            {loadingStep}
          </div>
        )}

        {/* Currently typing line */}
        {!done && !loadingStep && currentLine !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: currentLine.startsWith("$") ? "var(--color-amber)" : "var(--color-text-secondary)",
              whiteSpace: "pre",
            }}>
              {currentLine}
            </span>
            <span className="cursor-blink" />
          </div>
        )}

        {/* Interactive History */}
        {done && history.map((item, i) => (
          <div key={`hist-${i}`} style={{
            fontFamily: "var(--font-mono)", fontSize: "11px",
            color: item.type === "cmd" ? "var(--color-amber)" : "var(--color-text-secondary)",
            lineHeight: 1.65, whiteSpace: "pre",
            marginTop: item.type === "cmd" ? "6px" : "0",
          }}>
            {item.type === "cmd" ? `$ ${item.text}` : item.text}
          </div>
        ))}

        {/* Interactive Input */}
        {done && (
          <div style={{ display: "flex", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-amber)", marginRight: "6px" }}>$</span>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setHasInteracted(true);
                executeCommand(input);
                setCmdHistory(prev => [input, ...prev]);
                setCmdIndex(-1);
                setInput("");
              }}
              style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => {
                  setHasInteracted(true);
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--color-text-primary)",
                  width: "100%",
                  caretColor: "transparent" // We use custom cursor blink
                }}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              {/* Custom blinking cursor overlay */}
              <div style={{ 
                position: "absolute", 
                left: `calc(${input.length} * 6.6px)`, // approximate width per char in 11px mono
                pointerEvents: "none",
                display: "flex",
                alignItems: "center"
              }}>
                <span className="cursor-blink" />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Real Visitor Telemetry Panel ───────────────────────── */
interface HardwareStat {
  label: string;
  value: string;
  detail: string;
  color: string;
  pct: number;
}

function VisitorTelemetryPanel() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [stats, setStats] = useState<HardwareStat[]>([
    { label: "GPU_RENDERER", value: "DETECTING", detail: "WEBGL", color: "var(--color-text-muted)", pct: 15 },
    { label: "CPU_THREADS", value: "DETECTING", detail: "LOGICAL CORES", color: "var(--color-text-muted)", pct: 15 },
    { label: "DEVICE_MEMORY", value: "DETECTING", detail: "RAM TIER", color: "var(--color-text-muted)", pct: 15 },
    { label: "NETWORK_LINK", value: "PINGING", detail: "LATENCY", color: "var(--color-text-muted)", pct: 15 },
    { label: "DISPLAY_MATRIX", value: "READING", detail: "VIEWPORT", color: "var(--color-text-muted)", pct: 15 },
    { label: "CLIENT_TIMEZONE", value: "SYNCING", detail: "TIMEZONE", color: "var(--color-text-muted)", pct: 15 },
  ]);
  const [clientPlatform, setClientPlatform] = useState("SCANNING...");

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectHardware = () => {
      // 1. GPU Renderer via WebGL
      let gpuName = "HARDWARE_ACCEL";
      let gpuPct = 85;
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            const raw = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (raw) {
              gpuName = String(raw)
                .replace(/ANGLE \(/i, "")
                .replace(/\sDirect3D.*$/i, "")
                .replace(/\sOpenGL.*$/i, "")
                .replace(/,\sor similar/i, "")
                .replace(/\)$/, "")
                .trim();
              if (gpuName.length > 20) {
                gpuName = gpuName.slice(0, 19) + "…";
              }
              gpuName = gpuName.toUpperCase();
              gpuPct = 95;
            }
          }
        }
      } catch {
        gpuName = "GPU ACCELERATED";
        gpuPct = 80;
      }

      // 2. CPU Threads
      const rawCores = navigator.hardwareConcurrency || 4;
      const cores = `${rawCores} THREADS`;
      const cpuPct = Math.min(100, Math.max(25, Math.round((rawCores / 24) * 100)));

      // 3. Memory RAM Tier (with space: [≥ 16 GB RAM])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navAny = navigator as any;
      const memVal = Number(navAny.deviceMemory) || 8;
      const memGB = navAny.deviceMemory ? `≥ ${navAny.deviceMemory} GB RAM` : "HARDWARE_TIER";
      const ramPct = Math.min(100, Math.max(25, Math.round((memVal / 32) * 100)));

      // 4. Network Link & Ping
      const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
      const connType = conn?.effectiveType ? String(conn.effectiveType).toUpperCase() : "ONLINE";
      const rtt = conn?.rtt ? `${conn.rtt}ms RTT` : "LOW_PING";
      const downlink = conn?.downlink ? `${conn.downlink}M` : "";
      const netLabel = downlink ? `${rtt} · ${downlink}` : rtt;
      let netPct = 85;
      if (conn?.rtt) {
        netPct = Math.max(20, Math.min(100, Math.round(100 - (conn.rtt / 150) * 70)));
      }

      // 5. Display & Color Gamut
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const isP3 = window.matchMedia && window.matchMedia("(color-gamut: p3)").matches;
      const dpr = window.devicePixelRatio ? `${window.devicePixelRatio}x` : "1x";
      const displayDetail = `${dpr} · ${isP3 ? "P3-HDR" : "sRGB"}`;
      const displayPct = Math.min(100, Math.max(35, Math.round((window.screen.width / 2560) * 100)));

      // 6. Timezone diurnal cycle
      let tz = "LOCAL";
      try {
        const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
        tz = resolved.split("/").pop()?.replace(/_/g, " ").toUpperCase() || "LOCAL";
      } catch {
        tz = "UTC";
      }
      const now = new Date();
      const tzPct = Math.min(100, Math.max(10, Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)));

      const platformStr = navAny.userAgentData?.platform || (navigator.platform ? navigator.platform : "HOST");
      setClientPlatform(String(platformStr).toUpperCase().slice(0, 14));

      setStats([
        {
          label: "GPU_ENGINE",
          value: gpuName,
          detail: "HW_ACCEL",
          color: "var(--color-online)",
          pct: gpuPct,
        },
        {
          label: "CPU_THREADS",
          value: cores,
          detail: "LOGICAL CORES",
          color: "var(--color-online)",
          pct: cpuPct,
        },
        {
          label: "SYSTEM_MEMORY",
          value: memGB,
          detail: "RAM_TIER",
          color: "var(--color-amber)",
          pct: ramPct,
        },
        {
          label: "NETWORK_LINK",
          value: netLabel,
          detail: connType,
          color: "var(--color-cyan)",
          pct: netPct,
        },
        {
          label: "DISPLAY_MATRIX",
          value: screenRes,
          detail: displayDetail,
          color: "var(--color-online)",
          pct: displayPct,
        },
        {
          label: "CLIENT_ZONE",
          value: tz,
          detail: "ZONE",
          color: "var(--color-amber)",
          pct: tzPct,
        },
      ]);
    };

    detectHardware();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    if (conn && conn.addEventListener) {
      conn.addEventListener("change", detectHardware);
      return () => conn.removeEventListener("change", detectHardware);
    }
  }, []);

  return (
    <div className="panel hover-glow-edge" style={{ contain: "layout paint style" }}>
      <div className="panel-header flex items-center justify-between">
        <span className="panel-title font-mono text-[10px] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] shadow-sm animate-pulse" />
          <span>client_telemetry.sys</span>
        </span>
        <span style={{ fontSize: "7px", color: "var(--color-online)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
          ● {clientPlatform}
        </span>
      </div>
      <div className="panel-body font-mono text-[9px]" style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {stats.map((s) => (
            <div 
              key={s.label} 
              className="flex items-center justify-between gap-1.5"
            >
              <span style={{ color: "var(--color-text-secondary)", fontSize: "8.5px" }} className="shrink-0">
                {s.label}
              </span>

              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{ color: "var(--color-text-muted)", fontSize: "7.5px" }} className="hidden sm:inline truncate">
                  {s.detail}
                </span>

                {/* Animated Hardware Meter Bar */}
                <div 
                  className="w-10 sm:w-14 h-1.5 rounded-full overflow-hidden shrink-0 flex items-center p-[0.5px]"
                  style={{
                    backgroundColor: "var(--color-elevated)",
                    border: "1px solid var(--color-border)",
                  }}
                  title={`${s.pct}% capacity readout`}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isAnimated ? `${s.pct}%` : "0%",
                      backgroundColor: s.color,
                      boxShadow: `0 0 6px ${s.color}`,
                    }}
                  />
                </div>

                <span style={{ color: s.color, fontWeight: "bold", fontSize: "8px" }} className="shrink-0 font-mono">
                  [{s.value}]
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7.5px", color: "var(--color-text-muted)" }}>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
            <span>PROBE // LIVE_CLIENT</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span style={{ color: "var(--color-cyan)" }}>SYNCED</span>
            <span style={{ color: "var(--color-border-bright)" }}>·</span>
            <span style={{ color: "var(--color-online)" }}>ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat block ─────────────────────────────────────────── */
const Stat = memo(function StatComponent({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      flex: 1, padding: "10px 14px",
      border: "1px solid var(--color-border)",
      borderTop: highlight ? "1px solid var(--color-amber)" : "1px solid var(--color-border)",
      background: highlight ? "rgba(200,84,26,0.03)" : "var(--color-surface)",
      display: "flex", flexDirection: "column", gap: "3px",
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: highlight ? "var(--color-amber-bright)" : "var(--color-text-secondary)", letterSpacing: "0.03em" }}>{value}</span>
    </div>
  );
});

/* ─── Hero Identity Animation ──────────────────────────────── */
const ROLES = ["ai systems", "automation", "infrastructure", "web3"];
const HERO_TITLES = [
  { line1: "USMAAN", line2: "GANI" },
  { line1: "INDEPENDENT", line2: "BUILDER" }
];

function ScrambleText({ text, trigger }: { text: string, trigger: boolean }) {
  const [display, setDisplay] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";
  
  useEffect(() => {
    if (!trigger) {
      // eslint-disable-next-line
      setDisplay("");
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(text.split("").map((char, index) => {
        if (char === " " || char === "\\n" || char === "·") return char;
        if (index < iteration) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/2;
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);
  
  return <>{display}</>;
}

function HeroIdentity() {
  const [phase, setPhase] = useState<"init" | "reveal" | "stable">("init");
  const [initText, setInitText] = useState("");
  const [roleIdx, setRoleIdx] = useState(0);
  const [titleIdx, setTitleIdx] = useState(0);

  useEffect(() => {
    // Phase 1: Init sequence
    const text = "SYS.INIT // IDENTITY_MODULE...";
    let i = 0;
    const typeInterval = setInterval(() => {
      setInitText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(typeInterval);
        setTimeout(() => setPhase("reveal"), 400);
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    if (phase === "reveal") {
      setTimeout(() => setPhase("stable"), 1200); // Give scramble time to finish
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "stable") return;
    const roleInterval = setInterval(() => {
      setRoleIdx(prev => (prev + 1) % ROLES.length);
    }, 2500);
    const titleInterval = setInterval(() => {
      setTitleIdx(prev => (prev + 1) % HERO_TITLES.length);
    }, 4500); // 4.5 seconds per title loop
    return () => {
      clearInterval(roleInterval);
      clearInterval(titleInterval);
    };
  }, [phase]);

  return (
    <div style={{ lineHeight: 0.88, position: "relative", minHeight: "clamp(170px, 20vw, 290px)" }}>
      {phase === "init" && (
        <div className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-4 animate-pulse">
          $ {initText}<span className="cursor-blink" />
        </div>
      )}

      {(phase === "reveal" || phase === "stable") && (
        <div className="animate-fade-in" style={{ animationDuration: "0.8s" }}>
          <h1 
            className="text-hero" 
            style={{ 
              margin: 0, 
              display: "flex", 
              flexDirection: "column",
              justifyContent: "flex-start",
              fontSize: titleIdx === 0 ? undefined : "clamp(52px, 8.5vw, 94px)",
              lineHeight: titleIdx === 0 ? 0.88 : 0.92,
              letterSpacing: titleIdx === 0 ? undefined : "-0.01em",
              wordBreak: "break-word",
              minHeight: "clamp(120px, 16vw, 245px)",
            }}
          >
            <span><ScrambleText key={`l1-${titleIdx}`} text={HERO_TITLES[titleIdx].line1} trigger={phase === "reveal" || phase === "stable"} /></span>
            <span style={{ color: "var(--color-text-muted)" }}>
              <ScrambleText key={`l2-${titleIdx}`} text={HERO_TITLES[titleIdx].line2} trigger={phase === "reveal" || phase === "stable"} />
            </span>
          </h1>
          
          <div 
            className="animate-fade-in-up" 
            style={{ 
              marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "flex-start",
              gap: "16px", flexWrap: "wrap",
              opacity: phase === "stable" ? 1 : 0, transition: "opacity 0.6s ease 0.6s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>AKA</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-amber)",
                border: "1px solid var(--color-amber-dim)", padding: "2px 8px", borderRadius: "1px",
                letterSpacing: "0.08em",
              }}>theUG</span>
            </div>
            <span style={{ color: "var(--color-border)" }} className="hidden sm:inline">|</span>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-cyan)", 
              letterSpacing: "0.08em", overflow: "hidden", position: "relative",
              height: "16px", display: "block", flexShrink: 0, minWidth: "160px"
            }}>
              <div 
                style={{ 
                  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  transform: `translateY(-${roleIdx * 16}px)` 
                }}
              >
                {ROLES.map((role, i) => (
                  <div key={i} style={{ height: "16px", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                    &gt; {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  return (
    <section id="home" style={{
      minHeight: "100dvh",
      paddingTop: "clamp(80px, 11vh, 130px)",
      paddingBottom: "clamp(48px, 7vh, 90px)",
      paddingLeft: "clamp(28px, 4vw, 60px)",
      paddingRight: "clamp(28px, 4vw, 60px)",
      display: "flex", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: "1420px", margin: "0 auto" }}>

        {/* System breadcrumb */}
        <div
          className={mounted ? "animate-fade-in" : "anim-hidden"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "clamp(28px, 4vh, 48px)",
            paddingBottom: "14px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>INDEX.01</span>
            <span style={{ color: "var(--color-border)", fontSize: "10px" }}>—</span>
            {["AI SYSTEMS", "AUTOMATION", "INFRASTRUCTURE", "WEB3"].map((tag, i, arr) => (
              <span key={tag} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-text-muted)" }}>{tag}</span>
                {i < arr.length - 1 && <span style={{ color: "var(--color-border)" }}>·</span>}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>BUILD_0525</span>
        </div>

        {/* Main grid — asymmetric 5:7 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "start",
        }} className="hero-grid">

          {/* ── LEFT ── */}
          <div
            className={mounted ? "animate-fade-in-up" : "anim-hidden"}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 32px)", minWidth: 0 }}
          >
            <HeroIdentity />

            <p style={{
              color: "var(--color-text-secondary)", fontSize: "13px",
              lineHeight: 1.85, maxWidth: "380px",
              fontFamily: "var(--font-space-grotesk)",
            }}>
              Building experimental AI tooling, autonomous workflows,
              blockchain infrastructure, and immersive system interfaces.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <a href="#projects" className="btn-primary" id="cta-workspace">
                &gt;_ ENTER WORKSPACE
              </a>
              <a href="#projects" className="btn-secondary" id="cta-projects">
                PROJECTS <span className="btn-arrow">→</span>
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "1px", border: "1px solid var(--color-border)" }}>
              <Stat label="BASE"   value="India" />
              <Stat label="STATUS" value="Building" highlight />
              <Stat label="EXP"    value="4Y+" />
            </div>

            {/* Redesigned Animated Kinetic Collaboration Uplink */}
            <Link
              href="/contact"
              className="collab-card group relative overflow-hidden rounded-2xl transition-all duration-300 p-4 md:p-5 hover:-translate-y-0.5 cursor-pointer block"
              title="Open direct communication channel with Usmaan Gani"
            >
              {/* Animated Top Flowing Laser Line */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, var(--color-online) 30%, var(--color-cyan) 70%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "laser-sweep 3.5s ease-in-out infinite",
                }}
              />

              {/* Ambient radial glow behind beacon */}
              <div 
                className="collab-glow absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity blur-2xl"
                style={{ background: "var(--color-online)" }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Concentric Dual-Pulse Radar Dot */}
                  <div className="relative mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-online)] opacity-60 duration-1000" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-online)] shadow-[0_0_12px_var(--color-online)]" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-online)] font-bold flex items-center gap-1">
                        <Radio size={10} className="animate-pulse" />
                        <span>BROADCAST // OPEN FOR COLLAB</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-online)] transition-colors tracking-tight">
                      Available for Collaboration
                    </h4>

                    <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                      EVM protocols, autonomous AI workflows & full-stack Web3 architecture.
                    </p>
                  </div>
                </div>

                {/* Animated Action Pill */}
                <div className="sm:self-center shrink-0">
                  <span className="collab-pill inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-sm">
                    <span>Initiate Comms</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── RIGHT ── */}
          <div
            className={mounted ? "animate-fade-in-up delay-200" : "anim-hidden"}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Terminal />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Real Client / Visitor Hardware & Network Telemetry */}
              <VisitorTelemetryPanel />

              {/* Node graph */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">network.map</span>
                </div>
                <div style={{ padding: "8px", height: "100%", minHeight: "160px" }}>
                  <NodeGraph />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
