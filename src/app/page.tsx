import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Timeline } from "@/components/sections/Timeline";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <WorkspaceLayout>
      <Hero />
      <About />
      <Projects />
      <Timeline />
      <Contact />
    </WorkspaceLayout>
  );
}
