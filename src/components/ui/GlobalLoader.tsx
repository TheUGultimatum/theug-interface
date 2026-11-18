"use client";

import { useEffect, useState } from "react";

export function GlobalLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if session has already initialized
    try {
      if (sessionStorage.getItem("theug_init")) {
        return;
      }
    } catch {}

    setLoading(true);

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const dismiss = () => {
      try {
        sessionStorage.setItem("theug_init", "1");
      } catch {}
      setLoading(false);
    };

    if (document.readyState === "complete") {
      const t = setTimeout(dismiss, 120);
      return () => clearTimeout(t);
    } else {
      window.addEventListener("load", dismiss, { once: true });
      const safety = setTimeout(dismiss, 400);
      return () => {
        clearTimeout(safety);
        window.removeEventListener("load", dismiss);
      };
    }
  }, []);

  if (!loading) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050810] pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading ? 1 : 0 }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-1.5 border-2 border-[var(--color-amber)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-text-muted)] animate-pulse">
          INITIALIZING_WORKSPACE...
        </div>
      </div>
    </div>
  );
}
