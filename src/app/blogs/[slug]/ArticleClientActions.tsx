"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Play, Volume2, VolumeX, Maximize2, ExternalLink } from "lucide-react";

/* ─── Reading Progress Bar ───────────────────────────────────── */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-transparent z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-amber)] transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── Share Article Button with Toast ────────────────────────── */
export function ShareArticleButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
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
      className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all bg-zinc-900/80 shadow-xs cursor-pointer"
      title={`Copy link to ${title}`}
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={13} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

/* ─── Copy Code Snippet Button ───────────────────────────────── */
export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window === "undefined") return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/50 hover:bg-zinc-800"
      title="Copy code"
    >
      {copied ? (
        <>
          <Check size={11} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <span>Copy</span>
      )}
    </button>
  );
}

/* ─── Interactive Article Video Player ───────────────────────── */
export function ArticleVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  originUrl,
}: {
  videoUrl?: string;
  thumbnailUrl?: string;
  title: string;
  originUrl?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay with audio restricted, playing muted:", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => setVideoError(true));
        }
      });
    }
  }, [isPlaying]);

  if (!videoUrl && !thumbnailUrl) return null;

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-zinc-800/90 bg-[#0c0d12] relative group shadow-xl">
      {isPlaying && videoUrl && !videoError ? (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            {...({ referrerPolicy: "no-referrer" } as any)}
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain bg-black"
          />
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 hover:bg-black text-xs font-mono text-white flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all z-20 cursor-pointer"
          >
            <span>Close ✕</span>
          </button>
        </div>
      ) : (
        <div
          onClick={() => {
            if (videoUrl) {
              setIsPlaying(true);
              setVideoError(false);
            }
          }}
          className={`relative w-full aspect-video sm:max-h-[460px] bg-gradient-to-br from-zinc-900 to-black overflow-hidden flex items-center justify-center ${
            videoUrl ? "cursor-pointer group" : ""
          }`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
              Media Attachment
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

          {videoUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
                setVideoError(false);
              }}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 transform group-hover:scale-110 transition-transform cursor-pointer z-10"
              title="Play Video"
            >
              <Play className="w-7 h-7 fill-current ml-1" />
            </button>
          )}

          {originUrl && (
            <a
              href={originUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 hover:bg-black text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md border border-white/15 z-10 transition-colors"
            >
              <span>Watch on 𝕏</span>
              <ExternalLink size={12} />
            </a>
          )}

          {videoUrl && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/85 text-xs font-mono text-white flex items-center gap-2 backdrop-blur-md border border-white/10 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>▶ Play Video Broadcast</span>
            </div>
          )}
        </div>
      )}

      {videoError && (
        <div className="p-4 bg-zinc-900/90 text-center border-t border-zinc-800">
          <p className="text-xs text-zinc-400 mb-2 font-mono">
            Direct video stream restricted by origin policy.
          </p>
          {originUrl && (
            <a
              href={originUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <span>Watch on 𝕏 ↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
