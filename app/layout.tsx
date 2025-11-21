import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://your-production-url.com"), // Replace with your actual URL
  title: "Convex Next.js AI Chat App Template",
  description:
    "Next.js AI Chat App - Convex is the open-source reactive database for app developers.",
  openGraph: {
    title: "Convex Next.js AI Chat App",
    description: "Chat with an AI assistant powered by Convex and Next.js.",
    url: "https://your-production-url.com", // Replace with your actual URL
    siteName: "Convex Chat App",
    // Add an image URL for social media previews
    // images: [
    //   {
    //     url: 'https://your-production-url.com/og-image.png', // Must be an absolute URL
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convex Next.js AI Chat App",
    description: "Chat with an AI assistant powered by Convex and Next.js.",
    // images: ['https://your-production-url.com/og-image.png'], // Must be an absolute URL
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="fixed inset-0 z-[-2] bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
