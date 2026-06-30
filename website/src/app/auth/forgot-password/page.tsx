"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Loader2, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || "Failed to send recovery email.");
      }
    } catch {
      setErrorMsg("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 border border-primary/40 mx-auto">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              We've sent a password recovery link to <strong className="text-white">{email}</strong>.
              Click the link to reset your password.
            </p>
            <p className="text-xs text-gray-500">Didn't receive the email? Check your spam folder or try again.</p>
            <Link href="/login" className="inline-block text-sm text-primary hover:underline font-semibold mt-4">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Link href="/login" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
              <p className="text-xs text-gray-400">Enter your email and we'll send you a recovery link.</p>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Email</label>
                <input type="email" placeholder="jane@company.com" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send recovery link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
