"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ScanReport {
  domain: string;
  companyName: string;
  businessSummary: string;
  industry: string;
  products: string[];
  services: string[];
  estimatedICP: {
    industries: string[];
    companySizes: string[];
    targetRoles: string[];
    painPoints: string[];
  };
  websiteQualityScore: number;
  aiSummary: string;
  topCompetitors: { name: string; website: string; marketShare: string }[];
  basicRecommendations: string[];
  aiReadinessScore: number;
}

export interface FileDetail {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: "processing" | "chunked" | "embedded";
  chunks: number;
  extractedText: string;
}

export interface Lead {
  id: string;
  name: string;
  role: string;
  companyName: string;
  domain: string;
  intentScore: number;
  intentSignals: string[];
  email: string;
  whatsapp: string;
  outreachDrafts: {
    email: { subject: string; body: string };
    whatsapp: string;
  };
  status: "new" | "reviewing" | "sent" | "interested" | "meeting_booked" | "ignored";
  crmSyncStatus: "not_synced" | "synced";
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  sentCount: number;
  openRate: number;
  replyRate: number;
  meetingsRate: number;
  status: "draft" | "active" | "paused";
}

export interface WeeklyReport {
  week: string;
  date: string;
  replyRateImprovement: string;
  meetingRateImprovement: string;
  learnings: string[];
  proposedOptimizations: {
    id: string;
    description: string;
    impact: string;
    status: "pending" | "approved" | "rejected";
  }[];
}

interface AppStateContextProps {
  // Authentication & Onboarding
  user: { name: string; email: string } | null;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  onboardingStep: number;
  plan: "none" | "starter" | "pro";
  workspaceName: string;
  
  // Free Scanner
  freeScanUsed: boolean;
  scanReport: ScanReport | null;
  scanningInProgress: boolean;
  
  // Dashboard Configurations & States
  mode: "manual" | "pro-ai"; // Pro gets autonomous Sales Agent
  apolloConnected: boolean;
  zohoConnected: boolean;
  apolloApiKey: string;
  zohoAuthToken: string;
  
  // Knowledge Center
  uploadedFiles: FileDetail[];
  
  // Sales Engine Data
  leads: Lead[];
  campaigns: Campaign[];
  weeklyReports: WeeklyReport[];
  
  // Limits counters
  leadSearchesThisMonth: number;
  aiMessagesThisMonth: number;
  
