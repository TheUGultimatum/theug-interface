"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Search,
  Pin,
  Heart,
  MessageCircle,
  Share2,
  Check,
  ArrowUpRight,
  Sparkles,
  FileText,
  Send,
} from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BLOGS_DATA, XPost } from "@/config/blogsData";

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

interface XLiveStats {
  followers: number;
  following: number;
  tweets: number;
  likes?: number;
  name?: string;
  description?: string;
  avatar_url?: string;
  joined?: string;
}

interface LinkedInStats {
  name: string;
  vanity_name: string;
  headline: string;
  profile_url: string;
  followers: number;
  connections: number;
  display_connections: string;
  company: string;
  location: string;
  updatedAt: string;
}

/* ─── Platform & Verification Icons ──────────────────────────── */
function XIcon({ className = "w-4 h-4 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.33a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function VerifiedBadge({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#1d9bf0" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" />
      <path fill="#ffffff" d="M10.2 16.5l-3.7-3.7 1.4-1.4 2.3 2.3 5.9-5.9 1.4 1.4-7.3 7.3z" />
    </svg>
  );
}

/* ─── CryptoGG-Style Dynamic Social Masonry Card ─────────────── */
function SocialContentCard({ post, avatarSrc }: { post: XPost; avatarSrc: string }) {
  const [copied, setCopied] = useState(false);
  const isArticle = post.type === "article" || Boolean(post.body);
  const isTelegram = post.type === "telegram" || post.platform === "telegram";
  const isLinkedIn = post.type === "linkedin" || (post.url && post.url.includes("linkedin.com"));
  const articleHref = `/blogs/${post.slug || post.id}`;

  const destinationUrl = isArticle
    ? articleHref
    : post.url || (isLinkedIn ? "https://www.linkedin.com/in/usmaan-gani/" : "https://x.com/Usmaangani252");

  const followUrl = isTelegram
    ? "https://t.me/theugultimatum"
    : isLinkedIn
    ? "https://www.linkedin.com/in/usmaan-gani/"
    : "https://x.com/Usmaangani252";

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = isArticle
      ? `${window.location.origin}${articleHref}`
      : post.url || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article className="break-inside-avoid mb-6 rounded-2xl border border-[var(--color-border)] bg-[#0d0f17] p-5 hover:border-[var(--color-cyan)]/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group">
      <div>
        {/* Card Header: Avatar, Name, Handle, Follow Button & Platform Logo */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border-bright)] shrink-0 bg-black">
              <img
                src={avatarSrc}
                alt={isLinkedIn ? "Usmaan Gani" : "TheUG"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/avatar-sun.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                  {isLinkedIn ? "Usmaan Gani" : isTelegram ? "CryptoGG // theUG" : "TheUG"}
                </span>
                <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />
              </div>
              <div className="text-[11px] font-mono text-[var(--color-text-muted)] truncate">
                {isTelegram ? "12,450 subscribers" : isLinkedIn ? "in/usmaan-gani" : "@Usmaangani252"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={followUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
            >
              {isTelegram ? "Join" : isLinkedIn ? "Connect" : "Follow"}
            </a>

            <div className="text-[var(--color-text-muted)]">
              {isTelegram ? (
                <TelegramIcon className="w-4 h-4 fill-[#229ED9]" />
              ) : isLinkedIn ? (
                <LinkedInIcon className="w-4 h-4 fill-[#0a66c2]" />
              ) : isArticle ? (
                <FileText className="w-4 h-4 text-[var(--color-cyan)]" />
              ) : (
                <XIcon className="w-4 h-4 fill-white" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-base md:text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-cyan)] transition-colors leading-snug mb-2.5">
          {isArticle ? (
            <Link href={articleHref} className="hover:underline">
              {post.title}
            </Link>
          ) : (
            <a href={destinationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {post.title}
            </a>
          )}
        </h3>

        {/* Post Text / Summary */}
        <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line mb-4 font-normal">
          {post.summary}
        </p>

        {/* Embedded Media Banner (If present) */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-[var(--color-border)] bg-black/40 group-hover:border-[var(--color-border-bright)] transition-colors">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-cyan)]/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats Strip & Actions */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)] mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#f91880]">
              <Heart size={13} className="fill-[#f91880]" />
              <span className="font-semibold">{post.stats?.likes || "980"}</span>
            </span>
            <span className="flex items-center gap-1 text-[var(--color-cyan)]">
              <MessageCircle size={13} />
              <span className="font-semibold">{post.stats?.replies || "210"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-muted)]">{post.publishedAt}</span>
            <button
              onClick={handleShare}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer"
              title="Copy link"
              type="button"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            </button>
          </div>
        </div>

        {/* Full-Width Action Button (CryptoGG Signature style) */}
        {isArticle ? (
          <Link
            href={articleHref}
            className="w-full py-2 px-4 rounded-xl border border-[var(--color-border)] bg-[#121520] hover:bg-[var(--color-cyan)] hover:text-black hover:border-[var(--color-cyan)] font-mono text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
          >
            <span>Read Full Article ⚡</span>
            <ArrowUpRight size={13} />
          </Link>
        ) : isTelegram ? (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl border border-[var(--color-border)] bg-[#121520] hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] font-mono text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
          >
            <span>Join theUG Channel ↗</span>
            <Send size={12} />
          </a>
        ) : isLinkedIn ? (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl border border-[var(--color-border)] bg-[#121520] hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] font-mono text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
          >
            <span>Read discussion on LinkedIn ↗</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl border border-[var(--color-border)] bg-[#121520] hover:bg-white hover:text-black hover:border-white font-mono text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
          >
            <span>Read {post.stats?.replies || "291"} replies on 𝕏 ↗</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
}

/* ─── Main Blogs Component ───────────────────────────────────── */
export function Blogs() {
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<XPost[]>(BLOGS_DATA);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activePlatform, setActivePlatform] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live real-time stats from X API
  const [xStats, setXStats] = useState<XLiveStats>({
    followers: 1270,
    following: 2501,
    tweets: 7283,
  });
  const [isLiveSync, setIsLiveSync] = useState<boolean>(false);

  // Live LinkedIn profile stats
  const [linkedinStats, setLinkedinStats] = useState<LinkedInStats>({
    name: "Usmaan Gani",
    vanity_name: "usmaan-gani",
    headline: "Web3 Builder & Operator · AI Engineer · Founder @theugultimatum",
    profile_url: "https://www.linkedin.com/in/usmaan-gani/",
    followers: 850,
    connections: 500,
    display_connections: "500+",
    company: "theUG Ultimatum",
    location: "Jharkhand, India",
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    // 1. Fetch live articles from admin store (fallback to BLOGS_DATA if empty)
    fetch("/api/admin/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
          setPosts(data.blogs);
        }
      })
      .catch(() => {});

    // 2. Fetch live real-time X stats from FixTweet API route
    fetch("/api/x-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setXStats({
            followers: data.stats.followers,
            following: data.stats.following,
            tweets: data.stats.tweets,
            likes: data.stats.likes,
            name: data.stats.name,
            description: data.stats.description,
            avatar_url: data.stats.avatar_url,
            joined: data.stats.joined,
          });
          setIsLiveSync(true);
        }
      })
      .catch(() => {});

    // 3. Fetch LinkedIn stats
    fetch("/api/linkedin-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setLinkedinStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    "ALL",
    "CT Alpha",
    "Web3",
    "AI & Agents",
    "Build In Public",
    "Engineering",
  ];

  const platforms = [
    { key: "ALL", label: "All Platforms" },
    { key: "x", label: "𝕏 Twitter" },
    { key: "telegram", label: "Telegram" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "article", label: "Articles" },
  ];

  // High-res avatar source
  const avatarSrc = useMemo(() => {
    if (!xStats.avatar_url) return "/images/avatar-sun.png";
    return xStats.avatar_url
      .replace(/_normal\.(jpg|jpeg|png|webp)/i, "_400x400.$1")
      .replace("_normal.", "_400x400.");
  }, [xStats.avatar_url]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory =
        activeCategory === "ALL" || post.category === activeCategory;
      const matchPlatform =
        activePlatform === "ALL" ||
        (activePlatform === "x" && (post.platform === "x" || post.type === "x-post" || (!post.platform && !post.body))) ||
        (activePlatform === "telegram" && (post.platform === "telegram" || post.type === "telegram")) ||
        (activePlatform === "linkedin" && (post.platform === "linkedin" || post.type === "linkedin" || post.url?.includes("linkedin.com"))) ||
        (activePlatform === "article" && (post.platform === "article" || post.type === "article" || Boolean(post.body)));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));

      return matchCategory && matchPlatform && matchSearch;
    });
  }, [posts, activeCategory, activePlatform, searchQuery]);

  return (
    <section
      id="blogs"
      ref={ref}
      style={{
        padding: "clamp(84px, 10vh, 150px) clamp(24px, 5vw, 64px)",
      }}
    >
      <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
        {/* Section Header (CryptoGG Inspired "Top contents" Style) */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 mb-8 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="04 // DISPATCHES" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mt-3">
              Top <span className="font-serif italic font-normal text-[var(--color-cyan)] tracking-normal">contents</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--color-text-secondary)] max-w-2xl mt-2 leading-relaxed">
              Curated Web3 dispatches, verified on-chain proofs, automated validator nodes, and deep engineering guides.
            </p>
          </div>

          {/* Dynamic Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const count =
                cat === "ALL"
                  ? posts.length
                  : posts.filter((p) => p.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-mono text-xs px-4 py-2 rounded-full transition-all cursor-pointer font-medium ${
                    isActive
                      ? "bg-[#0088cc] text-white shadow-lg shadow-[#0088cc]/30 border border-[#0088cc] font-semibold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] hover:text-white"
                  }`}
                >
                  {cat === "ALL" ? `All ${count}` : `${cat} ${count}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform Tabs & Live Search Bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {platforms.map((p) => {
              const count =
                p.key === "ALL"
                  ? posts.length
                  : posts.filter((item) => {
                      if (p.key === "x") return item.platform === "x" || item.type === "x-post" || (!item.platform && !item.body);
                      if (p.key === "telegram") return item.platform === "telegram" || item.type === "telegram";
                      if (p.key === "linkedin") return item.platform === "linkedin" || item.type === "linkedin" || item.url?.includes("linkedin.com");
                      if (p.key === "article") return item.platform === "article" || item.type === "article" || Boolean(item.body);
                      return false;
                    }).length;
              const isSelected = activePlatform === p.key;

              return (
                <button
                  key={p.key}
                  onClick={() => setActivePlatform(p.key)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-elevated)] border-[var(--color-cyan)] text-[var(--color-cyan)] font-bold shadow-xs"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {p.label} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[260px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search top contents..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 font-mono text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Multi-Column Masonry Grid */}
        <div
          className={`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 ${
            inView ? "animate-fade-in-up delay-200" : "anim-hidden"
          }`}
        >
          {filteredPosts.map((post) => (
            <SocialContentCard key={post.id || post.slug} post={post} avatarSrc={avatarSrc} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              No contents found matching &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
