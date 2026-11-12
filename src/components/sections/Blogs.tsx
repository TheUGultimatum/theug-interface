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

/* ─── Editorial Dispatch / Article Card ──────────────────────── */
function DispatchCard({ post }: { post: XPost }) {
  const [copied, setCopied] = useState(false);
  const isArticle = post.type === "article" || Boolean(post.body);
  const articleHref = `/blogs/${post.slug || post.id}`;

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
            ) : null}
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
          {isArticle ? (
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
          ) : (
            <a
              href={post.url || "https://x.com/Usmaangani252"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 focus:outline-none"
            >
              <span>{post.title}</span>
              <ArrowUpRight
                size={16}
                className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[var(--color-amber)]"
              />
            </a>
          )}
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors"
            title="Copy link"
            type="button"
          >
            {copied ? (
              <Check size={15} className="text-[var(--color-green)]" />
            ) : (
              <Share2 size={15} />
            )}
          </button>

          {isArticle ? (
            <Link
              href={articleHref}
              className="font-mono text-xs md:text-sm font-semibold text-[var(--color-amber)] hover:underline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,94,58,0.08)] hover:bg-[rgba(255,94,58,0.15)] transition-colors"
            >
              <span>Read Article</span>
              <ArrowUpRight size={14} />
            </Link>
          ) : (
            <a
              href={post.url || "https://x.com/Usmaangani252"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs md:text-sm font-semibold text-[var(--color-amber)] hover:underline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,94,58,0.08)] hover:bg-[rgba(255,94,58,0.15)] transition-colors"
            >
              <span>View on X</span>
              <ExternalLink size={13} />
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
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="04 // DISPATCHES" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mt-3 mb-3">
              Writing & Dispatches
            </h1>
            <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Authentic essays, system architectures, and technical notes curated directly from my development log and live X feed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com/Usmaangani252"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-mono text-xs md:text-sm px-4 py-2.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-primary)] transition-all bg-[var(--color-surface)] shadow-sm hover:shadow"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Follow @Usmaangani252 ↗</span>
            </a>
          </div>
        </div>

        {/* Real-Time Live Profile Masthead */}
        <div
          className={`p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative w-20 h-20 md:w-22 md:h-22 rounded-2xl overflow-hidden border border-[var(--color-border-bright)] shrink-0 bg-black shadow-md">
              {/* Fallback to avatar-sun, dynamically upgrades to live X avatar photo when synced */}
              <img
                src={xStats.avatar_url || "/images/avatar-sun.png"}
                alt="TheUG"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/avatar-sun.png";
                }}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-bold text-xl md:text-2xl text-[var(--color-text-primary)] tracking-tight">
                  TheUG
                </h2>
                <span className="font-mono text-xs md:text-sm text-[var(--color-text-muted)]">
                  @Usmaangani252
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-amber)] bg-[rgba(255,94,58,0.08)] font-semibold">
                  Founder @theugultimatum
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">
                CONTENT CREATOR · Web3 Builder & Operator
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--color-text-muted)] font-mono">
                <span>Products • Communities • Growth • Content</span>
                <span className="text-[var(--color-border-bright)]">•</span>
                <span>Building & shipping across ecosystems</span>
                {isLiveSync && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-online)] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-online)] animate-pulse" />
                    Live X sync
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Metrics Strip from X API */}
          <div className="flex items-center gap-8 md:gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-[var(--color-border)] justify-between lg:justify-end font-mono">
            <div>
              <div className="font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
                {xStats.tweets.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                Posts on X
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-bold text-2xl md:text-3xl text-[var(--color-cyan)]">
                {xStats.followers.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                Followers
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
                {xStats.following.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                Following
              </div>
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
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Read {xStats.tweets.toLocaleString()} posts on X ↗</span>
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
                  placeholder="Filter dispatches..."
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs md:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-inner"
                />
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 ${
                inView ? "animate-fade-in-up delay-300" : "anim-hidden"
              }`}
            >
              {filteredPosts.map((post) => (
                <DispatchCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
