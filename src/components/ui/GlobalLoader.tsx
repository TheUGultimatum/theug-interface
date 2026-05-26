"use client";

import { useEffect, useState } from "react";

export function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force manual scroll restoration to block browser jump on reload
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Wait for everything to settle
    const hideLoader = () => {
      // Small delay to ensure smooth transition and fonts loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        setLoading(false);
      }, 500);
    };

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
      return () => window.removeEventListener("load", hideLoader);
    }
  }, []);

  if (!loading) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050810]"
      style={{
        transition: "opacity 0.6s ease-out, visibility 0.6s",
        opacity: loading ? 1 : 0,
        visibility: loading ? "visible" : "hidden",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Loader Animation */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-[var(--color-amber)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>
        
        {/* Loading Text */}
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-text-muted)] animate-pulse">
          INITIALIZING_WORKSPACE...
        </div>
      </div>
    </div>
  );
}
