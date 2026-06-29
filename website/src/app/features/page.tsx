"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Target, Sparkles, Mail, BarChart3, RefreshCw, Cpu,
  CheckCircle, ArrowRight, Zap, Users, Shield, Search
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "Signal-Based Lead Generation",
      description: "Your agent monitors 30+ buying and social signals including competitor engagement, job changes, hiring activity, funding events, and profile visits. It finds prospects who are already showing intent.",
      details: ["30+ intent signals monitored", "Competitor engagement tracking", "Job change & hiring detection"]
    },
    {
      icon: <Users className="h-6 w-6 text-secondary" />,
      title: "Smart Lead Scoring & ICP Filtering",
      description: "Every lead is automatically scored against your ideal customer profile. Only the best prospects make it through — your agent never wastes a message on someone who was never going to buy.",
      details: ["Pre-filtered to match your ICP", "Intent-based scoring (0-100%)", "Automatic prioritization"]
    },
    {
      icon: <Mail className="h-6 w-6 text-accent" />,
      title: "Multichannel Outreach",
      description: "AI-personalized messages across LinkedIn and email, coordinated automatically. No sequences to build. Your agent decides the right channel, at the right time, with the right context.",
      details: ["LinkedIn connection & messages", "Email follow-ups", "No manual sequences needed"]
    },
    {
      icon: <Cpu className="h-6 w-6 text-neon-purple" />,
      title: "AI Copilot & Auto Mode",
      description: "Full auto or approve before it sends. Choose Manual Mode to review every draft, or Autonomous Mode and let your agent run outreach 24/7. AI drafts every reply for you.",
      details: ["Manual review mode", "Autonomous 24/7 mode", "AI-drafted replies"]
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-green-500" />,
      title: "Gets Better Every Week",
      description: "Your agent tracks what converts, adjusts messaging automatically, and benchmarks your campaigns against top performers in your industry. The system gets smarter over time.",
      details: ["Weekly learning loops", "Automatic message optimization", "Performance benchmarking"]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-yellow-500" />,
      title: "Email Waterfall Enrichment",
      description: "15+ data providers to find the best contact information for every lead. Automatic enrichment ensures you always reach the right person at the right company.",
      details: ["15+ enrichment providers", "Automatic contact discovery", "Real-time verification"]
    }
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Core Modules
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            One agent. Replaces your entire outreach stack.
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Stop paying for tools that don't talk to each other. Gojiberry handles it end to end, for a fraction of the price.
          </p>
        </div>
      </header>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-dark-bg/40 p-6 glass-panel flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                {feat.details.map((det, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>{det}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-black/20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Built to run your entire outreach.</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Your agent handles everything from lead research to booked meetings, so your team shows up only to close.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Lead Generation", desc: "Finds & prioritizes your best prospects", icon: <Target className="h-5 w-5" /> },
              { title: "Outreach", desc: "Human-quality messages at scale", icon: <Mail className="h-5 w-5" /> },
              { title: "Learning", desc: "It gets better every week", icon: <RefreshCw className="h-5 w-5" /> },
              { title: "Control", desc: "Full auto or approve before it sends", icon: <Shield className="h-5 w-5" /> },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 text-center space-y-3 glass-panel">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 mx-auto text-primary">
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your next 10 customers are already out there.</h2>
        <p className="text-gray-400 text-sm">Let your agent find them.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover gap-1"
          >
            Launch my agent for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
