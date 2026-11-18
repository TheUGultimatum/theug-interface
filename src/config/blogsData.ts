export interface XPost {
  id: string;
  slug?: string;
  title: string;
  type?: "article" | "x-post";
  url?: string;
  publishedAt: string;
  readTime: string;
  category: "Web3" | "AI & Agents" | "Build In Public" | "CT Alpha" | "Engineering";
  summary: string;
  body?: string; // Full markdown / article text for normal articles on the website
  content?: string[];
  stats?: {
    likes?: string;
    reposts?: string;
    views?: string;
  };
  highlights?: string[];
  tags?: string[];
  isPinned?: boolean;
}

/**
 * Real Articles & X Dispatches for Usmaan Gani (@Usmaangani252).
 * Managed directly via the /admin console or updated here.
 */
export const BLOGS_DATA: XPost[] = [];
