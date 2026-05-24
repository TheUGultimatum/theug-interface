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
    setDays(Math.floor((Date.now() - start) / 86400000));
  }, []);
  return <span>{days}d</span>;
}

export function Contact() {
  const { ref, inView } = useInView();
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setSent(true);
    setInput("");
    setTimeout(() => setSent(false), 3000);
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
          <div className={`panel ${inView ? "animate-fade-in-up delay-100" : "anim-hidden"}`}>
            <div className="panel-header">
              <div className="panel-controls">
                <span className="panel-dot panel-dot-red" />
                <span className="panel-dot panel-dot-yellow" />
                <span className="panel-dot panel-dot-green" />
              </div>
              <span className="panel-title">contact.sh</span>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: "16px" }}>
                <div className="terminal-line">
                  <span className="terminal-prompt" style={{ fontSize: "11px" }}>theUG@workspace:~$</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    &nbsp;open --channel=collaboration
                  </span>
                </div>
                <div className="terminal-line" style={{ marginTop: "6px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                    › Ready to receive messages.
                  </span>
                </div>
                {sent && (
                  <div className="terminal-line" style={{ marginTop: "6px" }}>
                    <span className="terminal-badge terminal-badge-success">SUCCESS</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", marginLeft: "8px", color: "var(--color-text-secondary)" }}>
                      Message sent — I&apos;ll respond within 48h.
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                background: "var(--color-abyss)",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "10px 12px",
                display: "flex", alignItems: "center", gap: "8px",
                transition: "border-color 0.2s",
              }}
                onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-glow)")}
                onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
              >
                <span className="terminal-prompt" style={{ fontSize: "11px", flexShrink: 0 }}>msg:</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                  }}
                />
                <button onClick={handleSend} aria-label="Send"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-cyan)", display: "flex", padding: "2px", flexShrink: 0,
                  }}
                >
                  <Send size={13} />
                </button>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", marginTop: "8px" }}>
                Press Enter or click Send · Responds within 48h
              </p>
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
