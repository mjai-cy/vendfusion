"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, Check, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

  const accessToken = searchParams.get("accessToken") || "";
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch {
      setErrorMsg("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8 animate-fade-in">
      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 border border-primary/40 mx-auto">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Password updated</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your password has been reset successfully.
          </p>
          <Link href="/login"
            className="inline-flex items-center justify-center gap-1.5 mt-4 px-6 h-10 rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
            <p className="text-xs text-gray-400">Enter a new password for your account.</p>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">{errorMsg}</div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Password</label>
              <input type="password" placeholder="••••••••" required minLength={6} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : "Reset password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
      <Suspense fallback={<div className="text-xs text-gray-500 font-mono">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
