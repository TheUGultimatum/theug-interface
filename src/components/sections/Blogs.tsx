"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
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

/* ─── Editorial Dispatch Card ─────────────────────────────────── */
function DispatchCard({ post }: { post: XPost }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-glow)] transition-all duration-300">
      <div>
        {/* Meta row: category, date, read time */}
        <div className="flex items-center justify-between gap-3 text-xs mb-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-[rgba(255,255,255,0.04)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {post.category}
            </span>
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-amber)]">
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
          <a
            href={post.url}
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
        </h3>

        {/* Summary */}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
          {post.summary}
        </p>

        {/* Takeaway Points (if provided) */}
        {post.highlights && post.highlights.length > 0 && (
          <ul className="mb-4 space-y-1.5 border-l border-[var(--color-border)] pl-3">
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
                className="font-mono text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
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
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--color-amber)] hover:underline inline-flex items-center gap-1"
          >
            <span>Read on X</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Blogs Component ───────────────────────────────────── */
export function Blogs() {
  const { ref, inView } = useInView();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["ALL", "Web3", "AI & Agents", "Build In Public", "CT Alpha"];
  const hasPosts = BLOGS_DATA.length > 0;

  const filteredPosts = useMemo(() => {
    if (!hasPosts) return [];
    return BLOGS_DATA.filter((post) => {
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
  }, [hasPosts, activeCategory, searchQuery]);

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
              Authentic essays, system architectures, and technical notes curated directly from my X feed and development log.
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

        {/* Real Profile Header Card */}
        <div
          className={`mt-8 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--color-border-glow)] flex-shrink-0 bg-black">
              <Image
                src="/images/avatar-sun.png"
                alt="TheUG"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
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
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                CONTENT CREATOR · Web3 Builder & Operator
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
                Products • Communities • Growth • Content · Joined April 2022
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--color-border)] justify-between md:justify-end">
            <div>
              <div className="font-mono font-bold text-sm text-[var(--color-text-primary)]">
                7,282
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Posts on X
              </div>
            </div>
            <div className="h-6 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-mono font-bold text-sm text-[var(--color-text-primary)]">
                1,270
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Followers
              </div>
            </div>
            <div className="h-6 w-[1px] bg-[var(--color-border)]" />
            <div>
              <div className="font-mono font-bold text-sm text-[var(--color-text-primary)]">
                2,501
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
            className={`mt-10 py-16 px-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center ${
              inView ? "animate-fade-in-up delay-200" : "anim-hidden"
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full border border-[var(--color-border)] mx-auto mb-4 flex items-center justify-center text-[var(--color-text-muted)]">
                <BookOpen size={18} />
              </div>

              <h3 className="font-sans font-bold text-lg text-[var(--color-text-primary)] mb-2">
                Dispatches are being compiled
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6">
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
                  <span>Read 7,282 posts on X ↗</span>
                </a>
                <a
                  href="https://x.com/theugultimatum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-glow)] transition-colors"
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
                      ? BLOGS_DATA.length
                      : BLOGS_DATA.filter((p) => p.category === cat).length;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`font-mono text-xs px-3 py-1.5 rounded transition-all border ${
                        isActive
                          ? "bg-[var(--color-text-primary)] text-black border-[var(--color-text-primary)] font-medium"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-glow)] hover:text-[var(--color-text-primary)]"
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
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded pl-8 pr-3 py-1.5 font-mono text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-glow)] transition-colors"
                />
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 ${
                inView ? "animate-fade-in-up delay-300" : "anim-hidden"
              }`}
            >
              {filteredPosts.map((post) => (
                <DispatchCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
