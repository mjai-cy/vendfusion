"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Target, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-dark-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Founded by Mritunjay Kumar
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            xyz helps 2,000+ sales teams find high-intent leads and run multichannel outreach automatically.
          </p>
        </div>
      </header>

      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Why We Built xyz</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Sales teams spend hours every week building lists, guessing intent, enriching contacts, writing repetitive messages, and deciding who to contact next.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              xyz was built to change that. Instead of uploading cold lists and writing generic sequences, xyz detects buying signals, matches prospects against your ICP, and launches relevant LinkedIn and email outreach — automatically.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              The difference is simple: automation tools execute your outbound. xyz helps run it.
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-dark-bg/60 p-8 glass-panel space-y-6">
            <h4 className="text-sm font-bold text-white">What Makes Us Different</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Signal Intelligence</p>
                  <p className="text-[10px] text-gray-400">30+ buying and social signals to find prospects already showing intent.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Multichannel Outreach</p>
                  <p className="text-[10px] text-gray-400">AI-personalized LinkedIn and email, coordinated automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Gets Better Every Week</p>
                  <p className="text-[10px] text-gray-400">Tracks what converts and adjusts automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
