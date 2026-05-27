import { NetworkMapClient } from "@/components/sections/NetworkMapClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onchain Convictions — theUG",
  description: "Futuristic observatory visualizing active ecosystems and infrastructure.",
};

export default function OnchainPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkMapClient />
      {/* 
         As requested: "Page structure: Hero intro -> Solar system -> Conviction telemetry logs -> Ecosystem categories -> Meme meteor layer -> Operator insights. Give breathing room."
         NetworkMap handles the Solar System, Telemetry logs, Meme meteors inside the Canvas currently. 
         We can add breathing room below it for future content. 
      */}
      <div className="operator-insights pt-12 pb-24 max-w-7xl mx-auto w-full">
        <h2 className="font-mono text-[var(--color-cyan)] mb-8 tracking-widest uppercase">
          Operator Insights
        </h2>
        <p className="text-[var(--color-text-secondary)] font-mono text-sm">
          More detailed architectural breakdowns and conviction theses will be logged here.
          Awaiting further data synchronization...
        </p>
      </div>
    </div>
  );
}