  // Methods
  login: (email: string, name: string) => void;
  logout: () => void;
  verifyOtp: (otp: string) => boolean;
  selectPlan: (selectedPlan: "starter" | "pro") => void;
  runWebsiteScan: (url: string) => Promise<ScanReport>;
  updateWorkspaceName: (name: string) => void;
  connectApollo: (apiKey: string) => void;
  connectZoho: (token: string) => void;
  uploadDocument: (name: string, size: number, type: string) => void;
  toggleSellingMode: (newMode: "manual" | "pro-ai") => void;
  sendOutreachAction: (leadId: string, type: "email" | "whatsapp") => void;
  updateLeadStatus: (leadId: string, status: Lead["status"]) => void;
  createCampaign: (name: string, subject: string, template: string) => void;
  toggleCampaignStatus: (id: string) => void;
  handleWeeklyOptimization: (reportIndex: number, optId: string, action: "approved" | "rejected") => void;
  resetScan: () => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

const defaultScanReport = (domain: string): ScanReport => {
  const cleanDomain = domain.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
  const name = cleanDomain.split(".")[0].toUpperCase();
  
  return {
    domain: cleanDomain,
    companyName: `${name} Technologies`,
    businessSummary: `A high-growth enterprise software provider specializing in cloud infrastructure security, machine learning pipeline orchestrations, and automated workload distributions designed for modern engineering teams.`,
    industry: "Enterprise Software & Cloud Security",
    products: ["SecureShield Gateway", "DataFlow AI Engine", "Sentinel Observability SDK"],
    services: ["24/7 Threat Response", "Managed Devops Migrations", "Custom AI Fine-tuning Consultation"],
    estimatedICP: {
      industries: ["Fintech", "Healthtech", "DevOps Platforms", "E-commerce Infrastructure"],
      companySizes: ["50-200 employees", "201-1000 employees"],
      targetRoles: ["VP of Engineering", "Chief Information Security Officer (CISO)", "Director of DevOps"],
      painPoints: ["Rapid scaling system bottlenecks", "Excessive manual security compliance tracking", "Data leakage risks in LLM integrations"],
    },
    websiteQualityScore: 84,
    aiSummary: `Based on public metadata and technology signatures, ${name} Technologies presents a solid security stance but runs slow performance on asset caching and lacks micro-copy optimization for developer conversion funnels. The team has active vacancies indicating scaling pains in platform engineering.`,
    topCompetitors: [
      { name: "Cloudflare Enterprise", website: "cloudflare.com", marketShare: "34%" },
      { name: "Datadog Cloud", website: "datadoghq.com", marketShare: "18%" },
      { name: "Snyk Developer Security", website: "snyk.io", marketShare: "12%" }
    ],
    basicRecommendations: [
      "Implement client-side query compression to boost page load speed by 28%.",
      "Deploy localized pricing tiers targeting Middle East and Asia-Pacific markets.",
      "Incorporate responsive testimonials section immediately below pricing grids to reduce sign-up bounce rates."
    ],
    aiReadinessScore: 72
  };
};

const preseededLeads = (companyName: string): Lead[] => [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    role: "VP of Engineering",
    companyName: "FintechFlow",
    domain: "fintechflow.co",
    intentScore: 92,
    intentSignals: ["Funding round completed ($12M Series A)", "Hiring 4 React Developers", "Tech stack: Next.js, Vercel"],
    email: "s.jenkins@fintechflow.co",
    whatsapp: "+1 (555) 349-2041",
    outreachDrafts: {
      email: {
        subject: "Scaling FintechFlow infrastructure: automation idea for Sarah",
        body: `Hi Sarah,\n\nSaw that FintechFlow recently closed your Series A — congrats to you and the engineering team!\n\nI noticed you are currently hiring React engineers to support the scale. With your stack built on Next.js, managing API integration security becomes critical. Our platform XYZ.AI has analyzed FintechFlow and found that cloud pipeline automation could save your senior engineers roughly 12 hours weekly.\n\nAre you open to a brief 10-minute chat next Thursday at 3 PM to see if we can help optimize this for your team?\n\nBest,\nXYZ Sales Intelligence Agent`
      },
      whatsapp: "Hey Sarah, congrats on the Series A at FintechFlow! Noticed your VP of Eng vacancy. We built an AI automation module tailored for Next.js setups. Let me know if you are open to checking it out."
    },
    status: "new",
    crmSyncStatus: "not_synced"
  },
  {
    id: "lead-2",
    name: "Michael Chen",
    role: "Director of IT Operations",
    companyName: "MedSafe Solutions",
    domain: "medsafesolutions.com",
    intentScore: 87,
    intentSignals: ["New HIPAA Compliance standards release", "Visitor surge on website", "Competing with active threat scanner"],
    email: "mchen@medsafesolutions.com",
    whatsapp: "+1 (555) 782-9011",
    outreachDrafts: {
      email: {
        subject: "HIPAA audit prep optimization for MedSafe Solutions",
        body: `Hi Michael,\n\nPreparing for the upcoming HIPAA compliance audits is usually a friction point for IT teams. Based on MedSafe Solutions' public engineering footprints, you seem to be running manual threat scan reports.\n\nXYZ.AI helps healthtech systems automate document extraction and verify network security settings to generate readiness audits in real time.\n\nWould you be open to reviewing a mock readiness audit we generated for MedSafe next Tuesday?\n\nBest regards,\nXYZ Sales Intelligence Agent`
      },
      whatsapp: "Hi Michael, noticed you're prepping MedSafe Solutions for compliance audits. We automate threat reports to cut readiness times by 40%. Got 5 mins for a quick preview?"
    },
    status: "new",
    crmSyncStatus: "not_synced"
  },
  {
    id: "lead-3",
    name: "Vikram Malhotra",
    role: "CISO",
    companyName: "BharatPay Labs",
    domain: "bharatpaylabs.in",
    intentScore: 95,
    intentSignals: ["Launched new digital wallet app", "Looking for automated security compliance", "Website tech stack shift"],
    email: "vikram@bharatpaylabs.in",
    whatsapp: "+91 98765 43210",
    outreachDrafts: {
      email: {
        subject: "Automated wallet security compliance for BharatPay Labs",
        body: `Dear Vikram,\n\nCongratulations on the launch of the BharatPay Labs digital wallet. Security at this scale is paramount.\n\nXYZ.AI analyzes user security preferences and automates client-side encryption audits. We've compiled a brief report showing potential leak risks in the payment gateway flow.\n\nCould we coordinate a quick call to share the vulnerabilities we identified?\n\nSincerely,\nXYZ Sales Intelligence Agent`
      },
      whatsapp: "Namaste Vikram, congrats on the new wallet launch! We run client-side encryption audits for payment gateways. Can we share a quick security audit we compiled for BharatPay?"
    },
    status: "new",
    crmSyncStatus: "not_synced"
  }
];

const preseededCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Series A Founders Outreach",
    subject: "Automating lead enrichment for {{company}}",
    template: "Hi {{first_name}},\n\nNoticed {{company}} is expanding your outbound team. We've automated custom outreach writing tailored to B2B software targets.\n\nWould you be open to seeing a sandbox demo?",
    sentCount: 142,
    openRate: 68.2,
    replyRate: 18.5,
    meetingsRate: 4.2,
    status: "active"
  },
  {
    id: "camp-2",
    name: "Enterprise CISOs Security Audit",
    subject: "Vulnerability audit preview for {{company}}",
    template: "Hello {{first_name}},\n\nWe ran a client-facing web audit on {{company}} and flagged 3 assets with high security latency.\n\nLet me know if you would like us to send the full analysis.",
    sentCount: 95,
    openRate: 74.7,
    replyRate: 22.1,
    meetingsRate: 6.8,
    status: "paused"
  }
];

const preseededWeeklyReports: WeeklyReport[] = [
  {
    week: "Week 25, 2026",
    date: "June 21, 2026",
    replyRateImprovement: "+4.2%",
    meetingRateImprovement: "+1.5%",
    learnings: [
      "Prospects respond 35% better when mention of 'Series A funding' is positioned in the opening sentence.",
      "Outreach campaigns targeting 'VP of Engineering' have a higher open rate on Tuesdays than Thursdays.",
      "WhatsApp campaigns achieve a 92% deliverability rate but are perceived as spam if they exceed 180 characters."
    ],
    proposedOptimizations: [
      {
        id: "opt-1",
        description: "Set campaign script prefix to mention recent news announcements automatically.",
        impact: "Est. +3.8% reply rate",
        status: "approved"
      },
      {
        id: "opt-2",
        description: "Limit WhatsApp contact limits to once per week, transferring cold leads to email sequences.",
        impact: "Est. -15% unsubscribe rate",
        status: "pending"
      },
      {
        id: "opt-3",
        description: "Auto-send secondary follow-up 48 hours after if email has been opened but unanswered.",
        impact: "Est. +5% booking rate",
        status: "pending"
      }
    ]
  }
];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Onboarding
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [plan, setPlan] = useState<"none" | "starter" | "pro">("none");
  const [workspaceName, setWorkspaceName] = useState("My Workspace");

  // Free Scanner
  const [freeScanUsed, setFreeScanUsed] = useState(false);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [scanningInProgress, setScanningInProgress] = useState(false);

  // Integrations & Modes
  const [mode, setMode] = useState<"manual" | "pro-ai">("manual");
  const [apolloConnected, setApolloConnected] = useState(true);
  const [zohoConnected, setZohoConnected] = useState(true);
  const [apolloApiKey, setApolloApiKey] = useState("");
  const [zohoAuthToken, setZohoAuthToken] = useState("");

  // Knowledge base, leads, campaigns, reports
  const [uploadedFiles, setUploadedFiles] = useState<FileDetail[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(preseededCampaigns);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(preseededWeeklyReports);

  // Limit counters
  const [leadSearchesThisMonth, setLeadSearchesThisMonth] = useState(12);
  const [aiMessagesThisMonth, setAiMessagesThisMonth] = useState(48);

  // Synchronize state from LocalStorage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("xyz_user");
    const cachedLoggedIn = localStorage.getItem("xyz_isLoggedIn");
    const cachedVerified = localStorage.getItem("xyz_isEmailVerified");
    const cachedOnboarding = localStorage.getItem("xyz_onboardingStep");
    const cachedPlan = localStorage.getItem("xyz_plan");
    const cachedWorkspace = localStorage.getItem("xyz_workspaceName");
    const cachedScanReport = localStorage.getItem("xyz_scanReport");
    const cachedFreeScan = localStorage.getItem("xyz_freeScanUsed");
    const cachedApollo = localStorage.getItem("xyz_apolloConnected");
    const cachedZoho = localStorage.getItem("xyz_zohoConnected");
    const cachedMode = localStorage.getItem("xyz_mode");
    const cachedFiles = localStorage.getItem("xyz_uploadedFiles");
    const cachedLeads = localStorage.getItem("xyz_leads");

    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedLoggedIn) setIsLoggedIn(cachedLoggedIn === "true");
    if (cachedVerified) setIsEmailVerified(cachedVerified === "true");
    if (cachedOnboarding) setOnboardingStep(Number(cachedOnboarding));
    if (cachedPlan) setPlan(cachedPlan as "none" | "starter" | "pro");
    if (cachedWorkspace) setWorkspaceName(cachedWorkspace);
    if (cachedFreeScan) setFreeScanUsed(cachedFreeScan === "true");
    if (cachedApollo) setApolloConnected(cachedApollo === "true");
    if (cachedZoho) setZohoConnected(cachedZoho === "true");
    if (cachedMode) setMode(cachedMode as "manual" | "pro-ai");
    
    if (cachedScanReport) {
      const report = JSON.parse(cachedScanReport);
      setScanReport(report);
      setLeads(preseededLeads(report.companyName));
    }
    
    if (cachedFiles) setUploadedFiles(JSON.parse(cachedFiles));
    if (cachedLeads && !cachedScanReport) setLeads(JSON.parse(cachedLeads));
  }, []);

  // Login handler
  const login = (email: string, name: string) => {
    const newUser = { name, email };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("xyz_user", JSON.stringify(newUser));
    localStorage.setItem("xyz_isLoggedIn", "true");
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setOnboardingStep(1);
    setPlan("none");
    setScanReport(null);
    setFreeScanUsed(false);
    setApolloConnected(false);
    setZohoConnected(false);
    setUploadedFiles([]);
    setLeads([]);
    localStorage.clear();
  };

  // Verify OTP
  const verifyOtp = (otp: string) => {
    if (otp.length === 6) {
      setIsEmailVerified(true);
      setOnboardingStep(2);
      localStorage.setItem("xyz_isEmailVerified", "true");
      localStorage.setItem("xyz_onboardingStep", "2");
      return true;
    }
    return false;
  };

  // Select Plan
  const selectPlan = (selectedPlan: "starter" | "pro") => {
    setPlan(selectedPlan);
    setOnboardingStep(3);
    localStorage.setItem("xyz_plan", selectedPlan);
    localStorage.setItem("xyz_onboardingStep", "3");
  };

  // Update Workspace Name
  const updateWorkspaceName = (name: string) => {
    setWorkspaceName(name);
    localStorage.setItem("xyz_workspaceName", name);
  };

  // Website scanner simulator
  const runWebsiteScan = async (url: string): Promise<ScanReport> => {
    setScanningInProgress(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    const report = defaultScanReport(url);
    setScanReport(report);
    setFreeScanUsed(true);
    
    const freshLeads = preseededLeads(report.companyName);
    setLeads(freshLeads);

    localStorage.setItem("xyz_scanReport", JSON.stringify(report));
    localStorage.setItem("xyz_freeScanUsed", "true");
    localStorage.setItem("xyz_leads", JSON.stringify(freshLeads));
    
    setScanningInProgress(false);
    return report;
  };

  const resetScan = () => {
    setScanReport(null);
    setLeads([]);
    localStorage.removeItem("xyz_scanReport");
    localStorage.removeItem("xyz_leads");
  };

  // Connect Apollo
  const connectApollo = (apiKey: string) => {
    setApolloConnected(true);
    setApolloApiKey(apiKey);
    localStorage.setItem("xyz_apolloConnected", "true");
  };

  // Connect Zoho
  const connectZoho = (token: string) => {
    setZohoConnected(true);
    setZohoAuthToken(token);
    localStorage.setItem("xyz_zohoConnected", "true");
  };

  // Upload company files
  const uploadDocument = (name: string, size: number, type: string) => {
    const sizeStr = size > 1024 * 1024 
      ? `${(size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(size / 1024).toFixed(0)} KB`;
      
    const newFile: FileDetail = {
      id: `file-${Date.now()}`,
      name,
      size: sizeStr,
      type,
      uploadedAt: new Date().toLocaleDateString(),
      status: "processing",
      chunks: 0,
      extractedText: ""
    };

    setUploadedFiles((prev) => {
      const updated = [newFile, ...prev];
      localStorage.setItem("xyz_uploadedFiles", JSON.stringify(updated));
      return updated;
    });

    setTimeout(() => {
      setUploadedFiles((prev) => {
        const updated = prev.map((f) => 
          f.id === newFile.id 
            ? { ...f, status: "chunked" as const, chunks: Math.floor(Math.random() * 15) + 3 } 
            : f
        );
        return updated;
      });
    }, 2000);

    setTimeout(() => {
      setUploadedFiles((prev) => {
        const updated = prev.map((f) => 
          f.id === newFile.id 
            ? { 
                ...f, 
                status: "embedded" as const, 
                extractedText: `Extracted company context from ${name}. Identified brand guidelines, customer personas, pricing tables, and pitch decks. Embedded 512-dimension vectors into local pgvector catalog.`
              } 
            : f
        );
        localStorage.setItem("xyz_uploadedFiles", JSON.stringify(updated));
        return updated;
      });
    }, 4500);
  };

  // Toggle Mode
  const toggleSellingMode = (newMode: "manual" | "pro-ai") => {
    if (plan === "starter" && newMode === "pro-ai") {
      alert("AI Mode (Autonomous Sales Agent) requires a Pro AI subscription. Please upgrade your plan.");
      return;
    }
    setMode(newMode);
    localStorage.setItem("xyz_mode", newMode);
  };

  // Send outreach
  const sendOutreachAction = (leadId: string, type: "email" | "whatsapp") => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status: "sent" as const } : l));
      localStorage.setItem("xyz_leads", JSON.stringify(updated));
      return updated;
    });
    setAiMessagesThisMonth((c) => c + 1);
  };

  // Update lead status
  const updateLeadStatus = (leadId: string, status: Lead["status"]) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status } : l));
      localStorage.setItem("xyz_leads", JSON.stringify(updated));
      return updated;
    });
  };

  // Create Campaign
  const createCampaign = (name: string, subject: string, template: string) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      subject,
      template,
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      meetingsRate: 0,
      status: "draft"
    };
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  // Toggle Campaign
  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) => 
      prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)
    );
  };

  // Weekly Optimization Feedback Loop
  const handleWeeklyOptimization = (reportIndex: number, optId: string, action: "approved" | "rejected") => {
    setWeeklyReports((prev) => {
      const updated = [...prev];
      const opt = updated[reportIndex].proposedOptimizations.find((o) => o.id === optId);
      if (opt) {
        opt.status = action;
      }
      return updated;
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        user,
        isLoggedIn,
        isEmailVerified,
        onboardingStep,
        plan,
        workspaceName,
        freeScanUsed,
        scanReport,
        scanningInProgress,
        mode,
        apolloConnected,
        zohoConnected,
        apolloApiKey,
        zohoAuthToken,
        uploadedFiles,
        leads,
        campaigns,
        weeklyReports,
        leadSearchesThisMonth,
        aiMessagesThisMonth,
        login,
        logout,
        verifyOtp,
        selectPlan,
        runWebsiteScan,
        updateWorkspaceName,
        connectApollo,
        connectZoho,
        uploadDocument,
        toggleSellingMode,
        sendOutreachAction,
        updateLeadStatus,
        createCampaign,
        toggleCampaignStatus,
        handleWeeklyOptimization,
        resetScan,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};


