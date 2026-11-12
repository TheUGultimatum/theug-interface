import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  const fallbackStats = {
    screen_name: "Usmaangani252",
    name: "TheUG",
    followers: 1270,
    following: 2501,
    tweets: 7283,
    likes: 7913,
    description:
      "Founder - @theugultimatum · CONTENT CREATOR · Web3 Builder & Operator",
    joined: "April 2022",
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch("https://api.fxtwitter.com/Usmaangani252", {
      headers: {
        "User-Agent": "theUG-Portfolio/2.0",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, stats: fallbackStats, cached: true });
    }

    const data = await res.json();
    const user = data?.user;

    if (!user) {
      return NextResponse.json({ success: true, stats: fallbackStats, cached: true });
    }

    return NextResponse.json({
      success: true,
      stats: {
        screen_name: user.screen_name || "Usmaangani252",
        name: user.name || "TheUG",
        followers: user.followers ?? fallbackStats.followers,
        following: user.following ?? fallbackStats.following,
        tweets: user.tweets ?? fallbackStats.tweets,
        likes: user.likes ?? fallbackStats.likes,
        description: user.description || fallbackStats.description,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        joined: "April 2022",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn("Live X stats fetch failed, using fallback:", error);
    return NextResponse.json({ success: true, stats: fallbackStats, cached: true });
  }
}
