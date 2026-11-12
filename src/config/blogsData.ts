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
    likes: string;
    reposts: string;
    views: string;
  };
  highlights: string[];
  tags: string[];
  isPinned?: boolean;
}

export const BLOGS_DATA: XPost[] = [
  {
    id: "onchain-conviction-deepdive",
    title: "The Architecture Behind My Web3 On-Chain Convictions (11 Networks Explored)",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Nov 2026",
    readTime: "3 min read · Thread",
    category: "Web3",
    isPinned: true,
    summary:
      "A deep dive into why I mapped my personal universe across 11 key chains — from Bitcoin's immutable settlement to Base's consumer adoption and Hyperliquid's custom orderbook L1.",
    content: [
      "Most portfolios track token balances. I wanted to track convictions and architectural paradigms.",
      "1/ Bitcoin & Ethereum: The bedrock settlement layers that never compromise on decentralization.",
      "2/ Solana & Base: Where developer velocity and retail onboarding actually collide. Fast, cheap, passkey-friendly.",
      "3/ Hyperliquid & Sui: Demonstrating that specialized execution (custom orderbooks + object data models) outperforms generic rollups.",
      "Read the full thread and architecture breakdown below 👇",
    ],
    stats: {
      likes: "428",
      reposts: "89",
      views: "18.4K",
    },
    highlights: [
      "11 Ecosystems analyzed without hype",
      "Settlement vs execution layer distinctions",
      "Why consumer crypto wins on passkeys",
    ],
    tags: ["#Web3", "#Solidity", "#CryptoTwitter", "#Ethereum", "#Base"],
  },
  {
    id: "autonomous-agents-in-production",
    title: "Autonomous Coding Swarms: Why Context Compaction Beats Brute-Force Context Windows",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Nov 2026",
    readTime: "4 min read · Deep Dive",
    category: "AI & Agents",
    isPinned: true,
    summary:
      "Context rot is real. Here is how I orchestrate local multi-agent coding swarms with reactive messaging and 75%+ memory compaction ratios.",
    content: [
      "Giving an LLM 1M tokens does NOT solve coordination. It just dilutes the attention map.",
      "When building autonomous coding workflows, I split responsibility:",
      "• Coordinator handles high-level architectural constraints.",
      "• Specialized Workers own atomic file domains.",
      "• Reactive Wakeup triggers actions only when child subagents report back — zero token polling.",
      "The result? Fast builds, zero context exhaustion, and clean pull requests.",
    ],
    stats: {
      likes: "612",
      reposts: "142",
      views: "24.6K",
    },
    highlights: [
      "Reactive agent wakeup patterns",
      "Preventing LLM hallucination in large codebases",
      "78% token savings via memory compaction",
    ],
    tags: ["#AIAgents", "#DevTools", "#LLMs", "#BuildInPublic"],
  },
  {
    id: "building-theug-hub",
    title: "From Zero to CT Community: Building theUG Hub in Public",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Oct 2026",
    readTime: "2 min read",
    category: "Build In Public",
    summary:
      "Why every independent developer needs a digital home for Crypto Twitter. Lessons learned launching hub.theug.in for Web3 builders.",
    content: [
      "Web3 moves at the speed of a Twitter timeline, but ephemeral tweets are terrible knowledge bases.",
      "That's why I started building theUG Hub — a dedicated space for CT alpha, shared research, and community collaboration.",
      "Key lessons so far:",
      "1. Build where your community already spends attention.",
      "2. Keep the personal portfolio distinct from community tooling.",
      "3. Ship daily, verify onchain, and never compromise on UI speed.",
    ],
    stats: {
      likes: "389",
      reposts: "67",
      views: "14.2K",
    },
    highlights: [
      "Separating portfolio from community hub",
      "Community-first crypto distribution",
      "Real-time CT feedback loops",
    ],
    tags: ["#theUG", "#Community", "#Web3Builders", "#CryptoTwitter"],
  },
  {
    id: "hyperliquid-evm-appchains",
    title: "Hyperliquid vs Generic Rollups: Why Custom Financial L1s Are Winning DeFi",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Oct 2026",
    readTime: "3 min read · Alpha",
    category: "CT Alpha",
    summary:
      "A technical dissection of HyperBFT, HyperEVM, and why native onchain orderbook DEXs are consistently taking market share from centralized exchanges.",
    content: [
      "Perpetuals onchain used to mean high slippage, AMM lag, and terrible UX.",
      "Hyperliquid proved that if you design custom consensus (HyperBFT) specifically for orderbook matching, you get sub-second finality with zero gas for cancellations.",
      "Now with HyperEVM, native programmability meets high-velocity financial primitives.",
      "Here is my architectural breakdown of why app-specific L1s win.",
    ],
    stats: {
      likes: "534",
      reposts: "118",
      views: "21.9K",
    },
    highlights: [
      "HyperBFT vs Tendermint consensus latency",
      "Orderbook matching engines on L1",
      "Why DeFi liquidity aggregates around speed",
    ],
    tags: ["#Hyperliquid", "#HYPE", "#DeFi", "#EVM"],
  },
  {
    id: "solidity-security-gotchas",
    title: "5 Hard-Earned Smart Contract Lessons from Testing EVM Protocols",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Sep 2026",
    readTime: "4 min read · Tutorial",
    category: "Web3",
    summary:
      "Practical contract security lessons on reentrancy guards, storage packing, cross-chain relaying, and ERC-4337 passkey account abstraction.",
    content: [
      "Auditing and deploying Solidity contracts teaches you humility very quickly.",
      "1. Checks-Effects-Interactions is non-negotiable, but reentrancy guards are your seatbelt.",
      "2. Variable storage packing (uint128 + uint128 in one slot) saves thousands in gas.",
      "3. Account Abstraction (ERC-4337) with WebAuthn passkeys is the only way retail users will ever self-custody.",
      "Full writeup and code samples on my X feed 👇",
    ],
    stats: {
      likes: "447",
      reposts: "95",
      views: "16.8K",
    },
    highlights: [
      "Gas optimization via slot packing",
      "ERC-4337 account abstraction patterns",
      "Invariant fuzzing with Foundry",
    ],
    tags: ["#Solidity", "#SmartContracts", "#Ethereum", "#Foundry"],
  },
  {
    id: "developer-stack-2026",
    title: "My 2026 Independent Developer Stack: Turbopack, Tailwind, and Local-First Agents",
    url: "https://x.com/Usmaangani252",
    publishedAt: "Aug 2026",
    readTime: "2 min read",
    category: "Build In Public",
    summary:
      "How I maintain sub-second reload times, 120 FPS canvas graphics, and zero-bloat architecture while shipping solo Web3 and AI apps.",
    content: [
      "Here is the exact tech stack powering all my production apps:",
      "• Next.js 16 (App Router + Turbopack) for instant builds.",
      "• Tailwind CSS with strict CSS custom property design tokens (Void Black, Solar Amber, Cyber Cyan).",
      "• Pure 2D Canvas with requestAnimationFrame for 120 FPS cosmic visuals.",
      "• Zero heavy UI component libraries — custom, lightweight, accessible components.",
    ],
    stats: {
      likes: "512",
      reposts: "81",
      views: "19.3K",
    },
    highlights: [
      "120 FPS canvas optimization",
      "Zero-dependency component design",
      "Next.js Turbopack productivity hacks",
    ],
    tags: ["#Nextjs", "#Frontend", "#WebDev", "#BuildInPublic"],
  },
];
