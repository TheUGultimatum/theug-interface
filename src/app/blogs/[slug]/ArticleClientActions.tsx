"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareArticleButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      className="inline-flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] transition-all bg-[var(--color-surface)] shadow-xs cursor-pointer"
      title={`Copy link to ${title}`}
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Copied URL!</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          <span>Share Dispatch</span>
        </>
      )}
    </button>
  );
}
