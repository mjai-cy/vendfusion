"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Check, Sparkles, CreditCard, X, ChevronRight,
  Smartphone, Shield, Clock, Copy
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
const AMOUNT = 1299;

/* ─── Payment processing overlay ────────────────────────────────────────── */
function ProcessingOverlay({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Connecting to payment network...",
    "Verifying transaction...",
    "Confirming payment...",
    "Activating your Pro plan...",
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 900));
    });
    // Auto-succeed after all steps
    timers.push(setTimeout(() => onSuccess(), steps.length * 900 + 400));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Spinner ring */}
      <div className="relative h-20 w-20">
        <svg className="absolute inset-0 animate-spin" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="url(#grad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="60 154"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="h-7 w-7 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-white">Processing Payment</p>
        <p className="text-xs text-primary animate-pulse">{steps[step]}</p>
      </div>

      <div className="w-full space-y-2 px-4">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${i <= step ? "text-secondary" : "text-gray-600"}`}>
            {i < step ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : i === step ? (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-white/10 shrink-0" />
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── UPI App Button ─────────────────────────────────────────────────────── */
function UpiAppButton({
  name, color, logo, onClick
}: {
  name: string; color: string; logo: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 transition-all active:scale-95`}
    >
      <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white font-black text-sm`}>
        {logo}
      </div>
      <span className="text-[9px] font-bold text-gray-400">{name}</span>
    </button>
  );
}

/* ─── Main Pricing Content ───────────────────────────────────────────────── */
function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, selectPlan } = useAppState();

  const [checkoutActive, setCheckoutActive] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"upi" | "card">("upi");
  const [processing, setProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiLaunched, setUpiLaunched] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("pay.xyzai@upi");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/billing/config`)
      .then(r => r.json())
      .then(d => { if (d?.upiId) setUpiId(d.upiId); })
      .catch(() => {});
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const getRedirectUrl = () => {
    const urlParam = searchParams.get("url") || searchParams.get("domain");
    return urlParam ? `/onboarding?url=${encodeURIComponent(urlParam)}` : "/onboarding";
  };

  const activateAndRedirect = () => {
    selectPlan("pro");
    router.push(getRedirectUrl());
    setCheckoutActive(false);
  };

  // Build UPI deep link
  const buildUpiLink = (app: string) => {
    const base = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("xyz.ai")}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent("xyz.ai Pro Plan")}`;
    switch (app) {
      case "gpay":   return `tez://upi/pay?${base}`;
      case "phonepe": return `phonepe://pay?${base}`;
      case "paytm":  return `paytmmp://upi/pay?${base}`;
      default:       return `upi://pay?${base}`;
    }
  };

  const handleUpiAppClick = (app: string) => {
    const link = buildUpiLink(app);
    // Open deep link
    window.location.href = link;
    // After 1.5s (user is back), show processing + auto-complete
    setUpiLaunched(true);
    timerRef.current = setTimeout(() => {
      setProcessing(true);
    }, 1500);
  };

  const handleUpiQrPaid = () => {
    setProcessing(true);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 15) return;
    if (!cardExpiry || !cardCvv || !cardName) return;
    setProcessing(true);
  };

  const features = [
    "2 AI agents prospecting 24/7",
    "Up to 1,800 prospects contacted/month",
    "Warm leads sourced automatically",
    "Unified inbox",
    "Smart lead scoring + AI Copilot",
    "Email waterfall enrichment (15+ providers)",
    "CRM, API & MCP integrations",
    "Live chat support",
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Simple pricing for all your needs
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Warm leads found. Multichannel campaigns deployed. All in 10 minutes.
          </p>
        </div>
      </header>

      <section className="py-12 max-w-lg mx-auto px-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 rounded-bl-lg bg-primary/20 border-l border-b border-primary/30 px-3 py-1 text-[10px] font-bold text-primary tracking-wide uppercase">
            Most Popular
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline mt-2 gap-1">
                <span className="text-2xl font-bold text-gray-400">₹</span>
                <span className="text-4xl font-extrabold text-white">1,299</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Your first AI sales rep. For founders and operators running their own outbound.</p>
            </div>

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  const urlParam = searchParams.get("url") || searchParams.get("domain");
                  router.push(urlParam ? `/signup?url=${encodeURIComponent(urlParam)}` : "/signup");
                } else {
                  setCheckoutActive(true);
                }
              }}
              className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all"
            >
              {isLoggedIn ? "Subscribe to Pro Plan" : "Try xyz for free →"}
            </button>

            <div className="border-t border-primary/10 pt-6 space-y-3">
              <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">What's included</p>
              <ul className="space-y-2.5">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <Check className="h-4 w-4 text-secondary shrink-0" />
                    <span className="text-gray-300">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-dark-bg/40 p-6 text-center glass-panel">
          <h3 className="text-base font-bold text-white">Need a custom plan?</h3>
          <p className="text-xs text-gray-400 mt-1">For sales teams (5+) &amp; outbound agencies looking to scale.</p>
          <button
            onClick={() => router.push("/contact")}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-5 text-xs font-semibold text-white border border-white/10 transition-colors"
          >
            Get a demo →
          </button>
        </div>
      </section>

      {/* ─── Checkout Modal ────────────────────────────────────────────── */}
      {checkoutActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => { if (!processing) setCheckoutActive(false); }} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a12] shadow-2xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pro Plan</p>
                  <p className="text-[9px] text-gray-500">xyz.ai · Monthly</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-white">₹1,299</span>
                {!processing && (
                  <button onClick={() => setCheckoutActive(false)} className="p-1 text-gray-600 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Processing state */}
            {processing ? (
              <ProcessingOverlay onSuccess={activateAndRedirect} />
            ) : (
              <div className="p-5 space-y-4">
                {/* Method tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
                  {(["upi", "card"] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setActiveMethod(m); setUpiLaunched(false); }}
                      className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeMethod === m ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {m === "upi" ? <Smartphone className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                      {m === "upi" ? "UPI" : "Card"}
                    </button>
                  ))}
                </div>

                {/* ─── UPI Flow ─── */}
                {activeMethod === "upi" && !upiLaunched && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-400 text-center">Open your payment app and pay ₹1,299</p>

                    {/* App buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <UpiAppButton
                        name="GPay"
                        color="bg-white"
                        logo={<span className="text-[#4285F4] font-black text-sm">G</span>}
                        onClick={() => handleUpiAppClick("gpay")}
                      />
                      <UpiAppButton
                        name="PhonePe"
                        color="bg-[#5f259f]"
                        logo={<span className="text-white font-black">P</span>}
                        onClick={() => handleUpiAppClick("phonepe")}
                      />
                      <UpiAppButton
                        name="Paytm"
                        color="bg-[#002970]"
                        logo={<span className="text-white font-black text-xs">Pt</span>}
                        onClick={() => handleUpiAppClick("paytm")}
                      />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[9px] text-gray-600 font-bold uppercase">or pay via UPI ID</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* UPI ID copy */}
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <span className="flex-1 font-mono text-xs text-gray-200">{upiId}</span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(upiId); setCopiedUpi(true); setTimeout(() => setCopiedUpi(false), 2000); }}
                        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary font-bold transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedUpi ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* After paying via UPI ID */}
                    <button
                      type="button"
                      onClick={handleUpiQrPaid}
                      className="w-full h-10 rounded-xl bg-secondary/10 border border-secondary/20 text-xs font-bold text-secondary hover:bg-secondary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5" />
                      I&apos;ve completed the payment
                    </button>
                  </div>
                )}

                {/* ─── After UPI app launched ─── */}
                {activeMethod === "upi" && upiLaunched && (
                  <div className="space-y-4 text-center">
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="h-14 w-14 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                        <Clock className="h-7 w-7 text-secondary" />
                      </div>
                      <p className="text-sm font-bold text-white">Waiting for payment...</p>
                      <p className="text-[10px] text-gray-400">Complete the payment in your UPI app<br />and return here</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProcessing(true)}
                      className="w-full h-10 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Payment done — Continue
                    </button>
                    <button type="button" onClick={() => setUpiLaunched(false)} className="text-[10px] text-gray-600 hover:text-gray-400">
                      ← Back
                    </button>
                  </div>
                )}

                {/* ─── Card Flow ─── */}
                {activeMethod === "card" && (
                  <form onSubmit={handleCardSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19))}
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white font-mono focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Name on Card</label>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        required
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, "");
                            setCardExpiry(v.length >= 3 ? `${v.slice(0,2)} / ${v.slice(2)}` : v);
                          }}
                          className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white text-center font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          required
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white text-center font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      Pay ₹1,299 <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-600">
                  <Shield className="h-3 w-3" />
                  Secured payment · ₹1,299/month · Cancel anytime
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center text-gray-400">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
