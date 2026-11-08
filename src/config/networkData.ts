export interface TokenData {
  id: string;
  label: string;
  name: string;
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
  narrative: "SETTLEMENT" | "CONSUMER_L2" | "HIGH_THROUGHPUT" | "DEFI_CONSENSUS";
  convictionScore: number; // 0-100
  ecosystemHighlight: string;
}

export const TOKENS_DATA: TokenData[] = [
  { 
    id: "base", label: "BASE", name: "BASE SUPERCHAIN", color: "#0052FF", radius: 95, speed: 0.00062, wobbleSpeed: 0.0004, wobbleAmount: 3, ellipseFactor: 1.0, breatheSpeed: 0.0007, breatheAmount: 3,
    role: "Consumer Superchain Gateway",
    thesis: "Coinbase-backed distribution gateway onboarding 100M+ retail users with sub-cent gas fees, Smart Wallet passkeys, and deep social layer integrations (Farcaster, Aerodrome).",
    strengths: "Coinbase Direct Onramp · Native Smart Wallets · OP Stack Superchain Interop",
    sector: "Consumer Crypto · SocialFi · Mass Onboarding",
    comment: "“Distribution beats raw tech every time. Base is the retail liquidity gravitational center.”",
    tps: "150-300 TPS",
    finality: "Sub-second Soft / 7d L1 Finality",
    consensus: "Optimistic Rollup (OP Stack Bedrock)",
    tier: "Layer 2 Consumer Hub",
    narrative: "CONSUMER_L2",
    convictionScore: 98,
    ecosystemHighlight: "Aerodrome Finance, Virtuals Protocol, Friend.tech, Base App"
  },
  { 
    id: "robinhood", label: "HOOD", name: "ROBINHOOD CHAIN", color: "#00C805", radius: 125, speed: 0.00054, wobbleSpeed: 0.0003, wobbleAmount: 3, ellipseFactor: 0.98, breatheSpeed: 0.0006, breatheAmount: 3,
    role: "RWA & Tokenized Stock Layer",
    thesis: "Dedicated Layer 2 utilizing Arbitrum Orbit Nitro architecture, engineered specifically for 24/7 tokenized equities, real-world asset settlement, and institutional micro-trading.",
    strengths: "Direct TradFi Brokerage Pipeline · 100ms Micro-Blocks · SEC/Finra Institutional Grade",
    sector: "Real World Assets (RWA) · Tokenized Equities · TradFi Bridge",
    comment: "“The bridge that brings Wall Street's trillion-dollar balance sheets into self-custodial onchain rails.”",
    tps: "1,500+ TPS",
    finality: "100ms Blocktimes",
    consensus: "Arbitrum Nitro Orbit (AnyTrust Model)",
    tier: "Enterprise RWA L2",
    narrative: "CONSUMER_L2",
    convictionScore: 94,
    ecosystemHighlight: "Stock Tokens, Treasury Yield Vaults, 24/7 Brokerage Settlement"
  },
  { 
    id: "sol", label: "SOL", name: "SOLANA", color: "#9945FF", radius: 155, speed: 0.00048, wobbleSpeed: 0.002, wobbleAmount: 14, ellipseFactor: 0.95, breatheSpeed: 0.001, breatheAmount: 6,
    role: "High-Throughput State Machine",
    thesis: "Single synchronous global state machine operating at physical hardware limits. Multi-threaded Sealevel runtime with 400ms blocktimes, atomic composability, and memetic liquidity dominance.",
    strengths: "400ms Sub-Second Blocks · Parallel Sealevel Runtime · Firedancer 1M TPS Client",
    sector: "High-Frequency DeFi · DePIN · Consumer Memetics",
    comment: "“Unmatched execution velocity and global retail mindshare. The fastest atomic liquidity loop.”",
    tps: "2,500 - 4,500+ Real TPS",
    finality: "400ms (Tower BFT)",
    consensus: "Proof of History + Tower BFT",
    tier: "High-Frequency Layer 1",
    narrative: "HIGH_THROUGHPUT",
    convictionScore: 97,
    ecosystemHighlight: "Jupiter Exchange, Raydium, Drift Protocol, Helium, Hivemapper"
  },
  { 
    id: "hyperliquid", label: "HYPE", name: "HYPERLIQUID", color: "#00F5D4", radius: 185, speed: 0.00042, wobbleSpeed: 0.0025, wobbleAmount: 12, ellipseFactor: 0.92, breatheSpeed: 0.0012, breatheAmount: 5,
    role: "Hyper-Performance Orderbook L1",
    thesis: "Purpose-built financial Layer 1 using native HyperBFT consensus capable of 200,000 orders/sec directly onchain with zero gas fees for book cancellations and native HyperEVM composability.",
    strengths: "200k Orders/s Throughput · Native HyperEVM · Zero-Gas Limit Orders",
    sector: "Decentralized Perpetuals · High-Frequency Trading · Native Appchain",
    comment: "“CEX-tier sub-millisecond execution without custodial risk. The undisputed king of onchain perps.”",
    tps: "200,000 Orders/sec",
    finality: "200ms Instant Finality",
    consensus: "HyperBFT Native Consensus Engine",
    tier: "Specialized Trading L1",
    narrative: "HIGH_THROUGHPUT",
    convictionScore: 96,
    ecosystemHighlight: "HyperEVM, PURR, HyperBFT Orderbook Engine, HIP-1 Spot Pairs"
  },
  { 
    id: "abstract", label: "ABS", name: "ABSTRACT CHAIN", color: "#00E599", radius: 215, speed: 0.00038, wobbleSpeed: 0.0005, wobbleAmount: 4, ellipseFactor: 0.98, breatheSpeed: 0.0006, breatheAmount: 4,
    role: "Culture & Consumer ZK Rollup",
    thesis: "Consumer-centric ZK Stack rollup backed by Igloo (Pudgy Penguins) turning culture, intellectual property, and casual gaming into frictionless onchain transactions with invisible smart accounts.",
    strengths: "Pudgy Penguins IP Gravity · ZK Stack Security · Native Account Abstraction",
    sector: "Consumer Crypto · IP Commercialization · Casual Gaming",
    comment: "“Crypto made invisible for mainstream consumer entertainment and global brand IP.”",
    tps: "2,000+ ZK TPS",
    finality: "Instant Soft / Validated ZK Proof",
    consensus: "ZK Stack (Zero-Knowledge Rollup)",
    tier: "Consumer ZK Layer 2",
    narrative: "CONSUMER_L2",
    convictionScore: 91,
    ecosystemHighlight: "Pudgy World, Abstract Global Wallet, Overpass IP Portal"
  },
  { 
    id: "berachain", label: "BERA", name: "BERACHAIN", color: "#FF5B00", radius: 245, speed: 0.00034, wobbleSpeed: 0.0008, wobbleAmount: 6, ellipseFactor: 0.96, breatheSpeed: 0.0007, breatheAmount: 4,
    role: "Proof-of-Liquidity DeFi Core",
    thesis: "Novel Layer 1 aligning network security with liquidity provision through Proof-of-Liquidity (PoL). Validators direct BGT emissions to liquidity pools, solving mercenary farming forever.",
    strengths: "Proof-of-Liquidity · Tri-Token Economic Flywheel · EVM-Identical Polaris Engine",
    sector: "Deep DeFi Architecture · Liquidity Consensus · Yield Infrastructure",
    comment: "“Transforming passive staked capital into active, productive network liquidity.”",
    tps: "1,000+ TPS",
    finality: "2-3 seconds",
    consensus: "Proof-of-Liquidity (PoL) + CometBFT",
    tier: "DeFi Consensus Layer 1",
    narrative: "DEFI_CONSENSUS",
    convictionScore: 93,
    ecosystemHighlight: "BEX DEX, Bend Lending, Berps Perps, Honey Stablecoin"
  },
  { 
    id: "monad", label: "MONAD", name: "MONAD", color: "#836EF9", radius: 275, speed: 0.00030, wobbleSpeed: 0.0022, wobbleAmount: 10, ellipseFactor: 0.96, breatheSpeed: 0.0009, breatheAmount: 5,
    role: "Parallel EVM Execution Engine",
    thesis: "Asynchronous pipelined execution delivering 10,000 TPS while maintaining 100% full byte-code equivalence for existing Ethereum dApps and custom asynchronous state storage via MonadDb.",
    strengths: "10k TPS Benchmark · Asynchronous MonadBFT · MonadDb Custom SSD Engine",
    sector: "Parallel EVM · Next-Gen Smart Contracts · High-Capacity DeFi",
    comment: "“Preserves complete EVM developer muscle memory while removing the single-threaded bottleneck.”",
    tps: "10,000 Real TPS",
    finality: "1 Second Single-Slot",
    consensus: "MonadBFT + MonadDb",
    tier: "Parallel EVM Layer 1",
    narrative: "HIGH_THROUGHPUT",
    convictionScore: 95,
    ecosystemHighlight: "Kuru DEX, Ambient Finance, Monad Native Tooling"
  },
  { 
    id: "megaeth", label: "MEGA", name: "MEGAETH", color: "#FF3366", radius: 305, speed: 0.00027, wobbleSpeed: 0.002, wobbleAmount: 8, ellipseFactor: 0.95, breatheSpeed: 0.0008, breatheAmount: 4,
    role: "Real-Time 100k TPS Rollup",
    thesis: "The world's first real-time Ethereum Layer 2 capable of 100,000 transactions per second with sub-millisecond latency through in-memory computing and specialized node hardware specialization.",
    strengths: "100k TPS · Sub-Millisecond Blocktimes · In-Memory Execution Architecture",
    sector: "Ultra-High Frequency · Real-Time Web3 · High-Compute dApps",
    comment: "“Bringing Web2 datacenter latency directly onto Ethereum's cryptographic security umbrella.”",
    tps: "100,000 TPS",
    finality: "<1 millisecond soft finality",
    consensus: "Hardware-Specialized Sequencer Rollup",
    tier: "Real-Time Layer 2",
    narrative: "HIGH_THROUGHPUT",
    convictionScore: 92,
    ecosystemHighlight: "Real-Time Gaming, High-Speed CLOBs, Streaming Micropayments"
  },
  { 
    id: "arbitrum", label: "ARB", name: "ARBITRUM ONE", color: "#28A0F0", radius: 335, speed: 0.00024, wobbleSpeed: 0.0002, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0005, breatheAmount: 2,
    role: "DeFi Capital Liquidity L2",
    thesis: "The highest TVL Ethereum rollup with Stylus multi-language execution (Rust, C, C++ alongside EVM) and battle-tested optimistic interactive fraud proofs.",
    strengths: "Deepest Rollup TVL · Stylus Multi-Language WASM · Orbit Chain Framework",
    sector: "Deep DeFi · Institutional Rollups · Multi-VM Architecture",
    comment: "“The battle-tested benchmark for high-liquidity Ethereum scaling and institutional Orbit chains.”",
    tps: "60-200 TPS (Spike capable to 400)",
    finality: "250ms Soft / 7d Settlement",
    consensus: "Multi-Round Interactive Fraud Proofs",
    tier: "Layer 2 DeFi Engine",
    narrative: "CONSUMER_L2",
    convictionScore: 94,
    ecosystemHighlight: "GMX, Camelot DEX, Pendle Finance, TreasureDAO"
  },
  { 
    id: "sui", label: "SUI", name: "SUI NETWORK", color: "#4ca2fe", radius: 365, speed: 0.00021, wobbleSpeed: 0.0028, wobbleAmount: 11, ellipseFactor: 0.98, breatheSpeed: 0.0008, breatheAmount: 7,
    role: "Object-Centric Move Engine",
    thesis: "Move-based paradigm where assets exist as first-class programmable objects. Bypasses global consensus for non-conflicting peer-to-peer asset transfers with Mysticeti consensus.",
    strengths: "Object Architecture · Mysticeti 390ms Engine · Dynamic Composability",
    sector: "Gaming Protocols · Low-Latency Asset Ownership · MoveVM",
    comment: "“The cleanest programmable asset execution primitive in modern crypto architecture.”",
    tps: "10,000+ Scalable TPS",
    finality: "390ms (Mysticeti Consensus)",
    consensus: "Mysticeti / Narwhal-Bullshark",
    tier: "Object Layer 1",
    narrative: "HIGH_THROUGHPUT",
    convictionScore: 90,
    ecosystemHighlight: "Cetus Protocol, Scallop Lending, SuiPlay0X1 Gaming"
  },
  { 
    id: "eth", label: "ETH", name: "ETHEREUM", color: "#627eea", radius: 405, speed: 0.00017, wobbleSpeed: 0.0002, wobbleAmount: 2, ellipseFactor: 1.0, breatheSpeed: 0.0005, breatheAmount: 3,
    role: "Decentralized World Computer",
    thesis: "The primary programmable settlement hub of decentralized finance. Unrivaled economic security, developer mindshare, and monetary deflationary mechanics.",
    strengths: "Decentralized Economic Security · EVM Standard Gravity · Rollup-Centric Settlement Hub",
    sector: "Programmable Settlement · Core L1",
    comment: "“The global trust computer anchoring all rollups and decentralized sovereign value.”",
    tps: "15-30 L1 TPS (Millions via L2s)",
    finality: "12 mins (Single slot in research)",
    consensus: "Proof-of-Stake (Gasper Consensus)",
    tier: "Layer 1 Core Settlement",
    narrative: "SETTLEMENT",
    convictionScore: 99,
    ecosystemHighlight: "Uniswap, Aave, MakerDAO / Sky, EigenLayer, Lido"
  },
  { 
    id: "btc", label: "BTC", name: "BITCOIN", color: "#f7931a", radius: 445, speed: 0.00013, wobbleSpeed: 0.0004, wobbleAmount: 4, ellipseFactor: 0.85, breatheSpeed: 0.0003, breatheAmount: 4,
    role: "Sovereign Monetary Reserve",
    thesis: "The unforgeable base layer of decentralized property rights. Unmatched hash rate security, absolute 21M scarcity, and deep institutional ETF custody integration.",
    strengths: "Absolute 21M Cap · Proof-of-Work Gravity · Sovereign Settlement",
    sector: "Store of Value · Monetary Base Layer",
    comment: "“The immutable digital bedrock of the decentralized financial era.”",
    tps: "7 TPS",
    finality: "60 mins (Probabilistic)",
    consensus: "Nakamoto Proof-of-Work (SHA-256)",
    tier: "Layer 0 Base Reserve",
    narrative: "SETTLEMENT",
    convictionScore: 100,
    ecosystemHighlight: "Lightning Network, Babylon Staking, Ordinals, BitVM"
  }
];

