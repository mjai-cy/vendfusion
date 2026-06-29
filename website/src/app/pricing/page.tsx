"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, Sparkles, Smartphone, CreditCard, Copy, X, Loader2 } from "lucide-react";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, selectPlan } = useAppState();

  const [checkoutActive, setCheckoutActive] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"upi" | "card">("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
  const [config, setConfig] = useState({
    upiId: "pay.xyz@upi",
    upiEnabled: true,
    cardEnabled: true,
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/payment/config`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig(data);
        }
      })
      .catch(err => console.log("Failed to fetch payment config:", err));
  }, [BACKEND_URL]);

  const handleSubscribeClick = () => {
    const urlParam = searchParams.get("url") || searchParams.get("domain");
    if (!isLoggedIn) {
      let signupUrl = "/signup";
      if (urlParam) signupUrl += `?url=${encodeURIComponent(urlParam)}`;
      router.push(signupUrl);
    } else {
      setCheckoutActive(true);
    }
  };

  const handleVerifyAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      selectPlan("pro");
      
      const urlParam = searchParams.get("url") || searchParams.get("domain");
      let redirectUrl = "/onboarding";
      if (urlParam) redirectUrl += `?url=${encodeURIComponent(urlParam)}`;
      
      router.push(redirectUrl);
      setCheckoutActive(false);
    }, 1500);
  };

  const features = [
    "2 AI agents prospecting 24/7",
    "Up to 1,800 prospects contacted/month, more available",
    "Warm leads sourced automatically (signals + lookalikes)",
    "Unified inbox",
    "Smart lead scoring",
    "AI Copilot mode",
    "Email waterfall enrichment (15+ data providers)",
    "CRM, API and MCP integrations (HubSpot, Pipedrive, Claude...)",
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
              <div className="flex items-baseline mt-2">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Your first AI sales rep. For founders and operators running their own outbound.</p>
            </div>

            <button
              onClick={handleSubscribeClick}
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

      {/* Checkout Modal Panel */}
      {checkoutActive && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCheckoutActive(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-sm font-bold text-white">Checkout: Pro Plan</h2>
              </div>
              <button onClick={() => setCheckoutActive(false)} className="p-1 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyAndPay} className="p-6 space-y-4">
              <div className="flex justify-between items-center rounded-lg bg-white/5 p-3 text-xs border border-white/5">
                <span className="text-gray-400">Monthly Subscription:</span>
                <span className="font-extrabold text-white">$99 / Month</span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-black/45 border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveMethod("upi")}
                  disabled={config.upiEnabled === false}
                  className={`h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                    activeMethod === "upi" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod("card")}
                  disabled={config.cardEnabled === false}
                  className={`h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                    activeMethod === "card" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Card
                </button>
              </div>

              {/* UPI QR Method */}
              {activeMethod === "upi" && config.upiEnabled !== false && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="rounded-lg bg-white p-2.5 border border-white/10 w-28 h-28 flex items-center justify-center shadow-lg">
                    <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                      <rect x="5" y="5" width="25" height="25" fill="black" />
                      <rect x="10" y="10" width="15" height="15" fill="white" />
                      <rect x="70" y="5" width="25" height="25" fill="black" />
                      <rect x="75" y="10" width="15" height="15" fill="white" />
                      <rect x="5" y="70" width="25" height="25" fill="black" />
                      <rect x="10" y="75" width="15" height="15" fill="white" />
                      <rect x="35" y="15" width="10" height="5" fill="black" />
                      <rect x="45" y="25" width="15" height="10" fill="black" />
                      <rect x="15" y="35" width="5" height="15" fill="black" />
                      <rect x="35" y="45" width="20" height="20" fill="black" />
                      <rect x="65" y="35" width="10" height="15" fill="black" />
                      <rect x="15" y="55" width="10" height="5" fill="black" />
                      <rect x="75" y="65" width="15" height="10" fill="black" />
                      <rect x="45" y="75" width="10" height="15" fill="black" />
                    </svg>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[9px] text-gray-500">Scan QR Code using GPay, PhonePe, or Paytm</p>
                    <div className="inline-flex items-center gap-1.5 justify-center text-xs bg-white/5 rounded px-2.5 py-1 border border-white/5">
                      <span className="font-mono text-gray-200">{config.upiId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(config.upiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-primary hover:text-primary-hover p-0.5 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {copiedUpi && <p className="text-[9px] text-secondary font-bold font-sans">Copied!</p>}
                  </div>

                  <div className="w-full space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Enter 12-Digit UPI UTR / Ref No.</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="123456789012"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white text-center tracking-widest font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Card Method */}
              {activeMethod === "card" && config.cardEnabled !== false && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white text-center font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white shadow-lg transition-colors gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  "Verify Payment & Pay"
                )}
              </button>
            </form>
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
