import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Navigation } from "@/components/navigation";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import ClerkClientProvider from "@/components/clerk/ClerkProviderLazy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SITE_URL!.toString() : "http://localhost:3000"),
  title: "Tirthvi - Hindu Wisdom Hub",
  description: "A digital hub and AI tool for Hindu wisdom, philosophy, and scripture",
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
      description: "A digital hub and AI tool for Hindu wisdom, philosophy, and scripture",
      images: [
          {
              url: "/android-chrome-512x512.png",
              width: 512,
              height: 512,
              alt: "Tirthvi Logo",
          },
          {
              url: "/android-chrome-192x192.png",
              width: 192,
              height: 192,
              alt: "Tirthvi Logo",
          }
      ],
      type: "website",
  },

  twitter: {
      card: "summary",
      title: "Tirthvi - Hindu Wisdom Hub",
      description: "A digital hub and AI tool for Hindu wisdom, philosophy, and scripture",
      images: ["/android-chrome-512x512.png"],
  },
  other: {
      "msapplication-TileColor": "#111111",
      "msapplication-TileImage": "/android-chrome-192x192.png",
  }
};

export const dynamic = "force-static";

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
          <ClerkClientProvider>
              <Navigation />
              <main className="min-h-screen">
                {children}
              </main>
          </ClerkClientProvider>

          <Analytics />
          <SpeedInsights />
          <Toaster />
        </body>
      </html>
  );
}
