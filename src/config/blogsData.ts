export type ContentPlatform = "x" | "telegram" | "article";

export interface TopContentItem {
  id: string;
  platform: ContentPlatform;
  category: "Airdrops" | "Education" | "Giveaways";
  author: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
    subscribers?: string;
    channelTag?: string;
    followUrl?: string;
  };
  content: string;
  date: string;
  media?: {
    type: "photo-grid" | "image" | "video" | "link-card";
    src?: string;
    title?: string;
    description?: string;
    url?: string;
    photos?: string[];
  };
  stats: {
    likes?: string;
    replies?: string;
    views?: string;
    shares?: string;
  };
  url: string;
  replyCount?: string;
  isPinned?: boolean;
}

export const TOP_CONTENTS: TopContentItem[] = [
  // ──────────────────── COLUMN 1: TELEGRAM & HIGH-IMPACT PROOF ────────────────────
  {
    id: "telegram-aptos-proof",
    platform: "telegram",
    category: "Airdrops",
    author: {
      name: "CryptoGG ❤️❤️",
      handle: "@LoootMoney",
      subscribers: "1,01,309 subscribers",
      channelTag: "@LoootMoney",
      followUrl: "https://t.me/cryptogg",
    },
    content: "🔥 Profit (1 lakh- 1.5crore from Aptos airdrop) - big proof soon 🔥\n\nYe to 2-3% proof h bs - abhi ruko (And bs vobhi bhaar se diye ) 😂🤌",
    date: "Aptos Epoch 1",
    media: {
      type: "photo-grid",
      photos: [
        "/images/proof/proof1.jpg",
        "/images/proof/proof2.jpg",
        "/images/proof/proof3.jpg",
        "/images/proof/proof4.jpg",
        "/images/proof/proof5.jpg",
        "/images/proof/proof6.jpg",
      ],
    },
    stats: {
      views: "48.2K",
      shares: "1.4K",
      likes: "3.2K",
    },
    url: "https://t.me/cryptogg",
  },
  {
    id: "guide-crypto-job-free",
    platform: "x",
    category: "Education",
    author: {
      name: "Gautamguptagg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "Here Is The Premium Guide At Free of Cost !! 💎💎\n\nThis guide will help you understand the core concepts and give you the best strategies for growth in Web3 ecosystem.",
    date: "Recent",
    media: {
      type: "image",
      title: "$0 TO CRYPTO JOB",
      description: "Complete roadmap to transitioning into full-time Web3 & on-chain development.",
      src: "guide-crypto-job",
    },
    stats: {
      likes: "1.5K",
      replies: "420",
    },
    replyCount: "420",
    url: "https://x.com/gautamguptagg",
  },

  // ──────────────────── COLUMN 2: AIRDROPS & MINDSET ────────────────────
  {
    id: "airdrop-swal-nil",
    platform: "x",
    category: "Airdrops",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "💎 We Made $200$-120,000$ From $WAL, $NIL #Airdrop\n\n💎 Just By Investing 0$ : Only GG Fam.\n\n📌 In Whole Crypto Space, I Gave $WAL When It Had 4500 Followers..\n\n💎 Follow GG For More ALPHA",
    date: "Apr 2, 2025",
    media: {
      type: "photo-grid",
      photos: ["proof-swal-1", "proof-swal-2", "proof-swal-3"],
    },
    stats: {
      likes: "994",
      replies: "291",
    },
    replyCount: "291",
    url: "https://x.com/gautamguptagg",
  },
  {
    id: "mindset-money-mgmt",
    platform: "x",
    category: "Education",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "The Premium Guide At Free of Cost !!\n\nFix Your Mindset, Fix Your Money Management, Fix Your Future.\nMost people think money management is only about saving or investing.\nBut the truth is simple: if you master on-chain asymmetric upside, you master financial freedom.",
    date: "Nov 28, 2025",
    media: {
      type: "image",
      title: "$0 TO HOME",
      description: "The backpacker mindset: Surviving bear markets and compounding capital.",
      src: "mindset-backpacker",
    },
    stats: {
      likes: "1.8K",
      replies: "407",
    },
    replyCount: "407",
    url: "https://x.com/gautamguptagg",
  },

  // ──────────────────── COLUMN 3: DRIP & CONTENT CREATION ────────────────────
  {
    id: "airdrop-spengu-drip",
    platform: "x",
    category: "Airdrops",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "💎 We Made $800$-105,000$ From $PENGU #Airdrop Just By Investing 0$ (From Drip)",
    date: "8:15 PM · Dec 10, 2024",
    media: {
      type: "video",
      title: "PENGU Airdrop Distribution Breakdown",
      description: "How early Solana Drip subscribers received 5-figure allocations with zero capital.",
      src: "video-pengu-thumb",
    },
    stats: {
      likes: "629",
      replies: "218",
    },
    replyCount: "218",
    url: "https://x.com/gautamguptagg",
  },
  {
    id: "guide-web3-creator-x",
    platform: "x",
    category: "Education",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "The Complete Comprehensive Guide to Making Money on X & Become a Web3 Content Creator !!\n\nIn this article, I will explain how you can make money on X without investing even a single dollar.",
    date: "Nov 9, 2025",
    media: {
      type: "image",
      title: "WEB3 CREATOR BLUEPRINT",
      description: "Monetizing attention, building distribution, and partnering with verified protocols.",
      src: "creator-homer-cash",
    },
    stats: {
      likes: "1.4K",
      replies: "297",
    },
    replyCount: "297",
    url: "https://x.com/gautamguptagg",
  },

  // ──────────────────── COLUMN 4: STAKING & PREDICTION MARKETS ────────────────────
  {
    id: "airdrop-deep-sui",
    platform: "x",
    category: "Airdrops",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "💎 We Made $900$-14,000$ From $DEEP #Airdrop Just By Staking 2$-10$ Of $SUI (400X)",
    date: "5:33 PM · Oct 16, 2024",
    media: {
      type: "link-card",
      title: "Sui Wallet — Chrome Web Store",
      description: "Wallet link - http://bit.ly/3uMY90R\nSec khhi koi project sui token hold/put stake ka snapshot leketa ❤️❤️",
      url: "https://chrome.google.com/webstore",
    },
    stats: {
      likes: "501",
      replies: "1.3k",
    },
    replyCount: "1.3k",
    url: "https://x.com/gautamguptagg",
  },
  {
    id: "guide-prediction-markets",
    platform: "x",
    category: "Education",
    author: {
      name: "Gautamgg",
      handle: "@gautamguptagg",
      verified: true,
      followUrl: "https://x.com/gautamguptagg",
    },
    content: "This is the most premium and only article which is made on prediction markets and you're getting it for free.\n\nDon't underestimate free content.\nBy this single guide, you can learn how to earn 4 to 5 figures.",
    date: "Jan 29, 2026",
    media: {
      type: "image",
      title: "STRATEGY $0 -> $100 EARN 5 FIGURE AIRDROP",
      description: "Polymarket & Kalshi volume strategies for farming tiered token retroactive pools.",
      src: "prediction-strategy-diagram",
    },
    stats: {
      likes: "585",
      replies: "98",
    },
    replyCount: "98",
    url: "https://x.com/gautamguptagg",
  },

  // ──────────────────── GIVEAWAYS & EXTRA HIGH-VALUE ALPHA ────────────────────
  {
    id: "giveaway-usdt-whitelist",
    platform: "x",
    category: "Giveaways",
    author: {
      name: "theUG // Usmaan Gani",
      handle: "@Usmaangani252",
      verified: true,
      followUrl: "https://x.com/Usmaangani252",
    },
    content: "🎁 Mega 1,000 USDT + 25x Testnet Validator Whitelist Allocation Giveaway!\n\n1. Follow @theugultimatum & @Usmaangani252\n2. Like & Repost with #Web3 #Giveaway\n3. Comment your EVM / Solana wallet address below 👇\n\nWinners announced Sunday!",
    date: "Recent",
    media: {
      type: "image",
      title: "1,000 USDT COMMUNITY GIVEAWAY",
      description: "Exclusive verification whitelist for high-yield node runners and active developers.",
      src: "giveaway-chest",
    },
    stats: {
      likes: "2.4K",
      replies: "1.8K",
    },
    replyCount: "1.8K",
    url: "https://x.com/Usmaangani252",
  },
  {
    id: "airdrop-berachain-testnet",
    platform: "x",
    category: "Airdrops",
    author: {
      name: "theUG // Usmaan Gani",
      handle: "@Usmaangani252",
      verified: true,
      followUrl: "https://x.com/Usmaangani252",
    },
    content: "🐻 Berachain Bartio Testnet to Mainnet Migration Playbook:\n\nDetailed breakdown on farming proof-of-liquidity vaults, automated swap routing, and maximizing BGT governance allocation before TGE.",
    date: "Dec 2024",
    media: {
      type: "photo-grid",
      photos: ["bera-flow-1", "bera-flow-2"],
    },
    stats: {
      likes: "870",
      replies: "154",
    },
    replyCount: "154",
    url: "https://x.com/Usmaangani252",
  },
  {
    id: "giveaway-hardware-key",
    platform: "x",
    category: "Giveaways",
    author: {
      name: "CryptoGG ❤️❤️",
      handle: "@LoootMoney",
      subscribers: "1,01,309 subscribers",
      channelTag: "@LoootMoney",
      followUrl: "https://t.me/cryptogg",
    },
    content: "🎉 5x Ledger Nano X Hardware Wallets + Special Telegram VIP Alpha Group Access!\n\nActive members who liked our last 5 posts are entered automatically. Tap below to claim your entry ticket.",
    date: "Active Drop",
    stats: {
      views: "36.8K",
      shares: "920",
      likes: "1.9K",
    },
    url: "https://t.me/cryptogg",
  },
  {
    id: "guide-drosera-nodes",
    platform: "x",
    category: "Education",
    author: {
      name: "theUG // Usmaan Gani",
      handle: "@Usmaangani252",
      verified: true,
      followUrl: "https://x.com/Usmaangani252",
    },
    content: "⚡ Drosera Network Zero-Downtime Trap Node Setup:\n\nStep-by-step masterclass on deploying high-availability Linux node daemons with automated health-check crons and automatic signature loops.",
    date: "Oct 2024",
    media: {
      type: "video",
      title: "Drosera VPS Setup in 10 Minutes",
      description: "Linux bash configuration, systemd daemon setups, and RPC fallback loops.",
      src: "drosera-video-thumb",
    },
    stats: {
      likes: "1.1K",
      replies: "312",
    },
    replyCount: "312",
    url: "https://x.com/Usmaangani252",
  },
];

// Fallback compatibility with previous code imports
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
  body?: string;
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

export const BLOGS_DATA: XPost[] = [];
