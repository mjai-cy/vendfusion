"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Globe, ArrowRight, Zap, Target, Users, ChevronRight, Check } from "lucide-react";

interface Persona {
  name: string;
  role: string;
  company: string;
  pain: string;
  hook: string;
  signals: string[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

const SIGNAL_COLORS = [
  "bg-primary/10 border-primary/20 text-primary",
  "bg-secondary/10 border-secondary/20 text-secondary",
  "bg-accent/10 border-accent/20 text-accent",
];

export default function PersonaPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setPersonas([]);
    setDone(false);

    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;

    try {
      const res = await fetch(`${BACKEND_URL}/scan/persona`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data.success && data.personas?.length) {
        setPersonas(data.personas);
        setDone(true);
      } else {
        setError(data.message || "Failed to generate personas. Please try again.");
      }
    } catch (err: any) {
      setError("Could not connect to the AI engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            Free AI Tool — No account required
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
            Enter your website.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Get 3 AI-generated
            </span>{" "}
            customer personas.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400">
            xyz.ai analyzes your website in seconds and generates your 3 best-fit customer personas — complete with pain points, outreach hooks, and buying signals.
            <br />
            <span className="text-primary font-semibold">Free. No signup. Powered by Gemini AI.</span>
          </p>

          {/* Input form */}
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              <div className="relative flex-grow flex items-center pl-3">
                <Globe className="h-5 w-5 text-gray-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent border-0 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Generate Personas
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="mx-auto max-w-md space-y-3 pt-4">
              {["Fetching website content...", "Analyzing with Gemini AI...", "Generating ICP personas..."].map((step, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  <span className="text-[11px] text-gray-400">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Persona Results */}
      {done && personas.length > 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 text-secondary uppercase tracking-wider">
                <Check className="h-3 w-3" />
                AI Analysis Complete
              </div>
              <h2 className="text-2xl font-bold text-white">Your 3 Best-Fit Customer Personas</h2>
              <p className="text-sm text-gray-400">Based on real analysis of your website content</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {personas.map((persona, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-dark-bg/60 backdrop-blur-sm p-6 space-y-5 hover:border-primary/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{persona.name}</p>
                      <p className="text-xs text-primary font-semibold">{persona.role}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{persona.company}</p>
                    </div>
                  </div>

                  {/* Pain point */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-3 w-3" /> Pain Point
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">{persona.pain}</p>
                  </div>

                  {/* Outreach hook */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-secondary" /> Outreach Hook
                    </p>
                    <div className="rounded-lg border border-secondary/15 bg-secondary/5 px-3 py-2.5">
                      <p className="text-[11px] text-secondary leading-relaxed italic">"{persona.hook}"</p>
                    </div>
                  </div>

                  {/* Buying signals */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Buying Signals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.signals?.map((signal, j) => (
                        <span
                          key={j}
                          className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${SIGNAL_COLORS[j % SIGNAL_COLORS.length]}`}
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
              <Sparkles className="h-8 w-8 text-primary mx-auto" />
              <h3 className="text-xl font-bold text-white">Ready to find real leads matching these personas?</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                xyz.ai automatically scans LinkedIn and the web for prospects matching your exact ICP and contacts them for you — 24/7.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-lg shadow-primary/20"
              >
                Launch my AI agent <ChevronRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-gray-500">Setup takes 2 minutes</p>
            </div>
          </div>
        </section>
      )}

      {/* How it works (shown when no results yet) */}
      {!done && !loading && (
        <section className="py-16 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { step: "1", icon: <Globe className="h-5 w-5 text-primary" />, title: "Enter your website", desc: "Just paste your URL — no signup, no credit card" },
                { step: "2", icon: <Sparkles className="h-5 w-5 text-secondary" />, title: "Gemini AI analyzes it", desc: "Our AI reads your website content and understands your product" },
                { step: "3", icon: <Users className="h-5 w-5 text-accent" />, title: "Get 3 ICP personas", desc: "Detailed personas with pain points, outreach hooks, and buying signals" },
              ].map((item) => (
                <div key={item.step} className="space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                    {item.icon}
                  </div>
                  <p className="font-bold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
