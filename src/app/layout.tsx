import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "@/styles/globals.css";
import { Navigation } from "@/components/navigation";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tirthvi - Hindu Wisdom Hub",
  description: "Discover Hindu philosophy, calendar events, scriptures, and AI-powered wisdom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      theme: dark,
    }}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        >
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
