"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, X, Link2, Mail, Send } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const SOCIAL = [
  { label: "GITHUB", handle: "@TheUGultimatum", href: "https://github.com/TheUGultimatum", icon: Code2, color: "var(--color-text-secondary)", rgb: "136,150,176" },
  { label: "X / TWITTER", handle: "@Usmaangani252", href: "https://x.com/Usmaangani252", icon: X, color: "var(--color-electric)", rgb: "68,136,255" },
  { label: "LINKEDIN", handle: "usmaan-gani", href: "https://www.linkedin.com/in/usmaan-gani/", icon: Link2, color: "var(--color-cyan)", rgb: "0,212,255" },
  { label: "EMAIL", handle: "theugultimatum@gmail.com", href: "mailto:theugultimatum@gmail.com", icon: Mail, color: "var(--color-purple)", rgb: "136,85,255" },
];

const STATUS_ITEMS = [
  { label: "SYSTEM", value: "ONLINE", live: true },
  { label: "LOCATION", value: "India · IST" },
  { label: "UPTIME", value: "4Y 0M" },
  { label: "CURRENT FOCUS", value: "AI Agents + Web3" },
];

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Uptime() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const start = new Date("2021-01-01").getTime();
    // eslint-disable-next-line
    setDays(Math.floor((Date.now() - start) / 86400000));
  }, []);
  return <span>{days}d</span>;
}

