export interface XPost {
  id: string;
  slug?: string;
  title: string;
  type?: "article" | "x-post" | "linkedin" | "telegram";
  platform?: "x" | "linkedin" | "telegram" | "article";
  url?: string;
  publishedAt: string;
  readTime: string;
  category: "Web3" | "AI & Agents" | "Build In Public" | "CT Alpha" | "Engineering";
  summary: string;
  body?: string; // Full markdown / article text
  content?: string[];
  imageUrl?: string; // Embedded media preview screenshot / graphic
  stats?: {
    likes?: string;
    reposts?: string;
    views?: string;
    replies?: string;
  };
  highlights?: string[];
  tags?: string[];
  isPinned?: boolean;
}

/**
 * Real Articles & Dynamic Social Dispatches for Usmaan Gani (@Usmaangani252 / theUG).
 * Can be managed dynamically via the /admin console or synced from Neon DB.
 */
export const BLOGS_DATA: XPost[] = [
  {
    id: "drosera-consensus-rewards",
    slug: "drosera-consensus-rewards",
    title: "How We Automated Validator Nodes on Drosera Network For Peak Consensus Yield",
    type: "x-post",
    platform: "x",
    category: "CT Alpha",
    publishedAt: "Apr 2, 2025",
    readTime: "3 min read",
    url: "https://x.com/Usmaangani252",
    summary: "💎 We automated node runners on Drosera & DAC Chain testnet directly on headless Linux VPS.\n\n⚡ Zero manual intervention: auto-faucet claim, wallet signature cycles & low-latency traps.\n\n🛡️ Follow @Usmaangani252 for direct node telemetry scripts.",
    imageUrl: "/images/dinorun.png",
    stats: {
      likes: "994",
      replies: "291",
      reposts: "182",
      views: "18.4K",
    },
    tags: ["#Web3", "#Nodes", "#Drosera", "#Alpha"],
    isPinned: true,
  },
  {
    id: "theug-telegram-alpha",
    slug: "theug-telegram-alpha",
    title: "theUG Ultimatum // On-Chain Alpha Room",
    type: "telegram",
    platform: "telegram",
    category: "CT Alpha",
    publishedAt: "Today",
    readTime: "Live Feed",
    url: "https://t.me/theugultimatum",
    summary: "🚀 Verified On-Chain Proofs & Early Testnet Scripts.\n\nOver 10,000+ builders tracking our daily pipeline: Base mainnet contracts, automated faucet bots, local GPU inference, and early liquidity staking routes.",
    imageUrl: "/images/portrait.png",
    stats: {
      likes: "1.5K",
      replies: "420",
      views: "24K",
    },
    tags: ["#Telegram", "#Alpha", "#Community"],
    isPinned: true,
  },
  {
    id: "modular-agent-swarms",
    slug: "modular-agent-swarms",
    title: "Building Autonomous Agent Swarms: Multi-Agent Orchestration with Local Inference",
    type: "x-post",
    platform: "x",
    category: "AI & Agents",
    publishedAt: "Dec 10, 2024",
    readTime: "4 min read",
    url: "https://x.com/Usmaangani252",
    summary: "🧠 We built a swarm architecture combining LangChain, Ollama local inference & async vector indexing.\n\nKey takeaways:\n• Zero API cost for code research\n• Autonomous verification feedback loops\n• Sub-100ms pipeline execution",
    stats: {
      likes: "800",
      replies: "218",
      reposts: "145",
      views: "14.2K",
    },
    tags: ["#AI", "#Agents", "#Python", "#Ollama"],
  },
  {
    id: "dino-run-on-chain",
    slug: "dino-run-on-chain",
    title: "DINO RUN ON BASE: Deploying an On-Chain Retro Cyber-Runner with Smart Contracts",
    type: "x-post",
    platform: "x",
    category: "Web3",
    publishedAt: "Oct 16, 2024",
    readTime: "2 min read",
    url: "https://x.com/Usmaangani252",
    summary: "🦖 Built and shipped an interactive cyberpunk runner directly on Base Mainnet.\n\nIntegrated Base SDK, Solidity escrow contracts & real-time global leaderboard. 100% on-chain transparency.",
    imageUrl: "/images/dinorun.png",
    stats: {
      likes: "900",
      replies: "1.3K",
      reposts: "310",
      views: "32K",
    },
    tags: ["#Base", "#Solidity", "#Gaming", "#Web3"],
  },
  {
    id: "linkedin-fullstack-architecture",
    slug: "linkedin-fullstack-architecture",
    title: "The Architecture of Zero-Latency Web3 Portfolios: Neon Postgres & Next.js Turbopack",
    type: "linkedin",
    platform: "linkedin",
    category: "Engineering",
    publishedAt: "Nov 9, 2025",
    readTime: "5 min read",
    url: "https://www.linkedin.com/in/usmaan-gani/",
    summary: "How do you achieve sub-50ms render times across global serverless edges while preserving atomic database writes on read-only environments?\n\nHere is our deep-dive system architecture breakdown using Neon Serverless Postgres connection pooling.",
    stats: {
      likes: "412",
      replies: "68",
      views: "6.8K",
    },
    tags: ["#Architecture", "#Nextjs", "#Postgres", "#WebDev"],
  },
  {
    id: "make-money-on-chain-guide",
    slug: "make-money-on-chain-guide",
    title: "The Comprehensive Guide to Building in Public & Becoming an Operator in Web3",
    type: "article",
    platform: "article",
    category: "Build In Public",
    publishedAt: "Nov 28, 2025",
    readTime: "6 min read",
    url: "/blogs/make-money-on-chain-guide",
    summary: "Fix your mindset, automate your deployment pipeline, and ship daily.\n\nIn this article, I explain how independent builders can build high-conviction portfolios and generate client pipelines without spending a single dollar on marketing.",
    body: `## The Operator Mindset in Web3

In 2026, the barrier to building software has collapsed. With modern LLM agents, Turbopack, and serverless databases, anyone can ship a frontend in hours.

The real differentiator is not code generation—it is **conviction, execution speed, and operational resilience**.

### 1. Own Your Domain & Infrastructure
Never rely entirely on third-party platform feeds. Twitter and LinkedIn algorithms change overnight. By keeping an autonomous, high-performance portfolio at theug.in connected to your own database, you own 100% of your audience equity.

### 2. Automate Repetitive Node & Telemetry Loops
Whether you are running consensus validators, scraping on-chain logs, or monitoring liquidity pools, automate everything with shell scripts and cron workers.

### 3. Build in Public With Concrete Evidence
Talk is cheap on Crypto Twitter. Real screenshots, verified transaction hashes, and live applications will always outrank buzzwords.`,
    stats: {
      likes: "1.8K",
      replies: "407",
      reposts: "290",
      views: "29K",
    },
    highlights: [
      "Why independent operators outpace bloated agency teams",
      "Setting up zero-maintenance serverless edge pipelines",
      "Transforming technical dispatches into organic inbound opportunities",
    ],
    tags: ["#BuildInPublic", "#Web3", "#Operator", "#Career"],
  },
];
