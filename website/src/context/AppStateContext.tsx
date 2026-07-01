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
  isDemoSandbox?: boolean;
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
  phone: string;
  linkedinUrl: string;
  outreachStatus: "new" | "contacted" | "replied" | "meeting_booked" | "ignored";
  enrichmentStatus: "pending" | "enriched" | "failed";
}

export interface Campaign {
  id: string;
  name: string;
  leadListId: string;
  channel: "linkedin" | "email" | "multichannel";
  inviteMessage: string;
  followUpMessage: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  sentCount: number;
  replyCount: number;
  meetingCount: number;
}

export interface AIAgent {
  id: string;
  name: string;
  type: "autopilot" | "onetime" | "subagent";
  status: "active" | "paused" | "completed";
  createdAt: string;
  icp: {
    jobTitles: string[];
    industries: string[];
    companySizes: string[];
    locations: string[];
    companyTypes: string[];
    additionalCriteria: string;
  };
  signals: {
    companyLinkedIn: string;
    engagementKeywords: string[];
    influencers: string[];
    triggerTopIcp: boolean;
    triggerFunding: boolean;
    triggerJobChanges: boolean;
    linkedInGroups: string[];
    linkedInEvents: string[];
    competitors: string[];
    excludedCompanies: string[];
  };
  logs: { message: string; time: string }[];
  leadsAnalyzed: number;
  icpMatchCount: number;
  leadsSavedCount: number;
}

export interface LeadList {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  leadCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  scanReport: ScanReport | null;
  leads: Lead[];
  leadSearchesThisMonth: number;
  aiMessagesThisMonth: number;
  agents: AIAgent[];
  campaigns: Campaign[];
  leadLists: LeadList[];
  linkedInConnected: boolean;
  linkedInWeeklyLimit: number;
  linkedInActiveDays: string[];
  autoEnrichEmails: boolean;
  autoEnrichPhones: boolean;
  autoGenerateMessages: boolean;
  excludeServiceProviders: boolean;
}

