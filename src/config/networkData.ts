export interface TokenData {
  id: string;
  label: string;
  color: string;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmount: number;
  ellipseFactor: number;
  breatheSpeed: number;
  breatheAmount: number;
  role: string;
  thesis: string;
  strengths: string;
  sector: string;
  comment: string;
  tps?: string;
  finality?: string;
  consensus?: string;
  tier?: string;
}

export const TOKENS_DATA: TokenData[] = [
  { 
    id: "btc", label: "BTC", color: "#d08b2b", radius: 280, speed: 0.00015, wobbleSpeed: 0.0005, wobbleAmount: 5, ellipseFactor: 0.85, breatheSpeed: 0.0003, breatheAmount: 4,
    role: "Digital Reserve Layer",
    thesis: "The bedrock monetary reserve of the decentralized economy. Unrivaled security, immutability, and sovereign property rights.",
    strengths: "Absolute Scarcity · Deepest Liquidity · Self-Sovereignty",
    sector: "Store of Value · Monetary Base Layer",
    comment: "“Base settlement layer for civilization.”",
    tps: "7 TPS",
    finality: "60 mins (Probabilistic)",
    consensus: "Proof-of-Work (SHA-256)",
    tier: "Layer 0 / Settlement"
  },
  { 
    id: "eth", label: "ETH", color: "#6cafe9", radius: 140, speed: 0.00038, wobbleSpeed: 0.0002, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0005, breatheAmount: 3,
    role: "Global Settlement Engine",
    thesis: "The decentralized world computer. The highest economic security, institutional trust, and ecosystem developer gravity.",
    strengths: "Economic Security · EVM Standards · Deflationary Asset",
    sector: "Decentralized Compute · DeFi Backbone",
    comment: "“The programmable financial settlement layer.”",
    tps: "15-30 TPS (L1 Base)",
    finality: "12 mins (Single slot in research)",
    consensus: "Proof-of-Stake (Gasper)",
    tier: "Layer 1 Core"
  },
  { 
    id: "base", label: "BASE", color: "#0052FF", radius: 105, speed: 0.00065, wobbleSpeed: 0.0004, wobbleAmount: 3, ellipseFactor: 1.0, breatheSpeed: 0.0007, breatheAmount: 3,
    role: "Optimistic Consumer Superchain",
    thesis: "The frictionless consumer onramp backed by Coinbase. Direct distribution to 100M+ users with sub-cent transaction costs.",
    strengths: "Distribution Velocity · Smart Wallets · OP Stack Synergy",
    sector: "Consumer Crypto · Onchain Gaming · Creator Economy",
    comment: "“Where mainstream consumer apps actually get built.”",
    tps: "80-150 TPS",
    finality: "Sub-second Soft / 7d L1 Finality",
    consensus: "Optimistic Rollup (OP Stack)",
    tier: "Layer 2 Consumer Hub"
  },
  { 
    id: "sol", label: "SOL", color: "#9d58ff", radius: 185, speed: 0.00075, wobbleSpeed: 0.002, wobbleAmount: 14, ellipseFactor: 0.95, breatheSpeed: 0.001, breatheAmount: 6,
    role: "High-Throughput State Machine",
    thesis: "Single-state machine running at physical limits. Pipelined multi-threaded Sealevel runtime enabling real-time global apps.",
    strengths: "400ms Blocktimes · Microcent Fees · Firedancer Client",
    sector: "High-Frequency DeFi · DePIN · Consumer Trading",
    comment: "“Built for global state synchronization at speed of light.”",
    tps: "2,500-4,000+ Real TPS",
    finality: "400ms (Tower BFT)",
    consensus: "Proof of History + Tower BFT",
    tier: "High-Frequency Layer 1"
  },
  { 
    id: "sui", label: "SUI", color: "#7fd2f1", radius: 215, speed: 0.00048, wobbleSpeed: 0.0028, wobbleAmount: 11, ellipseFactor: 0.98, breatheSpeed: 0.0008, breatheAmount: 7,
    role: "Object-Centric Execution",
    thesis: "Move-based paradigm where assets are first-class programmable objects. Bypasses consensus for independent casual transactions.",
    strengths: "Object Architecture · Mysticeti Fast Path · Dynamic NFTs",
    sector: "Gaming Protocols · Low-Latency Ownership",
    comment: "“The cleanest programmable asset execution primitive.”",
    tps: "10,000+ Theoretical TPS",
    finality: "390ms (Mysticeti Engine)",
    consensus: "Narwhal & Bullshark / Mysticeti",
    tier: "Object Layer 1"
  },
  { 
    id: "ton", label: "TON", color: "#3cb4e7", radius: 245, speed: 0.00025, wobbleSpeed: 0.0008, wobbleAmount: 8, ellipseFactor: 1.0, breatheSpeed: 0.0004, breatheAmount: 5,
    role: "Mass Social Distribution Layer",
    thesis: "Instant access to 900M+ active Telegram users. Dynamic sharding architecture built for asynchronous mass throughput.",
    strengths: "Native Messenger Integration · Actor Model · Sharding",
    sector: "SocialFi · Telegram Mini Apps · Micro-Payments",
    comment: "“Crypto invisibly embedded into everyday messaging.”",
    tps: "Up to millions with Shards",
    finality: "5-6 seconds",
    consensus: "Catchain Proof-of-Stake",
    tier: "Social Distribution Hub"
  },
  { 
    id: "near", label: "NEAR", color: "#777777", radius: 155, speed: 0.00032, wobbleSpeed: 0.001, wobbleAmount: 4, ellipseFactor: 0.9, breatheSpeed: 0.0006, breatheAmount: 3,
    role: "Chain Abstraction & User OS",
    thesis: "Erasing fragmentation by turning the entire multi-chain landscape into a single unified UX through account aggregation and relayers.",
    strengths: "Nightshade Sharding · Named Accounts · AI Agent Focus",
    sector: "Chain Abstraction · User Aggregation · Web3 AI",
    comment: "“Making blockchain plumbing invisible to end users.”",
    tps: "1,000+ TPS per Shard",
    finality: "1.2 seconds (Doomslug)",
    consensus: "Nightshade Sharding PoS",
    tier: "Abstraction Layer"
  },
  { 
    id: "polygon", label: "POLYGON", color: "#b35cfb", radius: 125, speed: 0.00045, wobbleSpeed: 0.0001, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0007, breatheAmount: 2,
    role: "Aggregated ZK Liquidity Hub",
    thesis: "Unifying disjointed Ethereum rollups through zero-knowledge proofs and the AggLayer for shared seamless liquidity.",
    strengths: "AggLayer Architecture · Plonky3 Prover · Enterprise Trust",
    sector: "ZK Scaling · Unified Liquidity · Institutional Web3",
    comment: "“Scaling Ethereum into a web of unified ZK chains.”",
    tps: "ZK Proofs at Scale",
    finality: "Near-instant AggLayer Finality",
    consensus: "ZK-Rollup & AggLayer Coordination",
    tier: "ZK Aggregation Network"
  },
];

