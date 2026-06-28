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

export interface SequenceStep {
  id: string;
  order: number;
  channel: "email" | "linkedin" | "whatsapp";
  delayDays: number;
  subject?: string;
  template: string;
  condition: "auto" | "wait_for_reply" | "wait_for_meeting";
  status?: "pending" | "sent" | "replied" | "completed";
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
  channel: "email" | "linkedin" | "multichannel";
  steps: SequenceStep[];
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

// Each URL scan owns its own isolated workspace
export interface Workspace {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  scanReport: ScanReport | null;
  leads: Lead[];
  campaigns: Campaign[];
  weeklyReports: WeeklyReport[];
  uploadedFiles: FileDetail[];
  leadSearchesThisMonth: number;
  aiMessagesThisMonth: number;
}

interface AppStateContextProps {
  user: { name: string; email: string } | null;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  onboardingStep: number;
  plan: "none" | "starter" | "pro";
  workspaceName: string;
  freeScanUsed: boolean;
  scanReport: ScanReport | null;
  scanningInProgress: boolean;
  mode: "manual" | "pro-ai";
  apolloConnected: boolean;
  zohoConnected: boolean;
  apolloApiKey: string;
  zohoAuthToken: string;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  switchWorkspace: (id: string) => void;
  uploadedFiles: FileDetail[];
  leads: Lead[];
  campaigns: Campaign[];
  weeklyReports: WeeklyReport[];
  leadSearchesThisMonth: number;
  aiMessagesThisMonth: number;
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
  createCampaign: (name: string, subject: string, template: string, channel?: Campaign["channel"], steps?: SequenceStep[]) => void;
  toggleCampaignStatus: (id: string) => void;
  handleWeeklyOptimization: (reportIndex: number, optId: string, action: "approved" | "rejected") => void;
  resetScan: () => void;
  deleteWorkspace: (id: string) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [plan, setPlan] = useState<"none" | "starter" | "pro">("none");
  const [freeScanUsed, setFreeScanUsed] = useState(false);
  const [scanningInProgress, setScanningInProgress] = useState(false);
  const [mode, setMode] = useState<"manual" | "pro-ai">("manual");
  const [apolloConnected, setApolloConnected] = useState(false);
  const [zohoConnected, setZohoConnected] = useState(false);
  const [apolloApiKey, setApolloApiKey] = useState("");
  const [zohoAuthToken, setZohoAuthToken] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;
  const scanReport = activeWorkspace?.scanReport ?? null;
  const leads = activeWorkspace?.leads ?? [];
  const campaigns = activeWorkspace?.campaigns ?? [];
  const weeklyReports = activeWorkspace?.weeklyReports ?? [];
  const uploadedFiles = activeWorkspace?.uploadedFiles ?? [];
  const leadSearchesThisMonth = activeWorkspace?.leadSearchesThisMonth ?? 0;
  const aiMessagesThisMonth = activeWorkspace?.aiMessagesThisMonth ?? 0;
  const workspaceName = activeWorkspace?.name ?? "No Workspace";

  const updateActiveWorkspace = (updater: (ws: Workspace) => Workspace) => {
    if (!activeWorkspaceId) return;
    setWorkspaces(prev => {
      const updated = prev.map(ws => ws.id === activeWorkspaceId ? updater(ws) : ws);
      localStorage.setItem("xyz_workspaces", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem("xyz_user");
    const cachedLoggedIn = localStorage.getItem("xyz_isLoggedIn");
    const cachedVerified = localStorage.getItem("xyz_isEmailVerified");
    const cachedOnboarding = localStorage.getItem("xyz_onboardingStep");
    const cachedPlan = localStorage.getItem("xyz_plan");
    const cachedFreeScan = localStorage.getItem("xyz_freeScanUsed");
    const cachedApollo = localStorage.getItem("xyz_apolloConnected");
    const cachedZoho = localStorage.getItem("xyz_zohoConnected");
    const cachedMode = localStorage.getItem("xyz_mode");
    const cachedWorkspaces = localStorage.getItem("xyz_workspaces");
    const cachedActiveWsId = localStorage.getItem("xyz_activeWorkspaceId");

    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedLoggedIn) setIsLoggedIn(cachedLoggedIn === "true");
    if (cachedVerified) setIsEmailVerified(cachedVerified === "true");
    if (cachedOnboarding) setOnboardingStep(Number(cachedOnboarding));
    if (cachedPlan) setPlan(cachedPlan as "none" | "starter" | "pro");
    if (cachedFreeScan) setFreeScanUsed(cachedFreeScan === "true");
    if (cachedApollo) setApolloConnected(cachedApollo === "true");
    if (cachedZoho) setZohoConnected(cachedZoho === "true");
    if (cachedMode) setMode(cachedMode as "manual" | "pro-ai");
    if (cachedWorkspaces) setWorkspaces(JSON.parse(cachedWorkspaces));
    if (cachedActiveWsId) setActiveWorkspaceId(cachedActiveWsId);
  }, []);

  const login = (email: string, name: string) => {
    const newUser = { name, email };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("xyz_user", JSON.stringify(newUser));
    localStorage.setItem("xyz_isLoggedIn", "true");
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setOnboardingStep(1);
    setPlan("none");
    setFreeScanUsed(false);
    setApolloConnected(false);
    setZohoConnected(false);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    localStorage.clear();
  };

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

  const selectPlan = (selectedPlan: "starter" | "pro") => {
    setPlan(selectedPlan);
    setOnboardingStep(3);
    localStorage.setItem("xyz_plan", selectedPlan);
    localStorage.setItem("xyz_onboardingStep", "3");
  };

  const updateWorkspaceName = (name: string) => {
    updateActiveWorkspace(ws => ({ ...ws, name }));
  };

  const switchWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem("xyz_activeWorkspaceId", id);
  };

