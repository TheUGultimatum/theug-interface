import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Calendar, Clock, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { XPost } from "@/config/blogsData";
import { getStoredBlogs } from "@/lib/serverStore";
import {
  ShareArticleButton,
  ReadingProgressBar,
  CopyCodeButton,
  ArticleVideoPlayer,
} from "./ArticleClientActions";

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

async function getTweetMedia(tweetUrl?: string) {
  if (!tweetUrl || (!tweetUrl.includes("x.com") && !tweetUrl.includes("twitter.com"))) return null;
  try {
    const match = tweetUrl.match(/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
    if (!match) return null;
    const [, screenName, statusId] = match;
    const res = await fetch(`https://api.fxtwitter.com/${screenName}/status/${statusId}`, {
      headers: { "User-Agent": "theUG-Portfolio/2.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tweet = data?.tweet;
    if (!tweet) return null;

    let mediaType: "video" | "photo" | "none" = "none";
    let mediaUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    if (tweet.media?.videos && tweet.media.videos.length > 0) {
      mediaType = "video";
      mediaUrl = tweet.media.videos[0].url;
      thumbnailUrl = tweet.media.videos[0].thumbnail_url;
    } else if (tweet.media?.photos && tweet.media.photos.length > 0) {
      mediaType = "photo";
      mediaUrl = tweet.media.photos[0].url;
      thumbnailUrl = tweet.media.photos[0].url;
    } else if (tweet.media?.all && tweet.media.all.length > 0) {
      const first = tweet.media.all[0];
      mediaType = first.type === "video" ? "video" : "photo";
      mediaUrl = first.url;
      thumbnailUrl = first.thumbnail_url || first.url;
    }

    return { mediaType, mediaUrl, thumbnailUrl, text: tweet.text };
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

  // Fetch tweet media if available
  const tweetMedia = await getTweetMedia(post.url);

  // Render article paragraphs or split body
  const bodyParagraphs = post.body
    ? post.body.split("\n\n").filter(Boolean)
    : post.content || [];

  return (
    <>
      <ReadingProgressBar />

      <article className="min-h-screen px-4 sm:px-6 md:px-8 py-8 sm:py-12 max-w-[720px] mx-auto text-[#dedede]">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-[var(--color-amber)] transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Dispatches</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{post.category}</span>
          </Link>
          <ShareArticleButton title={post.title} />
        </div>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-zinc-400 mb-4">
          <span className="px-2.5 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider border border-[var(--color-border)] bg-[rgba(255,94,58,0.08)] text-[var(--color-amber)]">
            {post.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-zinc-500" />
            <span>{post.publishedAt}</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-zinc-500" />
            <span>{post.readTime}</span>
          </span>
          {post.isPinned && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-[var(--color-amber)] font-semibold flex items-center gap-1">
                <Sparkles size={11} /> Featured
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 leading-tight font-sans">
          {post.title}
        </h1>

        {/* Lead Summary */}
        {post.summary && (
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8 pb-6 border-b border-zinc-800/80 italic">
            &ldquo;{post.summary}&rdquo;
          </p>
        )}

        {/* Origin Broadcast Reference */}
        {post.url && (
          <div className="mb-8 p-3.5 sm:p-4 rounded-xl border border-zinc-800 bg-[#0e1017] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              {isLinkedIn ? (
                <>
                  <LinkedInSmallIcon className="w-4 h-4 fill-[#0a66c2] shrink-0" />
                  <span>Published on LinkedIn by <strong className="text-white">Usmaan Gani</strong></span>
                </>
              ) : (
                <>
                  <XSmallIcon className="w-4 h-4 fill-current text-[var(--color-amber)] shrink-0" />
                  <span>Broadcasted on 𝕏 by <strong className="text-white">@Usmaangani252</strong></span>
                </>
              )}
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 font-bold hover:underline self-start sm:self-auto ${
                isLinkedIn ? "text-[#0a66c2]" : "text-[var(--color-amber)]"
              }`}
            >
              <span>View Discussion</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Live Video Player or Photo Preview if attached */}
        {tweetMedia && tweetMedia.mediaType === "video" && (
          <ArticleVideoPlayer
            videoUrl={tweetMedia.mediaUrl}
            thumbnailUrl={tweetMedia.thumbnailUrl}
            title={post.title}
            originUrl={post.url}
          />
        )}

        {tweetMedia && tweetMedia.mediaType === "photo" && tweetMedia.mediaUrl && (
          <div className="my-8 rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-lg">
            <img
              src={tweetMedia.mediaUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Key Highlights */}
        {post.highlights && post.highlights.length > 0 && (
          <div className="my-8 p-5 rounded-2xl border border-zinc-800/90 bg-[#10121a]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-amber)] font-bold mb-3">
              <Sparkles size={13} />
              <span>Key Takeaways & Core Convictions</span>
            </div>
            <ul className="space-y-2">
              {post.highlights.map((h, i) => (
                <li
                  key={i}
                  className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="text-[var(--color-cyan)] font-mono font-bold mt-0.5">›</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Content */}
        <div className="space-y-6 text-[15px] sm:text-base leading-relaxed text-zinc-300">
          {bodyParagraphs.map((paragraph, idx) => {
            const trimmed = paragraph.trim();

            // Heading 2
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-white mt-10 mb-3 pt-4 font-sans tracking-tight"
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
                  className="text-lg sm:text-xl font-bold text-zinc-100 mt-8 mb-2 font-sans tracking-tight"
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
                  className="border-l border-zinc-700 pl-4 py-2 italic text-zinc-200 bg-zinc-900/30 rounded-r-lg my-6"
                >
                  {trimmed.replace(/^>\s*/gm, "")}
                </blockquote>
              );
            }

            // Code block
            if (trimmed.startsWith("```")) {
              const cleanCode = trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
              return (
                <div key={idx} className="my-6 rounded-xl border border-zinc-800 bg-[#07090e] overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/60">
                    <span className="font-mono text-[11px] text-zinc-500">code snippet</span>
                    <CopyCodeButton code={cleanCode} />
                  </div>
                  <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-400">
                    <code>{cleanCode}</code>
                  </pre>
                </div>
              );
            }

            // Bullet points
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              const items = trimmed
                .split("\n")
                .filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
              return (
                <ul key={idx} className="space-y-2 my-5 pl-2 font-sans">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base">
                      <span className="text-[var(--color-amber)] mt-1.5">•</span>
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
          <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t border-zinc-800/80">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Footer */}
        <div className="mt-12 p-6 rounded-2xl border border-zinc-800/90 bg-[#10121a] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-zinc-700 bg-black shrink-0 shadow-md">
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
                <span className="font-bold text-base text-white">
                  Usmaan Gani
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  (theUG)
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Founder @theugultimatum · Web3 Builder & AI Engineer
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-zinc-500">
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
    </>
  );
}
