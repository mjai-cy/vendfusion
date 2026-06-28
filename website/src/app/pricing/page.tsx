"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppState } from "@/context/AppStateContext";
import { Check, X, ShieldCheck, CreditCard, Sparkles, Loader, Copy, QrCode, Smartphone, Building2 } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { selectPlan, isLoggedIn } = useAppState();
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | null>(null);
  const [paymentStep, setPaymentStep] = useState<"gateway" | "processing" | "success">("gateway");
  
  // Custom Fee-Free Payment states & configs from backend
  const [config, setConfig] = useState({
    upiId: "pay.xyz@upi",
    upiEnabled: true,
    bankEnabled: true,
    cardEnabled: true,
    holderName: "XYZ AI Technologies Private Limited",
    accountNumber: "50200084729103",
    ifscCode: "HDFC0000012",
    bankName: "HDFC Bank Ltd",
  });

  const [activeMethod, setActiveMethod] = useState<"upi" | "bank" | "card">("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    fetch("http://localhost:3002/payment/config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig(data);
          if (data.upiEnabled !== false) {
            setActiveMethod("upi");
          } else if (data.bankEnabled !== false) {
            setActiveMethod("bank");
          } else if (data.cardEnabled !== false) {
            setActiveMethod("card");
          }
        }
      })
      .catch(err => console.log("Failed to load payment config:", err));
  }, []);

  const handleSelectPlan = (tier: "starter" | "pro") => {
    setSelectedTier(tier);
    setCheckoutActive(true);
    setPaymentStep("gateway");
    setUtrNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const executeMockPayment = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("success");
      setTimeout(() => {
        setCheckoutActive(false);
        selectPlan(selectedTier!);
        
        // Redirect to onboarding or login depending on auth state
        if (isLoggedIn) {
          router.push("/onboarding");
        } else {
          router.push("/signup?plan=" + selectedTier);
        }
      }, 1500);
    }, 2000);
  };

  const starterFeatures = [
    { name: "Website Scans & Business Brain Analysis", included: true },
    { name: "ICP Generator & Competitor Maps", included: true },
    { name: "Knowledge base uploads (PDF, DOCX, TXT)", included: true },
    { name: "Email Outbound (Manual Mode Only)", included: true },
    { name: "1 Workspace & 2 User Profiles", included: true },
    { name: "500 Lead Searches / month limit", included: true },
    { name: "1,000 AI Messages / month limit", included: true },
    { name: "Autonomous Sales Agent (AI Mode)", included: false },
    { name: "Weekly Learning Loop Optimization Reports", included: false },
    { name: "Role management & Unlimited workspaces", included: false },
  ];

  const proFeatures = [
    { name: "Website Scans & Business Brain Analysis", included: true },
    { name: "ICP Generator & Competitor Maps", included: true },
    { name: "Knowledge base uploads (PDF, DOCX, TXT)", included: true },
    { name: "Email Outbound (Manual & AI Modes)", included: true },
    { name: "Unlimited workspaces & Role Management", included: true },
    { name: "Unlimited* Lead Searches (FUP)", included: true },
    { name: "Unlimited* AI Messages (FUP)", included: true },
    { name: "Autonomous Sales Agent (AI Mode)", included: true },
    { name: "Weekly Learning Loop Optimization Reports", included: true },
    { name: "Priority Chat & Call Support", included: true },
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg grid-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Flexible Plans for Growing Teams
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Choose the model limits you need to start prospecting target accounts. Upgrade or cancel at any time.
          </p>
        </div>
      </header>

      {/* Pricing Cards */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Starter Plan */}
          <div className="rounded-2xl border border-white/5 bg-dark-bg/40 p-8 glass-panel flex flex-col justify-between relative">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                <p className="mt-2 text-xs text-gray-400">Perfect for small teams launching outbound campaigns.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">₹999</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              
              <button
                onClick={() => handleSelectPlan("starter")}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white border border-white/10 transition-colors"
              >
                Choose Starter
              </button>

              <div className="border-t border-white/5 pt-6 space-y-3">
                <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Features Include:</p>
                <ul className="space-y-2.5">
                  {starterFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      {feat.included ? (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-600 shrink-0" />
                      )}
                      <span className={feat.included ? "text-gray-300" : "text-gray-600 line-through"}>
                        {feat.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pro AI Plan */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 glass-panel flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-lg bg-primary/20 border-l border-b border-primary/30 px-3 py-1 text-[10px] font-bold text-primary tracking-wide uppercase">
              Most Popular
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Pro AI Plan</h3>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-xs text-gray-400">For agencies wanting autonomous sales capabilities.</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-white">₹2,999</span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </div>
              
              <button
                onClick={() => handleSelectPlan("pro")}
                className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all"
              >
                Choose Pro AI
              </button>

              <div className="border-t border-primary/10 pt-6 space-y-3">
                <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Everything in Starter plus:</p>
                <ul className="space-y-2.5">
                  {proFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      <Check className="h-4 w-4 text-secondary shrink-0" />
                      <span className="text-gray-300">{feat.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Checkout Method Selection Modal */}
      {checkoutActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-bg/95 p-6 shadow-2xl glass-panel space-y-6">
            
            <button
              onClick={() => setCheckoutActive(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {paymentStep === "gateway" && (
              <div className="space-y-5 text-left">
                
                {/* Header */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Complete Your Subscription
                  </h3>
                  <p className="text-xs text-gray-400">0% Transaction Fees • Direct Processing</p>
                </div>

                {/* Plan Summary */}
                <div className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block">Subscription Tier</span>
                    <span className="font-bold text-white uppercase">{selectedTier} Plan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">Amount Due</span>
                    <span className="font-bold text-primary text-sm">
                      {selectedTier === "starter" ? "₹999.00" : "₹2,999.00"}
                    </span>
                  </div>
                </div>
                               {/* Payment Methods tabs (displays only if enabled by Super Admin) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-black/45 border border-white/5">
                  <button
                    onClick={() => setActiveMethod("upi")}
                    disabled={config.upiEnabled === false}
                    className={`h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                      activeMethod === "upi" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3 w-3" /> UPI QR
                  </button>
                  <button
                    onClick={() => setActiveMethod("bank")}
                    disabled={config.bankEnabled === false}
                    className={`h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                      activeMethod === "bank" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="h-3 w-3" /> Bank
                  </button>
                  <button
                    onClick={() => setActiveMethod("card")}
                    disabled={config.cardEnabled === false}
                    className={`h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                      activeMethod === "card" ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="h-3 w-3" /> Card
                  </button>
                </div>

                {/* Tab content: UPI */}
                {activeMethod === "upi" && config.upiEnabled !== false && (
                  <div className="space-y-4 flex flex-col items-center">
                    
                    {/* Mock QR Code in SVG */}
                    <div className="rounded-lg bg-white p-2.5 border border-white/10 w-32 h-32 flex items-center justify-center shadow-lg">
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
                      <p className="text-[10px] text-gray-400">Scan QR Code using GPay, PhonePe, or Paytm</p>
                      <div className="inline-flex items-center gap-1.5 justify-center text-xs bg-white/5 rounded px-2.5 py-1 border border-white/5">
                        <span className="font-mono text-gray-200">{config.upiId}</span>
                        <button
                          onClick={() => copyToClipboard(config.upiId)}
                          className="text-primary hover:text-primary-hover p-0.5 transition-colors"
                          title="Copy UPI ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {copiedUpi && <p className="text-[9px] text-secondary font-bold font-sans">Copied to clipboard!</p>}
                    </div>

                    {/* Transaction Ref Entry */}
                    <div className="w-full space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Enter 12-Digit UPI UTR / Ref No.</label>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="123456789012"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white tracking-widest text-center"
                      />
                    </div>
                  </div>
                )}

                {/* Tab content: Bank */}
                {activeMethod === "bank" && config.bankEnabled !== false && (
                  <div className="space-y-3.5">
                    
                    <div className="rounded-lg border border-white/5 bg-black/20 p-3 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-gray-500">Account Holder:</span>
                        <span className="font-bold text-white text-right">{config.holderName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-gray-500">Account Number:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white font-mono">{config.accountNumber}</span>
                          <button onClick={() => copyToClipboard(config.accountNumber)} className="text-primary hover:underline"><Copy className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-gray-500">Bank Name & Branch:</span>
                        <span className="font-bold text-white">{config.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">IFSC Code:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white font-mono">{config.ifscCode}</span>
                          <button onClick={() => copyToClipboard(config.ifscCode)} className="text-primary hover:underline"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>

                    {copiedUpi && <p className="text-[9px] text-center text-secondary font-bold">Account parameter copied!</p>}

                    {/* UTR Input */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-sans">Enter Bank Transaction Ref No.</label>
                      <input
                        type="text"
                        placeholder="UTR / Ref ID"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Tab content: Card */}
                {activeMethod === "card" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19))}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\s?/g, "").slice(0, 5))}
                          className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Complete Button */}
                <button
                  onClick={executeMockPayment}
                  disabled={
                    (activeMethod === "upi" && utrNumber.length < 12) ||
                    (activeMethod === "bank" && !utrNumber) ||
                    (activeMethod === "card" && (!cardNumber || !cardExpiry || cardCvv.length < 3))
                  }
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-lg shadow-primary/20 transition-colors gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {activeMethod === "card" ? "Process Card Transaction" : "Submit Verification Proof"}
                </button>
                
                <p className="text-[9px] text-gray-500 text-center leading-relaxed">
                  By clicking, you trigger a direct payment check. No gateway fees will be deducted. Verification completes in the sandbox logs instantly.
                </p>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="py-12 space-y-6 flex flex-col items-center">
                <Loader className="h-10 w-10 text-primary animate-spin-slow" />
                <div className="space-y-1 text-center">
                  <h4 className="text-sm font-semibold text-white">Validating Transaction Proof...</h4>
                  <p className="text-xs text-gray-500">Connecting directly to ledger logs for clearance</p>
                </div>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="py-12 space-y-4 flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1 text-center">
                  <h4 className="text-sm font-semibold text-white">Payment Ingested Successfully</h4>
                  <p className="text-xs text-gray-500">Subscription activated at 0% fees. Initializing workspace...</p>
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
