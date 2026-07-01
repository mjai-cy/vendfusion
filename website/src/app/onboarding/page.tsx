"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { 
  Sparkles, Check, ArrowRight, Loader2, Globe, 
  RefreshCw, Cpu, AlertCircle
} from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    runWebsiteScan, scanningInProgress, scanReport,
    updateWorkspaceName, isLoggedIn, plan, workspaces
  } = useAppState();

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [completed, setCompleted] = useState(false);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setWebsiteUrl(urlParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const runScan = async (cleanUrl: string) => {
    setScanError("");
    try {
      await runWebsiteScan(cleanUrl);
      
      const domainName = cleanUrl.replace(/https?:\/\/(www\.)?/, "").split(".")[0];
      updateWorkspaceName(domainName.toUpperCase());
      
      setCompleted(true);
    } catch (err: any) {
      setScanError(err.message || "Scan failed. Please check the URL and try again.");
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) return;
    let cleanUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }
    await runScan(cleanUrl);
  };

  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col pb-12 animate-fade-in">
      <header className="border-b border-white/5 bg-black/20 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            xyz<span className="text-primary">.ai</span>
          </span>
        </Link>
        <span className="text-xs text-gray-500 font-mono">SETUP</span>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 mt-12">
        <div className="w-full max-w-md rounded-2xl border border-white/5 bg-dark-bg/60 p-8 glass-panel shadow-2xl space-y-6">

          {workspaces.length >= 1 && plan !== "pro" ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Scan Limit Reached</h2>
                <p className="text-xs text-gray-400">
                  You can only have 1 active website scan on your current free plan. 
                  Please upgrade to a Pro plan to add and scan multiple websites.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg transition-all"
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            !completed && !scanReport && (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Launch your AI agent</h2>
                  <p className="text-xs text-gray-400">
                    Enter your website. We'll analyze your business and configure your agent.
                  </p>
                </div>

                {!scanningInProgress ? (
                  <form onSubmit={handleStart} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Website</label>
                      <input
                        type="text"
                        placeholder="https://company.com"
                        required
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg transition-all gap-2"
                    >
                      Launch my agent
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {scanError && (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300">{scanError}</p>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">Analyzing your website...</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">Scanning your business, finding leads, and configuring your AI agent</p>
                  </div>
                )}
              </div>
            )
          )}

          {completed && (
            <div className="py-8 space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                <Check className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Your agent is live!</h2>
                <p className="text-sm text-gray-400">
                  Your AI agent is now analyzing your ICP and searching for high-intent leads.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg transition-all gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
