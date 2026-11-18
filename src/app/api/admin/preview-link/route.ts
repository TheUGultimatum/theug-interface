import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/adminAuth";

function isPrivateIpOrHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "::1" ||
    lower === "0.0.0.0" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower === "169.254.169.254"
  ) {
    return true;
  }
  // Check private IP ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(lower)) return true;

  return false;
}

export async function POST(request: Request) {
  // 1. Require admin authentication
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");
  if (!verifySessionToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid URL is required" },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // 2. Validate URL protocol and target (SSRF prevention)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return NextResponse.json({ success: false, error: "Malformed URL" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return NextResponse.json({ success: false, error: "Only HTTP/HTTPS URLs allowed" }, { status: 400 });
    }

    if (isPrivateIpOrHost(parsedUrl.hostname)) {
      return NextResponse.json({ success: false, error: "Access to private or local hosts is disallowed" }, { status: 403 });
    }

    // 1. Twitter / X Link Preview via official Twitter oEmbed
    const isXUrl = /(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/i.test(trimmedUrl);

    if (isXUrl) {
      try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
          trimmedUrl
        )}&omit_script=true`;
        const oembedRes = await fetch(oembedUrl, {
          headers: {
            "User-Agent": "theUG-Bot/1.0",
          },
        });

        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          // Extract text from the oembed html block
          const htmlText = oembedData.html || "";
          // Strip HTML tags to get pure tweet text
          const cleanText = htmlText
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&mdash;[\s\S]*$/, "") // remove author and date block at end
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();

          const lines = cleanText.split("\n").filter(Boolean);
          const firstLine = lines[0] || "";
          const summary = lines.slice(1, 4).join(" ") || firstLine;

          // Extract potential hashtags
          const hashtags = (cleanText.match(/#[A-Za-z0-9_]+/g) || []).slice(0, 5);

          return NextResponse.json({
            success: true,
            type: "x-post",
            title: firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine || "X Dispatch",
            summary: summary.slice(0, 220),
            content: lines,
            authorName: oembedData.author_name || "TheUG",
            authorUrl: oembedData.author_url || "https://x.com/Usmaangani252",
            rawHtml: oembedData.html,
            url: trimmedUrl,
            tags: hashtags.length > 0 ? hashtags : ["#Web3"],
          });
        }
      } catch (err) {
        console.warn("oEmbed fetch failed, falling back to open-graph:", err);
      }
    }

    // 2. Generic Article / URL OpenGraph Metadata Parser
    try {
      const pageRes = await fetch(trimmedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();

        const getMeta = (names: string[]) => {
          for (const name of names) {
            const match =
              html.match(new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
              html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i")) ||
              html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
              html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"));
            if (match && match[1]) return match[1].trim();
          }
          return "";
        };

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title =
          getMeta(["og:title", "twitter:title"]) ||
          (titleMatch ? titleMatch[1].trim() : "") ||
          "Untitled Dispatch";

        const description =
          getMeta(["og:description", "twitter:description", "description"]) || "";

        const image = getMeta(["og:image", "twitter:image"]) || "";
        const siteName = getMeta(["og:site_name"]) || "";

        return NextResponse.json({
          success: true,
          type: "article",
          title,
          summary: description.slice(0, 240),
          image,
          siteName,
          url: trimmedUrl,
        });
      }
    } catch (err) {
      console.warn("OpenGraph fetch failed:", err);
    }

    // Fallback if network blocked
    return NextResponse.json({
      success: true,
      type: "generic",
      title: "Dispatch from " + new URL(trimmedUrl).hostname,
      summary: "Direct preview link to external dispatch.",
      url: trimmedUrl,
    });
  } catch (error) {
    console.error("Preview link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to parse link metadata" },
      { status: 500 }
    );
  }
}
