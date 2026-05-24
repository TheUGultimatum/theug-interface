"use client";

import { useEffect, useState } from "react";

function LiveClock({ align = "right" }: { align?: "left" | "right" }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ textAlign: align }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--color-text-primary)", lineHeight: 1, letterSpacing: "0.06em" }}>{time}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", marginTop: "3px", letterSpacing: "0.09em" }}>{date} · IST+5:30</p>
    </div>
  );
}

export function TopBar() {
  return (
    <header
      className="fixed top-0 right-0 z-40 flex flex-col md:flex-row md:items-center topbar-responsive"
      style={{
        left: "var(--sidebar-width)",
        background: "rgba(5, 5, 5, 0.92)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(20px)",
        padding: "0 clamp(20px, 3vw, 40px)",
        gap: "0",
      }}
    >
      {/* Top Row / Left side */}
      <div className="flex items-center justify-between w-full md:w-auto" style={{ height: "52px", gap: "16px", flex: 1, minWidth: 0 }}>
        {/* Left — breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-amber)", flexShrink: 0, letterSpacing: "0.04em" }}>
            theUG@workspace:~$
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>
            independent builder · ai engineer · web3
          </span>
        </div>

        {/* Center — process indicators (hidden on mobile) */}
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {["AGENT:RUNNING", "DEPLOY:OK", "BUILD:PASS"].map((item) => (
            <span key={item} style={{
              fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.09em",
              color: "var(--color-text-muted)",
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right side / Bottom Row on mobile */}
      <div className="flex md:hidden items-center justify-between w-full" style={{ height: "42px", borderTop: "1px solid var(--color-border)" }}>
        <LiveClock align="left" />
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-online)", animation: "pulse-dot 2.4s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--color-online)", letterSpacing: "0.1em" }}>SYS.ONLINE</span>
        </div>
      </div>
      
      {/* Right side on Desktop */}
      <div className="hidden md:flex items-center gap-5 shrink-0" style={{ height: "52px" }}>
        <LiveClock />
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          paddingLeft: "16px", borderLeft: "1px solid var(--color-border)", height: "24px"
        }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-online)", animation: "pulse-dot 2.4s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--color-online)", letterSpacing: "0.1em" }}>SYS.ONLINE</span>
        </div>
      </div>

      <style>{`
        .topbar-responsive { min-height: 52px; }
        @media (max-width: 768px) {
          .topbar-responsive { left: 0 !important; }
        }
      `}</style>
    </header>
  );
}
