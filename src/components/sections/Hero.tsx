"use client";

import { useEffect, useState, useRef, memo } from "react";
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
        output = "Available commands:\n  help     - List all available terminal commands\n  whoami   - Display active engineer identification\n  skills   - Output diagnostic skill visual metrics\n  projects - Show portfolio products & details\n  socials  - Link outbound transmission vectors\n  contact  - Open immediate communications link\n  clear    - Clear console screen buffer\n  date     - Show current standard system date\n  uptime   - Fetch host active runtime timer\n  stack    - Output active engineering stack details\n  matrix   - Sync binary translation streams\n  neocore  - Test active core thermal loads\n  glitch   - Trigger interface theme calibration";
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

/* ─── Metrics with fluctuation ───────────────────────────── */
interface Metric { label: string; base: number; color: string; }
const METRICS: Metric[] = [
  { label: "CPU",  base: 42, color: "var(--color-amber)" },
  { label: "MEM",  base: 68, color: "var(--color-amber-bright)" },
  { label: "NET",  base: 71, color: "var(--color-text-muted)" },
  { label: "AI",   base: 63, color: "var(--color-amber)" },
];

const LiveMetric = memo(function LiveMetricComponent({ metric }: { metric: Metric }) {
  const [val, setVal] = useState(metric.base);
  const [animated, setAnimated] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setAnimated(val), 100);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [val]);

  useEffect(() => {
    // Throttled to fluctuate every 6-8 seconds instead of ~3 seconds to save re-renders
    const id = setInterval(() => {
      if (document.hidden) return; // Skip updating value if browser tab is inactive!
      const next = Math.max(5, Math.min(96, metric.base + (Math.random() - 0.5) * 18));
      setVal(Math.round(next));
      setAnimated(Math.round(next));
    }, 6000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [metric.base]);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.09em" }}>{metric.label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: metric.color, transition: "color 0.4s" }}>{val}%</span>
      </div>
      <div className="metric-bar-track">
        <div style={{
          height: "100%", borderRadius: "1px",
          background: metric.color,
          width: `${animated}%`,
          transition: "width 1.8s ease-out",
          opacity: 0.7,
        }} />
      </div>
    </div>
  );
});

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
    <div style={{ lineHeight: 0.88, position: "relative", minHeight: "120px" }}>
      {phase === "init" && (
        <div className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-4 animate-pulse">
          $ {initText}<span className="cursor-blink" />
        </div>
      )}

      {(phase === "reveal" || phase === "stable") && (
        <div className="animate-fade-in" style={{ animationDuration: "1s" }}>
          <h1 
            className="text-hero" 
            style={{ 
              margin: 0, 
              display: "flex", 
              flexDirection: "column",
              fontSize: titleIdx === 0 ? undefined : "clamp(42px, 8vw, 76px)",
              lineHeight: titleIdx === 0 ? 0.88 : 0.95,
              wordBreak: "break-word"
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

            {/* Vertical rule + decorative text */}
            <div style={{
              paddingTop: "16px", borderTop: "1px solid var(--color-border)",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>AVAILABLE FOR COLLABORATION</span>
              <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-online)", flexShrink: 0 }} />
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div
            className={mounted ? "animate-fade-in-up delay-200" : "anim-hidden"}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Terminal />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Metrics */}
              {/* Active Systems Operations Monitor */}
              <div className="panel hover-glow-edge" style={{ contain: "layout paint style" }}>
                <div className="panel-header flex items-center justify-between">
                  <span className="panel-title">active_systems.log</span>
                  <span style={{ fontSize: "7px", color: "var(--color-online)", fontFamily: "var(--font-mono)" }}>
                    ● SYS_OK
                  </span>
                </div>
                <div className="panel-body font-mono text-[9px]" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                      { label: "LOCAL_LLM_CLUSTER",    value: "ONLINE", color: "var(--color-online)" },
                      { label: "AUTOMATION_PIPELINES", value: "ACTIVE", color: "var(--color-amber)" },
                      { label: "NODE_INFRASTRUCTURE",  value: "SYNCED", color: "var(--color-online)" },
                      { label: "GPU_INFERENCE_CORE",   value: "READY",  color: "var(--color-cyan)" },
                      { label: "CONTACT_UPLINK",       value: "STABLE", color: "var(--color-cyan)" }
                    ].map((sys) => (
                      <div key={sys.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "8.5px" }}>{sys.label}</span>
                        <span style={{ color: sys.color, fontWeight: "bold" }}>[{sys.value}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
