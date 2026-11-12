export interface XPost {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  readTime: string;
  category: "Web3" | "AI & Agents" | "Build In Public" | "CT Alpha";
  summary: string;
  content: string[];
  stats: {
    likes?: string;
    reposts?: string;
    views?: string;
  };
  highlights?: string[];
  tags?: string[];
  isPinned?: boolean;
}

/**
 * Real X Dispatches & Blog Posts for Usmaan Gani (@Usmaangani252).
 * Currently empty - real posts and articles will be added directly.
 */
export const BLOGS_DATA: XPost[] = [];
