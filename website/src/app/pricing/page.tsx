"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Check, Sparkles, X, ChevronRight,
  Shield, Clock
} from "lucide-react";

/* ─── Coming Soon overlay for payment ──────────────────────────────────── */
function PaymentComingSoon({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 space-y-6">
      <div className="h-16 w-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
        <Clock className="h-8 w-8 text-yellow-400" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-bold text-white">Payment Not Yet Available</p>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
          We're working on integrating a real payment gateway. Your Pro plan is currently active for testing.
        </p>
      </div>
      <button
        onClick={onClose}
        className="h-10 px-6 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors"
      >
        Continue with Free Access
      </button>
    </div>
  );
}

/* ─── Main Pricing Content ───────────────────────────────────────────────── */
function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, selectPlan } = useAppState();

  const [checkoutActive, setCheckoutActive] = useState(false);

  const getRedirectUrl = () => {
    const urlParam = searchParams.get("url") || searchParams.get("domain");
    return urlParam ? `/onboarding?url=${encodeURIComponent(urlParam)}` : "/onboarding";
  };

  const features = [
    "2 AI agents prospecting 24/7",
    "Up to 1,800 prospects contacted/month",
    "Warm leads sourced automatically",
    "Unified inbox",
    "Smart lead scoring + AI Copilot",
    "Email waterfall enrichment (15+ providers)",
    "CRM, API & MCP integrations",
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
              <div className="flex items-baseline mt-2 gap-1">
                <span className="text-2xl font-bold text-gray-400">₹</span>
                <span className="text-4xl font-extrabold text-white">1,299</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Your first AI sales rep. For founders and operators running their own outbound.</p>
            </div>

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  const urlParam = searchParams.get("url") || searchParams.get("domain");
                  router.push(urlParam ? `/signup?url=${encodeURIComponent(urlParam)}` : "/signup");
                } else {
                  selectPlan("pro");
                  router.push(getRedirectUrl());
                }
              }}
              className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all"
            >
              {isLoggedIn ? "Continue to Setup →" : "Try xyz for free →"}
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

      {/* ─── Checkout Modal ────────────────────────────────────────────── */}
      {checkoutActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setCheckoutActive(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a12] shadow-2xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pro Plan</p>
                  <p className="text-[9px] text-gray-500">xyz.ai · Monthly</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-white">₹1,299</span>
                <button onClick={() => setCheckoutActive(false)} className="p-1 text-gray-600 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <PaymentComingSoon onClose={() => { setCheckoutActive(false); selectPlan("pro"); }} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center text-gray-400">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
