export interface EcosystemData {
  id: string;
  name: string;
  ticker?: string;
  displayName: string;
  classification: "Network" | "Settlement Layer" | "Platform" | "Appchain" | "Infrastructure";
  classificationDetail: string;
  color: string;
  accentGlow: string;
  radius: number; // orbital radius
  speed: number;  // orbital speed multiplier
  size: number;   // visual planet radius in px
  status?: "Building" | "Researching" | "Experimenting" | "Exploring" | "Contributing";
  personalInterest: string;
  experimentsAndObservations: string;
  relevantProjects: string[];
  toolsAndTech: string[];
  officialWebsite: string;
  docsUrl?: string;
  personalNotes?: string;
}

export const ECOSYSTEMS_DATA: EcosystemData[] = [
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    displayName: "Bitcoin — BTC",
    classification: "Settlement Layer",
    classificationDetail: "Decentralized Monetary Network · Proof-of-Work Reserve",
    color: "#F7931A",
    accentGlow: "rgba(247, 147, 26, 0.4)",
    radius: 460,
    speed: 0.00010,
    size: 26,
    status: "Researching",
    personalInterest: "The foundational unforgeable monetary ledger of the internet, anchoring global cryptographic property rights through Nakamoto Proof-of-Work.",
    experimentsAndObservations: "Observing programmatic scarcity, Bitcoin scripting innovations, institutional custody dynamics, and second-layer settlement rails.",
    relevantProjects: ["Bitcoin Core", "Lightning Network", "Babylon Protocol", "BitVM"],
    toolsAndTech: ["SHA-256", "Script", "Taproot", "Lightning Nodes"],
    officialWebsite: "https://bitcoin.org",
    docsUrl: "https://developer.bitcoin.org",
    personalNotes: "The immutable digital bedrock of decentralized trust and self-sovereignty."
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    displayName: "Ethereum — ETH",
    classification: "Settlement Layer",
    classificationDetail: "Decentralized World Computer · Programmable Settlement Hub",
    color: "#627EEA",
    accentGlow: "rgba(98, 126, 234, 0.45)",
    radius: 410,
    speed: 0.00014,
    size: 25,
    status: "Building",
    personalInterest: "The universal programmable settlement backbone powering decentralized finance, rollups, account abstraction, and developer culture.",
    experimentsAndObservations: "Deploying and testing Solidity smart contracts, exploring EIP-4337 smart accounts, and studying modular L2 settlement mechanics.",
    relevantProjects: ["Uniswap", "Aave", "EigenLayer", "Flashbots"],
    toolsAndTech: ["Solidity", "EVM", "Foundry", "Hardhat", "viem/wagmi"],
    officialWebsite: "https://ethereum.org",
    docsUrl: "https://ethereum.org/en/developers/docs/",
    personalNotes: "The primary programmable settlement hub anchoring modern rollup ecosystems."
  },
  {
    id: "sol",
    name: "Solana",
    ticker: "SOL",
    displayName: "Solana — SOL",
    classification: "Network",
    classificationDetail: "High-Throughput State Machine · Parallel Sealevel Runtime",
    color: "#9945FF",
    accentGlow: "rgba(153, 69, 255, 0.45)",
    radius: 200,
    speed: 0.00038,
    size: 23,
    status: "Experimenting",
    personalInterest: "Single synchronous global state machine operating at physical hardware limits with sub-second blocktimes and high atomic liquidity velocity.",
    experimentsAndObservations: "Testing Rust program lifecycles, evaluating parallel execution under congestion, and tracking client diversity developments.",
    relevantProjects: ["Jupiter Exchange", "Drift Protocol", "Firedancer", "Helium"],
    toolsAndTech: ["Rust", "Anchor Framework", "Sealevel", "Solana Web3.js"],
    officialWebsite: "https://solana.com",
    docsUrl: "https://docs.solana.com",
    personalNotes: "High-velocity consumer and DeFi execution with exceptional developer mindshare."
  },
  {
    id: "base",
    name: "Base",
    displayName: "Base",
    classification: "Network",
    classificationDetail: "Consumer Superchain · Ethereum Layer 2 Network",
    color: "#0052FF",
    accentGlow: "rgba(0, 82, 255, 0.5)",
    radius: 125,
    speed: 0.00062,
    size: 24,
    status: "Building",
    personalInterest: "Coinbase-incubated OP Stack rollup optimized to onboard mainstream internet users into seamless onchain applications with sub-cent gas fees.",
    experimentsAndObservations: "Building on Base testnets, integrating passkey-based Smart Wallets, and tracking the growth of onchain social protocols.",
    relevantProjects: ["Aerodrome", "Virtuals Protocol", "Farcaster", "Base Name Service"],
    toolsAndTech: ["OP Stack", "Smart Wallets", "ERC-4337", "Base RPC"],
    officialWebsite: "https://base.org",
    docsUrl: "https://docs.base.org",
    personalNotes: "Where consumer crypto apps and retail distribution naturally converge."
  },
  {
    id: "robinhood",
    name: "Robinhood",
    displayName: "Robinhood",
    classification: "Platform",
    classificationDetail: "Web3 & Crypto Gateway · Retail & Brokerage On-Ramp",
    color: "#00C805",
    accentGlow: "rgba(0, 200, 5, 0.45)",
    radius: 155,
    speed: 0.00052,
    size: 22,
    status: "Exploring",
    personalInterest: "Major consumer brokerage gateway connecting tens of millions of retail users to crypto trading, self-custody wallets, and institutional RWA pipelines.",
    experimentsAndObservations: "Monitoring non-custodial wallet infrastructure, Layer-2 scaling integrations, and tokenized real-world asset trading initiatives.",
    relevantProjects: ["Robinhood Wallet", "Robinhood Crypto Connect", "RWA Settlement"],
    toolsAndTech: ["Multi-Chain Relayers", "Self-Custody Protocols", "Arbitrum Orbit Stack"],
    officialWebsite: "https://robinhood.com/us/en/about/crypto/",
    docsUrl: "https://robinhood.com",
    personalNotes: "Bridging mainstream brokerage accounts into self-custodial onchain rails."
  },
  {
    id: "tron",
    name: "TRON",
    ticker: "TRX",
    displayName: "TRON — TRX",
    classification: "Network",
    classificationDetail: "High-Velocity Settlement Network · Global Stablecoin Rail",
    color: "#EF0027",
    accentGlow: "rgba(239, 0, 39, 0.45)",
    radius: 340,
    speed: 0.00021,
    size: 21,
    status: "Exploring",
    personalInterest: "One of the most heavily utilized peer-to-peer settlement networks globally, processing massive daily USDT volumes for emerging market commerce.",
    experimentsAndObservations: "Analyzing high-frequency stablecoin transaction velocity, energy/bandwidth fee models, and cross-border payment utility.",
    relevantProjects: ["Tether (USDT on TRON)", "JustLend", "SunSwap"],
    toolsAndTech: ["DPoS Consensus", "TronWeb", "TVM"],
    officialWebsite: "https://tron.network",
    docsUrl: "https://developers.tron.network",
    personalNotes: "Essential global payments infrastructure with unparalleled micro-transaction volume."
  },
  {
    id: "sui",
    name: "Sui",
    ticker: "SUI",
    displayName: "Sui — SUI",
    classification: "Network",
    classificationDetail: "Object-Centric Move VM · High Concurrency Layer 1",
    color: "#4CA2FE",
    accentGlow: "rgba(76, 162, 254, 0.45)",
    radius: 280,
    speed: 0.00027,
    size: 22,
    status: "Researching",
    personalInterest: "Next-generation Layer 1 designed around first-class programmable objects, parallel execution for non-conflicting transactions, and sub-second Mysticeti consensus.",
    experimentsAndObservations: "Exploring Sui Move package development, object composability patterns, and dynamic asset ownership.",
    relevantProjects: ["Cetus Protocol", "Scallop Lending", "SuiPlay0X1", "DeepBook"],
    toolsAndTech: ["Sui Move", "Mysticeti Consensus", "Object Data Model", "Sui TS SDK"],
    officialWebsite: "https://sui.io",
    docsUrl: "https://docs.sui.io",
    personalNotes: "Clean object-based programming model delivering genuine parallel execution."
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    ticker: "HYPE",
    displayName: "Hyperliquid — HYPE",
    classification: "Appchain",
    classificationDetail: "Custom Financial L1 · Onchain Orderbook & HyperEVM",
    color: "#00F5D4",
    accentGlow: "rgba(0, 245, 212, 0.45)",
    radius: 240,
    speed: 0.00032,
    size: 23,
    status: "Experimenting",
    personalInterest: "Purpose-built financial Layer 1 running a native Central Limit Order Book directly in consensus at 200k orders/sec with zero gas fees and HyperEVM composability.",
    experimentsAndObservations: "Studying custom HyperBFT consensus, testing native spot/perp execution APIs, and exploring HyperEVM smart contract deployments.",
    relevantProjects: ["HyperEVM", "PURR", "HyperBFT Orderbook Engine", "HIP-1 Spot"],
    toolsAndTech: ["HyperBFT", "HyperEVM", "Python API", "Rust SDK"],
    officialWebsite: "https://hyperliquid.xyz",
    docsUrl: "https://hyperliquid.gitbook.io",
    personalNotes: "Unmatched performance proving that custom financial execution beats generic rollups."
  },
  {
    id: "arc",
    name: "Arc",
    displayName: "Arc",
    classification: "Infrastructure",
    classificationDetail: "Web3 Infrastructure & Payment Layer · Programmable Commerce",
    color: "#00E5FF",
    accentGlow: "rgba(0, 229, 255, 0.4)",
    radius: 175,
    speed: 0.00045,
    size: 20,
    status: "Researching",
    personalInterest: "Emerging programmable financial infrastructure focused on developer APIs, cross-chain liquidity abstraction, and friction-free payment settlement.",
    experimentsAndObservations: "Analyzing merchant checkout flows, programmatic settlement primitives, and stablecoin payment rail integrations.",
    relevantProjects: ["Arc Protocol", "Developer Commerce SDKs", "Liquidity Relayers"],
    toolsAndTech: ["REST / GraphQL APIs", "Smart Accounts", "Cross-Chain Bridges"],
    officialWebsite: "https://arc.market",
    docsUrl: "https://arc.market/docs",
    personalNotes: "Pioneering invisible onchain infrastructure for seamless digital transactions."
  },
  {
    id: "polygon",
    name: "Polygon",
    ticker: "POL",
    displayName: "Polygon — POL",
    classification: "Network",
    classificationDetail: "Aggregated EVM Network · AggLayer Multi-Chain Architecture",
    color: "#8247E5",
    accentGlow: "rgba(130, 71, 229, 0.45)",
    radius: 310,
    speed: 0.00024,
    size: 22,
    status: "Contributing",
    personalInterest: "Pioneering Ethereum scaling ecosystem transitioning toward the unified AggLayer, bridging asynchronous zero-knowledge rollups into unified liquidity.",
    experimentsAndObservations: "Deploying dApps across Polygon PoS and zkEVM, studying AggLayer unified state proofs, and experimenting with CDK rollups.",
    relevantProjects: ["AggLayer", "Polygon zkEVM", "QuickSwap", "Polygon CDK"],
    toolsAndTech: ["POL Token", "Polygon CDK", "zkSNARKs", "Foundry"],
    officialWebsite: "https://polygon.technology",
    docsUrl: "https://docs.polygon.technology",
    personalNotes: "Battle-tested Ethereum scaling network evolving into an interconnected zero-knowledge mesh."
  },
  {
    id: "ton",
    name: "TON",
    displayName: "TON",
    classification: "Network",
    classificationDetail: "Social Distribution Highway · The Open Network",
    color: "#0088CC",
    accentGlow: "rgba(0, 136, 204, 0.45)",
    radius: 375,
    speed: 0.00017,
    size: 23,
    status: "Exploring",
    personalInterest: "Cryptographic ecosystem tightly integrated with Telegram's 900M+ global user base, enabling frictionless crypto onboarding via mini-apps and wallet bots.",
    experimentsAndObservations: "Examining TON actor-model concurrency, FunC / Tact smart contract languages, and Telegram Mini App webhooks.",
    relevantProjects: ["Telegram Wallet (@wallet)", "STON.fi", "Tonkeeper", "Telegram Mini Apps"],
    toolsAndTech: ["Tact Language", "FunC", "TON Virtual Machine (TVM)", "Telegram Web Apps"],
    officialWebsite: "https://ton.org",
    docsUrl: "https://docs.ton.org",
    personalNotes: "The ultimate social distribution engine making crypto native to global messaging."
  }
];

