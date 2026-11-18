import { Blogs } from "@/components/sections/Blogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top contents — Curated Alpha & Dispatches | theUG",
  description:
    "Curated Web3 alpha, on-chain proof of reserves, airdrop strategies, and technical guides from Usmaan Gani and top crypto researchers.",
  openGraph: {
    title: "Top contents — Curated Alpha & Dispatches | theUG",
    description:
      "Curated Web3 alpha, on-chain proof of reserves, airdrop strategies, and technical guides from Usmaan Gani and top crypto researchers.",
    url: "https://theug.in/blogs",
    siteName: "theUG_",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Usmaangani252",
    creator: "@Usmaangani252",
    title: "Top contents — Curated Alpha & Dispatches | theUG",
    description:
      "Curated Web3 alpha, on-chain proof of reserves, airdrop strategies, and technical guides from Usmaan Gani and top crypto researchers.",
  },
};

export default function BlogsPage() {
  return <Blogs />;
}
