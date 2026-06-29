"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Sparkles, ArrowRight, Loader2, Check } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppState();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setErrorMsg("");
    setSandboxOtp("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.mockOtp) {
          setSandboxOtp(data.mockOtp);
        }
        setOtpSent(true);
      } else {
        setErrorMsg(data.message || "Failed to send OTP verification email");
      }
    } catch (err) {
      setErrorMsg("Network connection error. Is the backend service online?");
    } finally {
      setLoading(false);
    }
  };

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
        login(email, name);
        
        const urlParam = searchParams.get("url") || searchParams.get("domain");
        let redirectUrl = "/pricing";
        if (urlParam) redirectUrl += `?url=${encodeURIComponent(urlParam)}`;
        
        router.push(redirectUrl);
      } else {
        setErrorMsg(data.message || "Invalid OTP code entered");
      }
    } catch (err) {
      setErrorMsg("Failed to verify OTP code. Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col md:flex-row overflow-hidden">
      <div className="relative w-full md:w-1/2 bg-black/40 border-r border-white/5 p-8 md:p-16 flex flex-col justify-between space-y-12">
        <div className="absolute inset-0 radial-glow z-0" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 group-hover:border-primary transition-all">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Gojiberry<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Your AI agent finds high intent leads and contacts them for you.
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your website. Gojiberry learns your business, identifies your best prospects, and runs multichannel outreach automatically.
          </p>

          <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>3-minute setup — just enter your website</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Detects 30+ buying signals automatically</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>AI writes and sends personalized LinkedIn + Email</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-1.5 items-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Backed by Y Combinator P26
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {otpSent ? "Verify your email" : "Create an account"}
            </h1>
            <p className="text-xs text-gray-400">
              {otpSent 
                ? (sandboxOtp 
                    ? `Your verification OTP code is: ${sandboxOtp}`
                    : `We've sent a 6-digit verification code to ${email}`
                  )
                : "Free trial. No credit card required."
              }
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                    Sending OTP code...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
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
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying OTP code...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-400 pt-1"
              >
                Back to registration details
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
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
