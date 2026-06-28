"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Brain, Target, Database, Mail, BarChart3, Lock,
  CheckCircle, ArrowRight, Zap, RefreshCw, Cpu
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-primary" />,
      title: "AI Business Brain",
      description: "XYZ.AI crawls your public company pages, meta tags, and pricing descriptions to automatically register industry classification, product inventories, and service listings. No uploaded documents or configurations needed.",
      details: ["Continuous website monitoring", "ICP model builder", "Competitor matrix generation"]
    },
    {
      icon: <Target className="h-6 w-6 text-secondary" />,
      title: "Lead Intelligence",
      description: "Unlock pre-integrated B2B databases to search contacts, profiles, and key intelligence. Monitor indicators like job openings, software stack additions, and funding announcements to spot warm buying intent.",
      details: ["Apollo alignment", "Role & hierarchy sorting", "Social signal monitoring"]
    },
    {
      icon: <Database className="h-6 w-6 text-accent" />,
      title: "Built-In RAG Ingestion",
      description: "Replace Dropbox/Drive with our custom files uploader. Drop company PDFs, DOCX docs, spreadsheet catalogs, or text lists. The AI chunks, embeds, and loads vectors into a private database space.",
      details: ["pgvector secure storage", "Automated text extraction", "Contextual RAG querying"]
    },
    {
      icon: <Mail className="h-6 w-6 text-neon-purple" />,
      title: "Outreach Channels (LinkedIn & Email)",
      description: "Focuses heavily on multichannel paths. Generate structured, hyper-personalized messaging sequences across LinkedIn (connection invites, profile views, chat outreach) and Email (SMTP / Outlook), coordinated automatically to maximize demo booking rates.",
      details: ["LinkedIn connection & message automation", "Email SMTP / Outlook integration", "Multichannel conditional sequence steps"]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-yellow-500" />,
      title: "Revenue & AI Performance Analytics",
      description: "Track lead volumes, message open/reply rates, meeting counts, and deals synced. Filter by campaign or user to view performance graphs in one centralized portal.",
      details: ["Dynamic funnel reports", "Meeting calendars overview", "Limit consumption trackers"]
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-green-500" />,
      title: "Weekly AI Learning Loops",
      description: "Every Sunday, the learning engine collects performance metrics and customer preference ratings. It outputs a Weekly Improvement Report detailing recommended message revisions, ensuring outreach becomes smarter.",
      details: ["Approve/Reject flow", "Admin performance check", "Testing sandbox safety gates"]
    }
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg grid-bg">
      <Navbar />

      {/* Header */}
      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Core Modules
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Comprehensive Platform Features
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Everything your sales team needs to discover qualified accounts, construct personalized messaging, and automate booking meetings.
          </p>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-dark-bg/40 p-6 glass-panel glass-panel-hover flex flex-col justify-between">
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

      {/* Permissions and Safety */}
      <section className="py-20 bg-black/20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">AI Permissions & Safety Safeguards</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Our safety guardrails are hardcoded into the architecture to ensure absolute workspace security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Can do */}
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-6 space-y-4">
              <h4 className="text-base font-bold text-secondary flex items-center gap-2">
                <Cpu className="h-5 w-5" /> What the AI Can Do
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">•</span>
                  <span>Analyze public website metadata and crawl catalog structures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">•</span>
                  <span>Retrieve documents from the custom Knowledge Center.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">•</span>
                  <span>Process lead data from connected Zoho CRM / Apollo workspace syncs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">•</span>
                  <span>Generate outreach draft emails and send them in Autonomous Mode.</span>
                </li>
              </ul>
            </div>

            {/* Cannot do */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
              <h4 className="text-base font-bold text-red-400 flex items-center gap-2">
                <Lock className="h-5 w-5" /> What the AI Cannot Do
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Modify web application code, host servers, or configuration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Delete tables, databases, or primary keys.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Alter billing contracts or checkout parameters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Access private security tokens, secrets, or other customer vaults.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Start Building Your Revenue Agent</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Scan your website, choose your plan, and unlock your autonomous sales dashboard in minutes.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/scan"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover gap-1"
          >
            Start Website Scan
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 px-6 text-sm font-semibold text-white border border-white/10"
          >
            View Pricing Tiers
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
