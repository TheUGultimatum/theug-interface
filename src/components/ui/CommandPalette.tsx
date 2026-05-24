"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal } from "lucide-react";

interface Command {
  id: string;
  label: string;
  action: () => void;
  icon?: string;
  category: "Navigation" | "Projects" | "System";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: "home", label: "cd ~ / home", category: "Navigation", action: () => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "about", label: "cat about.md", category: "Navigation", action: () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "projects", label: "ls ./projects", category: "Navigation", action: () => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "timeline", label: "history | grep timeline", category: "Navigation", action: () => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "contact", label: "ping contact", category: "Navigation", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
    
    // Quick links to featured projects
    { id: "p-dino", label: "./run dino-run.exe", category: "Projects", action: () => { document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); } },
    { id: "p-agent", label: "./run agent-stack.exe", category: "Projects", action: () => { document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); } },
    
    // System
    { id: "sys-source", label: "git clone source-code", category: "System", action: () => window.open("https://github.com/TheUGultimatum", "_blank") },
    { id: "sys-resume", label: "curl -O resume.pdf", category: "System", action: () => alert("Resume download initiated...") },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % Math.max(filtered.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [open, filtered, selectedIndex]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
      style={{
        background: "rgba(5, 5, 5, 0.6)",
        backdropFilter: "blur(8px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div 
        className="panel w-full max-w-xl animate-fade-in-up"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px var(--color-border-bright)",
          borderRadius: "4px",
          background: "var(--color-surface)",
        }}
        onClick={e => e.stopPropagation()}
        data-cursor="text"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Terminal size={16} color="var(--color-amber)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-primary)] font-mono text-[13px] placeholder-[var(--color-text-muted)]"
          />
          <span className="font-mono text-[9px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">ESC</span>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center font-mono text-[11px] text-[var(--color-text-muted)]">
              No commands found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className="px-4 py-2 flex items-center justify-between cursor-pointer transition-colors"
                  style={{
                    background: isSelected ? "rgba(255, 94, 58, 0.08)" : "transparent",
                    borderLeft: `2px solid ${isSelected ? "var(--color-amber)" : "transparent"}`,
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => { cmd.action(); setOpen(false); }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px]" style={{ color: isSelected ? "var(--color-amber-bright)" : "var(--color-text-secondary)" }}>
                      $ {cmd.label}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[rgba(0,0,0,0.2)] flex justify-between items-center">
          <span className="font-mono text-[9px] text-[var(--color-text-muted)]">
            Use <span className="text-[var(--color-text-secondary)]">↑↓</span> to navigate, <span className="text-[var(--color-text-secondary)]">↵</span> to select
          </span>
          <span className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-widest">
            CMD.PALETTE v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
