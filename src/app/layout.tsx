import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "theUG · AI & Automation Engineer",
  description:
    "Portfolio of theUG — building AI agents, automation tools, and experimental products. Enter the workspace.",
  keywords: ["AI", "Automation", "Developer", "Portfolio", "Next.js", "TypeScript"],
  openGraph: {
    title: "theUG · AI & Automation Engineer",
    description: "Building intelligent systems. Enter the workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