export const METEOR_TYPES = [
  { id: "doge", file: "doge.svg", color: "#f3c623", label: "DOGE // CULTURAL ANCHOR", desc: "First memetic sovereign asset, battle-tested through multiple multi-billion dollar market cycles." },
  { id: "pepe", file: "pepe.svg", color: "#44d62c", label: "PEPE // PURE LIQUIDITY MEMETIC", desc: "Zero-tax, organic viral distribution protocol proving community velocity outpaces venture capital." },
  { id: "shiba", file: "shiba.svg", color: "#f03b22", label: "SHIB // DECENTRALIZED SWARM", desc: "Community ecosystem pioneering decentralized autonomous governance and L2 scaling." },
  { id: "pengu", file: "pengu.png", color: "#00f0ff", label: "PUDGY // IP BRAND CONVERGENCE", desc: "Mainstream toy retail and cultural brand converting Web2 consumer attention into onchain activity." }
];

export const ECOSYSTEM_RELATIONSHIPS: Record<string, string[]> = {
  "eth": ["arbitrum", "base", "robinhood", "abstract", "megaeth"],
  "arbitrum": ["robinhood", "eth"],
  "base": ["eth", "abstract"],
  "robinhood": ["arbitrum"],
  "abstract": ["base", "eth"],
  "sol": ["hyperliquid", "sui"],
  "hyperliquid": ["sol", "arbitrum"],
  "monad": ["eth", "sol"],
  "megaeth": ["eth", "monad"],
  "berachain": ["eth", "arbitrum"],
  "sui": ["sol"]
};

export const OPERATOR_NODES = [
  {
    name: "DROSERA NETWORK CONSENSUS NODE",
    category: "DECENTRALIZED SURVEILLANCE & TRAPS",
    role: "Active Validator / Trap Operator",
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
