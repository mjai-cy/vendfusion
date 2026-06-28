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
  title: "XYZ.AI | Autonomous AI Sales Agent & Revenue Platform",
  description: "Automate outbound prospecting, find leads, enrich intelligence, verify email scans, and schedule customer meetings with XYZ.AI's complete Autonomous Company Brain.",
  keywords: ["AI sales agent", "B2B prospecting", "automated outreach", "website scanning", "Zoho CRM", "Apollo integration"],
  openGraph: {
    title: "XYZ.AI Revenue Platform",
    description: "Your Autonomous Sales Intelligence & Execution Engine.",
    type: "website",
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
