import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Calendar, Clock, Share2, Sparkles } from "lucide-react";
import { XPost } from "@/config/blogsData";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "blogs.json");

async function getBlogPost(slug: string): Promise<XPost | null> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const blogs: XPost[] = JSON.parse(fileContent);
    const post = blogs.find(
      (b) => (b.slug && b.slug === slug) || b.id === slug
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

  // Render article paragraphs or split body
  const bodyParagraphs = post.body
    ? post.body.split("\n\n").filter(Boolean)
    : post.content || [];

  return (
    <article className="min-h-screen px-4 md:px-8 py-12 max-w-[840px] mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dispatches</span>
        </Link>
      </div>

      {/* Meta header */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-text-muted)] mb-4">
        <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-[var(--color-border)] bg-[rgba(255,94,58,0.06)] text-[var(--color-amber)]">
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
      </div>

      {/* Main Title */}
      <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mb-6 leading-tight font-sans">
        {post.title}
      </h1>

      {/* Summary Lead */}
      {post.summary && (
        <div className="p-4 rounded-lg border-l-2 border-[var(--color-amber)] bg-[var(--color-surface)] border border-[var(--color-border)] mb-8">
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed italic">
            &ldquo;{post.summary}&rdquo;
          </p>
        </div>
      )}

      {/* Highlights Box */}
      {post.highlights && post.highlights.length > 0 && (
        <div className="mb-8 p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-amber)] font-bold mb-3">
            <Sparkles size={14} />
            <span>Key Takeaways</span>
          </div>
          <ul className="space-y-2">
            {post.highlights.map((h, i) => (
              <li key={i} className="text-xs md:text-sm text-[var(--color-text-secondary)] flex items-start gap-2.5 leading-relaxed">
                <span className="text-[var(--color-cyan)] font-mono">›</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Article Body */}
      <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed space-y-5">
        {bodyParagraphs.map((paragraph, idx) => {
          // Detect headers
          if (paragraph.startsWith("## ")) {
            return (
              <h2
                key={idx}
                className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mt-8 mb-3"
              >
                {paragraph.replace("## ", "")}
              </h2>
            );
          }
          if (paragraph.startsWith("### ")) {
            return (
              <h3
                key={idx}
                className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mt-6 mb-2"
              >
                {paragraph.replace("### ", "")}
              </h3>
            );
          }
          return (
            <p key={idx} className="whitespace-pre-line">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--color-border)]">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Dossier & Discussion Footer */}
      <div className="mt-12 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--color-border-glow)] flex-shrink-0 bg-black">
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
              <span className="font-bold text-sm text-[var(--color-text-primary)]">
                Usmaan Gani
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                @Usmaangani252
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Founder @theugultimatum · Web3 Builder & Operator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-xs font-mono tracking-wider flex items-center gap-1.5"
            >
              <span>DISCUSS ON X</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

