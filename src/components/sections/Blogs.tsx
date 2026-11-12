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
  Sparkles,
  BookOpen,
  MessageSquare,
  Flame,
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

/* ─── X Post Preview Card ─────────────────────────────────────── */
function XPostCard({ post, index }: { post: XPost; index: number }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryColor = (cat: XPost["category"]) => {
    switch (cat) {
      case "Web3":
        return { rgb: "0, 217, 255", text: "var(--color-cyan)" };
      case "AI & Agents":
        return { rgb: "255, 94, 58", text: "var(--color-amber)" };
      case "Build In Public":
        return { rgb: "0, 230, 118", text: "var(--color-green)" };
      case "CT Alpha":
        return { rgb: "255, 179, 0", text: "var(--color-electric)" };
      default:
        return { rgb: "0, 217, 255", text: "var(--color-cyan)" };
    }
  };

  const catColor = getCategoryColor(post.category);

  return (
    <article
      className="panel flex flex-col justify-between transition-all duration-300 relative group overflow-hidden"
      style={{
        background: "var(--color-surface)",
        borderColor: hovered
          ? `rgba(${catColor.rgb}, 0.45)`
          : post.isPinned
          ? "rgba(255, 94, 58, 0.35)"
          : "var(--color-border)",
        boxShadow: hovered ? `0 12px 32px rgba(${catColor.rgb}, 0.12)` : "none",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Banner & Window Controls */}
      <div className="panel-header flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
          </div>
          <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-wider">
            dispatch_{String(index + 1).padStart(2, "0")}.x
          </span>
        </div>

        <div className="flex items-center gap-2">
          {post.isPinned && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-semibold"
              style={{
                background: "rgba(255, 94, 58, 0.12)",
                color: "var(--color-amber)",
                border: "1px solid rgba(255, 94, 58, 0.3)",
              }}
            >
              <Pin size={10} className="fill-current" />
              PINNED ALPHA
            </span>
          )}
          <span
            className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase"
            style={{
              background: `rgba(${catColor.rgb}, 0.08)`,
              color: catColor.text,
              border: `1px solid rgba(${catColor.rgb}, 0.25)`,
            }}
          >
            {post.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Author Row (Mimicking X / Twitter Header) */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border-glow)] flex-shrink-0 bg-black">
                <Image
                  src="/images/avatar-sun.png"
                  alt="Usmaan Gani"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-[var(--color-text-primary)]">
                    Usmaan Gani
                  </span>
                  {/* Verified check badge */}
                  <svg
                    viewBox="0 0 24 24"
                    aria-label="Verified account"
                    className="w-3.5 h-3.5 text-[var(--color-cyan)] fill-current"
                  >
                    <g>
                      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"></path>
                    </g>
                  </svg>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--color-text-muted)]">
                  <span>@Usmaangani252</span>
                  <span>·</span>
                  <span>{post.publishedAt}</span>
                </div>
              </div>
            </div>

            <span className="font-mono text-[10px] text-[var(--color-text-muted)] bg-[var(--color-abyss)] px-2 py-1 rounded border border-[var(--color-border)]">
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-mono font-bold text-sm text-[var(--color-text-primary)] mb-2 tracking-tight group-hover:text-[var(--color-amber)] transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed font-sans">
            {post.summary}
          </p>

          {/* Embedded X Content Preview Block */}
          <div
            className="p-3.5 rounded mb-4 font-mono text-[11px] leading-relaxed border"
            style={{
              background: "rgba(0, 0, 0, 0.45)",
              borderColor: "var(--color-border)",
            }}
          >
            {post.content.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="mb-2 last:mb-0 text-[var(--color-text-secondary)] whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Highlights Takeaway Block */}
          {post.highlights && post.highlights.length > 0 && (
            <div className="mb-4 pt-1">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={11} className="text-[var(--color-amber)]" />
                <span>CORE TAKEAWAYS</span>
              </div>
              <ul className="space-y-1">
                {post.highlights.map((h, hIdx) => (
                  <li
                    key={hIdx}
                    className="font-mono text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2"
                  >
                    <span className="text-[var(--color-cyan)]">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="font-mono text-[10px] text-[var(--color-cyan)] opacity-85 hover:opacity-100 transition-opacity"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Metrics & CTAs */}
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
          {/* Post Metrics */}
          <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1 hover:text-[#f91880] transition-colors cursor-default" title="Likes">
              <Heart size={13} />
              <span>{post.stats.likes}</span>
            </span>
            <span className="flex items-center gap-1 hover:text-[#00ba7c] transition-colors cursor-default" title="Reposts">
              <Repeat2 size={14} />
              <span>{post.stats.reposts}</span>
            </span>
            <span className="flex items-center gap-1 hover:text-[var(--color-cyan)] transition-colors cursor-default" title="Views">
              <Eye size={13} />
              <span>{post.stats.views}</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded hover:bg-[var(--color-abyss)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors border border-transparent hover:border-[var(--color-border)]"
              title="Copy link to dispatch"
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
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-3 py-1.5 rounded transition-all tracking-wider"
              style={{
                background: "rgba(255, 94, 58, 0.12)",
                color: "var(--color-amber)",
                border: "1px solid rgba(255, 94, 58, 0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-amber)";
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 94, 58, 0.12)";
                e.currentTarget.style.color = "var(--color-amber)";
              }}
            >
              <span>VIEW ON X</span>
              <ExternalLink size={11} />
            </a>
          </div>
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

  const filteredPosts = useMemo(() => {
    return BLOGS_DATA.filter((post) => {
      const matchCategory =
        activeCategory === "ALL" || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.some((c) => c.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section
      id="blogs"
      ref={ref}
      style={{
        padding: "clamp(64px, 8vh, 120px) clamp(24px, 4vw, 56px)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${
            inView ? "animate-fade-in-up" : "anim-hidden"
          }`}
        >
          <div>
            <SectionLabel label="04 // DISPATCHES & WRITING" />
            <p className="text-system" style={{ marginTop: "4px" }}>
              LIVE THREADS & TECHNICAL NOTES · DIRECT FROM @Usmaangani252
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com/Usmaangani252"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-widest text-[var(--color-amber)] hover:text-white transition-colors flex items-center gap-2 border border-[rgba(255,94,58,0.3)] hover:border-[var(--color-amber)] px-3.5 py-1.5 rounded bg-[rgba(255,94,58,0.06)]"
            >
              {/* X Logo SVG */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>FOLLOW @Usmaangani252 ON X ↗</span>
            </a>
          </div>
        </div>

        {/* Profile Card & Bio Uplink */}
        <div
          className={`mt-8 p-6 rounded border border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${
            inView ? "animate-fade-in-up delay-100" : "anim-hidden"
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(255,94,58,0.04) 0%, var(--color-surface) 60%, rgba(0,217,255,0.03) 100%)",
          }}
        >
          {/* Subtle Cyber Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-amber)] shadow-[0_0_20px_rgba(255,94,58,0.3)] bg-black flex-shrink-0">
              <Image
                src="/images/avatar-sun.png"
                alt="Usmaan Gani - theUG"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-base text-[var(--color-text-primary)]">
                  Usmaan Gani
                </h3>
                <span className="font-mono text-xs text-[var(--color-amber)] bg-[rgba(255,94,58,0.12)] px-2 py-0.5 rounded border border-[rgba(255,94,58,0.3)]">
                  theUG_
                </span>
              </div>
              <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">
                Web3 Developer · Content Creator · CT Alpha Architect
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-xl font-sans">
                Curating real-time engineering experiments, on-chain breakdowns, and multi-agent AI blueprints. All long-form dispatches originate on X.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[var(--color-border)]">
            <div className="text-center md:text-right">
              <div className="font-mono font-bold text-lg text-[var(--color-amber)]">
                {BLOGS_DATA.length}
              </div>
              <div className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Dispatches
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[var(--color-border)] hidden md:block" />
            <div className="text-center md:text-right">
              <div className="font-mono font-bold text-lg text-[var(--color-cyan)]">
                100K+
              </div>
              <div className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">
                Impressions
              </div>
            </div>
            <div className="h-8 w-[1px] bg-[var(--color-border)] hidden md:block" />
            <a
              href="https://x.com/Usmaangani252"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-xs font-mono tracking-wider flex items-center gap-1.5"
            >
              <span>CONNECT ON X</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-8 pb-4 border-b border-[var(--color-border)] ${
            inView ? "animate-fade-in-up delay-200" : "anim-hidden"
          }`}
        >
          {/* Category Tabs */}
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
                  className={`font-mono text-xs px-3.5 py-1.5 rounded transition-all border ${
                    isActive
                      ? "bg-[var(--color-amber)] text-black border-[var(--color-amber)] font-bold shadow-[0_0_12px_rgba(255,94,58,0.3)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-glow)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {cat}{" "}
                  <span
                    className={`text-[10px] ml-1 ${
                      isActive ? "text-black/80" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] max-w-sm">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches or tags..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded pl-8 pr-3 py-1.5 font-mono text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-amber)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--color-text-muted)] hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Grid of Dispatches */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 ${
            inView ? "animate-fade-in-up delay-300" : "anim-hidden"
          }`}
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <XPostCard key={post.id} post={post} index={idx} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-[var(--color-border)] rounded">
              <BookOpen
                size={32}
                className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40"
              />
              <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                No dispatches found matching &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("ALL");
                }}
                className="mt-3 font-mono text-xs text-[var(--color-amber)] hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* CTA Footer: Suggest Topics or Follow on X */}
        <div
          className="mt-12 p-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Flame className="text-[var(--color-amber)]" size={20} />
            <div>
              <p className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                Want to suggest a technical topic or alpha deep-dive?
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                DM me directly on X or quote tweet any thread to start a discussion.
              </p>
            </div>
          </div>
          <a
            href="https://x.com/Usmaangani252"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-4 py-2 rounded border border-[var(--color-border)] hover:border-[var(--color-amber)] text-[var(--color-text-primary)] hover:text-[var(--color-amber)] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare size={13} />
            <span>DM @Usmaangani252 ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
