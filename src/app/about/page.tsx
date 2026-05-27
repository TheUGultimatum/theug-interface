import { About } from "@/components/sections/About";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Usmaan Gani — theUG",
  description: "Learn more about Usmaan Gani (theUG), AI Engineer, Web3 Builder, and Developer from Ranchi, Jharkhand, India.",
};

export default function AboutPage() {
  return <About />;
}
