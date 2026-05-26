import dynamic from "next/dynamic";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Now } from "@/components/sections/Now";

// Dynamically lazy-load heavy sections below the fold to minimize initial JS payloads & speed up Vercel page boots
const Projects = dynamic(() => import("@/components/sections/Projects").then((m) => m.Projects));
const Labs = dynamic(() => import("@/components/sections/Labs").then((m) => m.Labs));
const NetworkMap = dynamic(() => import("@/components/sections/NetworkMap").then((m) => m.NetworkMap));
const Timeline = dynamic(() => import("@/components/sections/Timeline").then((m) => m.Timeline));
const Contact = dynamic(() => import("@/components/sections/Contact").then((m) => m.Contact));

export default function Home() {
  return (
    <WorkspaceLayout>
      <Hero />
      <About />
      <Now />
      <Projects />
      <Labs />
      <NetworkMap />
      <Timeline />
      <Contact />
    </WorkspaceLayout>
  );
}
