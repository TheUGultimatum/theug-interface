"use client";

import dynamic from "next/dynamic";

export const OnchainObservatoryClient = dynamic(
  () => import("./OnchainObservatory").then((m) => m.OnchainObservatory),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px] w-full font-mono text-xs text-[var(--color-cyan)]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] animate-ping mr-3" />
        INITIALIZING CELESTIAL OBSERVATORY // 120 FPS ENGINE...
      </div>
    ),
  }
);
