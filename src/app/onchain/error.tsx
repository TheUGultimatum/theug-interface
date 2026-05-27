"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Onchain Visualization Error:", error);
  }, [error]);

  return (
    <section className="relative w-full h-[850px] bg-[var(--color-void)] flex flex-col items-center justify-center border-t border-b border-[var(--color-border)]">
      <p className="font-mono text-sm text-[var(--color-error)] mb-4 tracking-widest uppercase">
        SYSTEM_FAILURE // VISUALIZATION_OFFLINE
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 border border-[var(--color-border)] hover:border-[var(--color-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-cyan)] font-mono text-xs transition-colors rounded-sm"
      >
        REBOOT_SYSTEM
      </button>
    </section>
  );
}
