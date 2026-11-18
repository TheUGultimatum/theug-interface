import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300; // 5 min cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tweetUrl = searchParams.get("url");

  if (!tweetUrl) {
    return NextResponse.json({ success: false, error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // Extract screen_name and status id from url
    // Formats: https://x.com/username/status/123456789 or https://twitter.com/username/status/123456789
    const match = tweetUrl.match(/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
    if (!match) {
      return NextResponse.json({ success: false, error: "Invalid Twitter/X URL" }, { status: 400 });
    }

    const [, screenName, statusId] = match;
    const fxUrl = `https://api.fxtwitter.com/${screenName}/status/${statusId}`;

    const res = await fetch(fxUrl, {
      headers: {
        "User-Agent": "theUG-Portfolio/2.0",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Upstream fetch failed" }, { status: 502 });
    }

    const data = await res.json();
    const tweet = data?.tweet;

    if (!tweet) {
      return NextResponse.json({ success: false, error: "Tweet not found" }, { status: 404 });
    }

    // Format metrics into readable K/M strings
    const formatNumber = (num: number | undefined) => {
      if (num === undefined || num === null) return "0";
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
      if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
      return num.toLocaleString();
    };

    // Extract media
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

    return NextResponse.json({
      success: true,
      data: {
        id: tweet.id,
        url: tweet.url,
        text: tweet.text || "",
        author: {
          name: tweet.author?.name || screenName,
          handle: `@${tweet.author?.screen_name || screenName}`,
          avatar: tweet.author?.avatar_url?.replace("_normal.", "_200x200.") || "",
          verified: Boolean(tweet.author?.verification?.verified),
        },
        stats: {
          likes: formatNumber(tweet.likes),
          rawLikes: tweet.likes || 0,
          views: formatNumber(tweet.views),
          reposts: formatNumber(tweet.retweets),
          replies: formatNumber(tweet.replies),
        },
        media: {
          type: mediaType,
          mediaUrl,
          thumbnailUrl,
        },
        createdAt: tweet.created_at,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tweet meta:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
