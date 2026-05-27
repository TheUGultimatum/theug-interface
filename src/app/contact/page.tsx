import { Contact } from "@/components/sections/Contact";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — theUG",
  description: "Secure terminal connection to reach theUG.",
};

export default function ContactPage() {
  return <Contact />;
}
