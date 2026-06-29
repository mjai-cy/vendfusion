"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, Sparkles } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  const features = [
    "2 AI agents prospecting 24/7",
    "Up to 1,800 prospects contacted/month, more available",
    "Warm leads sourced automatically (signals + lookalikes)",
    "Unified inbox",
    "Smart lead scoring",
    "AI Copilot mode",
    "Email waterfall enrichment (15+ data providers)",
    "CRM, API and MCP integrations (HubSpot, Pipedrive, Claude...)",
    "Live chat support",
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Simple pricing for all your needs
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Warm leads found. Multichannel campaigns deployed. All in 10 minutes.
          </p>
        </div>
      </header>

      <section className="py-12 max-w-lg mx-auto px-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 rounded-bl-lg bg-primary/20 border-l border-b border-primary/30 px-3 py-1 text-[10px] font-bold text-primary tracking-wide uppercase">
            Most Popular
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline mt-2">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Your first AI sales rep. For founders and operators running their own outbound.</p>
            </div>

            <button
              onClick={() => router.push("/signup")}
              className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all"
            >
              Try Gojiberry for free →
            </button>

            <div className="border-t border-primary/10 pt-6 space-y-3">
              <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">What's included</p>
              <ul className="space-y-2.5">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <Check className="h-4 w-4 text-secondary shrink-0" />
                    <span className="text-gray-300">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-dark-bg/40 p-6 text-center glass-panel">
          <h3 className="text-base font-bold text-white">Need a custom plan?</h3>
          <p className="text-xs text-gray-400 mt-1">For sales teams (5+) &amp; outbound agencies looking to scale.</p>
          <button
            onClick={() => router.push("/contact")}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-5 text-xs font-semibold text-white border border-white/10 transition-colors"
          >
            Get a demo →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
