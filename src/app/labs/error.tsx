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
    console.error("Labs Error:", error);
  }, [error]);

  return (
    <section className="relative w-full min-h-[600px] bg-[var(--color-void)] flex flex-col items-center justify-center border-t border-[var(--color-border)]">
      <p className="font-mono text-sm text-[var(--color-error)] mb-4 tracking-widest uppercase">
        LABS_CRITICAL_FAILURE // EXPERIMENT_TERMINATED
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 border border-[var(--color-border)] hover:border-[var(--color-amber)] text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] font-mono text-xs transition-colors rounded-sm"
      >
        RESTART_EXPERIMENT
      </button>
    </section>
  );
}
