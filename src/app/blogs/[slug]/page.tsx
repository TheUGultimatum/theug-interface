import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Calendar, Clock, Sparkles } from "lucide-react";
import { XPost } from "@/config/blogsData";
import { getStoredBlogs } from "@/lib/serverStore";
import { ShareArticleButton } from "./ArticleClientActions";

function XSmallIcon({ className = "w-3.5 h-3.5 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInSmallIcon({ className = "w-3.5 h-3.5 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.33a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
    </svg>
  );
}

async function getBlogPost(slug: string): Promise<XPost | null> {
  try {
    const blogs = await getStoredBlogs();
    const cleanSlug = slug.toLowerCase();
    const post = blogs.find(
      (b) => (b.slug && b.slug.toLowerCase() === cleanSlug) || b.id.toLowerCase() === cleanSlug
    );
    return post || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Article Not Found — theUG",
    };
  }

  return {
    title: `${post.title} — theUG // Usmaan Gani`,
    description: post.summary,
    openGraph: {
      title: `${post.title} — theUG`,
      description: post.summary,
      type: "article",
      url: `https://theug.in/blogs/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@Usmaangani252",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const isLinkedIn = Boolean(post.url && post.url.includes("linkedin.com"));
  const isX = Boolean(post.url && (post.url.includes("x.com") || post.url.includes("twitter.com")));

  // Render article paragraphs or split body
  const bodyParagraphs = post.body
    ? post.body.split("\n\n").filter(Boolean)
    : post.content || [];

  return (
    <article className="min-h-screen px-4 md:px-8 py-12 max-w-[860px] mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Dispatches</span>
        </Link>
        <ShareArticleButton title={post.title} />
      </div>

      {/* Meta Header */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-text-muted)] mb-4">
        <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-[var(--color-border)] bg-[rgba(255,94,58,0.08)] text-[var(--color-amber)]">
          {post.category}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          <span>{post.publishedAt}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>{post.readTime}</span>
        </span>
        {post.isPinned && (
          <>
            <span>•</span>
            <span className="text-[var(--color-amber)] font-semibold">Featured Dispatch</span>
          </>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mb-6 leading-tight font-sans">
        {post.title}
      </h1>

      {/* Origin Broadcast Banner (if originally shared on X or LinkedIn) */}
      {post.url && (
        <div className="mb-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-[var(--color-text-secondary)]">
            {isLinkedIn ? (
              <>
                <LinkedInSmallIcon className="w-4 h-4 fill-[#0a66c2]" />
                <span>Originally published on LinkedIn by <strong>Usmaan Gani</strong></span>
              </>
            ) : (
              <>
                <XSmallIcon className="w-4 h-4 fill-current text-[var(--color-amber)]" />
                <span>Originally broadcasted as an 𝕏 thread by <strong>@Usmaangani252</strong></span>
              </>
            )}
          </div>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 font-bold hover:underline ${
              isLinkedIn ? "text-[#0a66c2]" : "text-[var(--color-amber)]"
            }`}
          >
            <span>View Original Discussion ↗</span>
          </a>
        </div>
      )}

      {/* Summary Lead Callout */}
      {post.summary && (
        <div className="p-5 md:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-8 shadow-xs">
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed italic">
            &ldquo;{post.summary}&rdquo;
          </p>
        </div>
      )}

      {/* Highlights Box */}
      {post.highlights && post.highlights.length > 0 && (
        <div className="mb-10 p-5 md:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-amber)] font-bold mb-3.5">
            <Sparkles size={14} />
            <span>Key Takeaways & Core Convictions</span>
          </div>
          <ul className="space-y-2.5">
            {post.highlights.map((h, i) => (
              <li
                key={i}
                className="text-xs md:text-sm text-[var(--color-text-secondary)] flex items-start gap-2.5 leading-relaxed"
              >
                <span className="text-[var(--color-cyan)] font-mono font-bold">›</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Article Body with Rich Block Support */}
      <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed space-y-6">
        {bodyParagraphs.map((paragraph, idx) => {
          const trimmed = paragraph.trim();

          // Heading 2
          if (trimmed.startsWith("## ")) {
            return (
              <h2
                key={idx}
                className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mt-10 mb-3 pt-4 border-t border-[var(--color-border)] font-sans"
              >
                {trimmed.replace("## ", "")}
              </h2>
            );
          }

          // Heading 3
          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={idx}
                className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mt-7 mb-2 font-sans"
              >
                {trimmed.replace("### ", "")}
              </h3>
            );
          }

          // Blockquote
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-[var(--color-amber)] pl-4 py-1 italic text-[var(--color-text-primary)] bg-[rgba(255,94,58,0.04)] rounded-r-lg my-4"
              >
                {trimmed.replace(/^>\s*/gm, "")}
              </blockquote>
            );
          }

          // Code block
          if (trimmed.startsWith("```")) {
            const cleanCode = trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
            return (
              <pre
                key={idx}
                className="p-4 rounded-xl bg-black border border-[var(--color-border)] font-mono text-xs overflow-x-auto text-emerald-400 my-4"
              >
                <code>{cleanCode}</code>
              </pre>
            );
          }

          // Bullet point lists
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
            return (
              <ul key={idx} className="space-y-2 my-4 pl-2 font-sans">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs md:text-sm">
                    <span className="text-[var(--color-amber)] mt-1">•</span>
                    <span>{item.replace(/^[-*]\s+/, "")}</span>
                  </li>
                ))}
              </ul>
            );
          }

          // Standard paragraph
          return (
            <p key={idx} className="whitespace-pre-line leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t border-[var(--color-border)]">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-md font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Dossier & Multi-Network Discussion Footer */}
      <div className="mt-12 p-6 md:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[var(--color-border-bright)] flex-shrink-0 bg-black shadow-md">
            <Image
              src="/images/avatar-sun.png"
              alt="Usmaan Gani"
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[var(--color-text-primary)]">
                Usmaan Gani
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                (theUG)
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Founder @theugultimatum · Web3 Builder & AI Engineer
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[var(--color-text-muted)]">
              <a
                href="https://x.com/Usmaangani252"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-amber)] transition-colors inline-flex items-center gap-1"
              >
                <XSmallIcon className="w-3 h-3 fill-current" />
                <span>@Usmaangani252</span>
              </a>
              <span>•</span>
              <a
                href="https://www.linkedin.com/in/usmaan-gani/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0a66c2] transition-colors inline-flex items-center gap-1 text-[#0a66c2]"
              >
                <LinkedInSmallIcon className="w-3 h-3 fill-current" />
                <span>in/usmaan-gani</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-mono tracking-wider flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                isLinkedIn
                  ? "bg-[#0a66c2] text-white hover:bg-[#0a66c2]/90"
                  : "bg-[var(--color-amber)] text-black hover:opacity-90"
              }`}
            >
              <span>{isLinkedIn ? "DISCUSS ON LINKEDIN" : "DISCUSS ON X"}</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
