import { LabsClient } from "@/components/sections/LabsClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labs — theUG",
  description: "Interactive experiments, simulations, and advanced capabilities.",
};

export default function LabsPage() {
  return <LabsClient />;
}
