import { NextResponse } from "next/server";
import { isNeonConfigured, neonGetMeta } from "@/lib/neon";

export const revalidate = 60; // Cache for 60 seconds

export interface LinkedInStats {
  name: string;
  vanity_name: string;
  headline: string;
  profile_url: string;
  followers: number;
  connections: number;
  display_connections: string;
  company: string;
  location: string;
  updatedAt: string;
}

export async function GET() {
  const fallbackStats: LinkedInStats = {
    name: "Usmaan Gani",
    vanity_name: "usmaan-gani",
    headline: "Web3 Builder & Operator · AI Engineer · Founder @theugultimatum",
    profile_url: "https://www.linkedin.com/in/usmaan-gani/",
    followers: 850,
    connections: 500,
    display_connections: "500+",
    company: "theUG Ultimatum",
    location: "Jharkhand, India",
    updatedAt: new Date().toISOString(),
  };

  // 1. Check for environment variable overrides if provided
  if (process.env.LINKEDIN_FOLLOWERS) {
    const f = parseInt(process.env.LINKEDIN_FOLLOWERS, 10);
    if (!isNaN(f)) fallbackStats.followers = f;
  }
  if (process.env.LINKEDIN_CONNECTIONS) {
    const c = parseInt(process.env.LINKEDIN_CONNECTIONS, 10);
    if (!isNaN(c)) {
      fallbackStats.connections = c;
      fallbackStats.display_connections = c >= 500 ? "500+" : String(c);
    }
  }

  // 2. Check Neon DB for stored custom metrics if database is connected
  if (isNeonConfigured()) {
    try {
      const meta = await neonGetMeta([
        "linkedin_followers",
        "linkedin_connections",
        "linkedin_headline",
      ]);
      if (meta.linkedin_followers) {
        const val = parseInt(meta.linkedin_followers, 10);
        if (!isNaN(val)) fallbackStats.followers = val;
      }
      if (meta.linkedin_connections) {
        const val = parseInt(meta.linkedin_connections, 10);
        if (!isNaN(val)) {
          fallbackStats.connections = val;
          fallbackStats.display_connections = val >= 500 ? "500+" : String(val);
        }
      }
      if (meta.linkedin_headline) {
        fallbackStats.headline = meta.linkedin_headline;
      }
    } catch (dbErr) {
      console.warn("[LinkedIn Stats] DB read failed, using default:", dbErr);
    }
  }

  return NextResponse.json({
    success: true,
    stats: fallbackStats,
    cached: true,
  });
}
