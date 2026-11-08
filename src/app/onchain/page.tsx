import type { Metadata } from "next";
import { NetworkMapClient } from "@/components/sections/NetworkMapClient";

export const metadata: Metadata = {
  title: "Onchain Convictions — theUG",
  description:
    "120 FPS interactive celestial solar system visualizing onchain convictions, trending execution engines (Robinhood, Base, Solana, Hyperliquid, Monad), and sovereign settlement layers by Usmaan Gani (theUG).",
};

export default function OnchainPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-52px)] w-full overflow-hidden bg-[var(--color-void)]">
      {/* Full-bleed 120 FPS Interactive Celestial Solar System */}
      <NetworkMapClient />
    </div>
  );
}
