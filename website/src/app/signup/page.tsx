"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Shield, ArrowRight, Loader2, Sparkles, Check } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppState();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setTimeout(() => {
      login(email, name);
      setLoading(false);
      
      const planParam = searchParams.get("plan");
      const urlParam = searchParams.get("url") || searchParams.get("domain");
      
      let redirectUrl = "/onboarding?step=1";
      if (planParam) redirectUrl += `&plan=${planParam}`;
      if (urlParam) redirectUrl += `&url=${encodeURIComponent(urlParam)}`;
      
      router.push(redirectUrl);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col md:flex-row overflow-hidden grid-bg">
      {/* Sidebar Info - Left */}
      <div className="relative w-full md:w-1/2 bg-black/40 border-r border-white/5 p-8 md:p-16 flex flex-col justify-between space-y-12">
        <div className="absolute inset-0 radial-glow z-0" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 group-hover:border-primary transition-all">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              XYZ<span className="text-primary">.AI</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Deploy your autonomous prospecting engine
          </h2>
          <p className="text-gray-400 text-sm">
            XYZ.AI reads your product documents, maps competitor strengths, filters lead signals, and writes hyper-targeted copy.
          </p>

          <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Isolated secure pgvector sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Full control via Manual or Autonomous Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>900M+ lead database with real-time CRM pipeline sync</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-1.5 items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          XYZ.AI Revenue Security Verified
        </div>
      </div>

      {/* Form Area - Right */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create an account</h1>
            <p className="text-xs text-gray-400">
              Sign up in under 2 minutes. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Email</label>
              <input
                type="email"
                placeholder="jane@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link 
              href={
                searchParams.get("url") || searchParams.get("domain")
                  ? `/login?url=${encodeURIComponent(searchParams.get("url") || searchParams.get("domain") || "")}`
                  : "/login"
              } 
              className="text-primary hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
