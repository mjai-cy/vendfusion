"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppState } from "@/context/AppStateContext";
import { 
  Globe, Sparkles, ArrowRight, Check, ChevronDown, Star
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, plan } = useAppState();
  const [urlInput, setUrlInput] = useState("");
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    
    if (isLoggedIn) {
      if (plan === "pro") {
        router.push(`/onboarding?url=${encodeURIComponent(targetUrl)}`);
      } else {
        router.push(`/pricing?url=${encodeURIComponent(targetUrl)}`);
      }
    } else {
      router.push(`/signup?url=${encodeURIComponent(targetUrl)}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemini AI & Apollo
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-4xl mx-auto leading-tight">
            Your AI agent finds{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              high intent leads
            </span>{" "}
            and contacts them for you.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-gray-400">
            Enter your website. We learn your business, identify your best prospects, and run multichannel outreach automatically.
            <br />
            <span className="text-primary font-semibold">It's like having a radar for high-intent prospects.</span>
          </p>

          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <span className="text-white font-bold">4.8/5</span>
          </div>

          <div className="mx-auto max-w-xl">
            <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              <div className="relative flex-grow flex items-center pl-3">
                <Globe className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Enter your website"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent border-0 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-2"
              >
                Launch my agent for free
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span>Free Trial</span>
            <span className="text-white/20">·</span>
            <span>Live in 5 minutes</span>
          </div>
        </div>
      </section>

      {/* ─── Power Stack Section ─────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 text-secondary uppercase tracking-wider">
              The Complete Outbound Stack
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              xyz.ai finds <span className="text-primary">who to contact</span>.{" "}
              Your stack handles <span className="text-secondary">the rest</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              xyz.ai is not trying to replace Apollo or lemlist — it fills the{" "}
              <strong className="text-white">"who to contact and when"</strong> gap that volume-based tools miss.
              Pair it with Clay and Instantly for a complete, intent-driven outbound engine.
            </p>
          </div>

          {/* Stack flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/30 via-yellow-500/30 to-blue-500/30 -translate-y-1/2 z-0" />

            {/* Step 1 — xyz.ai */}
            <div className="relative z-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <p className="font-extrabold text-primary">xyz.ai</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Step 1 · Signal Intelligence</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Monitors LinkedIn activity, funding rounds, job changes, and competitor follows in real time. Identifies warm, in-market prospects and scores them against your ICP.
              </p>
              <div className="space-y-1.5">
                {["Intent signal detection", "ICP scoring & qualification", "Personalised outreach drafts"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Running 24/7</span>
              </div>
            </div>

            {/* Step 2 — Clay */}
            <div className="relative z-10 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                </div>
                <div>
                  <p className="font-extrabold text-yellow-400">Clay</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Step 2 · Data Enrichment</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enriches xyz.ai's warm leads with verified emails, phone numbers, company data, and AI-researched personalisation from 150+ data sources.
              </p>
              <div className="space-y-1.5">
                {["Waterfall enrichment (150+ sources)", "Verified email & phone", "AI personalisation (Claygent)"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    {t}
                  </div>
                ))}
              </div>
              <a href="/integrations" className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
                Connect Clay →
              </a>
            </div>

            {/* Step 3 — Instantly */}
            <div className="relative z-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="font-extrabold text-blue-400">Instantly.ai</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Step 3 · Scale & Deliverability</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sends enriched, warm leads at scale with inbox-protecting warmup and spam prevention — ensuring every email lands in the primary inbox.
              </p>
              <div className="space-y-1.5">
                {["Unlimited email accounts", "Native warmup & spam protection", "Inbox-first delivery at scale"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {t}
                  </div>
                ))}
              </div>
              <a href="/integrations" className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Connect Instantly →
              </a>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <a
              href="/integrations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-white transition-all"
            >
              Set up your power stack
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 4-Step Feature Section */}
      <section className="py-24 bg-black/10 border-t border-white/5">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Your sales agent runs <span className="text-primary">24/7</span>. And gets <span className="text-secondary">better every week</span>.
            </h2>
            <p className="text-gray-400">
              From finding the right leads to sending the right message, your agent handles it all, automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              
              <button
                onClick={() => setActiveFeatureTab(0)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-3 ${
                  activeFeatureTab === 0
                    ? "bg-dark-bg border-primary/30 shadow-lg shadow-primary/5"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeFeatureTab === 0 ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-gray-500"
                  }`}>
                    1/4
                  </span>
                  <h3 className="text-base font-bold text-white">Finds &amp; scores your best leads first</h3>
                </div>
                {activeFeatureTab === 0 && (
                  <p className="text-gray-400 text-xs leading-relaxed font-sans pl-10">
                    Your agent detects buying &amp; social signals, scores every prospect against your ideal customer, and prioritizes the ones most likely to convert, before reaching out.
                  </p>
                )}
              </button>

              <button
                onClick={() => setActiveFeatureTab(1)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-3 ${
                  activeFeatureTab === 1
                    ? "bg-dark-bg border-primary/30 shadow-lg shadow-primary/5"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeFeatureTab === 1 ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-gray-500"
                  }`}>
                    2/4
                  </span>
                  <h3 className="text-base font-bold text-white">Only your best prospects. Nothing else.</h3>
                </div>
                {activeFeatureTab === 1 && (
                  <p className="text-gray-400 text-xs leading-relaxed font-sans pl-10">
                    Every lead is pre-filtered to match your ideal buyer profile. Your agent never wastes a message on someone who was never going to buy.
                  </p>
                )}
              </button>

              <button
                onClick={() => setActiveFeatureTab(2)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-3 ${
                  activeFeatureTab === 2
                    ? "bg-dark-bg border-primary/30 shadow-lg shadow-primary/5"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeFeatureTab === 2 ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-gray-500"
                  }`}>
                    3/4
                  </span>
                  <h3 className="text-base font-bold text-white">Multichannel outreach that books demos</h3>
                </div>
                {activeFeatureTab === 2 && (
                  <p className="text-gray-400 text-xs leading-relaxed font-sans pl-10">
                    Your agent reaches out via email and socials with AI personalized messages, coordinated automatically, no sequences to build.
                  </p>
                )}
              </button>

              <button
                onClick={() => setActiveFeatureTab(3)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-3 ${
                  activeFeatureTab === 3
                    ? "bg-dark-bg border-primary/30 shadow-lg shadow-primary/5"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    activeFeatureTab === 3 ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-gray-500"
                  }`}>
                    4/4
                  </span>
                  <h3 className="text-base font-bold text-white">Gets better every week</h3>
                </div>
                {activeFeatureTab === 3 && (
                  <p className="text-gray-400 text-xs leading-relaxed font-sans pl-10">
                    Your agent tracks what converts, adjusts automatically, and benchmarks your campaigns against top performers in your industry.
                  </p>
                )}
              </button>

              <div className="pt-4 pl-6">
                <button
                  onClick={() => router.push("/signup")}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-xs font-bold text-white transition-all shadow-md shadow-primary/20"
                >
                  Launch my agent for free
                </button>
              </div>

            </div>

            <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-dark-bg/60 p-6 min-h-[380px] flex items-center justify-center glass-panel shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 radial-glow pointer-events-none opacity-40" />

              {activeFeatureTab === 0 && (
                <div className="w-full max-w-md space-y-6 relative py-4">
                  <div className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-xl flex items-center justify-center animate-pulse">
                    <div className="h-full w-full bg-dark-bg rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary inline-block mr-1" />
                      Competitor engagement
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block mr-1" />
                      Follows your company
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block mr-1" />
                      Active in your space
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 1 && (
                <div className="w-full max-w-md space-y-3 font-sans text-xs">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Lead Intent Scores</span>
                  <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-black/30 overflow-hidden">
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] text-primary flex items-center justify-center font-bold">ET</div>
                        <div>
                          <p className="font-bold text-white text-xs">Emma Thompson</p>
                          <p className="text-[9px] text-gray-500">Marketing Director</p>
                        </div>
                      </div>
                      <span className="rounded bg-secondary/15 border border-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">94% Intent</span>
                    </div>
                    <div className="p-3 flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/5 text-[10px] text-gray-400 flex items-center justify-center font-bold">OG</div>
                        <div>
                          <p className="font-semibold text-gray-300 text-xs">Olivia Garcia</p>
                          <p className="text-[9px] text-gray-600">Customer Success Manager</p>
                        </div>
                      </div>
                      <span className="rounded bg-white/5 border border-white/15 px-1.5 py-0.5 text-[9px] text-gray-500">42% Low</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] text-primary flex items-center justify-center font-bold">AM</div>
                        <div>
                          <p className="font-bold text-white text-xs">Ava Martinez</p>
                          <p className="text-[9px] text-gray-500">UX Designer</p>
                        </div>
                      </div>
                      <span className="rounded bg-secondary/15 border border-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">93% Intent</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 2 && (
                <div className="w-full max-w-md space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    <span>Multichannel Outreach</span>
                    <span>LinkedIn + Email</span>
                  </div>
                  <div className="space-y-2">
                    <div className="border border-white/5 bg-black/40 rounded-lg p-3 space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase block font-semibold">LinkedIn Connection</span>
                      <p className="text-[10px] text-gray-300">Hi Emma, noticed you're growing your team at Acme. Would love to connect!</p>
                    </div>
                    <div className="border border-white/5 bg-black/40 rounded-lg p-3 space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase block font-semibold">Email Follow-up</span>
                      <p className="text-[10px] text-gray-300">Hey Emma — following up on my LinkedIn request. We've helped similar companies like yours increase pipeline by 40%.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 3 && (
                <div className="w-full max-w-lg grid grid-cols-3 gap-6 font-sans text-center">
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="h-28 w-full border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative">
                      <div className="flex gap-2 items-center">
                        <div className="h-3.5 w-3.5 rounded-full bg-primary" />
                        <div className="w-6 h-0.5 bg-gray-600" />
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Week 1</span>
                  </div>
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="h-28 w-full border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative">
                      <div className="relative h-12 w-12">
                        <span className="absolute top-0 left-0 h-3 w-3 bg-secondary rounded-full" />
                        <span className="absolute top-0 right-0 h-4.5 w-4.5 bg-secondary rounded-full" />
                        <span className="absolute bottom-0 left-4 h-3.5 w-3.5 bg-secondary rounded-full" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Week 3</span>
                  </div>
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="h-28 w-full border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative">
                      <div className="relative h-16 w-16">
                        <span className="absolute top-0 left-4 h-2 w-2 bg-accent rounded-full" />
                        <span className="absolute top-2 left-0 h-4 w-4 bg-accent rounded-full" />
                        <span className="absolute top-1 right-2 h-3.5 w-3.5 bg-accent rounded-full" />
                        <span className="absolute bottom-2 left-6 h-5 w-5 bg-accent rounded-full" />
                        <span className="absolute bottom-4 right-1 h-3 w-3 bg-accent rounded-full" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Week 5</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - 3 steps */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              3 minutes to set up. First results today.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-primary/30 font-mono">01</div>
              <h4 className="text-lg font-bold text-white">Connect</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                Enter your website. We read it and instantly understand what you sell, who you target, and how to pitch you. No manual set up needed.
              </p>
            </div>
            
            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-secondary/30 font-mono">02</div>
              <h4 className="text-lg font-bold text-white">Prospect</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                It detects buying signals, scores your best prospects, and starts contacting them across email and socials, automatically. Outbound that used to require a full team now runs with AI.
              </p>
            </div>

            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-accent/30 font-mono">03</div>
              <h4 className="text-lg font-bold text-white">Convert</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                You wake up to qualified leads already interested. Replies are already drafted. And your pipeline keeps growing in the background every single day. This is what sales was always supposed to feel like.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-8 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
            >
              Launch my agent for free
            </button>
          </div>
        </div>
      </section>


      {/* Integrations */}
      <section className="py-16 bg-black/20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 text-center space-y-8">
          <h2 className="text-2xl font-bold text-white">Works with the tools you already use.</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Connects natively with your CRM, Claude, and internal tools. No manual setup.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30">
            <span className="text-lg font-bold text-white tracking-widest">HUBSPOT</span>
            <span className="text-xl font-bold text-white tracking-widest">PIPEDRIVE</span>
            <span className="text-lg font-bold text-white tracking-widest">CLAUDE</span>
            <span className="text-xl font-bold text-white tracking-widest">SLACK</span>
            <span className="text-lg font-bold text-white tracking-widest">GMAIL</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white">Simple pricing for all your needs</h2>
            <p className="text-gray-400">Warm leads found. Multichannel campaigns deployed. All in 10 minutes.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-lg bg-primary/20 border-l border-b border-primary/30 px-3 py-1 text-[10px] font-bold text-primary tracking-wide uppercase">
                Most Popular
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-xl font-bold text-white">Pro</span>
                  <div className="flex items-baseline mt-2 gap-1">
                    <span className="text-2xl font-bold text-gray-400">₹</span>
                    <span className="text-4xl font-extrabold text-white">1,299</span>
                    <span className="ml-1 text-sm text-gray-500">/month</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Your first AI sales rep. For founders and operators running their own outbound.</p>
                </div>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all"
                >
                  Try xyz for free →
                </button>
                <div className="border-t border-white/5 pt-6 space-y-3">
                  <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">What's included</p>
                  <ul className="space-y-2.5">
                    {[
                      "2 AI agents prospecting 24/7",
                      "Up to 1,800 prospects contacted/month",
                      "Warm leads sourced automatically (signals + lookalikes)",
                      "Unified inbox",
                      "Smart lead scoring",
                      "AI Copilot mode",
                      "Email waterfall enrichment (15+ data providers)",
                      "CRM, API and MCP integrations (HubSpot, Pipedrive, Claude...)",
                      "Live chat support",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs">
                        <Check className="h-4 w-4 text-secondary shrink-0" />
                        <span className="text-gray-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How is xyz different from classic automation tools?",
                a: "Classic automation tools help you send more messages. xyz helps you decide who to contact, when to contact them, and what to say. Instead of uploading cold lists, writing generic sequences, and hoping volume turns into replies, xyz detects buying and social signals, matches prospects against your ICP, scores leads, and launches relevant LinkedIn and email outreach."
              },
              {
                q: "Is xyz only a LinkedIn automation tool?",
                a: "No. LinkedIn is one of the main channels xyz uses today, but xyz is an AI GTM Agent for outbound teams. It helps you find relevant prospects, detect buying and social signals, understand why each lead matters, prioritize who to contact first, write personalized LinkedIn and email messages, run multichannel outreach, and generate more qualified conversations."
              },
              {
                q: "How does xyz find high-intent leads?",
                a: "xyz monitors signals that suggest a prospect may be more relevant or more likely to engage. These include people engaging with your company or content, profile visits, company followers, engagement around competitors, job changes, hiring activity, lookalikes based on your best customers, and relevant activity inside your market."
              },
              {
                q: "What does the AI agent actually do?",
                a: "xyz's AI agents help you move from 'Who should we contact?' to 'These are the right people to reach now, and here is the best way to start the conversation.' The agents can find prospects based on your ICP, detect buying and social signals, enrich contacts, score and prioritize leads, generate personalized LinkedIn and email messages, and launch outreach workflows."
              },
              {
                q: "Is xyz safe for LinkedIn?",
                a: "Yes. xyz is built with account safety in mind. It uses human-like sending limits, smart pacing and delays, quality filters before outreach, warm intent-based targeting, and controlled daily activity. Because the focus is on relevant prospects instead of mass-volume outreach, activity stays safer and more natural."
              }
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-dark-bg/60 glass-panel overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${faqOpen[i] ? "rotate-180" : ""}`} />
                </button>
                {faqOpen[i] && (
                  <div className="border-t border-white/5 p-5 text-sm text-gray-400 leading-relaxed bg-black/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-y border-white/5">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Your next 10 customers are already out there.</h2>
          <p className="text-gray-400 text-sm">Let your agent find them.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span>Free Trial</span>
            <span className="text-white/20">·</span>
            <span>Live in 5 minutes</span>
          </div>
          <div className="pt-4">
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all gap-2"
            >
              Launch my agent for free
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
