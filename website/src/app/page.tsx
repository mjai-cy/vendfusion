"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppState } from "@/context/AppStateContext";
import { 
  Globe, Shield, Brain, Sparkles, Target, Zap, 
  ArrowRight, Check, Database, Bot, Users, Mail,
  ChevronDown, MessageSquare
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { runWebsiteScan, scanningInProgress, isLoggedIn } = useAppState();
  const [urlInput, setUrlInput] = useState("");
  const [demoState, setDemoState] = useState<"idle" | "scanning" | "finished">("idle");
  const [demoLog, setDemoLog] = useState("");
  const [demoProgress, setDemoProgress] = useState(0);

  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    // Normalize URL
    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    
    if (isLoggedIn) {
      router.push(`/onboarding?step=3&url=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(`/signup?url=${encodeURIComponent(targetUrl)}`);
    }
  };

  // Automated Interactive AI Demo Loop
  useEffect(() => {
    if (demoState !== "scanning") return;

    const logs = [
      "Connecting to public DNS routing...",
      "Extracting index HTML structure & meta descriptors...",
      "Identifying services catalogs: Cloud Storage, Automated Threat Inspection...",
      "Analyzing technology signature: Next.js, Vercel edge framework, Stripe Payments...",
      "Estimating Ideal Customer Profile (ICP): CTOs, VP of Security, Lead DevOps...",
      "Mapping competitor vectors: Cloudflare (34%), Datadog (18%), Snyk (12%)...",
      "Compiling final quality reports and generating embeddings..."
    ];

    let currentLogIndex = 0;
    setDemoProgress(5);
    setDemoLog(logs[0]);

    const progressInterval = setInterval(() => {
      setDemoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setDemoState("finished");
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        const next = prev + step;
        return next > 100 ? 100 : next;
      });
    }, 500);

    const logInterval = setInterval(() => {
      currentLogIndex++;
      if (currentLogIndex < logs.length) {
        setDemoLog(logs[currentLogIndex]);
      } else {
        clearInterval(logInterval);
      }
    }, 700);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [demoState]);

  const triggerDemo = () => {
    setDemoState("scanning");
  };

  return (
    <div className="relative min-h-screen bg-dark-bg overflow-x-hidden grid-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary animate-pulse-slow">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            XYZ.AI Revenue Platform (v1.0) is officially live
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-4xl mx-auto leading-tight">
            Turn Your Company Website Into An{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Autonomous AI Sales Agent
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-gray-400">
            Automatically scan your site, build your Company Brain, connect Apollo and Zoho CRM, and let the AI find qualified buyers and schedule meetings.
          </p>

          {/* Core Conversion Widget */}
          <div className="mx-auto max-w-xl">
            <form onSubmit={handleStartScan} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              <div className="relative flex-grow flex items-center pl-3">
                <Globe className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="https://yourcompany.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent border-0 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={scanningInProgress}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-2"
              >
                {scanningInProgress ? "Scanning AI..." : "Scan Free Website"}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-500">
              * One free website audit. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="border-y border-white/5 bg-black/20 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Engineered for high-performing revenue networks
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-50 transition-opacity">
            <span className="text-lg font-bold text-white tracking-widest">STRIPE</span>
            <span className="text-xl font-bold text-white tracking-widest">VERCEL</span>
            <span className="text-lg font-bold text-white tracking-widest">RETOOL</span>
            <span className="text-xl font-bold text-white tracking-widest">ZAPIER</span>
            <span className="text-lg font-bold text-white tracking-widest">LINEAR</span>
          </div>
        </div>
      </section>

      {/* Interactive AI Demo Dashboard Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Watch XYZ.AI Scan & Ingest in Real Time
            </h2>
            <p className="text-gray-400">
              See the simulated AI parsing engine extract products, structure ICP guidelines, and construct the Company Brain models instantly.
            </p>
          </div>

          {/* Interactive Console Screen */}
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-dark-bg/60 shadow-2xl overflow-hidden glass-panel">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex gap-1.5">
                <div className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
                <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
                <div className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-semibold text-gray-400 tracking-wider font-mono">
                XYZ-AI-SCANNER-DAEMON.sh
              </span>
              <div className="w-12" />
            </div>

            {/* Content area */}
            <div className="p-6 font-mono text-xs sm:text-sm min-h-[300px] flex flex-col justify-between">
              {demoState === "idle" && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                    <Bot className="h-8 w-8 text-primary animate-float" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-gray-300 font-semibold">Ready to run automated scan simulation</p>
                    <p className="text-xs text-gray-500">Targets mock parsing on `https://cloudflow.io` to isolate security and tech stack signals.</p>
                  </div>
                  <button
                    onClick={triggerDemo}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-4 font-semibold text-white border border-white/10 transition-all"
                  >
                    Launch Agent Simulation
                  </button>
                </div>
              )}

              {demoState === "scanning" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Task Ingestion Status:</span>
                    <span>{demoProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300 shadow-md shadow-primary/40"
                      style={{ width: `${demoProgress}%` }}
                    />
                  </div>
                  <div className="mt-6 border-t border-white/5 pt-4 space-y-2">
                    <p className="text-primary font-semibold">&gt; Executing scan protocol...</p>
                    <p className="text-gray-300 animate-pulse">{demoLog}</p>
                    <p className="text-gray-500 text-[11px]">&gt; PostgreSQL transaction open (pgvector embeddings generation active)</p>
                  </div>
                </div>
              )}

              {demoState === "finished" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-secondary">
                    <span>Scan Ingestion complete!</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-secondary/10 rounded-full h-1.5">
                    <div className="bg-secondary h-1.5 rounded-full shadow-md shadow-secondary/40" style={{ width: "100%" }} />
                  </div>
                  <div className="border border-secondary/20 bg-secondary/5 rounded-lg p-4 space-y-2 text-gray-300">
                    <p className="text-secondary font-semibold font-sans text-sm flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Company Brain Generated
                    </p>
                    <p className="text-xs text-gray-400">
                      Domain identified: `cloudflow.io`. Found 3 competitors. Generated 4 outreach sequences. Ready for CRM alignment.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      onClick={() => setDemoState("idle")}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      Reset Console
                    </button>
                    <Link
                      href="/scan"
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover gap-1"
                    >
                      Scan Custom Website
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Interactive Slide Deck matching Gojiberry) */}
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
            
            {/* Left Column: Vertical Accordion Selectors (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Slide 1 Selector */}
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
                  <h3 className="text-base font-bold text-white">Finds & scores your best leads first</h3>
                </div>
                {activeFeatureTab === 0 && (
                  <p className="text-gray-400 text-xs leading-relaxed font-sans pl-10">
                    Your agent detects buying & social signals, scores every prospect against your ideal customer, and prioritizes the ones most likely to convert, before reaching out.
                  </p>
                )}
              </button>

              {/* Slide 2 Selector */}
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

              {/* Slide 3 Selector */}
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

              {/* Slide 4 Selector */}
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

            {/* Right Column: Dynamic Mockup Display Panels (lg:col-span-7) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-dark-bg/60 p-6 min-h-[380px] flex items-center justify-center glass-panel shadow-2xl relative overflow-hidden">
              
              {/* Glow background */}
              <div className="absolute inset-0 radial-glow pointer-events-none opacity-40" />

              {/* Slide 1 Visual: Signal Ingestion Box */}
              {activeFeatureTab === 0 && (
                <div className="w-full max-w-md space-y-6 relative py-4">
                  {/* Central Box graphic representing ingestion */}
                  <div className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-xl flex items-center justify-center animate-pulse">
                    <div className="h-full w-full bg-dark-bg rounded-2xl flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  {/* Floating Tags */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary inline-block mr-1" />
                      Active in your space
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block mr-1" />
                      Follows your company
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-300 font-sans shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block mr-1" />
                      Competitor engagement
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 2 Visual: Mock Pre-filtered Leads */}
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
                      <span className="rounded bg-secondary/15 border border-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">
                        94% Intent
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/5 text-[10px] text-gray-400 flex items-center justify-center font-bold">OG</div>
                        <div>
                          <p className="font-semibold text-gray-300 text-xs">Olivia Garcia</p>
                          <p className="text-[9px] text-gray-600">Customer Success Manager</p>
                        </div>
                      </div>
                      <span className="rounded bg-white/5 border border-white/15 px-1.5 py-0.5 text-[9px] text-gray-500">
                        42% Low
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] text-primary flex items-center justify-center font-bold">AM</div>
                        <div>
                          <p className="font-bold text-white text-xs">Ava Martinez</p>
                          <p className="text-[9px] text-gray-500">UX Designer</p>
                        </div>
                      </div>
                      <span className="rounded bg-secondary/15 border border-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">
                        93% Intent
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3 Visual: Google Calendar Demo Board */}
              {activeFeatureTab === 2 && (
                <div className="w-full max-w-md space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    <span>Target Calendar</span>
                    <span>Week 28</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-white/5 bg-black/40 rounded-lg p-2.5 space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase block font-semibold">Monday</span>
                      <div className="rounded bg-secondary/15 border border-secondary/25 p-1.5 text-[10px] text-secondary font-semibold">
                        Intro Call <span className="block text-[8px] text-secondary/70">9:00 AM</span>
                      </div>
                    </div>
                    
                    <div className="border border-white/5 bg-black/40 rounded-lg p-2.5 space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase block font-semibold">Wednesday</span>
                      <div className="rounded bg-primary/15 border border-primary/25 p-1.5 text-[10px] text-primary font-semibold">
                        Demo XYZ.AI <span className="block text-[8px] text-primary/70">11:30 AM</span>
                      </div>
                    </div>

                    <div className="border border-white/5 bg-black/40 rounded-lg p-2.5 space-y-1">
                      <span className="text-[8px] text-gray-500 uppercase block font-semibold">Friday</span>
                      <div className="rounded bg-accent/15 border border-accent/25 p-1.5 text-[10px] text-accent font-semibold">
                        Proposal Sync <span className="block text-[8px] text-accent/70">2:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 4 Visual: Gets Better Every Week Graph */}
              {activeFeatureTab === 3 && (
                <div className="w-full max-w-lg grid grid-cols-3 gap-6 font-sans text-center">
                  
                  {/* Week 1 */}
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

                  {/* Week 3 */}
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="h-28 w-full border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative">
                      {/* Simple Node cluster */}
                      <div className="relative h-12 w-12">
                        <span className="absolute top-0 left-0 h-3 w-3 bg-secondary rounded-full" />
                        <span className="absolute top-0 right-0 h-4.5 w-4.5 bg-secondary rounded-full" />
                        <span className="absolute bottom-0 left-4 h-3.5 w-3.5 bg-secondary rounded-full" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Week 3</span>
                  </div>

                  {/* Week 5 */}
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="h-28 w-full border border-white/5 bg-black/20 rounded-xl flex items-center justify-center relative">
                      {/* Larger cluster */}
                      <div className="relative h-16 w-16">
                        <span className="absolute top-0 left-4 h-2 w-2 bg-accent rounded-full animate-ping" />
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

      {/* How It Works Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              How It Works
            </h2>
            <p className="text-gray-400">
              Outbound sales that used to require a full team, now running autonomously with AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Step 1 */}
            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-primary/30 font-mono">
                01
              </div>
              <h4 className="text-lg font-bold text-white">Enter your website</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                XYZ.AI reads your website and instantly understands what you sell, who you target, and how to pitch you. No manual set up needed.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-secondary/30 font-mono">
                02
              </div>
              <h4 className="text-lg font-bold text-white">Your agent finds your buyers</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                It detects buying signals, scores your best prospects, and starts contacting them across email and socials, automatically. Outbound that used to require a full team now runs with AI.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative bg-dark-bg/25 border border-white/5 p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-extrabold text-accent/30 font-mono">
                03
              </div>
              <h4 className="text-lg font-bold text-white">Demos land in your calendar</h4>
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

      {/* Free Website Scan Dedicated CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-y border-white/5">
        <div className="mx-auto max-w-5xl px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to inspect your company's AI Sales potential?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Input your URL below to view your Estimated ICP, Quality Score, Top Competitors, and AI Recommendations immediately.
          </p>
          <div className="mx-auto max-w-md">
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white transition-all gap-2"
            >
              Get Your Free Scan
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Approved by Modern Revenue Teams
            </h2>
            <p className="text-gray-400">
              See how companies leverage XYZ.AI to book qualified sales calls directly into calendar schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/5 bg-dark-bg p-6 glass-panel flex flex-col justify-between">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "Within 10 days of connecting our CRM and uploading our pricing deck to the Knowledge Center, XYZ.AI identified 45 warm prospects and booked 3 discovery meetings autonomously."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                  AK
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Arjun Kulkarni</h5>
                  <p className="text-[10px] text-gray-500">Co-founder, SecureStack.io</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/5 bg-dark-bg p-6 glass-panel flex flex-col justify-between">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "We set XYZ.AI to Manual Mode to review drafts first. The email personalizations based on intent signals were so clean that we switched it to fully Autonomous Mode. Lead booking rates jumped by 40%."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center font-bold text-secondary">
                  MC
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Marie Cunningham</h5>
                  <p className="text-[10px] text-gray-500">Head of Growth, FinScale</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/5 bg-dark-bg p-6 glass-panel flex flex-col justify-between">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "The Sunday optimization feedback loop is incredible. It isolates our learning weights, shows exactly what messages were rejected, and updates its target search algorithms on approval."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent">
                  DT
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Devon Taylor</h5>
                  <p className="text-[10px] text-gray-500">VP Operations, CloudHub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 bg-black/20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white">Simple, Predictable Pricing</h2>
            <p className="text-gray-400">Choose the volume limits and AI modules suited to your scale.</p>
          </div>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-8 text-sm font-semibold text-white shadow-lg transition-colors gap-2"
            >
              Explore Starter & Pro Tiers
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400">Clear context on limits, privacy sandboxes, and integrations.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does the Free AI website scan access our CRM or documents?",
                a: "No. The free website scanner parses only publicly available metadata, sitemaps, and domain registration listings. We do not access CRM pools, Apollo filters, or company files until a user chooses a plan and registers their secure keys."
              },
              {
                q: "What is the difference between Manual Mode and AI Mode?",
                a: "In **Manual Mode**, the AI finds target companies and writes custom draft emails, but waits for your manual click before sending. In **AI Mode** (autonomous agent), the agent searches, researches, sends outreach, schedules follow-ups, and books meetings automatically, notifying you of actions."
              },
              {
                q: "How does the built-in Knowledge Center vector base work?",
                a: "When you upload files (PDF, DOCX, etc.), our parsing microservices split the document into semantic text chunks, convert them into vector embeddings, and store them inside an isolated PostgreSQL pgvector instance schema linked only to your workspace."
              },
              {
                q: "What are the workspace and user limits for Starter and Pro?",
                a: "Starter includes 1 Workspace, 2 Users, 500 Lead searches/month, and 1,000 AI messages/month. Pro AI includes unlimited workspaces, users, lead searches, and campaigns, governed under our standard Fair Usage Policy."
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

      <Footer />
    </div>
  );
}
