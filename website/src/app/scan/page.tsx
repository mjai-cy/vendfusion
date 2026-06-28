"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppState } from "@/context/AppStateContext";
import { 
  Globe, Shield, Sparkles, Target, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, Loader2, Gauge, CheckCircle2
} from "lucide-react";

function ScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { runWebsiteScan, scanReport, scanningInProgress, plan, freeScanUsed, resetScan, isLoggedIn } = useAppState();
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Redirect guest to signup; auto‑run scan for logged‑in users
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && !isLoggedIn) {
      router.push(`/signup?url=${encodeURIComponent(urlParam)}`);
    } else if (urlParam && isLoggedIn) {
      // Clean and start scan automatically for authenticated users
      const clean = urlParam.trim();
      const normalized = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      setUrl(normalized);
      runWebsiteScan(normalized);
    }
  }, [searchParams, router, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    if (isLoggedIn) {
      // Directly start scan for authenticated users
      await runWebsiteScan(cleanUrl);
    } else {
      // Redirect guests to sign‑up preserving the URL
      router.push(`/signup?url=${encodeURIComponent(cleanUrl)}`);
    }
  };

  const handleUnlockBrain = () => {
    if (plan !== "none") {
      router.push("/dashboard");
    } else {
      router.push("/pricing");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      
      {/* State 1: Scanning In Progress */}
      {scanningInProgress && (
        <div className="mx-auto max-w-2xl py-20 text-center space-y-8">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 radial-glow blur-2xl opacity-50" />
            <Loader2 className="relative h-16 w-16 text-primary animate-spin" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">XYZ.AI Ingestion Agent Active</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Analyzing sitemap structures, extracting service details, indexing competitor profiles, and generating vector models.
            </p>
          </div>
          {/* Step-by-step progress logging */}
          <div className="mx-auto max-w-md rounded-xl border border-white/5 bg-black/30 p-4 font-mono text-xs text-left text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span>Domain:</span>
              <span className="text-gray-300">{url}</span>
            </div>
            <div className="border-t border-white/5 pt-2 space-y-1.5">
              <div className="text-primary">&gt; Scraping public index file...</div>
              <div>&gt; Extracting keywords & meta headers...</div>
              <div>&gt; Mapping target competitor metrics...</div>
              <div>&gt; Running pgvector text-embeddings transformations...</div>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Input Screen (No report, not scanning) */}
      {!scanningInProgress && !scanReport && (
        <div className="mx-auto max-w-3xl py-12 space-y-10 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Free Sales Assessment Scanner
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Analyze Your Company's Outbound Strategy
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Scan public pages to extract target customer profiles, find competitors, and assess AI campaign readiness. No upload needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto max-w-xl flex flex-col sm:flex-row gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
            <div className="relative flex-grow flex items-center pl-3">
              <Globe className="h-5 w-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="https://yourcompany.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent border-0 text-white text-sm placeholder-gray-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white transition-all"
            >
              Scan Now
            </button>
          </form>

          {errorMessage && (
            <div className="mx-auto max-w-md rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3 text-left">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-red-300">Scan Gated</p>
                <p className="text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* State 3: Render Free Assessment Report */}
      {!scanningInProgress && scanReport && (
        <div className="space-y-10">
          {/* Header info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                <ShieldCheck className="h-4 w-4" /> Public Analysis Complete
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Free Assessment: {scanReport.companyName}
              </h1>
              <p className="text-xs text-gray-400">
                Target domain: <span className="text-primary font-mono">{scanReport.domain}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetScan}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Reset Analysis
              </button>
              <button
                onClick={handleUnlockBrain}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all gap-1.5 group"
              >
                Unlock Complete AI Company Brain
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section 1: Business Summary & Industry */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Business Summary
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {scanReport.businessSummary}
                </p>
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-400 font-semibold">Industry classification:</span>
                  <span className="text-primary">{scanReport.industry}</span>
                </div>
              </div>

              {/* Section 2: Products & Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-3">
                  <h4 className="text-sm font-bold text-white">Identified Products</h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {(scanReport.products || []).map((prod, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{prod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-3">
                  <h4 className="text-sm font-bold text-white">Identified Services</h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {(scanReport.services || []).map((serv, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{serv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 3: Estimated ICP */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" /> Estimated Ideal Customer Profile (ICP)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400">Target Industries</p>
                    <p className="text-gray-200">{(scanReport.estimatedICP?.industries || []).join(", ")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400">Target Job Titles</p>
                    <p className="text-gray-200">{(scanReport.estimatedICP?.targetRoles || []).join(", ")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400">Target Sizes</p>
                    <p className="text-gray-200">{(scanReport.estimatedICP?.companySizes || []).join(", ")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-400">Identified Pain Points</p>
                    <p className="text-gray-200">{(scanReport.estimatedICP?.painPoints || []).join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Top Competitors */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-4">
                <h3 className="text-lg font-bold text-white">Estimated Competitor Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 pb-2 text-gray-500 font-semibold">
                        <th className="py-2">Competitor</th>
                        <th className="py-2">Domain</th>
                        <th className="py-2 text-right">Estimated Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {(scanReport.topCompetitors || []).map((comp, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-semibold text-white">{comp.name}</td>
                          <td className="py-2.5 text-primary">{comp.website}</td>
                          <td className="py-2.5 text-right text-secondary">{comp.marketShare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar Gauges */}
            <div className="space-y-6">
              
              {/* Website Score */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel text-center space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Website Quality Score</h4>
                <div className="relative flex justify-center py-2">
                  <div className="text-5xl font-extrabold text-white">
                    {scanReport.websiteQualityScore}
                    <span className="text-lg font-semibold text-gray-600">/100</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  Calculated based on caching response delay, meta tag density, and mobile typography alignment.
                </p>
              </div>

              {/* AI Readiness Score */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel text-center space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">AI Campaign Readiness</h4>
                <div className="relative flex justify-center py-2">
                  <div className="text-5xl font-extrabold text-secondary">
                    {scanReport.aiReadinessScore}
                    <span className="text-lg font-semibold text-gray-600">/100</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  Measures availability of contextual customer case reviews and explicit pricing variables required for AI personalization.
                </p>
              </div>

              {/* Basic Recommendations */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Optimizations</h4>
                <ul className="space-y-3 text-xs text-gray-300">
                  {(scanReport.basicRecommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ingestion block */}
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-6 glass-panel space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Company Brain Ingestion</h4>
                <div className="rounded border border-white/5 bg-black/40 p-3 space-y-2 text-[10px] font-mono text-gray-500">
                  <div className="flex items-center justify-between text-primary">
                    <span>Ingestion Modules</span>
                    <span>Embeddings</span>
                  </div>
                  <div className="border-t border-white/5 pt-1.5 space-y-1">
                    <div className="flex justify-between">
                      <span>[Website parser]</span>
                      <span className="text-secondary">active (512d)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>[Apollo Database]</span>
                      <span>locked</span>
                    </div>
                    <div className="flex justify-between">
                      <span>[Zoho CRM]</span>
                      <span>locked</span>
                    </div>
                    <div className="flex justify-between">
                      <span>[Knowledge files]</span>
                      <span>locked</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleUnlockBrain}
                  className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white transition-colors"
                >
                  Unlock Ingestors
                </button>
              </div>

            </div>

          </div>

          {/* Bottom Warning Alert */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-4 max-w-4xl mx-auto">
            <h4 className="text-base font-bold text-white">Unlock Your Complete AI Company Brain</h4>
            <p className="text-xs text-gray-400 max-w-xl mx-auto">
              By purchasing a subscription, the AI will connect Apollo for contact enrichment, link Zoho CRM to synchronize deals, and ingest company collateral (PDF, DOCX, TXT) into isolated vector tables.
            </p>
            <button
              onClick={handleUnlockBrain}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-semibold text-white shadow-lg transition-colors gap-2"
            >
              Proceed to Dashboard Creation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </main>
  );
}

export default function ScannerPage() {
  return (
    <div className="relative min-h-screen bg-dark-bg grid-bg">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }>
        <ScannerContent />
      </Suspense>
      <Footer />
    </div>
  );
}
