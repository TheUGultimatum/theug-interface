import { Projects } from "@/components/sections/Projects";
import { getStoredProjects } from "@/lib/serverStore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — theUG",
  description: "Showcase of projects, apps, and decentralized systems built by Usmaan Gani (theUG).",
};

export default async function ProjectsPage() {
  const initialProjects = await getStoredProjects();
  return <Projects initialProjects={initialProjects} />;
}