interface AppStateContextProps {
  user: { name: string; email: string } | null;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  plan: "none" | "pro";
  workspaceName: string;
  scanReport: ScanReport | null;
  scanningInProgress: boolean;
  mode: "manual" | "auto";
  hubspotConnected: boolean;
  pipedriveConnected: boolean;
  linkedInConnected: boolean;
  autoEnrichEmails: boolean;
  autoEnrichPhones: boolean;
  autoGenerateMessages: boolean;
  excludeServiceProviders: boolean;
  linkedInWeeklyLimit: number;
  linkedInActiveDays: string[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  switchWorkspace: (id: string) => void;
  leads: Lead[];
  leadSearchesThisMonth: number;
  aiMessagesThisMonth: number;
  login: (email: string, name: string) => void;
  logout: () => void;
  selectPlan: (selectedPlan: "pro") => void;
  runWebsiteScan: (url: string) => Promise<ScanReport>;
  updateWorkspaceName: (name: string) => void;
  connectHubspot: (apiKey: string) => void;
  connectPipedrive: (token: string) => void;
  toggleSellingMode: (newMode: "manual" | "auto") => void;
  sendOutreachAction: (leadId: string, type: "email" | "linkedin") => void;
  updateLeadStatus: (leadId: string, status: Lead["outreachStatus"]) => void;
  enrichLead: (leadId: string) => void;
  resetScan: () => void;
  deleteWorkspace: (id: string) => void;
  agents: AIAgent[];
  campaigns: Campaign[];
  leadLists: LeadList[];
  createAgent: (agent: AIAgent) => Promise<void>;
  updateAgent: (agentId: string, updates: Partial<AIAgent>) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  createCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  createLeadList: (list: LeadList) => Promise<void>;
  deleteLeadList: (listId: string) => void;
  generateAIMessage: (type: "email" | "linkedin", lead: Lead, companyDescription?: string) => Promise<{ subject?: string; body?: string; message?: string }>;
  connectLinkedIn: () => void;
  disconnectLinkedIn: () => void;
  updateLinkedInSettings: (weeklyLimit: number, activeDays: string[]) => void;
  updateCompanySettings: (settings: { autoEnrichEmails?: boolean; autoEnrichPhones?: boolean; autoGenerateMessages?: boolean; excludeServiceProviders?: boolean }) => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [plan, setPlan] = useState<"none" | "pro">("none");
  const [scanningInProgress, setScanningInProgress] = useState(false);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [pipedriveConnected, setPipedriveConnected] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;
  const scanReport = activeWorkspace?.scanReport ?? null;
  const leads = activeWorkspace?.leads ?? [];
  const leadSearchesThisMonth = activeWorkspace?.leadSearchesThisMonth ?? 0;
  const aiMessagesThisMonth = activeWorkspace?.aiMessagesThisMonth ?? 0;
  const agents = activeWorkspace?.agents ?? [];
  const campaigns = activeWorkspace?.campaigns ?? [];
  const leadLists = activeWorkspace?.leadLists ?? [];
  const linkedInConnected = activeWorkspace?.linkedInConnected ?? false;
  const autoEnrichEmails = activeWorkspace?.autoEnrichEmails ?? false;
  const autoEnrichPhones = activeWorkspace?.autoEnrichPhones ?? false;
  const autoGenerateMessages = activeWorkspace?.autoGenerateMessages ?? false;
  const excludeServiceProviders = activeWorkspace?.excludeServiceProviders ?? false;
  const linkedInWeeklyLimit = activeWorkspace?.linkedInWeeklyLimit ?? 100;
  const linkedInActiveDays = activeWorkspace?.linkedInActiveDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const workspaceName = activeWorkspace?.name ?? "No Workspace";

  const updateWorkspaceById = (wsId: string, updater: (ws: Workspace) => Workspace) => {
    setWorkspaces(prev => {
      const idx = prev.findIndex(ws => ws.id === wsId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = updater(updated[idx]);
      localStorage.setItem("gj_workspaces", JSON.stringify(updated));
      return updated;
    });
  };

  const updateActiveWorkspace = (updater: (ws: Workspace) => Workspace) => {
    if (!activeWorkspaceId) return;
    updateWorkspaceById(activeWorkspaceId, updater);
  };

  const ensureWorkspace = () => {
    if (activeWorkspaceId) return activeWorkspaceId;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: "My Workspace",
      domain: "",
      createdAt: new Date().toISOString(),
      scanReport: null,
      leads: [],
      leadSearchesThisMonth: 0,
      aiMessagesThisMonth: 0,
      agents: [],
      campaigns: [],
      leadLists: [],
      linkedInConnected: false,
      linkedInWeeklyLimit: 100,
      linkedInActiveDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      autoEnrichEmails: false,
      autoEnrichPhones: false,
      autoGenerateMessages: false,
      excludeServiceProviders: false,
    };
    setWorkspaces(prev => {
      const updated = [newWs, ...prev];
      localStorage.setItem("gj_workspaces", JSON.stringify(updated));
      return updated;
    });
    setActiveWorkspaceId(newWs.id);
    localStorage.setItem("gj_activeWorkspaceId", newWs.id);
    return newWs.id;
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem("gj_user");
    const cachedLoggedIn = localStorage.getItem("gj_isLoggedIn");
    const cachedVerified = localStorage.getItem("gj_isEmailVerified");
    const cachedPlan = localStorage.getItem("gj_plan");
    const cachedMode = localStorage.getItem("gj_mode");
    const cachedWorkspaces = localStorage.getItem("gj_workspaces");
    const cachedActiveWsId = localStorage.getItem("gj_activeWorkspaceId");
    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedLoggedIn) setIsLoggedIn(cachedLoggedIn === "true");
    if (cachedVerified) setIsEmailVerified(cachedVerified === "true");
    if (cachedPlan) setPlan(cachedPlan as "none" | "pro");
    if (cachedMode) setMode(cachedMode as "manual" | "auto");
    if (cachedWorkspaces) setWorkspaces(JSON.parse(cachedWorkspaces));
    if (cachedActiveWsId) setActiveWorkspaceId(cachedActiveWsId);
  }, []);

  const login = (email: string, name: string) => {
    const newUser = { name, email };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("gj_user", JSON.stringify(newUser));
    localStorage.setItem("gj_isLoggedIn", "true");
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsEmailVerified(false);
    setPlan("none");
    setHubspotConnected(false);
    setPipedriveConnected(false);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    localStorage.clear();
  };

  const verifyOtp = async (_otp: string): Promise<boolean> => { return false; };

  const selectPlan = async (selectedPlan: "pro") => {
    // Activate plan locally immediately
    setPlan(selectedPlan);
    localStorage.setItem("gj_plan", selectedPlan);

    // Also sync to Supabase in the background (non-blocking)
    if (user?.email) {
      fetch(`${BACKEND_URL}/billing/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, plan: selectedPlan }),
      }).catch(() => {}); // Silent fail — local state is source of truth
    }
  };

  const updateWorkspaceName = (name: string) => {
    updateActiveWorkspace(ws => ({ ...ws, name }));
  };

  const switchWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem("gj_activeWorkspaceId", id);
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

      const leadsFromApi: Lead[] = (data.leads && data.leads.length > 0) ? data.leads : [];

      const autoAgent: AIAgent = {
        id: `agent-${Date.now()}`,
        name: `${report?.companyName || domain} Agent`,
        type: "autopilot",
        status: "active",
        createdAt: new Date().toISOString(),
        icp: {
          jobTitles: report?.estimatedICP?.targetRoles || [],
          industries: report?.estimatedICP?.industries || [],
          companySizes: report?.estimatedICP?.companySizes || [],
          locations: [report?.industry || "Global"],
          companyTypes: ["Startup", "Private Company"],
          additionalCriteria: report?.businessSummary?.slice(0, 300) || "",
        },
        signals: {
          companyLinkedIn: `https://linkedin.com/company/${domain}`,
          engagementKeywords: (report?.products || []).concat(report?.services || []).slice(0, 8),
          influencers: [],
          triggerTopIcp: true,
          triggerFunding: true,
          triggerJobChanges: true,
          linkedInGroups: [],
          linkedInEvents: [],
          competitors: (report?.topCompetitors || []).map(c => c.name),
          excludedCompanies: [],
        },
        logs: [
          { message: `Website analyzed — found ${report?.products?.length || 0} products, ${report?.services?.length || 0} services`, time: "Just now" },
          { message: `ICP configured for ${(report?.estimatedICP?.targetRoles || []).slice(0, 3).join(", ") || "Unknown"} roles`, time: "Just now" },
          { message: `Detected ${report?.topCompetitors?.length || 0} competitors in your space`, time: "Just now" },
          { message: `Found ${leadsFromApi.length} high-intent leads matching your ICP`, time: "Just now" },
          { message: `Agent is actively monitoring signals — ${report?.estimatedICP?.industries?.length || 0} industries tracked`, time: "Just now" },
        ],
        leadsAnalyzed: leadsFromApi.length,
        icpMatchCount: Math.round(leadsFromApi.length * 0.6),
        leadsSavedCount: leadsFromApi.length,
      };

      const newWorkspace: Workspace = {
        id: `ws-${Date.now()}`,
        name: domain,
        domain,
        createdAt: new Date().toISOString(),
        scanReport: report,
        leads: leadsFromApi,
        leadSearchesThisMonth: 0,
        aiMessagesThisMonth: 0,
        agents: [autoAgent],
        campaigns: [],
        leadLists: [],
        linkedInConnected: false,
        linkedInWeeklyLimit: 100,
        linkedInActiveDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        autoEnrichEmails: false,
        autoEnrichPhones: false,
        autoGenerateMessages: false,
        excludeServiceProviders: false,
      };

      try {
        await apiCall('/agents', 'POST', { ...autoAgent, workspaceId: newWorkspace.id });
      } catch (_) { /* ignore backend sync error */ }

      setWorkspaces(prev => {
        const updated = [newWorkspace, ...prev];
        localStorage.setItem("gj_workspaces", JSON.stringify(updated));
        return updated;
      });
      setActiveWorkspaceId(newWorkspace.id);
      localStorage.setItem("gj_activeWorkspaceId", newWorkspace.id);
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

  const deleteWorkspace = (id: string) => {
    const updated = workspaces.filter(ws => ws.id !== id);
    const nextId = id === activeWorkspaceId
      ? (updated[0]?.id ?? null)
      : activeWorkspaceId;

    setWorkspaces(updated);
    setActiveWorkspaceId(nextId);

    localStorage.setItem("gj_workspaces", JSON.stringify(updated));
    if (nextId) localStorage.setItem("gj_activeWorkspaceId", nextId);
    else localStorage.removeItem("gj_activeWorkspaceId");
  };

  const connectHubspot = (_apiKey: string) => {
    console.warn("[HubSpot] Integration not yet implemented — requires backend API validation");
  };

  const connectPipedrive = (_token: string) => {
    console.warn("[Pipedrive] Integration not yet implemented — requires backend API validation");
  };

  const toggleSellingMode = (newMode: "manual" | "auto") => {
    setMode(newMode);
    localStorage.setItem("gj_mode", newMode);
  };

  const sendOutreachAction = (leadId: string, type: "email" | "linkedin") => {
    updateActiveWorkspace(ws => ({
      ...ws,
      leads: ws.leads.map(l => l.id === leadId ? { ...l, outreachStatus: "contacted" as const } : l),
      aiMessagesThisMonth: ws.aiMessagesThisMonth + 1,
    }));
  };

  const updateLeadStatus = (leadId: string, status: Lead["outreachStatus"]) => {
    updateActiveWorkspace(ws => ({
      ...ws,
      leads: ws.leads.map(l => l.id === leadId ? { ...l, outreachStatus: status } : l),
    }));
  };

  const enrichLead = (leadId: string) => {
    updateActiveWorkspace(ws => ({
      ...ws,
      leads: ws.leads.map(l =>
        l.id === leadId
          ? { ...l, enrichmentStatus: "enriched" as const }
          : l
      ),
    }));
  };

  const apiCall = async (path: string, method: string, body?: any) => {
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[API Fallback] ${method} ${path} failed — using local state`, err);
      return null;
    }
  };

  const createAgent = async (agent: AIAgent) => {
    const wsId = ensureWorkspace();
    updateWorkspaceById(wsId, ws => ({
      ...ws,
      agents: [...(ws.agents || []), agent],
    }));
    const data = await apiCall('/agents', 'POST', { ...agent, workspaceId: wsId });
    if (data && data.id !== agent.id) {
      updateWorkspaceById(wsId, ws => ({
        ...ws,
        agents: (ws.agents || []).map(a => a.id === agent.id ? { ...a, id: data.id } : a),
      }));
    }
  };

  const updateAgent = async (agentId: string, updates: Partial<AIAgent>) => {
    const data = await apiCall(`/agents/${agentId}`, 'PATCH', updates);
    if (data) {
      updateActiveWorkspace(ws => ({
        ...ws,
        agents: (ws.agents || []).map(a => a.id === agentId ? { ...a, ...data } : a),
      }));
    } else {
      updateActiveWorkspace(ws => ({
        ...ws,
        agents: (ws.agents || []).map(a => a.id === agentId ? { ...a, ...updates } : a),
      }));
    }
  };

  const deleteAgent = async (agentId: string) => {
    await apiCall(`/agents/${agentId}`, 'DELETE');
    updateActiveWorkspace(ws => ({
      ...ws,
      agents: (ws.agents || []).filter(a => a.id !== agentId),
    }));
  };

  const createCampaign = async (campaign: Campaign) => {
    const wsId = ensureWorkspace();
    updateWorkspaceById(wsId, ws => ({
      ...ws,
      campaigns: [...(ws.campaigns || []), campaign],
    }));
    const data = await apiCall('/campaigns', 'POST', { ...campaign, workspaceId: wsId });
    if (data && data.id !== campaign.id) {
      updateWorkspaceById(wsId, ws => ({
        ...ws,
        campaigns: (ws.campaigns || []).map(c => c.id === campaign.id ? { ...c, id: data.id } : c),
      }));
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    const data = await apiCall(`/campaigns/${campaignId}`, 'PATCH', updates);
    if (data) {
      updateActiveWorkspace(ws => ({
        ...ws,
        campaigns: (ws.campaigns || []).map(c => c.id === campaignId ? { ...c, ...data } : c),
      }));
    } else {
      updateActiveWorkspace(ws => ({
        ...ws,
        campaigns: (ws.campaigns || []).map(c => c.id === campaignId ? { ...c, ...updates } : c),
      }));
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    await apiCall(`/campaigns/${campaignId}`, 'DELETE');
    updateActiveWorkspace(ws => ({
      ...ws,
      campaigns: (ws.campaigns || []).filter(c => c.id !== campaignId),
    }));
  };

  const createLeadList = async (list: LeadList) => {
    const wsId = ensureWorkspace();
    updateWorkspaceById(wsId, ws => ({
      ...ws,
      leadLists: [...(ws.leadLists || []), list],
    }));
    const data = await apiCall('/lead-lists', 'POST', { ...list, workspaceId: wsId });
    if (data && data.id !== list.id) {
      updateWorkspaceById(wsId, ws => ({
        ...ws,
        leadLists: (ws.leadLists || []).map(l => l.id === list.id ? { ...l, id: data.id } : l),
      }));
    }
  };

  const deleteLeadList = (listId: string) => {
    updateWorkspaceById(ensureWorkspace(), ws => ({
      ...ws,
      leadLists: (ws.leadLists || []).filter(l => l.id !== listId),
    }));
  };

  const generateAIMessage = async (type: "email" | "linkedin", lead: Lead, companyDescription?: string) => {
    const ws = activeWorkspace;
    const desc = companyDescription || ws?.scanReport?.businessSummary || ws?.scanReport?.aiSummary || "";
    try {
      if (type === "email") {
        const res = await fetch(`${BACKEND_URL}/ai/generate-outreach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadName: lead.name,
            role: lead.role,
            company: lead.companyName,
            triggers: lead.intentSignals,
            companyDescription: desc,
          }),
        });
        if (res.ok) return await res.json();
      } else {
        const res = await fetch(`${BACKEND_URL}/ai/generate-linkedin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadName: lead.name,
            role: lead.role,
            company: lead.companyName,
            triggers: lead.intentSignals,
            companyDescription: desc,
          }),
        });
        if (res.ok) return await res.json();
      }
    } catch (err) {
      console.warn("AI generate failed, using fallback:", err);
    }
    return {};
  };

  const connectLinkedIn = async () => {
    await apiCall(`/workspaces/${activeWorkspaceId}/settings`, 'PATCH', { linkedInConnected: true });
    updateActiveWorkspace(ws => ({ ...ws, linkedInConnected: true }));
  };

  const disconnectLinkedIn = async () => {
    await apiCall(`/workspaces/${activeWorkspaceId}/settings`, 'PATCH', { linkedInConnected: false });
    updateActiveWorkspace(ws => ({ ...ws, linkedInConnected: false }));
  };

  const updateLinkedInSettings = async (weeklyLimit: number, activeDays: string[]) => {
    await apiCall(`/workspaces/${activeWorkspaceId}/settings`, 'PATCH', { linkedInWeeklyLimit: weeklyLimit, linkedInActiveDays: activeDays });
    updateActiveWorkspace(ws => ({ ...ws, linkedInWeeklyLimit: weeklyLimit, linkedInActiveDays: activeDays }));
  };

  const updateCompanySettings = async (settings: { autoEnrichEmails?: boolean; autoEnrichPhones?: boolean; autoGenerateMessages?: boolean; excludeServiceProviders?: boolean }) => {
    await apiCall(`/workspaces/${activeWorkspaceId}/settings`, 'PATCH', settings);
    updateActiveWorkspace(ws => ({ ...ws, ...settings }));
  };

  return (
    <AppStateContext.Provider
      value={{
        user, isLoggedIn, isEmailVerified, plan, workspaceName,
        scanReport, scanningInProgress,
        mode, hubspotConnected, pipedriveConnected,
        linkedInConnected, autoEnrichEmails, autoEnrichPhones,
        autoGenerateMessages, excludeServiceProviders,
        linkedInWeeklyLimit, linkedInActiveDays,
        workspaces, activeWorkspaceId, switchWorkspace,
        leads, leadSearchesThisMonth, aiMessagesThisMonth,
        agents, campaigns, leadLists,
        login, logout, selectPlan, runWebsiteScan,
        updateWorkspaceName, connectHubspot, connectPipedrive,
        toggleSellingMode, sendOutreachAction, updateLeadStatus,
        enrichLead, resetScan, deleteWorkspace,
        createAgent, updateAgent, deleteAgent,
        createCampaign, updateCampaign, deleteCampaign,
        createLeadList, deleteLeadList, generateAIMessage,
        connectLinkedIn, disconnectLinkedIn,
        updateLinkedInSettings, updateCompanySettings,
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
