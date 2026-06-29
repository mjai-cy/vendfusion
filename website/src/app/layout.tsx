import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xyz.ai | Your AI agent finds high intent leads and contacts them for you",
  description: "Enter your website. xyz.ai learns your business, identifies your best prospects, and runs multichannel outreach on LinkedIn and email automatically.",
  keywords: ["AI sales agent", "AI SDR", "B2B prospecting", "automated outreach", "lead generation", "LinkedIn outreach", "xyz.ai"],
  openGraph: {
    title: "xyz.ai - AI Sales Agent",
    description: "Your AI agent finds high intent leads and contacts them for you.",
    type: "website",
    url: "https://xyz.ai",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-bg text-gray-100 min-h-screen`}
      >
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
