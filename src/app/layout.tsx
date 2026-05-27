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
  metadataBase: new URL("https://theug.vercel.app"),
  title: "theUG — Usmaan Gani | AI Engineer • Web3 Builder • Developer",
  description:
    "Official portfolio of Usmaan Gani (theUG), independent AI engineer, Web3 developer, automation builder, blockchain researcher and creative technologist from Jharkhand, India.",

  keywords: [
    "theug",
    "usmaan gani",
    "usmaan gani ranchi",
    "usmaan gani bokaro",
    "usmaan gani chandrapura",
    "ai engineer",
    "web3 developer",
    "automation engineer",
    "blockchain developer india",
    "portfolio website",
    "crypto developer",
    "full stack developer",
    "independent builder",
    "solana developer",
    "ethereum developer",
    "base builder",
    "web3 portfolio",
  ],

  authors: [{ name: "Usmaan Gani" }],

  creator: "Usmaan Gani",
  publisher: "theUG",

  verification: {
    google: "e-Cmx8JGxYclrwrIZoq7cFX1g5WjEXCKwfWccsUWb8o",
  },

  openGraph: {
    title: "theUG — Usmaan Gani",
    description:
      "AI Engineer • Web3 Builder • Independent Developer",
    url: "https://theug.vercel.app",
    siteName: "theUG",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "theUG — Usmaan Gani",
    description:
      "AI Engineer • Web3 Builder • Independent Developer",
    images: ["/og-banner.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Usmaan Gani",
              alternateName: "theUG",
              url: "https://theug.vercel.app",
              image: "https://theug.vercel.app/profile.png",
              sameAs: [
                "https://x.com/Usmaangani252",
                "https://github.com/TheUGultimatum",
                "https://www.linkedin.com/in/usmaan-gani/"
              ],
              jobTitle: "AI Engineer & Web3 Developer",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Ranchi",
                addressRegion: "Jharkhand",
                addressCountry: "India"
              }
            }),
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