export function Contact() {
  const { ref, inView } = useInView();
  const [step, setStep] = useState<'name' | 'email' | 'message' | 'confirm' | 'sending' | 'success' | 'error'>('name');
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [inputValue, setInputValue] = useState('');
  const [honey, setHoney] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "› Initializing telemetry link...",
    "› channel: secure_uplink",
    "› ready for input transmission.",
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  // Focus input when clicking anywhere inside the terminal panel
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (inView && startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
  }, [inView]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const resetTerminal = () => {
    setStep('name');
    setFields({ name: '', email: '', message: '' });
    setInputValue('');
    setHoney('');
    setLogs([
      "› Initializing telemetry link...",
      "› channel: secure_uplink",
      "› ready for input transmission.",
    ]);
    startTimeRef.current = Date.now();
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      startUplinkSequence(fields);
    } else {
      setLogs(prev => [
        ...prev,
        "› execute uplink? (y/n): n",
        "› uplink aborted by user.",
        "› session reset required."
      ]);
      setInputValue('');
      setStep('name');
      setFields({ name: '', email: '', message: '' });
    }
  };

  const startUplinkSequence = async (finalFields: typeof fields) => {
    setStep('sending');
    setInputValue('');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    setLogs(prev => [...prev, "› establishing secure channel..."]);
    await delay(350);

    setLogs(prev => [...prev, "› encrypting payload..."]);
    await delay(350);

    setLogs(prev => [...prev, "› uplink stable..."]);
    await delay(350);

    setLogs(prev => [...prev, "› transmitting telemetry..."]);
    await delay(300);

    // Spam prevention: Check elapsed time since initial focus/load
    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
    if (elapsedSeconds < 2.0) {
      // Artificially slow down to look real, then simulate honeypot discard
      await delay(1000);
      setLogs(prev => [...prev, "› transmission complete."]);
      await delay(350);
      setStep('success');
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: finalFields.name,
          email: finalFields.email,
          message: finalFields.message,
          honey: honey
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLogs(prev => [...prev, "› transmission complete."]);
        await delay(350);
        setStep('success');
      } else {
        setLogs(prev => [
          ...prev,
          `⚠ UPLINK_ERROR: ${result.error || "Gateway rejected payload."}`
        ]);
        await delay(350);
        setStep('error');
      }
    } catch {
      setLogs(prev => [
        ...prev,
        "⚠ UPLINK_ERROR: Telemetry network timed out."
      ]);
      await delay(350);
      setStep('error');
    }
  };

  const handleSend = () => {
    const value = inputValue.trim();
    if (step === 'sending') return;

    if (step === 'success' || step === 'error') {
      const cmd = value.toLowerCase();
      if (cmd === 'reset') {
        resetTerminal();
      } else if (cmd === 'retry' && step === 'error') {
        startUplinkSequence(fields);
      } else {
        setLogs(prev => [
          ...prev,
          `theUG@workspace:~$ ${value}`,
          `⚠ COMMAND_NOT_FOUND. Available: ${step === 'error' ? "'retry', " : ""}'reset'`
        ]);
        setInputValue('');
      }
      return;
    }

    if (step === 'name') {
      if (!value) return;
      setFields(prev => ({ ...prev, name: value }));
      setLogs(prev => [
        ...prev,
        `› enter_name: ${value}`
      ]);
      setInputValue('');
      setStep('email');
    } else if (step === 'email') {
      if (!value) return;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        setLogs(prev => [
          ...prev,
          `› enter_email: ${value}`,
          "⚠ ERROR: INVALID_EMAIL_FORMAT. Please try again."
        ]);
        setInputValue('');
        return;
      }
      setFields(prev => ({ ...prev, email: value }));
      setLogs(prev => [
        ...prev,
        `› enter_email: ${value}`
      ]);
      setInputValue('');
      setStep('message');
    } else if (step === 'message') {
      if (!value) return;
      setFields(prev => ({ ...prev, message: value }));
      setLogs(prev => [
        ...prev,
        `› enter_message: ${value}`,
        "› payload_preview:",
        `  {`,
        `    name: "${fields.name}",`,
        `    email: "${fields.email}",`,
        `    message: "${value}"`,
        `  }`,
      ]);
      setInputValue('');
      setStep('confirm');
    } else if (step === 'confirm') {
      const choice = value.toLowerCase();
      if (choice === 'y' || choice === 'yes') {
        handleConfirm(true);
      } else if (choice === 'n' || choice === 'no') {
        handleConfirm(false);
      } else {
        setLogs(prev => [
          ...prev,
          `› execute uplink? (y/n): ${value}`,
          "⚠ Invalid choice. Enter 'y' to send or 'n' to abort."
        ]);
        setInputValue('');
      }
    }
  };

  const getPromptLabel = () => {
    switch (step) {
      case 'name':
        return 'enter_name:~$';
      case 'email':
        return 'enter_email:~$';
      case 'message':
        return 'enter_message:~$';
      case 'confirm':
        return 'execute_uplink? (y/n):~$';
      case 'success':
      case 'error':
        return 'theUG@workspace:~$';
      default:
        return 'theUG@workspace:~$';
    }
  };

  const getPlaceholder = () => {
    switch (step) {
      case 'name':
        return 'Type your name...';
      case 'email':
        return 'Type your email...';
      case 'message':
        return 'Type your message...';
      case 'confirm':
        return 'y / n';
      case 'success':
      case 'error':
        return "Type 'reset' or click commands below...";
      default:
        return 'Type...';
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(28px, 4vw, 56px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        <div className={inView ? "animate-fade-in-up" : "anim-hidden"}>
          <SectionLabel label="CONTACT.SH" />
          <p className="text-system" style={{ marginTop: "4px" }}>
            OPEN FOR COLLABORATION · FREELANCE · INTERESTING PROBLEMS
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(16px, 3vw, 32px)",
          marginTop: "clamp(28px, 4vh, 44px)",
        }} className="contact-grid">

          {/* Terminal contact */}
          <div
            className={`panel ${inView ? "animate-fade-in-up delay-100" : "anim-hidden"}`}
            style={{ cursor: "none" }}
            onClick={handleTerminalClick}
          >
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="panel-controls">
                  <span className="panel-dot panel-dot-red" />
                  <span className="panel-dot panel-dot-yellow" />
                  <span className="panel-dot panel-dot-green" />
                </div>
                <span className="panel-title">contact.sh</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="status-badge status-badge-live">
                <span className="status-dot animate-pulse" style={{ backgroundColor: "var(--color-online)" }} />
                <span style={{ fontSize: "8px", fontFamily: "var(--font-mono)", color: "var(--color-online-bright)", letterSpacing: "0.05em" }}>
                  resend_gateway: online
                </span>
              </div>
            </div>

            <div className="panel-body" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", minHeight: "300px" }}>
              <div>
                {/* CLI Scrollable Logs */}
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    marginBottom: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    lineHeight: "1.5"
                  }}
                  className="terminal-logs-scroll"
                >
                  {logs.map((log, index) => {
                    let color = "var(--color-text-secondary)";
                    if (log.startsWith("theUG@workspace")) {
                      color = "var(--color-text-muted)";
                    } else if (log.startsWith("›")) {
                      color = "var(--color-text-primary)";
                    } else if (log.startsWith("⚠") || log.includes("ERROR")) {
                      color = "var(--color-error)";
                    } else if (log.includes("complete") || log.includes("RECEIVED")) {
                      color = "var(--color-online-bright)";
                    }

                    return (
                      <div key={index} style={{ color, whiteSpace: "pre-wrap" }}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>

                {/* Inline Action Buttons during Confirm / Success / Error Steps */}
                {step === 'confirm' && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirm(true); }}
                      style={{
                        background: "rgba(0, 217, 255, 0.08)",
                        border: "1px solid var(--color-cyan)",
                        color: "var(--color-cyan)",
                        padding: "4px 10px",
                        borderRadius: "2px",
                        cursor: "none",
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        textTransform: "uppercase"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 217, 255, 0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 217, 255, 0.08)";
                      }}
                    >
                      [Y] Confirm Uplink
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirm(false); }}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        padding: "4px 10px",
                        borderRadius: "2px",
                        cursor: "none",
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        textTransform: "uppercase"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-amber)";
                        e.currentTarget.style.color = "var(--color-amber)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }}
                    >
                      [N] Abort
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    background: "rgba(0, 217, 255, 0.02)",
                    border: "1px solid rgba(0, 217, 255, 0.12)",
                    borderRadius: "4px"
                  }}>
                    <p style={{ color: "var(--color-online-bright)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold" }}>
                      [MESSAGE_RECEIVED]
                    </p>
                    <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: "10px", marginTop: "2px" }}>
                      response_time_estimate: &lt;48h
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); resetTerminal(); }}
                      style={{
                        background: "rgba(0, 217, 255, 0.06)",
                        border: "1px solid rgba(0, 217, 255, 0.3)",
                        color: "var(--color-online-bright)",
                        padding: "3px 8px",
                        borderRadius: "2px",
                        cursor: "none",
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        marginTop: "8px"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 217, 255, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 217, 255, 0.06)";
                      }}
                    >
                      [Reset CLI Session]
                    </button>
                  </div>
                )}

                {step === 'error' && (
                  <div style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    background: "rgba(255, 51, 51, 0.02)",
                    border: "1px solid rgba(255, 51, 51, 0.12)",
                    borderRadius: "4px"
                  }}>
                    <p style={{ color: "var(--color-error)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold" }}>
                      [TRANSMISSION_FAILED]
                    </p>
                    <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: "10px", marginTop: "2px" }}>
                      retry_required...
                    </p>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); startUplinkSequence(fields); }}
                        style={{
                          background: "rgba(255, 51, 51, 0.06)",
                          border: "1px solid rgba(255, 51, 51, 0.3)",
                          color: "var(--color-error)",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          cursor: "none",
                          fontSize: "9px",
                          fontFamily: "var(--font-mono)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 51, 51, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 51, 51, 0.06)";
                        }}
                      >
                        [Retry Uplink]
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); resetTerminal(); }}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-secondary)",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          cursor: "none",
                          fontSize: "9px",
                          fontFamily: "var(--font-mono)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-text-muted)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-border)";
                        }}
                      >
                        [Reset CLI]
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal Dynamic Input Area */}
              <div>
                {/* Honeypot Spam Prevention (Hidden to humans) */}
                <input
                  type="text"
                  name="honey"
                  value={honey}
                  onChange={(e) => setHoney(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div style={{
                  background: "var(--color-abyss)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: isFocused ? "0 0 16px var(--color-cyan-glow)" : "none",
                  borderColor: isFocused ? "var(--color-cyan)" : "var(--color-border)",
                }}>
                  <span className="terminal-prompt" style={{ fontSize: "11px", flexShrink: 0, color: step === 'confirm' ? "var(--color-warning)" : "var(--color-amber)" }}>
                    {getPromptLabel()}
                  </span>
                  
                  <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={step === 'sending'}
                      placeholder={getPlaceholder()}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        caretColor: "transparent",
                        position: "relative",
                        zIndex: 2,
                      }}
                    />
                    
                    {/* Layer to render the text and the custom blinking caretaker */}
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      pointerEvents: "none",
                      color: "transparent",
                      whiteSpace: "pre-wrap",
                      zIndex: 1,
                    }}>
                      <span>{inputValue}</span>
                      <span className="cursor-blink" style={{ display: isFocused && step !== 'sending' ? "inline-block" : "none", backgroundColor: step === 'confirm' ? "var(--color-warning)" : "var(--color-amber-bright)" }} />
                    </div>
                    {!inputValue && isFocused && step !== 'sending' && (
                      <span className="cursor-blink" style={{ position: "absolute", left: 0, pointerEvents: "none", backgroundColor: step === 'confirm' ? "var(--color-warning)" : "var(--color-amber-bright)" }} />
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSend(); }}
                    disabled={step === 'sending'}
                    aria-label="Send"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-cyan)",
                      display: "flex",
                      padding: "2px",
                      flexShrink: 0,
                      opacity: step === 'sending' ? 0.3 : 1
                    }}
                  >
                    <Send size={13} />
                  </button>
                </div>
                
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", marginTop: "8px" }}>
                  {step === 'sending' ? "Telemetry transmitting..." : "Press Enter or click Send · Responds within 48h"}
                </p>

                {/* Quick links styled like terminal commands */}
                <div style={{
                  marginTop: "16px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "12px"
                }}>
                  <span style={{ color: "var(--color-text-muted)" }}>quick_links:</span>
                  <a href="https://x.com/Usmaangani252" target="_blank" rel="noopener noreferrer" className="terminal-link">
                    [X]
                  </a>
                  <a href="https://github.com/TheUGultimatum" target="_blank" rel="noopener noreferrer" className="terminal-link">
                    [GitHub]
                  </a>
                  <a href="https://www.linkedin.com/in/usmaan-gani/" target="_blank" rel="noopener noreferrer" className="terminal-link">
                    [LinkedIn]
                  </a>
                  <a href="https://discord.gg/yourserver" target="_blank" rel="noopener noreferrer" className="terminal-link">
                    [Discord]
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className={`panel ${inView ? "animate-fade-in-up delay-200" : "anim-hidden"}`}>
            <div className="panel-header">
              <span className="panel-title">social.links</span>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {SOCIAL.map(({ label, handle, href, icon: Icon, color, rgb }) => (
                  <a key={label} href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                    suppressHydrationWarning
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "11px 14px",
                      borderRadius: "4px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-abyss)",
                      transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                    }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = color;
                        el.style.boxShadow = `0 0 20px rgba(${rgb},0.12)`;
                        el.style.background = `rgba(${rgb},0.04)`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "var(--color-border)";
                        el.style.boxShadow = "none";
                        el.style.background = "var(--color-abyss)";
                      }}
                    >
                      <Icon size={14} style={{ color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)", marginBottom: "1px" }}>{label}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{handle}</p>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className={inView ? "animate-fade-in-up delay-300" : "anim-hidden"}
          style={{
            marginTop: "clamp(40px, 5vh, 64px)",
            paddingTop: "24px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {/* Status strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--color-border)",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "20px",
          }} className="footer-grid">
            {STATUS_ITEMS.map(({ label, value, live }) => (
              <div key={label} style={{
                background: "var(--color-surface)",
                padding: "12px 16px",
              }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-muted)", marginBottom: "4px" }}>{label}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {live && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-online)", flexShrink: 0 }} className="animate-pulse" />}
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: live ? "var(--color-online)" : "var(--color-text-secondary)" }}>
                    {label === "UPTIME" ? <Uptime /> : value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--color-text-primary)", letterSpacing: "0.08em" }}>theUG</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>© 2025 · All rights reserved</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {SOCIAL.slice(0, 3).map(({ label, href, icon: Icon, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--color-text-muted)", transition: "color 0.2s" }}
                  suppressHydrationWarning
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = color)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
                  aria-label={label}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-online)" }} className="animate-pulse" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-online)", letterSpacing: "0.08em" }}>ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .terminal-link {
          color: var(--color-cyan);
          text-decoration: none;
          transition: all var(--transition-base);
        }
        .terminal-link:hover {
          color: var(--color-amber-bright);
          text-shadow: 0 0 8px var(--color-amber-glow);
        }
        .terminal-logs-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .terminal-logs-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .terminal-logs-scroll::-webkit-scrollbar-thumb {
          background: var(--color-border-bright);
          border-radius: 2px;
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