export const METEOR_TYPES = [
  { id: "doge", file: "doge.svg", color: "#f3c623", label: "DOGE // CULTURAL ANCHOR" },
  { id: "pepe", file: "pepe.svg", color: "#44d62c", label: "PEPE // PURE LIQUIDITY MEMETIC" },
  { id: "shiba", file: "shiba.svg", color: "#f03b22", label: "SHIB // DECENTRALIZED SWARM" },
  { id: "pengu", file: "pengu.png", color: "#00f0ff", label: "PUDGY // IP BRAND TRANSFORMATION" }
];

export const ECOSYSTEM_RELATIONSHIPS: Record<string, string[]> = {
  "eth": ["polygon", "base"],
  "polygon": ["eth"],
  "base": ["eth"],
  "sol": ["sui"],
  "sui": ["sol"],
  "near": ["eth", "sol"]
};

export const CATEGORY_LABELS = [
  { text: "MONETARY_LAYER", angle: 0.4, radius: 280 },
  { text: "L2_CONSUMER", angle: 1.8, radius: 105 },
  { text: "ZK_AGGLAYER", angle: 2.5, radius: 125 },
  { text: "SETTLEMENT_CORE", angle: 3.1, radius: 140 },
  { text: "PARALLEL_EXECUTION", angle: 3.9, radius: 185 },
  { text: "OBJECT_MODEL", angle: 4.8, radius: 215 },
  { text: "SOCIAL_DISTRIBUTION", angle: 5.6, radius: 245 },
  { text: "CHAIN_ABSTRACTION", angle: 1.1, radius: 155 },
];

export const OPERATOR_NODES = [
  {
    name: "DROSERA NETWORK CONSENSUS NODE",
    category: "DECENTRALIZED SURVEILLANCE & TRAPS",
    role: "Active Validator / Operator",
    status: "SYNCED & MONITORING",
    stack: "Docker · Go · Linux CLI · RPC",
    telemetry: "99.98% uptime · 0 missed epochs",
    link: "https://github.com/TheUGultimatum/DROSERA-NETWORK-NODE"
  },
  {
    name: "DAC CHAIN TESTNET NODE",
    category: "DECENTRALIZED ACCESS CONTROL",
    role: "Single-Command Runner & Faucet Bot",
    status: "ONLINE // VALIDATING",
    stack: "Shell Automation · Systemd · Web3 RPC",
    telemetry: "Full block height synced · Background daemon active",
    link: "https://github.com/TheUGultimatum/dac-node-by-theug"
  },
  {
    name: "QUIP QUANTUM BLOCKCHAIN NODE",
    category: "POST-QUANTUM RESILIENT LEDGER",
    role: "VPS Node Architecture Guide & Runner",
    status: "HEALTHY // PEER SYNC",
    stack: "Ubuntu · VPS Orchestration · Bash",
    telemetry: "Multi-peer mesh sync active",
    link: "https://github.com/TheUGultimatum/quip-node-for-vps"
  },
  {
    name: "AZTEC SEQUENCER TESTNET NODE",
    category: "ZERO-KNOWLEDGE PRIVACY ROLLUP",
    role: "Block Production & Sequencer Guide",
    status: "DOCUMENTED & DEPLOYED",
    stack: "Noir · Aztec Node CLI · Docker",
    telemetry: "Private state execution validated",
    link: "https://github.com/TheUGultimatum/Aztec_Sequencer_Node"
  }
];

export const mobileConfig = {
  radiusScale: 0.52,
  starCount: 65,
  meteorSpawnRate: 0.0003,
  blurSpread: 0.5,
  particleDensity: 0.45
};

export const tabletConfig = {
  radiusScale: 0.78,
  starCount: 110,
  meteorSpawnRate: 0.0007,
  blurSpread: 0.75,
  particleDensity: 0.75
};

export const desktopConfig = {
  radiusScale: 1.0,
  starCount: 160,
  meteorSpawnRate: 0.0014,
  blurSpread: 1.0,
  particleDensity: 1.0
};
