"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Search,
  Pin,
  Heart,
  Repeat2,
  Eye,
  Share2,
  Check,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  FileText,
  Radio,
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

function FormattedPostText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm sm:text-[15px] leading-relaxed text-zinc-200">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        const words = line.split(/(\s+)/);
        return (
          <p key={li}>
            {words.map((w, wi) => {
              if (w.startsWith("#")) {
                return (
                  <span key={wi} className="text-[#38bdf8] font-medium hover:underline">
                    {w}
                  </span>
                );
              }
              if (w.startsWith("@")) {
                return (
                  <span key={wi} className="text-[#38bdf8] font-medium hover:underline">
                    {w}
                  </span>
                );
              }
              if (w.startsWith("$")) {
                return (
                  <span key={wi} className="text-emerald-400 font-semibold">
                    {w}
                  </span>
                );
              }
              if (w.startsWith("http://") || w.startsWith("https://") || w.includes("pic.twitter.com")) {
                return (
                  <span key={wi} className="text-blue-400 underline break-all">
                    {w}
                  </span>
                );
              }
              return w;
            })}
          </p>
        );
      })}
    </div>
  );
}

function PostMediaPreview({
  post,
  liveMedia,
}: {
  post: XPost;
  liveMedia?: { type: string; mediaUrl?: string; thumbnailUrl?: string };
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (liveMedia && liveMedia.type === "video" && liveMedia.mediaUrl) {
    return (
      <div className="my-3.5 rounded-xl overflow-hidden border border-zinc-800 bg-black relative group shadow-md">
        {isPlaying ? (
          <video
            src={liveMedia.mediaUrl}
            controls
            autoPlay
            className="w-full max-h-80 object-contain rounded-xl bg-black"
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative cursor-pointer w-full h-56 sm:h-64 bg-zinc-950 overflow-hidden flex items-center justify-center group"
          >
            {liveMedia.thumbnailUrl && (
              <img
                src={liveMedia.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/75 text-[11px] font-mono text-white flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>▶ Play Video Preview</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (liveMedia && liveMedia.type === "photo" && liveMedia.mediaUrl) {
    return (
      <div className="my-3.5 rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-md">
        <img
          src={liveMedia.mediaUrl}
          alt="Post attachment"
          className="w-full max-h-80 object-cover"
        />
      </div>
    );
  }

  return null;
}

/* ─── Editorial Dispatch / Authentic Social Card ──────────────────────── */
function DispatchCard({ post, avatarSrc }: { post: XPost; avatarSrc?: string }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const [liveTweet, setLiveTweet] = useState<{
    text: string;
    author: { name: string; handle: string; avatar: string; verified: boolean };
    stats: { likes: string; rawLikes: number; views: string; reposts: string; replies: string };
    media: { type: string; mediaUrl?: string; thumbnailUrl?: string };
  } | null>(null);

  const isArticle = post.type === "article" || Boolean(post.body);
  const isLinkedIn = Boolean(post.url && post.url.includes("linkedin.com"));
  const isXPost = Boolean(post.url && (post.url.includes("x.com") || post.url.includes("twitter.com")));
  const articleHref = `/blogs/${post.slug || post.id}`;

  const isGtaIntel = Boolean(post.url && post.url.includes("GTA6Intel"));
  const authorName = liveTweet?.author.name || (isGtaIntel ? "GTA 6 Intel" : "Usmaan Gani");
  const authorHandle = liveTweet?.author.handle || (isGtaIntel ? "@GTA6Intel" : "@Usmaangani252");
  const authorAvatar = liveTweet?.author.avatar || (isGtaIntel ? "/images/avatar-sun.png" : (avatarSrc || "/images/avatar-sun.png"));
  const isVerified = liveTweet?.author.verified ?? isGtaIntel;

  useEffect(() => {
    if (!post.url || (!post.url.includes("x.com") && !post.url.includes("twitter.com"))) return;
    fetch(`/api/tweet-meta?url=${encodeURIComponent(post.url)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setLiveTweet(res.data);
        }
      })
      .catch(() => {});
  }, [post.url]);

  const displayLikes = liked ? "Liked" : (liveTweet?.stats.likes || post.stats?.likes || "42");
  const displayViews = liveTweet?.stats.views || post.stats?.views || "1.2K";
  const displayReposts = liveTweet?.stats.reposts || post.stats?.reposts || "18";

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

  if (isXPost) {
    return (
      <article className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-zinc-800/90 bg-[#101218] hover:bg-[#131520] hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-xl">
        <div>
          {/* Author Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-black shrink-0">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/avatar-sun.png";
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-bold text-sm sm:text-base text-white hover:underline cursor-pointer">
                    {authorName}
                  </span>
                  {isVerified && (
                    <svg className="w-4 h-4 text-[#38bdf8] fill-current" viewBox="0 0 24 24">
                      <path d="m8.6 22.5-1.9-3.2-3.6-.8.4-3.7L1 12l2.5-2.8-.4-3.7 3.6-.8 1.9-3.2L12 2.9l3.4-1.4 1.9 3.2 3.6.8-.4 3.7L23 12l-2.5 2.8.4 3.7-3.6.8-1.9 3.2-3.4-1.4-3.4 1.4zm4.4-6.4 5.3-5.3-1.4-1.4-3.9 3.9-1.8-1.8-1.4 1.4 3.2 3.2z"/>
                    </svg>
                  )}
                  <XIcon className="w-3 h-3 fill-zinc-500 ml-0.5" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {authorHandle}
                </span>
              </div>
            </div>

            <a
              href={`https://x.com/${authorHandle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1 rounded-full border border-zinc-700 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Follow
            </a>
          </div>

          {/* Title */}
          {isArticle && (
            <h3 className="font-bold text-base sm:text-lg text-white mb-2 leading-snug">
              <Link href={articleHref} className="hover:text-[var(--color-amber)] transition-colors inline-flex items-center gap-1.5">
                <span>{post.title}</span>
                <ArrowUpRight size={15} />
              </Link>
            </h3>
          )}

          {/* Formatted Post Text with Real Content */}
          <FormattedPostText text={liveTweet?.text || post.summary || post.body || ""} />

          {/* Real Live Media Preview (Playable Video or Photo Attachment) */}
          <PostMediaPreview post={post} liveMedia={liveTweet?.media} />

          {/* Timestamp */}
          <div className="text-xs text-zinc-500 font-mono mt-3.5 flex items-center justify-between">
            <span>{post.publishedAt} · Dispatched on 𝕏</span>
            <span className="text-zinc-500">{displayViews} views</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer"
              >
                <Heart size={14} className={liked ? "fill-pink-500 text-pink-500" : ""} />
                <span>{displayLikes}</span>
              </button>
              <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                <Repeat2 size={15} />
                <span>{displayReposts}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <Check size={13} /> Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-400 hover:text-white">
                  <Share2 size={13} /> Copy link
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-full border border-zinc-800 bg-[#161822] hover:bg-[#1e2232] text-zinc-300 hover:text-white text-xs font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <XIcon className="w-3 h-3 fill-current" />
                <span>Read on 𝕏 ↗</span>
              </a>
            )}
            {isArticle && (
              <Link
                href={articleHref}
                className="flex-1 py-2.5 rounded-full border border-cyan-800/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5"
              >
                <FileText size={13} />
                <span>Read Article ↗</span>
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col justify-between p-8 md:p-9 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-bright)] transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
      <div>
        {/* Meta row: category, format, date, read time */}
        <div className="flex items-center justify-between gap-3 text-xs mb-5 font-mono">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md text-[11px] tracking-wider uppercase font-semibold bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {post.category}
            </span>
            {isArticle ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cyan)] font-mono font-medium">
                <FileText size={13} />
                Article
              </span>
            ) : isLinkedIn ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0a66c2] font-mono font-medium">
                <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
                LinkedIn Dispatch
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-amber)] font-mono font-medium">
                <XIcon className="w-3 h-3 fill-current" />
                X Dispatch
              </span>
            )}
            {post.isPinned && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-amber)] font-mono font-medium">
                <Pin size={12} className="fill-current" />
                Featured
              </span>
            )}
          </div>
          <span className="text-[var(--color-text-muted)] text-xs">
            {post.publishedAt} · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-xl md:text-2xl text-[var(--color-text-primary)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-3.5">
          <Link
            href={articleHref}
            className="inline-flex items-center gap-2 focus:outline-none"
          >
            <span>{post.title}</span>
            <ArrowUpRight
              size={16}
              className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[var(--color-amber)]"
            />
          </Link>
        </h3>

        {/* Summary */}
        <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed mb-6 font-normal">
          {post.summary}
        </p>

        {/* Takeaway Points */}
        {post.highlights && post.highlights.length > 0 && (
          <ul className="mb-6 space-y-2 border-l-2 border-[var(--color-border-bright)] pl-4">
            {post.highlights.map((h, i) => (
              <li
                key={i}
                className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-xs px-2.5 py-1 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-5 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-5 text-xs font-mono text-[var(--color-text-muted)]">
          {post.stats?.likes && (
            <span className="flex items-center gap-1.5" title="Likes">
              <Heart size={14} />
              <span>{post.stats.likes}</span>
            </span>
          )}
          {post.stats?.reposts && (
            <span className="flex items-center gap-1.5" title="Reposts">
              <Repeat2 size={15} />
              <span>{post.stats.reposts}</span>
            </span>
          )}
          {post.stats?.views && (
            <span className="flex items-center gap-1.5" title="Views">
              <Eye size={14} />
              <span>{post.stats.views}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors cursor-pointer"
            title="Copy dispatch link"
            type="button"
          >
            {copied ? (
              <Check size={15} className="text-[var(--color-green)]" />
            ) : (
              <Share2 size={15} />
            )}
          </button>

          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors"
              title={isLinkedIn ? "View original on LinkedIn" : "View original on X"}
            >
              {isLinkedIn ? (
                <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
              ) : (
                <XIcon className="w-3 h-3 fill-current text-[var(--color-amber)]" />
              )}
            </a>
          )}

          <Link
            href={articleHref}
            className="font-mono text-xs md:text-sm font-semibold text-[var(--color-cyan)] hover:underline inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[rgba(0,240,255,0.08)] hover:bg-[rgba(0,240,255,0.15)] transition-colors"
          >
            <span>Read Dispatch</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Blogs Component ───────────────────────────────────── */
export function Blogs() {
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<XPost[]>(BLOGS_DATA);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeNetwork, setActiveNetwork] = useState<"all" | "x" | "linkedin">("all");

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
    // 1. Fetch live articles from admin store
    fetch("/api/admin/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs)) {
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
    "Web3",
    "AI & Agents",
    "Build In Public",
    "CT Alpha",
    "Engineering",
  ];
  const hasPosts = posts.length > 0;

  // Upgrade Twitter low-res avatar (_normal.jpg, 48x48) to high-res 400x400 HD photo
  const avatarSrc = useMemo(() => {
    if (!xStats.avatar_url) return "/images/avatar-sun.png";
    return xStats.avatar_url
      .replace(/_normal\.(jpg|jpeg|png|webp)/i, "_400x400.$1")
      .replace("_normal.", "_400x400.");
  }, [xStats.avatar_url]);

  const filteredPosts = useMemo(() => {
    if (!hasPosts) return [];
    return posts.filter((post) => {
      const matchCategory =
        activeCategory === "ALL" || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [hasPosts, posts, activeCategory, searchQuery]);

  return (
    <section
      id="blogs"
      ref={ref}
      style={{
        padding: "clamp(84px, 10vh, 150px) clamp(24px, 5vw, 64px)",
      }}
    >
      <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
              className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-zinc-800/80 ${
                inView ? "animate-fade-in-up" : "anim-hidden"
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                  <span>04 // DISPATCHES & ARTICLES</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <span>Top</span>
                  <span className="font-caveat text-4xl sm:text-5xl md:text-6xl text-[#38bdf8] font-semibold italic tracking-wide lowercase inline-flex items-center gap-2">
                    contents
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[var(--color-amber)] rotate-[15deg] drop-shadow-[0_0_6px_rgba(255,94,58,0.4)] transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                      <line x1="16" y1="8" x2="2" y2="22"/>
                      <line x1="17.5" y1="15" x2="9" y2="15"/>
                    </svg>
                  </span>
                </h1>
                <p className="text-sm md:text-base text-zinc-400 mt-2 font-normal max-w-xl">
                  Curated Web3 dispatches, live ecosystem updates, and technical breakdowns.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://x.com/Usmaangani252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs md:text-sm px-4 py-2 rounded-full border border-zinc-700 hover:border-zinc-500 text-white transition-all bg-zinc-900/90 shadow-sm hover:bg-zinc-800"
                >
                  <XIcon className="w-3.5 h-3.5 fill-current" />
                  <span>@Usmaangani252 ↗</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/usmaan-gani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs md:text-sm px-4 py-2 rounded-full border border-blue-900/60 hover:border-blue-600 text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all bg-zinc-900/90"
                >
                  <LinkedInIcon className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn ↗</span>
                </a>
          </div>
        </div>

        {/* Real-Time Live Profile Masthead (Dual X + LinkedIn Support) */}
        <div
          className={`p-6 sm:p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          {/* Header Bar with Network Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                Real-Time Community & Social Sync
              </span>
            </div>

            {/* Network Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] self-start sm:self-auto font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveNetwork("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeNetwork === "all"
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                ALL NETWORKS
              </button>
              <button
                type="button"
                onClick={() => setActiveNetwork("x")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeNetwork === "x"
                    ? "bg-[var(--color-surface)] text-[var(--color-amber)] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <XIcon className="w-3 h-3 fill-current" />
                <span>𝕏 TWITTER</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNetwork("linkedin")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeNetwork === "linkedin"
                    ? "bg-[var(--color-surface)] text-[#0a66c2] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <LinkedInIcon className="w-3.5 h-3.5 fill-current" />
                <span>LINKEDIN</span>
              </button>
            </div>
          </div>

          {/* Profile Identity & Metrics Content */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative w-20 h-20 md:w-22 md:h-22 rounded-2xl overflow-hidden border border-[var(--color-border-bright)] shrink-0 bg-black shadow-md">
                {/* High-resolution X / profile avatar */}
                <img
                  src={avatarSrc}
                  alt={xStats.name || "Usmaan Gani"}
                  width={88}
                  height={88}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/avatar-sun.png";
                  }}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-bold text-xl md:text-2xl text-[var(--color-text-primary)] tracking-tight">
                    Usmaan Gani
                  </h2>
                  <span className="font-mono text-xs md:text-sm text-[var(--color-text-muted)]">
                    (theUG)
                  </span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-amber)] bg-[rgba(255,94,58,0.08)] font-semibold">
                    Founder @theugultimatum
                  </span>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">
                  {activeNetwork === "linkedin"
                    ? linkedinStats.headline
                    : "CONTENT CREATOR · Web3 Builder & Operator"}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--color-text-muted)] font-mono">
                  <a
                    href="https://x.com/Usmaangani252"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-amber)] transition-colors inline-flex items-center gap-1.5"
                  >
                    <XIcon className="w-3 h-3 fill-current" />
                    <span>@Usmaangani252</span>
                  </a>
                  <span className="text-[var(--color-border-bright)]">•</span>
                  <a
                    href="https://www.linkedin.com/in/usmaan-gani/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0a66c2] transition-colors inline-flex items-center gap-1.5 text-[#0a66c2]"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
                    <span>in/usmaan-gani</span>
                  </a>
                  {isLiveSync && (
                    <>
                      <span className="text-[var(--color-border-bright)]">•</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-online)] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
                        Live X sync
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Real-Time Metrics Strip */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 md:gap-10 border-t lg:border-t-0 pt-6 lg:pt-0 border-[var(--color-border)] justify-between lg:justify-end font-mono">
              {activeNetwork === "all" ? (
                <>
                  <div>
                    <div className="font-bold text-xl md:text-2xl text-[var(--color-text-primary)]">
                      {xStats.tweets.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <XIcon className="w-2.5 h-2.5 fill-current" /> 𝕏 Posts
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)] hidden sm:block" />
                  <div>
                    <div className="font-bold text-xl md:text-2xl text-[var(--color-cyan)]">
                      {xStats.followers.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <XIcon className="w-2.5 h-2.5 fill-current" /> 𝕏 Followers
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)] hidden sm:block" />
                  <div>
                    <div className="font-bold text-xl md:text-2xl text-[#0a66c2]">
                      {linkedinStats.display_connections}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <LinkedInIcon className="w-2.5 h-2.5 fill-[#0a66c2]" /> in Connections
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)] hidden sm:block" />
                  <div>
                    <div className="font-bold text-xl md:text-2xl text-[var(--color-text-primary)]">
                      {linkedinStats.followers.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <LinkedInIcon className="w-2.5 h-2.5 fill-[#0a66c2]" /> in Followers
                    </div>
                  </div>
                </>
              ) : activeNetwork === "x" ? (
                <>
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
                      {xStats.tweets.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      Posts on 𝕏
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)]" />
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-[var(--color-cyan)]">
                      {xStats.followers.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      𝕏 Followers
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)]" />
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
                      {xStats.following.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      𝕏 Following
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-[#0a66c2]">
                      {linkedinStats.display_connections}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      Connections
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)]" />
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-[var(--color-cyan)]">
                      {linkedinStats.followers.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      Followers
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-[var(--color-border)]" />
                  <div>
                    <div className="font-bold text-2xl md:text-3xl text-emerald-400">
                      Verified
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      Public Profile
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Section: Editorial Empty State or Real Post Feed */}
        {!hasPosts ? (
          <div
            className={`mt-12 py-24 px-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center shadow-sm ${
              inView ? "animate-fade-in-up delay-200" : "anim-hidden"
            }`}
          >
            <div className="max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl border border-[var(--color-border)] mx-auto mb-5 flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-elevated)] shadow-inner">
                <BookOpen size={24} />
              </div>

              <h3 className="font-sans font-bold text-xl md:text-2xl text-[var(--color-text-primary)] mb-3">
                Dispatches are being compiled
              </h3>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8 font-normal">
                Long-form technical articles, ecosystem teardowns, and architecture breakdowns will be published here directly from Usmaan Gani.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://x.com/Usmaangani252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-mono text-xs md:text-sm px-6 py-3 rounded-xl font-medium bg-[var(--color-amber)] text-black hover:opacity-90 transition-opacity shadow-sm"
                >
                  <XIcon className="w-4 h-4 fill-current" />
                  <span>Read {xStats.tweets.toLocaleString()} posts on X ↗</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/usmaan-gani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-mono text-xs md:text-sm px-5 py-3 rounded-xl border border-[#0a66c2]/40 text-[#0a66c2] hover:text-white hover:bg-[#0a66c2]/15 transition-all bg-[var(--color-surface)]"
                >
                  <LinkedInIcon className="w-4 h-4 fill-current" />
                  <span>Connect on LinkedIn ↗</span>
                </a>
                <a
                  href="https://x.com/theugultimatum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-mono text-xs md:text-sm px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] transition-colors bg-[var(--color-surface)]"
                >
                  <span>@theugultimatum ↗</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Filter Bar & Dispatches Grid */
          <>
            <div
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-12 pb-6 border-b border-[var(--color-border)] ${
                inView ? "animate-fade-in-up delay-200" : "anim-hidden"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
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
                      className={`font-mono text-xs md:text-sm px-4 py-2 rounded-xl transition-all border ${
                        isActive
                          ? "bg-[var(--color-text-primary)] text-[var(--color-void)] border-[var(--color-text-primary)] font-semibold shadow-sm"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-bright)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {cat}{" "}
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-[280px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type keywords to filter..."
                      style={{ paddingLeft: "44px", paddingRight: "16px" }}
                      className="w-full h-11 bg-[#0c0e14] border border-zinc-800 focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)] rounded-xl font-mono text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
                    />
              </div>
            </div>

            <div
                  className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10 items-start ${
                    inView ? "animate-fade-in-up delay-300" : "anim-hidden"
                  }`}
                >
                  {filteredPosts.map((post) => (
                    <DispatchCard key={post.id || post.slug} post={post} avatarSrc={avatarSrc} />
                  ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