export const CONVICTION_PILLARS = [
  {
    id: "permissionless",
    title: "Permissionless Infrastructure",
    subtitle: "Censorship-Resistant Base Layers",
    description: "Financial and compute systems must remain open to all participants without centralized gatekeeping. Unforgeable code over trusted intermediaries.",
    icon: "Shield"
  },
  {
    id: "ownership",
    title: "Real User Ownership",
    subtitle: "Self-Custody & Verifiable Identity",
    description: "True digital sovereignty means users hold the cryptographic keys to their assets, reputation, and data rather than renting them from platforms.",
    icon: "Key"
  },
  {
    id: "execution",
    title: "High-Performance Execution",
    subtitle: "Sub-Second State & Modern VMs",
    description: "Scaling to global adoption requires modern parallel execution (Sealevel, Move, HyperBFT, Parallel EVMs) that matches Web2 responsiveness with cryptographic integrity.",
    icon: "Cpu"
  },
  {
    id: "creator-economy",
    title: "On-Chain Creator Economy",
    subtitle: "Direct Value Capture",
    description: "Replacing extractive middleman algorithms with transparent tokenized primitives that return economic sovereignty directly to developers, creators, and communities.",
    icon: "Sparkles"
  },
  {
    id: "public-learning",
    title: "Building in Public",
    subtitle: "Open Documentation & Community",
    description: "Sharing experiments, validator node guides, and open-source tooling openly. Collective intelligence accelerates decentralized engineering.",
    icon: "Terminal"
  }
];

// Active Operator Nodes maintained by Usmaan Gani
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
