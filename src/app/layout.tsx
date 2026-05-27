import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Bebas_Neue } from "next/font/google";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Background } from "@/components/layout/Background";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { CommandPalette } from "@/components/ui/CommandPalette";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://theug.vercel.app"),
  title: "theUG · AI & Automation Engineer",
  description:
    "Portfolio of theUG — building AI agents, automation tools, and experimental products. Enter the workspace.",
  keywords: ["AI", "Automation", "Developer", "Portfolio", "Next.js", "TypeScript", "Web3", "Smart Contracts", "Infrastructure", "Software Engineer"],
  authors: [{ name: "theUG" }],
  openGraph: {
    title: "theUG · AI & Automation Engineer",
    description: "Building intelligent systems. Enter the workspace.",
    url: "/",
    siteName: "theUG Portfolio",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "theUG Portfolio Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "theUG · AI & Automation Engineer",
    description: "Building intelligent systems. Enter the workspace.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalLoader />
        <div className="workspace-layout">
          <div className="crt-overlay" />
          <CustomCursor />
          <CommandPalette />
          <Background />
          <Sidebar />
          <TopBar />
          <main className="workspace-content relative z-10 pt-[94px] md:pt-[52px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
