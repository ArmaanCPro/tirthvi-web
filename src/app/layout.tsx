import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/auth/SessionProvider";
import LazyAnalytics from "@/components/lazy-analytics";
import { StructuredData } from "@/components/structured-data";
import { SkipLink } from "@/components/accessibility-utils";
import dynamic from "next/dynamic";

const Navigation = dynamic(() => import("@/components/navbar/navigation").then(mod => ({ default: mod.Navigation })) );

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SITE_URL!.toString() : "http://localhost:3000"),
  title: {
    default: "Tirthvi - Hindu Wisdom Hub",
    template: "%s | Tirthvi"
  },
  description: "Discover Hindu wisdom through our comprehensive calendar of sacred events, digital scripture library, and AI-powered spiritual guidance. Your gateway to ancient knowledge.",
  keywords: ["Hindu", "scriptures", "calendar", "festivals", "AI", "spiritual guidance", "Bhagavad Gita", "Vedas", "Upanishads"],
  alternates: {
      canonical: "/",
  },
  icons: {
      icon: [
          { url: '/tirthvi-icon.svg', type: 'image/svg+xml' },
          { url: '/favicon.ico', sizes: 'any' },
          { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',

  openGraph: {
      title: "Tirthvi - Hindu Wisdom Hub",
      description: "Discover Hindu wisdom through our comprehensive calendar of sacred events, digital scripture library, and AI-powered spiritual guidance.",
      images: [
          {
              url: "/android-chrome-512x512.png",
              width: 512,
              height: 512,
              alt: "Tirthvi - Hindu Wisdom Hub Logo",
          },
          {
              url: "/android-chrome-192x192.png",
              width: 192,
              height: 192,
              alt: "Tirthvi Logo",
          }
      ],
      type: "website",
      siteName: "Tirthvi",
      locale: "en_US",
  },

  twitter: {
      card: "summary_large_image",
      title: "Tirthvi - Hindu Wisdom Hub",
      description: "Discover Hindu wisdom through our comprehensive calendar of sacred events, digital scripture library, and AI-powered spiritual guidance.",
      images: ["/android-chrome-512x512.png"],
      creator: "@tirthvi",
  },
  other: {
      "msapplication-TileColor": "#111111",
      "msapplication-TileImage": "/android-chrome-192x192.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        >
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <StructuredData type="website" />
            <StructuredData type="organization" />
            <SessionProvider>
              <Navigation />
              <main id="main-content" className="min-h-screen" role="main">
                {children}
              </main>
            </SessionProvider>

          <LazyAnalytics />
          <Toaster />
        </body>
      </html>
  );
}
