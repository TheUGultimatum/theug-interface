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
    <article className="group relative flex flex-col justify-between p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-bright)] transition-all duration-300 shadow-sm">
      <div>
        {/* Meta row: category, format, date, read time */}
        <div className="flex items-center justify-between gap-3 text-xs mb-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {post.category}
            </span>
            {isArticle ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-cyan)] font-mono">
                <FileText size={11} />
                Article
              </span>
            ) : null}
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-amber)] font-mono">
                <Pin size={10} className="fill-current" />
                Featured
              </span>
            )}
          </div>
          <span className="text-[var(--color-text-muted)] text-[11px]">
            {post.publishedAt} · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-2">
          {isArticle ? (
            <Link
              href={articleHref}
              className="inline-flex items-center gap-1.5 focus:outline-none"
            >
              <span>{post.title}</span>
              <ArrowUpRight
                size={14}
                className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[var(--color-amber)]"
              />
            </Link>
          ) : (
            <a
              href={post.url || "https://x.com/Usmaangani252"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 focus:outline-none"
            >
              <span>{post.title}</span>
              <ArrowUpRight
                size={14}
                className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[var(--color-amber)]"
              />
            </a>
          )}
        </h3>

        {/* Summary */}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
          {post.summary}
        </p>

        {/* Takeaway Points */}
        {post.highlights && post.highlights.length > 0 && (
          <ul className="mb-4 space-y-1.5 border-l-2 border-[var(--color-border)] pl-3">
            {post.highlights.map((h, i) => (
              <li
                key={i}
                className="text-xs text-[var(--color-text-muted)] leading-relaxed"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-muted)]">
          {post.stats?.likes && (
            <span className="flex items-center gap-1.5" title="Likes">
              <Heart size={12} />
              <span>{post.stats.likes}</span>
            </span>
          )}
          {post.stats?.reposts && (
            <span className="flex items-center gap-1.5" title="Reposts">
              <Repeat2 size={13} />
              <span>{post.stats.reposts}</span>
            </span>
          )}
          {post.stats?.views && (
            <span className="flex items-center gap-1.5" title="Views">
              <Eye size={12} />
              <span>{post.stats.views}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Copy link"
            type="button"
          >
            {copied ? (
              <Check size={13} className="text-[var(--color-green)]" />
            ) : (
              <Share2 size={13} />
            )}
          </button>

          {isArticle ? (
            <Link
              href={articleHref}
              className="font-mono text-xs font-semibold text-[var(--color-amber)] hover:underline inline-flex items-center gap-1"
            >
              <span>Read Article</span>
              <ArrowUpRight size={12} />
            </Link>
          ) : (
            <a
              href={post.url || "https://x.com/Usmaangani252"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold text-[var(--color-amber)] hover:underline inline-flex items-center gap-1"
            >
              <span>View on X</span>
              <ExternalLink size={11} />
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
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 56px)",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="04 // DISPATCHES" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mt-2">
              Writing & Dispatches
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl">
              Authentic essays, system architectures, and technical notes curated directly from my development log and live X feed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com/Usmaangani252"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-[var(--color-text-primary)] transition-all bg-[var(--color-surface)]"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Follow @Usmaangani252 ↗</span>
            </a>
          </div>
        </div>

        {/* Real-Time Live Profile Header Card */}
        <div
          className={`mt-8 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--color-border-bright)] flex-shrink-0 bg-black">
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-base text-[var(--color-text-primary)]">
                  TheUG
                </h2>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  @Usmaangani252
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-amber)] bg-[rgba(255,94,58,0.06)]">
                  Founder @theugultimatum
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-sans">
                CONTENT CREATOR · Web3 Builder & Operator
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-text-muted)] font-mono">
                <span>Products • Communities • Growth • Content</span>
                {isLiveSync && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-online)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-online)] animate-pulse" />
                    Live X sync
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Metrics Strip from X API */}
          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--color-border)] justify-between md:justify-end font-mono">
            <div>
              <div className="font-bold text-sm text-[var(--color-text-primary)]">
                {xStats.tweets.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Posts on X
              </div>
            </div>
            <div className="h-6 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-bold text-sm text-[var(--color-cyan)]">
                {xStats.followers.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Followers
              </div>
            </div>
            <div className="h-6 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-bold text-sm text-[var(--color-text-primary)]">
                {xStats.following.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Following
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Editorial Empty State or Real Post Feed */}
        {!hasPosts ? (
          <div
            className={`mt-10 py-16 px-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center shadow-sm ${
              inView ? "animate-fade-in-up delay-200" : "anim-hidden"
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full border border-[var(--color-border)] mx-auto mb-4 flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-elevated)]">
                <BookOpen size={18} />
              </div>

              <h3 className="font-sans font-bold text-lg text-[var(--color-text-primary)] mb-2">
                Dispatches are being compiled
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6 font-sans">
                Long-form technical articles, ecosystem teardowns, and architecture breakdowns will be published here directly from Usmaan Gani.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://x.com/Usmaangani252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-mono text-xs px-5 py-2.5 rounded font-medium bg-[var(--color-amber)] text-black hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Read {xStats.tweets.toLocaleString()} posts on X ↗</span>
                </a>
                <a
                  href="https://x.com/theugultimatum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] transition-colors"
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
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-8 pb-4 border-b border-[var(--color-border)] ${
                inView ? "animate-fade-in-up delay-200" : "anim-hidden"
              }`}
            >
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
                      className={`font-mono text-xs px-3 py-1.5 rounded transition-all border ${
                        isActive
                          ? "bg-[var(--color-text-primary)] text-[var(--color-void)] border-[var(--color-text-primary)] font-medium"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-bright)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {cat}{" "}
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-[240px]">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dispatches..."
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded pl-8 pr-3 py-1.5 font-mono text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors"
                />
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 ${
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
