"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { 
  Sparkles, Check, ArrowRight, Loader2, Globe, 
  RefreshCw, Cpu
} from "lucide-react";
import confetti from "canvas-confetti";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    runWebsiteScan, scanningInProgress, scanReport,
    updateWorkspaceName, isLoggedIn, plan
  } = useAppState();

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scanPercentage, setScanPercentage] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setWebsiteUrl(urlParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else if (plan !== "pro") {
      router.push("/pricing");
    }
  }, [isLoggedIn, plan, router]);

  const runScan = async (cleanUrl: string) => {
    setScanPercentage(5);
    setScanMessage("Analyzing your website...");
    const progressInterval = setInterval(() => {
      setScanPercentage((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 10) + 3;
      });
    }, 300);

    const messages = [
      "Reading your business model and ICP...",
      "Identifying products and services...",
      "Analyzing competitive positioning...",
      "Generating buyer profiles...",
      "Initializing your AI agent..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx++;
      if (msgIdx < messages.length) {
        setScanMessage(messages[msgIdx]);
      } else {
        clearInterval(msgInterval);
      }
    }, 800);

    try {
      await runWebsiteScan(cleanUrl);
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setScanPercentage(100);
      setScanMessage("Your AI agent is ready!");
      
      const domainName = cleanUrl.replace(/https?:\/\/(www\.)?/, "").split(".")[0];
      updateWorkspaceName(domainName.toUpperCase());
      
      setTimeout(() => {
        setCompleted(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setScanMessage("Scan failed. Please try again.");
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
            Gojiberry<span className="text-primary">.ai</span>
          </span>
        </Link>
        <span className="text-xs text-gray-500 font-mono">SETUP</span>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 mt-12">
        <div className="w-full max-w-md rounded-2xl border border-white/5 bg-dark-bg/60 p-8 glass-panel shadow-2xl space-y-6">

          {!completed && !scanReport && (
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
                </form>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Cpu className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-xs text-gray-400 font-medium">Setting up your agent...</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span>Progress</span>
                    <span>{scanPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${scanPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-300 font-mono animate-pulse">{scanMessage}</p>
                </div>
              )}
            </div>
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
