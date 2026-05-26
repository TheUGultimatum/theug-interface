"use client";

import { useEffect, useState } from "react";
import {
  Home,
  User,
  FolderOpen,
  Clock,
  Mail,
  Code2,
  X,
  Link2,
  Activity,
  Flame,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "#home", label: "HOME", icon: Home },
  { href: "#about", label: "ABOUT", icon: User },
  { href: "#now", label: "NOW", icon: Activity },
  { href: "#projects", label: "PROJECTS", icon: FolderOpen },
  { href: "#labs", label: "LABS", icon: Flame },
  { href: "#timeline", label: "TIMELINE", icon: Clock },
  { href: "#contact", label: "CONTACT", icon: Mail },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/TheUGultimatum", label: "GitHub", icon: Code2 },
  { href: "https://x.com/Usmaangani252", label: "X / Twitter", icon: X },
  { href: "https://www.linkedin.com/in/usmaan-gani/", label: "LinkedIn", icon: Link2 },
];

function DesktopSidebar({ active }: { active: string }) {
  const [dayMode, setDayMode] = useState(false);

  useEffect(() => {
    const isDay = document.documentElement.classList.contains("day-mode");
    setDayMode(isDay);

    const observer = new MutationObserver(() => {
      const currentIsDay = document.documentElement.classList.contains("day-mode");
      setDayMode(currentIsDay);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextMode = !dayMode;
    setDayMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("day-mode");
    } else {
      document.documentElement.classList.remove("day-mode");
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 hidden lg:flex flex-col"
      style={{
        width: "var(--sidebar-width)",
        background: dayMode ? "rgba(252, 250, 247, 0.98)" : "rgba(8,8,7,0.98)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Brand */}
      <div
        suppressHydrationWarning
        className="flex flex-col px-6 pt-8 pb-6"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="font-mono font-bold tracking-widest"
          style={{ color: "var(--color-text-primary)", fontSize: "20px" }}
        >
          theUG
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--color-online)", flexShrink: 0 }}
          />
          <span
            className="font-mono"
            style={{ color: "var(--color-online)", fontSize: "9px", letterSpacing: "0.15em" }}
          >
            SYS / ONLINE
          </span>
        </div>
      </div>

      {/* Theme Switcher in Sidebar */}
      <div className="px-6 py-3.5 flex items-center justify-between border-b border-[var(--color-border)]">
        <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider">INTERFACE THEME</span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-amber)] transition-colors flex items-center justify-center cursor-pointer"
          style={{ color: "var(--color-text-secondary)", background: "transparent" }}
          title={dayMode ? "Switch to Night Mode" : "Switch to Day Mode"}
        >
          {dayMode ? <Sun size={13} className="text-[var(--color-amber-bright)]" /> : <Moon size={13} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4 py-6 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = active === href;
          return (
            <a
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-md transition-all duration-200 group relative",
                isActive
                  ? "bg-[rgba(0,212,255,0.08)]"
                  : "hover:bg-[rgba(255,255,255,0.03)]"
              )}
              style={{
                color: isActive
                  ? "var(--color-amber)"
                  : "var(--color-text-muted)",
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-0.5"
                  style={{ background: "var(--color-amber)" }}
                />
              )}
              <Icon
                size={16}
                className="shrink-0 transition-colors"
                style={{
                  color: isActive ? "var(--color-amber)" : "var(--color-text-muted)",
                }}
              />
              <span className="font-mono text-[11px] tracking-widest transition-colors group-hover:text-[color:var(--color-text-secondary)]">
                {label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Social + footer */}
      <div
        className="px-6 py-5"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-4 mb-3">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors duration-200"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-cyan)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-muted)")
              }
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
        <p
          className="font-mono text-[9px] leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          © 2025 theUG
          <br />
          All rights reserved
        </p>
      </div>
    </aside>
  );
}

function MobileNav({ active }: { active: string }) {
  const [dayMode, setDayMode] = useState(false);

  useEffect(() => {
    const isDay = document.documentElement.classList.contains("day-mode");
    setDayMode(isDay);

    const observer = new MutationObserver(() => {
      const currentIsDay = document.documentElement.classList.contains("day-mode");
      setDayMode(currentIsDay);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const mobileItems = [
    NAV_ITEMS[0], // Home
    NAV_ITEMS[1], // About
    NAV_ITEMS[2], // Now
    NAV_ITEMS[4], // Labs
    NAV_ITEMS[6], // Contact
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden"
      style={{
        background: dayMode ? "rgba(252, 250, 247, 0.98)" : "rgba(8,8,7,0.98)",
        borderTop: "1px solid var(--color-border)",
        height: "64px",
      }}
    >
      {mobileItems.map(({ href, label, icon: Icon }) => {
        const isActive = active === href;
        return (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200"
            style={{
              color: isActive ? "var(--color-cyan)" : "var(--color-text-muted)",
            }}
          >
            <Icon size={16} />
            <span className="font-mono text-[8px] tracking-widest">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => item.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(`#${id}`);
        },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <DesktopSidebar active={active} />
      <MobileNav active={active} />
    </>
  );
}
