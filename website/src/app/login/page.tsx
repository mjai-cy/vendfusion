"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppState();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const redirectAfterLogin = () => {
    const urlParam = searchParams.get("url") || searchParams.get("domain");
    if (urlParam) {
      router.push(`/onboarding?url=${encodeURIComponent(urlParam)}`);
    } else {
      router.push("/dashboard");
    }
  };

  // ─── Password login ──────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(email, data.name || email.split("@")[0]);
        redirectAfterLogin();
      } else {
        setErrorMsg(data.message || "Invalid email or password");
      }
    } catch {
      setErrorMsg("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP login: send OTP ─────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
      }
    } catch {
      setErrorMsg("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP login: verify OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        login(email, data.name || email.split("@")[0]);
        redirectAfterLogin();
      } else {
        setErrorMsg(data.message || "Invalid OTP code entered");
      }
    } catch {
      setErrorMsg("Failed to verify OTP code. Connection error.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared redirect helper (after successful login/verify) ───────────────

  return (
    <div className="w-full max-w-sm space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {otpSent ? "Verify your identity" : "Welcome back"}
        </h1>
        <p className="text-xs text-gray-400">
          {otpSent
            ? `We've sent a 6-digit verification code to ${email}`
            : "Sign in to manage your AI agent."
          }
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {otpSent ? (
        // ─── OTP verification form ──────────────────────────────────────────
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification OTP Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary text-center font-mono text-lg tracking-widest transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verifying OTP code...</>
            ) : (
              <>Verify & Log In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-400 pt-1"
          >
            Back to login details
          </button>
        </form>
      ) : useOtp ? (
        // ─── OTP login form ─────────────────────────────────────────────────
        <form onSubmit={handleSendOtp} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP code...</>
            ) : (
              <>Send OTP <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          <button
            type="button"
            onClick={() => setUseOtp(false)}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-400 pt-1"
          >
            Sign in with password instead
          </button>
        </form>
      ) : (
        // ─── Password login form ────────────────────────────────────────────
        <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
            ) : (
              <>Log In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          <button
            type="button"
            onClick={() => setUseOtp(true)}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-400 pt-1"
          >
            Sign in with OTP instead
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-500">
        Don't have an account yet?{" "}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col md:flex-row overflow-hidden grid-bg">
      
      {/* Sidebar Info - Left */}
      <div className="relative w-full md:w-1/2 bg-black/40 border-r border-white/5 p-8 md:p-16 flex flex-col justify-between space-y-12">
        <div className="absolute inset-0 radial-glow z-0" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 group-hover:border-primary transition-all">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              xyz<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          <h2 className="text-2xl font-extrabold text-white leading-tight">
            Your AI agent finds high intent leads and contacts them for you.
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            Enter your website. xyz learns your business, identifies your best prospects, and runs multichannel outreach automatically.
          </p>
        </div>

        <div className="relative z-10 flex gap-1.5 items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Backed by Y Combinator P26
        </div>
      </div>

      {/* Form Area - Right */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <Suspense fallback={<div className="text-xs text-gray-500 font-mono">Syncing credentials...</div>}>
          <LoginForm />
        </Suspense>
      </div>

    </div>
  );
}
