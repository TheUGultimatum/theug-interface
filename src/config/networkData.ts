export const TOKENS_DATA = [
  { 
    id: "btc", label: "BTC", color: "#d08b2b", radius: 260, speed: 0.00015, wobbleSpeed: 0.0005, wobbleAmount: 5, ellipseFactor: 0.85, breatheSpeed: 0.0003, breatheAmount: 4,
    role: "Digital Reserve Layer", thesis: "Most decentralized monetary network. Long-term store of value. Institutional adoption keeps increasing.", strengths: "Scarcity · Security · Self Custody · Global Liquidity", sector: "Store of Value · Sovereignty · Monetary Layer", comment: "“Base settlement layer for crypto.”"
  },
  { 
    id: "eth", label: "ETH", color: "#6cafe9", radius: 120, speed: 0.0004, wobbleSpeed: 0.0002, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0005, breatheAmount: 3,
    role: "Global Settlement Engine", thesis: "The leading smart contract platform with unmatched developer density and economic security.", strengths: "Network Effects · Deflationary · L2 Ecosystem", sector: "DeFi · Infrastructure · Smart Contracts", comment: "“The internet of value.”"
  },
  { 
    id: "sol", label: "SOL", color: "#9d58ff", radius: 170, speed: 0.0008, wobbleSpeed: 0.002, wobbleAmount: 15, ellipseFactor: 0.95, breatheSpeed: 0.001, breatheAmount: 6,
    role: "High-Throughput State Machine", thesis: "Parallelized execution enables consumer-grade applications at scale without sharding.", strengths: "Speed · Low Fees · Consumer Focus", sector: "Consumer · DePIN · Fast DeFi", comment: "“Built for global state synchronization.”"
  },
  { 
    id: "ton", label: "TON", color: "#3cb4e7", radius: 220, speed: 0.00025, wobbleSpeed: 0.0008, wobbleAmount: 8, ellipseFactor: 1.0, breatheSpeed: 0.0004, breatheAmount: 5,
    role: "Social Distribution Layer", thesis: "Tapping into nearly a billion active Telegram users for massive onboarding scale.", strengths: "Distribution · Async Architecture · Social Graph", sector: "SocialFi · Mini-apps · Mass Adoption", comment: "“Web3 meets instant messaging.”"
  },
  { 
    id: "near", label: "NEAR", color: "#777777", radius: 145, speed: 0.0003, wobbleSpeed: 0.001, wobbleAmount: 4, ellipseFactor: 0.9, breatheSpeed: 0.0006, breatheAmount: 3,
    role: "Chain Abstraction OS", thesis: "Removing the friction of multi-chain UX through account aggregation and relayer networks.", strengths: "Sharding · Usability · Fast Finality", sector: "Abstraction · AI · Developer UX", comment: "“Making crypto invisible to the user.”"
  },
  { 
    id: "sui", label: "SUI", color: "#7fd2f1", radius: 195, speed: 0.0005, wobbleSpeed: 0.003, wobbleAmount: 12, ellipseFactor: 0.98, breatheSpeed: 0.0008, breatheAmount: 7,
    role: "Object-Centric Engine", thesis: "Novel Move architecture treating digital assets as objects, enabling high concurrency.", strengths: "Move Language · Parallel Tx · Dynamic Assets", sector: "Gaming · High-TPS DeFi · Ownership", comment: "“Next-gen architectural primitive.”"
  },
  { 
    id: "polygon", label: "POLYGON", color: "#b35cfb", radius: 130, speed: 0.00045, wobbleSpeed: 0.0001, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0007, breatheAmount: 2,
    role: "Aggregated Ethereum Scaling", thesis: "Unifying Ethereum liquidity and state through ZK-proofs and the AggLayer.", strengths: "ZK Tech · Business Dev · Ecosystem", sector: "Scaling · ZK · Enterprise", comment: "“Scaling Ethereum to infinite capacity.”"
  },
];

export const METEOR_TYPES = [
  { id: "doge", file: "doge.svg", color: "#f3c623" },
  { id: "pepe", file: "pepe.svg", color: "#44d62c" },
  { id: "shiba", file: "shiba.svg", color: "#f03b22" },
  { id: "pengu", file: "pengu.png", color: "#00f0ff" }
];

export const ECOSYSTEM_RELATIONSHIPS: Record<string, string[]> = {
  "eth": ["polygon"],
  "polygon": ["eth"],
  "sol": ["sui"],
  "sui": ["sol"]
};

export const CATEGORY_LABELS = [
  { text: "MONETARY_LAYER", angle: 0.5, radius: 260 },
  { text: "L2_SCALING", angle: 2.1, radius: 130 },
  { text: "HIGH_THROUGHPUT", angle: 3.5, radius: 170 },
  { text: "SOCIAL_LAYER", angle: 5.2, radius: 220 },
  { text: "CHAIN_ABSTRACTION", angle: 1.2, radius: 145 },
];

export const mobileConfig = {
  radiusScale: 0.55,
  starCount: 60,
  meteorSpawnRate: 0.0002,
  blurSpread: 0.5,
  particleDensity: 0.4
};

export const tabletConfig = {
  radiusScale: 0.8,
  starCount: 100,
  meteorSpawnRate: 0.0006,
  blurSpread: 0.7,
  particleDensity: 0.7
};

export const desktopConfig = {
  radiusScale: 1.0,
  starCount: 150,
  meteorSpawnRate: 0.0012,
  blurSpread: 1.0,
  particleDensity: 1.0
};
