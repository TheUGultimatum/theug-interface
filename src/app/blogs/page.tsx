import { BlogsClient } from "@/components/sections/BlogsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Dispatches — theUG // Usmaan Gani",
  description:
    "Curated technical threads, on-chain breakdowns, and multi-agent AI blueprints from Usmaan Gani (@Usmaangani252).",
  openGraph: {
    title: "Blogs & Dispatches — theUG // Usmaan Gani",
    description:
      "Curated technical threads, on-chain breakdowns, and multi-agent AI blueprints from Usmaan Gani (@Usmaangani252).",
    url: "https://theug.in/blogs",
    siteName: "theUG_",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Usmaangani252",
    creator: "@Usmaangani252",
    title: "Blogs & Dispatches — theUG // Usmaan Gani",
    description:
      "Curated technical threads, on-chain breakdowns, and multi-agent AI blueprints from Usmaan Gani (@Usmaangani252).",
  },
};

export default function BlogsPage() {
  return <BlogsClient />;
}
