import { Projects } from "@/components/sections/Projects";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — theUG",
  description: "Showcase of projects, apps, and decentralized systems built by Usmaan Gani (theUG).",
};

export default function ProjectsPage() {
  return <Projects />;
}
