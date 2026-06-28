"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { 
  Shield, Check, ArrowRight, Loader2, Mail, Globe, 
  Database, RefreshCw, Cpu, CheckCircle2, CloudUpload, Upload
} from "lucide-react";
import confetti from "canvas-confetti";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    isEmailVerified, verifyOtp, plan, selectPlan, 
    runWebsiteScan, scanningInProgress, scanReport,
    connectApollo, connectZoho, uploadDocument, mode, toggleSellingMode,
    updateWorkspaceName
  } = useAppState();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: OTP Email Verification
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  
  // Step 3: Website Scan
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scanPercentage, setScanPercentage] = useState(0);
  const [scanMessage, setScanMessage] = useState("");

  // Step 4: Optional setups
  const [apolloKey, setApolloKey] = useState("");
  const [zohoToken, setZohoToken] = useState("");
  const [apolloStatus, setApolloStatus] = useState<"disconnected" | "connecting" | "connected">("connected");
  const [zohoStatus, setZohoStatus] = useState<"disconnected" | "connecting" | "connected">("connected");
  
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isFinishing, setIsFinishing] = useState(false);

  // Initialize onboarding step and website URL based on session state
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const urlParam = searchParams.get("url");

    if (urlParam) {
      setWebsiteUrl(urlParam);
    }

    if (stepParam) {
      setCurrentStep(Number(stepParam));
    } else {
      if (!isEmailVerified) {
        setCurrentStep(1);
      } else if (plan === "none") {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
  }, [searchParams, isEmailVerified, plan]);

  // Auto‑run scan when URL is pre‑filled (e.g., via query param) and we are on step 3
  useEffect(() => {
    if (currentStep === 3 && websiteUrl && !scanningInProgress) {
      // Trigger scan automatically
      const clean = websiteUrl.trim();
      const url = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      runScan(url);
    }
  }, [currentStep, websiteUrl, scanningInProgress]);

  // OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setOtpError("");
    const ok = verifyOtp(otp);
    if (ok) {
      setCurrentStep(2);
    } else {
      setOtpError("Invalid verification code. Please check your spam inbox.");
    }
  };

  // Select pricing plan from onboarding wizard
  const handleSelectPlan = (tier: "starter" | "pro") => {
    selectPlan(tier);
    setCurrentStep(3);
  };

  // Run Website Scan
  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) return;
    let cleanUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }
    await runScan(cleanUrl);
  };

  // reusable scan logic without event
  const runScan = async (cleanUrl: string) => {
    setScanPercentage(5);
    setScanMessage("Launching website crawl engine...");
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
      "Contacting DNS resolvers for public tags...",
      "Downloading HTML structure, scripts, and CSS targets...",
      "Parsing products catalog and services list...",
      "Analyzing competitive landscape and tech stack properties...",
      "Mapping Ideal Customer Profile parameters...",
      "Generating isolated pgvector embedding datasets..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx++;
      if (msgIdx < messages.length) {
        setScanMessage(messages[msgIdx]);
      } else {
        clearInterval(msgInterval);
      }
    }, 600);

    try {
      await runWebsiteScan(cleanUrl);
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setScanPercentage(100);
      setScanMessage("Company Brain assets generated successfully!");
      
      const domainName = cleanUrl.replace(/https?:\/\/(www\.)?/, "").split(".")[0];
      updateWorkspaceName(`${domainName.toUpperCase()} Workspace`);
      
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setScanMessage("Crawl error encountered.");
    }
  };

  // Mock connecting Apollo
  const handleConnectApollo = () => {
    if (!apolloKey) return;
    setApolloStatus("connecting");
    setTimeout(() => {
      connectApollo(apolloKey);
      setApolloStatus("connected");
    }, 1500);
  };

  // Mock connecting Zoho
  const handleConnectZoho = () => {
    if (!zohoToken) return;
    setZohoStatus("connecting");
    setTimeout(() => {
      connectZoho(zohoToken);
      setZohoStatus("connected");
    }, 1500);
  };

  // Mock upload document
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setUploadProgress(prev => ({ ...prev, [file.name]: 5 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[file.name] || 0;
        if (current >= 100) {
          clearInterval(interval);
          uploadDocument(file.name, file.size, file.type);
          return { ...prev, [file.name]: 100 };
        }
        return { ...prev, [file.name]: current + 25 };
      });
    }, 500);
  };

  // Complete onboarding
  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setIsFinishing(false);
      window.location.href = "/dashboard";
    }, 1500);
  };

  const steps = [
    { num: 1, label: "Verify Email" },
    { num: 2, label: "Choose Plan" },
    { num: 3, label: "Analyze Site" },
    { num: 4, label: "Launch AI Brain" }
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg flex flex-col grid-bg pb-12 animate-fade-in">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-black/20 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            XYZ<span className="text-primary">.AI</span>
          </span>
        </Link>
        <span className="text-xs text-gray-500 font-mono">ONBOARDING STREAM ACTIVE</span>
      </header>

      {/* Progress Circles */}
      <div className="mx-auto max-w-xl w-full px-4 pt-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute inset-y-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10" />
          <div 
            className="absolute inset-y-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((st) => (
            <div key={st.num} className="flex flex-col items-center gap-1.5 z-10">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border transition-all duration-300 ${
                  currentStep > st.num 
                    ? "bg-primary border-primary text-white" 
                    : currentStep === st.num 
                      ? "bg-dark-bg border-primary text-primary ring-4 ring-primary/15 font-extrabold"
                      : "bg-dark-bg border-white/10 text-gray-500"
                }`}
              >
                {currentStep > st.num ? <Check className="h-4.5 w-4.5" /> : st.num}
              </div>
              <span className={`text-[10px] font-semibold tracking-wider uppercase ${currentStep === st.num ? "text-primary" : "text-gray-500"}`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Wizard Body */}
      <main className="flex-grow flex items-center justify-center px-4 mt-12">
        <div className="w-full max-w-md rounded-2xl border border-white/5 bg-dark-bg/60 p-8 glass-panel shadow-2xl space-y-6">
          
          {/* STEP 1: VERIFY EMAIL */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Verify your work email</h2>
                <p className="text-xs text-gray-400">
                  We sent a 6-digit OTP code to verify your identity logs.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 rounded-lg border border-white/10 bg-white/5 text-center text-xl font-mono tracking-[0.4em] text-white focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-center text-gray-500">Enter code: anything works in mock demo</p>
                </div>

                {otpError && <p className="text-xs text-center text-red-400 font-semibold">{otpError}</p>}

                <button
                  type="submit"
                  className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white transition-colors"
                >
                  Verify Verification Token
                </button>
              </form>

              <div className="text-center pt-2">
                <button 
                  onClick={() => setOtp("123456")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Autofill Sandbox Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE PLAN */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold text-white">Select Subscription Tier</h2>
                <p className="text-xs text-gray-400">
                  Choose a model to deploy inside your workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleSelectPlan("starter")}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 text-left hover:border-primary transition-all group flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Starter Plan</p>
                    <p className="text-[10px] text-gray-400">₹999/mo • 500 Searches • Manual outreach mode</p>
                  </div>
                  <ArrowRight className="h-4.5 w-4.5 text-gray-500 group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => handleSelectPlan("pro")}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-left hover:border-primary transition-all group flex justify-between items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase">
                    AI Mode Agent
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Pro AI Plan</p>
                    <p className="text-[10px] text-gray-400">₹2,999/mo • Unlimited limits* • Autonomous Sales agent</p>
                  </div>
                  <ArrowRight className="h-4.5 w-4.5 text-gray-500 group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RUN INITIAL SCAN */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Create Company Brain</h2>
                <p className="text-xs text-gray-400">
                  Enter your website URL to index public catalogs.
                </p>
              </div>

              {!scanningInProgress ? (
                <form onSubmit={handleRunScan} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Website URL</label>
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
                    className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white transition-colors"
                  >
                    Build Brain Vectors
                  </button>
                </form>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span>Index status:</span>
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

          {/* STEP 4: INTEGRATIONS & SELLING MODES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold text-white">Configure Sales Intelligence</h2>
                <p className="text-xs text-gray-400">
                  Connect data sources and choose your AI selling pace.
                </p>
              </div>

              <div className="space-y-4">
                


                {/* Document Upload */}
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-2">
                  <span className="text-xs font-bold text-white block">Upload Sales Collateral</span>
                  <label className="relative flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                    <CloudUpload className="h-6 w-6 text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-1 font-sans">PDF, DOCX, XLSX, TXT (Max 5MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx,.txt"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                  {Object.keys(uploadProgress).map((name) => (
                    <div key={name} className="pt-2 flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span>{uploadProgress[name]}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${uploadProgress[name]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mode Select */}
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-3">
                  <span className="text-xs font-bold text-white block">Select Campaign Execution Mode</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => toggleSellingMode("manual")}
                      className={`h-9 rounded-lg border font-semibold transition-all ${
                        mode === "manual" 
                          ? "bg-primary/20 border-primary text-primary" 
                          : "border-white/10 bg-white/5 text-gray-400"
                      }`}
                    >
                      Manual (Review Drafts)
                    </button>
                    <button
                      onClick={() => toggleSellingMode("pro-ai")}
                      className={`h-9 rounded-lg border font-semibold transition-all ${
                        mode === "pro-ai" 
                          ? "bg-secondary/20 border-secondary text-secondary" 
                          : "border-white/10 bg-white/5 text-gray-400"
                      }`}
                    >
                      AI Mode (Autonomous)
                    </button>
                  </div>
                </div>

              </div>

              {/* Action */}
              <button
                onClick={handleFinish}
                disabled={isFinishing}
                className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg transition-colors gap-2"
              >
                {isFinishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Launching Revenue Center...
                  </>
                ) : (
                  <>
                    Activate AI Revenue Platform
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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