  const runWebsiteScan = async (url: string): Promise<ScanReport> => {
    setScanningInProgress(true);
    try {
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
      const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];

      const res = await fetch(`${BACKEND_URL}/scan/website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      const report: ScanReport = data.report || data;

      const newWorkspace: Workspace = {
        id: `ws-${Date.now()}`,
        name: domain,
        domain,
        createdAt: new Date().toISOString(),
        scanReport: report,
        leads: [],
        campaigns: [],
        weeklyReports: [],
        uploadedFiles: [],
        leadSearchesThisMonth: 0,
        aiMessagesThisMonth: 0,
      };

      setWorkspaces(prev => {
        const updated = [newWorkspace, ...prev];
        localStorage.setItem("xyz_workspaces", JSON.stringify(updated));
        return updated;
      });
      setActiveWorkspaceId(newWorkspace.id);
      localStorage.setItem("xyz_activeWorkspaceId", newWorkspace.id);
      setFreeScanUsed(true);
      localStorage.setItem("xyz_freeScanUsed", "true");
      setScanningInProgress(false);
      return report;
    } catch (err) {
      console.error("Website scan failed:", err);
      setScanningInProgress(false);
      throw err;
    }
  };

  const resetScan = () => {
    if (!activeWorkspaceId) return;
    deleteWorkspace(activeWorkspaceId);
  };

  // Delete any workspace by ID — handles both active and non-active cleanly
  const deleteWorkspace = (id: string) => {
    const updated = workspaces.filter(ws => ws.id !== id);
    // If deleting the active workspace, switch to next available
    const nextId = id === activeWorkspaceId
      ? (updated[0]?.id ?? null)
      : activeWorkspaceId;

    setWorkspaces(updated);
    setActiveWorkspaceId(nextId);

    localStorage.setItem("xyz_workspaces", JSON.stringify(updated));
    if (nextId) localStorage.setItem("xyz_activeWorkspaceId", nextId);
    else localStorage.removeItem("xyz_activeWorkspaceId");
  };

  const connectApollo = (apiKey: string) => {
    setApolloConnected(true);
    setApolloApiKey(apiKey);
    localStorage.setItem("xyz_apolloConnected", "true");
  };

  const connectZoho = (token: string) => {
    setZohoConnected(true);
    setZohoAuthToken(token);
    localStorage.setItem("xyz_zohoConnected", "true");
  };

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
      extractedText: "",
    };

    updateActiveWorkspace(ws => ({ ...ws, uploadedFiles: [newFile, ...ws.uploadedFiles] }));

    setTimeout(() => {
      updateActiveWorkspace(ws => ({
        ...ws,
        uploadedFiles: ws.uploadedFiles.map(f =>
          f.id === newFile.id
            ? { ...f, status: "chunked" as const, chunks: Math.floor(Math.random() * 15) + 3 }
            : f
        ),
      }));
    }, 2000);

    setTimeout(() => {
      updateActiveWorkspace(ws => ({
        ...ws,
        uploadedFiles: ws.uploadedFiles.map(f =>
          f.id === newFile.id
            ? {
                ...f,
                status: "embedded" as const,
                extractedText: `Extracted company context from ${name}. Embedded 512-dimension vectors into pgvector catalog.`,
              }
            : f
        ),
      }));
    }, 4500);
  };

  const toggleSellingMode = (newMode: "manual" | "pro-ai") => {
    if (plan === "starter" && newMode === "pro-ai") {
      alert("AI Mode requires a Pro AI subscription. Please upgrade your plan.");
      return;
    }
    setMode(newMode);
    localStorage.setItem("xyz_mode", newMode);
  };

  const sendOutreachAction = (leadId: string, type: "email" | "whatsapp") => {
    updateActiveWorkspace(ws => ({
      ...ws,
      leads: ws.leads.map(l => l.id === leadId ? { ...l, status: "sent" as const } : l),
      aiMessagesThisMonth: ws.aiMessagesThisMonth + 1,
    }));
  };

  const updateLeadStatus = (leadId: string, status: Lead["status"]) => {
    updateActiveWorkspace(ws => ({
      ...ws,
      leads: ws.leads.map(l => l.id === leadId ? { ...l, status } : l),
    }));
  };

  const createCampaign = (name: string, subject: string, template: string, channel: Campaign["channel"] = "multichannel", steps?: SequenceStep[]) => {
    const defaultSteps: SequenceStep[] = steps || (() => {
      if (channel === "email") return [{
        id: `step-${Date.now()}-0`, order: 1, channel: "email", delayDays: 0,
        subject, template, condition: "auto" as const, status: "pending" as const,
      }];
      if (channel === "linkedin") return [{
        id: `step-${Date.now()}-0`, order: 1, channel: "linkedin", delayDays: 0,
        subject: "", template, condition: "auto" as const, status: "pending" as const,
      }];
      return [
        { id: `step-${Date.now()}-0`, order: 1, channel: "linkedin", delayDays: 0, subject: "", template: `Hi {{first_name}}, noticed {{company}} is growing. Would love to connect!`, condition: "auto" as const, status: "pending" as const },
        { id: `step-${Date.now()}-1`, order: 2, channel: "email", delayDays: 2, subject, template, condition: "wait_for_reply" as const, status: "pending" as const },
        { id: `step-${Date.now()}-2`, order: 3, channel: "linkedin", delayDays: 5, subject: "", template: `Hey {{first_name}} — following up on growth opportunities. Available for a quick chat?`, condition: "auto" as const, status: "pending" as const },
        { id: `step-${Date.now()}-3`, order: 4, channel: "email", delayDays: 7, subject: `Quick follow-up: ${subject}`, template: `Hi {{first_name}},\n\nJust circling back. Would love to show you how we've helped similar teams.\n\nBest,\n{{sender_name}}`, condition: "auto" as const, status: "pending" as const },
      ];
    })();

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      subject,
      template,
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      meetingsRate: 0,
      status: "draft",
      channel,
      steps: defaultSteps,
    };
    updateActiveWorkspace(ws => ({ ...ws, campaigns: [newCamp, ...ws.campaigns] }));
  };

  const toggleCampaignStatus = (id: string) => {
    updateActiveWorkspace(ws => ({
      ...ws,
      campaigns: ws.campaigns.map(c =>
        c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c
      ),
    }));
  };

  const handleWeeklyOptimization = (reportIndex: number, optId: string, action: "approved" | "rejected") => {
    updateActiveWorkspace(ws => {
      const updatedReports = [...ws.weeklyReports];
      const opt = updatedReports[reportIndex]?.proposedOptimizations.find(o => o.id === optId);
      if (opt) opt.status = action;
      return { ...ws, weeklyReports: updatedReports };
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        user, isLoggedIn, isEmailVerified, onboardingStep, plan, workspaceName,
        freeScanUsed, scanReport, scanningInProgress,
        mode, apolloConnected, zohoConnected, apolloApiKey, zohoAuthToken,
        workspaces, activeWorkspaceId, switchWorkspace,
        uploadedFiles, leads, campaigns, weeklyReports,
        leadSearchesThisMonth, aiMessagesThisMonth,
        login, logout, verifyOtp, selectPlan, runWebsiteScan,
        updateWorkspaceName, connectApollo, connectZoho, uploadDocument,
        toggleSellingMode, sendOutreachAction, updateLeadStatus,
        createCampaign, toggleCampaignStatus, handleWeeklyOptimization, resetScan, deleteWorkspace,
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
