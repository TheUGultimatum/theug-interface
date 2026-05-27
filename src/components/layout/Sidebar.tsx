"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  FolderOpen,
  Clock,
  Mail,
  Code2,
  X,
  Link2,
  Flame,
  Sun,
  Moon,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/about", label: "ABOUT", icon: User },
  { href: "/projects", label: "PROJECTS", icon: FolderOpen },
  { href: "/onchain", label: "ONCHAIN", icon: Network },
  { href: "/labs", label: "LABS", icon: Flame },
  { href: "/timeline", label: "TIMELINE", icon: Clock },
  { href: "/contact", label: "CONTACT", icon: Mail },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/TheUGultimatum", label: "GitHub", icon: Code2 },
  { href: "https://x.com/Usmaangani252", label: "X / Twitter", icon: X },
  { href: "https://www.linkedin.com/in/usmaan-gani/", label: "LinkedIn", icon: Link2 },
];

function DesktopSidebar() {
  const pathname = usePathname();
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
        className="flex flex-col px-7 pt-9 pb-7"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="font-mono font-bold tracking-widest"
          style={{ color: "var(--color-text-primary)", fontSize: "22px" }}
        >
          theUG
        </span>
        <div className="flex items-center gap-2 mt-2">
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
      <div className="px-7 py-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider">INTERFACE THEME</span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-amber)] transition-colors flex items-center justify-center cursor-pointer"
          style={{ color: "var(--color-text-secondary)", background: "transparent" }}
          title={dayMode ? "Switch to Night Mode" : "Switch to Day Mode"}
        >
          {dayMode ? <Sun size={14} className="text-[var(--color-amber-bright)]" /> : <Moon size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-5 py-8 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-transparent"
                  : "hover:bg-[rgba(255,255,255,0.02)]"
              )}
              style={{
                color: isActive
                  ? "var(--color-amber)"
                  : "var(--color-text-muted)",
                background: isActive ? "linear-gradient(90deg, rgba(0,212,255,0.06) 0%, rgba(255,150,50,0.01) 100%)" : "transparent"
              }}
            >
              <span
                className={cn(
                  "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md transition-all duration-300",
                  isActive ? "bg-[var(--color-amber)] opacity-100 scale-y-100 shadow-[0_0_8px_var(--color-amber)]" : "bg-transparent opacity-0 scale-y-0"
                )}
              />
              
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-all duration-300 group-hover:translate-x-[2px]",
                  isActive ? "drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" : "group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                )}
                style={{
                  color: isActive ? "var(--color-amber)" : "var(--color-text-muted)",
                }}
              />
              <span className="font-mono text-[11px] tracking-widest font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Socials */}
      <div className="px-7 pb-8 pt-4">
        <div className="flex gap-4 mb-6">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors hover:-translate-y-0.5 transform duration-200"
              style={{ color: "var(--color-text-muted)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-amber)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
        <p
          className="font-mono text-[10px] leading-relaxed tracking-wider opacity-60"
          style={{ color: "var(--color-text-muted)" }}
        >
          © {new Date().getFullYear()} theUG
          <br />
          All rights reserved
        </p>
      </div>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
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
    NAV_ITEMS[3], // Onchain
    NAV_ITEMS[4], // Labs
    NAV_ITEMS[6], // Contact
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center px-2"
      style={{
        background: dayMode ? "rgba(252, 250, 247, 0.98)" : "rgba(8,8,7,0.98)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
      }}
    >
      <div className="flex items-center justify-around w-full h-[64px]">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="relative flex flex-col items-center justify-center w-[48px] h-[48px] group transition-all duration-300"
            >
              <span
                className={cn(
                  "absolute -top-1 w-8 h-[2px] rounded-full transition-all duration-300",
                  isActive ? "bg-[var(--color-amber)] scale-x-100 shadow-[0_0_8px_var(--color-amber)]" : "bg-transparent scale-x-0"
                )}
              />
              <Icon
                size={20}
                className={cn(
                  "mb-1 transition-all duration-300",
                  isActive ? "drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" : ""
                )}
                style={{
                  color: isActive ? "var(--color-amber)" : "var(--color-text-muted)",
                }}
              />
              <span
                className="font-mono tracking-widest transition-colors duration-300"
                style={{
                  fontSize: "8px",
                  color: isActive ? "var(--color-amber)" : "var(--color-text-muted)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
}
