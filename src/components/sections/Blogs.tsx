"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  FileText,
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

/* ─── Spacious Editorial Dispatch Card ───────────────────────── */
function DispatchCard({ post }: { post: XPost }) {
  const [copied, setCopied] = useState(false);
  const isArticle = post.type === "article" || Boolean(post.body);
  const isLinkedIn = Boolean(post.url && post.url.includes("linkedin.com"));
  const articleHref = `/blogs/${post.slug || post.id}`;

  const destinationUrl = isArticle
    ? articleHref
    : post.url || (isLinkedIn ? "https://www.linkedin.com/in/usmaan-gani/" : "https://x.com/Usmaangani252");

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
    <article className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-bright)] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div>
        {/* Meta Row: Category, Format & Published Date */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono mb-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md text-xs tracking-wider uppercase font-bold bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {post.category}
            </span>
            {isArticle ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cyan)] font-medium">
                <FileText size={14} />
                Article
              </span>
            ) : isLinkedIn ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0a66c2] font-medium">
                <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
                LinkedIn
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-amber)] font-medium">
                <XIcon className="w-3 h-3 fill-current" />
                Dispatch
              </span>
            )}
            {post.isPinned && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-amber)] font-medium">
                <Pin size={12} className="fill-current" />
                Featured
              </span>
            )}
          </div>
          <span className="text-[var(--color-text-muted)]">
            {post.publishedAt} · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-2xl sm:text-3xl text-[var(--color-text-primary)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-4 tracking-tight">
          <Link href={articleHref} className="inline-flex items-center gap-2 focus:outline-none">
            <span>{post.title}</span>
            <ArrowUpRight
              size={18}
              className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[var(--color-amber)] shrink-0"
            />
          </Link>
        </h3>

        {/* Summary Description */}
        <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8 font-normal">
          {post.summary}
        </p>

        {/* Key Takeaways */}
        {post.highlights && post.highlights.length > 0 && (
          <ul className="mb-8 space-y-3 border-l-2 border-[var(--color-border-bright)] pl-5">
            {post.highlights.map((h, i) => (
              <li key={i} className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-6 text-sm font-mono text-[var(--color-text-muted)]">
          {post.stats?.likes && (
            <span className="flex items-center gap-2" title="Likes">
              <Heart size={16} />
              <span>{post.stats.likes}</span>
            </span>
          )}
          {post.stats?.reposts && (
            <span className="flex items-center gap-2" title="Reposts">
              <Repeat2 size={16} />
              <span>{post.stats.reposts}</span>
            </span>
          )}
          {post.stats?.views && (
            <span className="flex items-center gap-2" title="Views">
              <Eye size={16} />
              <span>{post.stats.views}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors cursor-pointer"
            title="Copy link"
            type="button"
          >
            {copied ? (
              <Check size={16} className="text-[var(--color-green)]" />
            ) : (
              <Share2 size={16} />
            )}
          </button>

          {isArticle ? (
            <Link
              href={articleHref}
              className="font-mono text-xs sm:text-sm font-semibold text-[var(--color-cyan)] hover:underline inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(0,240,255,0.08)] hover:bg-[rgba(0,240,255,0.16)] transition-colors"
            >
              <span>Read Article</span>
              <ArrowUpRight size={15} />
            </Link>
          ) : isLinkedIn ? (
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs sm:text-sm font-semibold text-[#0a66c2] hover:underline inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(10,102,194,0.1)] hover:bg-[rgba(10,102,194,0.18)] transition-colors"
            >
              <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
              <span>View on LinkedIn</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs sm:text-sm font-semibold text-[var(--color-amber)] hover:underline inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(255,94,58,0.08)] hover:bg-[rgba(255,94,58,0.16)] transition-colors"
            >
              <XIcon className="w-3.5 h-3.5 fill-current" />
              <span>View on 𝕏</span>
              <ExternalLink size={14} />
            </a>
          )}
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
    "Web3",
    "AI & Agents",
    "Build In Public",
    "CT Alpha",
    "Engineering",
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
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  return (
    <section
      id="blogs"
      ref={ref}
      style={{
        padding: "clamp(96px, 12vh, 180px) clamp(20px, 5vw, 64px)",
      }}
    >
      <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="04 // DISPATCHES" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] mt-4 mb-4">
              Writing & Dispatches
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Authentic essays, system architectures, and technical notes curated directly from my development log, live 𝕏 feed, and LinkedIn network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://x.com/Usmaangani252"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-mono text-sm px-5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-amber)] text-[var(--color-text-primary)] transition-all bg-[var(--color-surface)] shadow-sm hover:shadow"
            >
              <XIcon className="w-4 h-4 fill-current text-[var(--color-amber)]" />
              <span>Follow @Usmaangani252 ↗</span>
            </a>
            <a
              href="https://www.linkedin.com/in/usmaan-gani/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-mono text-sm px-5 py-3 rounded-xl border border-[#0a66c2]/40 hover:border-[#0a66c2] text-[#0a66c2] hover:text-white hover:bg-[#0a66c2]/15 transition-all bg-[var(--color-surface)] shadow-sm hover:shadow"
            >
              <LinkedInIcon className="w-4 h-4 fill-current" />
              <span>Connect on LinkedIn ↗</span>
            </a>
          </div>
        </div>

        {/* Minimalist Floating Telemetry Bar */}
        <div
          className={`my-12 md:my-16 p-8 sm:p-10 md:p-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[var(--color-border-bright)] shrink-0 bg-black shadow-md">
                <img
                  src={avatarSrc}
                  alt={xStats.name || "Usmaan Gani"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/avatar-sun.png";
                  }}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-bold text-xl sm:text-2xl text-[var(--color-text-primary)] tracking-tight">
                    Usmaan Gani
                  </h2>
                  <span className="font-mono text-sm text-[var(--color-text-muted)]">
                    (theUG)
                  </span>
                  <span className="font-mono text-xs px-3 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-amber)] bg-[rgba(255,94,58,0.08)] font-semibold">
                    Founder @theugultimatum
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 font-medium">
                  CONTENT CREATOR · Web3 Builder & Operator
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
                  <span className="text-xs font-mono text-[var(--color-online)] font-medium">
                    Live Verified Sync
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-[var(--color-border)] font-mono">
              <div>
                <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--color-text-primary)]">
                  {xStats.tweets.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                  <XIcon className="w-3 h-3 fill-current" /> 𝕏 Posts
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--color-cyan)]">
                  {xStats.followers.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                  <XIcon className="w-3 h-3 fill-current" /> 𝕏 Followers
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-[#0a66c2]">
                  {linkedinStats.display_connections}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                  <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" /> Connections
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--color-text-primary)]">
                  {linkedinStats.followers.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                  <LinkedInIcon className="w-3.5 h-3.5 fill-[#0a66c2]" /> in Followers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 md:mb-16 pb-6 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up delay-200" : "anim-hidden"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
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
                  className={`font-mono text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all border cursor-pointer ${
                    isActive
                      ? "bg-[var(--color-text-primary)] text-[var(--color-void)] border-[var(--color-text-primary)] font-bold shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-bright)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {cat}{" "}
                  <span className="opacity-70 font-normal">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[280px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-11 pr-5 py-3 font-mono text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Spacious Editorial Dispatches Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 ${
            inView ? "animate-fade-in-up delay-300" : "anim-hidden"
          }`}
        >
          {filteredPosts.map((post) => (
            <DispatchCard key={post.id || post.slug} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="py-24 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="font-mono text-sm text-[var(--color-text-muted)]">
              No dispatches found matching &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
