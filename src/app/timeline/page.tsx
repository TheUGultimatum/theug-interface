import { Timeline } from "@/components/sections/Timeline";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline — theUG",
  description: "The journey and experience timeline of theUG.",
};

export default function TimelinePage() {
  return <Timeline />;
}
