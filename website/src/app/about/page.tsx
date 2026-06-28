"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Users, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-dark-bg grid-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Pioneering Autonomous B2B Outreach
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            We are building the future of revenue operations where AI agents research prospects, write personalized messaging, sync logs, and book meetings securely.
          </p>
        </div>
      </header>

      {/* Philosophy */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Why We Built XYZ.AI</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Sales teams spend over 70% of their working hours on manual task alignments: researching lead social channels, copying contacts into databases, writing outreach templates, and pacing emails.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              XYZ.AI was engineered to solve this. By compiling a company's website data and documentation into a single secure vectors space, our platform gives you an autonomous agent that operates with full context of your brand.
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-dark-bg/60 p-8 glass-panel space-y-4">
            <h4 className="text-sm font-bold text-white">Our Engineering Core</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <Shield className="h-4.5 w-4.5 text-primary shrink-0" />
                <span><strong>Absolute Data Isolation:</strong> Your workspace logs are sandbox-protected and never shared for multi-tenant model training.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Users className="h-4.5 w-4.5 text-primary shrink-0" />
                <span><strong>Human-in-the-loop Controls:</strong> Choose Manual Mode to review every draft outreach prior to delivery.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
