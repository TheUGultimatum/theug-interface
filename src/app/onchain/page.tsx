import type { Metadata } from "next";
import { OnchainObservatoryClient } from "@/components/sections/OnchainObservatoryClient";

export const metadata: Metadata = {
  title: "On-Chain Conviction — theUG",
  description:
    "Interactive Web3 Solar System visualizing the personal on-chain journey, technical curiosity, and ecosystem convictions of Usmaan Gani (theUG).",
};

export default function OnchainPage() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[var(--color-void)]">
      <OnchainObservatoryClient />
    </div>
  );
}
