"use client";

import React, { useState } from "react";
import { useAppState, Lead } from "@/context/AppStateContext";
import { 
  Target, Mail, Send, RefreshCw, Check, 
  ChevronRight, Search, Sparkles, Linkedin,
  Building2, Users, Globe, AlertCircle
} from "lucide-react";

interface ApolloSearchResult {
  id: string;
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  company: string;
  company_domain: string;
  industry: string;
  city: string;
  country: string;
  intent_score: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export default function LeadsIntelligence() {
  const { leads, sendOutreachAction, updateLeadStatus, zohoConnected } = useAppState();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>("lead-1");
  const [isSending, setIsSending] = useState(false);

  // Apollo Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchTitle, setSearchTitle] = useState("CTO,VP Engineering,CISO");
  const [searchIndustry, setSearchIndustry] = useState("Fintech,SaaS");
  const [searchCountry, setSearchCountry] = useState("United States,India");
  const [isSearching, setIsSearching] = useState(false);
  const [apolloResults, setApolloResults] = useState<ApolloSearchResult[]>([]);
  const [searchError, setSearchError] = useState("");

  // Company enrichment state
  const [enrichDomain, setEnrichDomain] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<any>(null);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleSend = (type: "email" | "whatsapp") => {
    if (!selectedLead) return;
    setIsSending(true);
    setTimeout(() => {
      sendOutreachAction(selectedLead.id, type);
      setIsSending(false);
    }, 1200);
  };

  const syncToCrm = (leadId: string) => {
    if (!zohoConnected) {
      alert("CRM sync is managed automatically by the system. Contact support if you need manual access.");
      return;
    }
    updateLeadStatus(leadId, "reviewing");
    setTimeout(() => {
      alert(`Prospect synchronized and deal opportunity created in CRM pipeline!`);
    }, 1000);
  };

  const handleApolloSearch = async () => {
    setIsSearching(true);
    setSearchError("");
    setApolloResults([]);
    try {
      const res = await fetch(`${BACKEND_URL}/apollo/leads/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles: searchTitle.split(",").map(t => t.trim()).filter(Boolean),
          industries: searchIndustry.split(",").map(i => i.trim()).filter(Boolean),
          countries: searchCountry.split(",").map(c => c.trim()).filter(Boolean),
          per_page: 10,
        }),
      });
      const data = await res.json();
      setApolloResults(data.leads || []);
      if (!data.leads?.length) setSearchError("No leads found for these filters. Try broader criteria.");
    } catch {
      setSearchError("Could not connect to backend. Make sure the backend is running on port 3002.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnrichOrg = async () => {
    if (!enrichDomain) return;
    setIsEnriching(true);
    setEnrichResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/apollo/enrich/organization?domain=${encodeURIComponent(enrichDomain)}`);
      const data = await res.json();
      setEnrichResult(data.organization);
    } catch {
      setEnrichResult({ error: "Enrichment failed — backend not reachable" });
    } finally {
      setIsEnriching(false);
    }
  };

  const getStatusBadgeColor = (status: Lead["status"]) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "reviewing": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "sent": return "bg-primary/10 text-primary border-primary/20";
      case "interested": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "meeting_booked": return "bg-secondary/15 text-secondary border-secondary/20";
      default: return "bg-gray-500/10 text-gray-400 border-white/5";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Lead Intelligence & Prospecting</h1>
          <p className="text-[11px] text-gray-400">
            Monitor buying signals, enrich contacts via Apollo, and approve customized outreach drafts.
          </p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary/10 border border-primary/25 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {showSearch ? "Hide" : "Search with Apollo AI"}
        </button>
      </div>

      {/* Apollo Search Panel */}
      {showSearch && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Apollo Lead Discovery</h3>
            <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 ml-auto">LIVE API</span>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Titles</label>
              <input
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="CTO, VP Engineering, CISO"
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Industry</label>
              <input
                value={searchIndustry}
                onChange={(e) => setSearchIndustry(e.target.value)}
                placeholder="Fintech, SaaS, Healthtech"
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Country</label>
              <input
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="United States, India"
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={handleApolloSearch}
            disabled={isSearching}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            {isSearching ? "Searching Apollo database..." : "Search Leads"}
          </button>

          {searchError && (
            <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {apolloResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">{apolloResults.length} leads retrieved from Apollo</p>
              <div className="divide-y divide-white/5 rounded-lg border border-white/10 overflow-hidden">
                {apolloResults.map((lead, i) => (
                  <div key={lead.id || i} className="flex items-center justify-between p-3 bg-dark-bg/40 hover:bg-white/5 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{lead.name}</span>
                        {lead.linkedin_url && (
                          <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                            <Linkedin className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{lead.title} · {lead.company}</p>
                      <p className="text-[9px] text-gray-600">{lead.city}, {lead.country} · {lead.industry}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-gray-500 block uppercase tracking-wider">Score</span>
                      <span className="text-sm font-extrabold text-secondary">{lead.intent_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Enrichment */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Company Enrichment (by domain)
            </h4>
            <div className="flex gap-2">
              <input
                value={enrichDomain}
                onChange={(e) => setEnrichDomain(e.target.value)}
                placeholder="e.g. stripe.com or openai.com"
                className="flex-grow h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleEnrichOrg}
                disabled={isEnriching || !enrichDomain}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold hover:bg-secondary/25 transition-colors disabled:opacity-50"
              >
                {isEnriching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                Enrich
              </button>
            </div>

            {enrichResult && !enrichResult.error && (
              <div className="rounded-lg border border-white/10 bg-dark-bg/60 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{enrichResult.name}</span>
                  {enrichResult.linkedin_url && (
                    <a href={enrichResult.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px]">
                      <Linkedin className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 pt-1">
                  <span>🏭 <strong className="text-gray-300">Industry:</strong> {enrichResult.industry}</span>
                  <span>👥 <strong className="text-gray-300">Employees:</strong> {enrichResult.employee_count?.toLocaleString()}</span>
                  <span>💰 <strong className="text-gray-300">Funding:</strong> {enrichResult.funding || "N/A"}</span>
                  <span>📅 <strong className="text-gray-300">Founded:</strong> {enrichResult.founded_year || "N/A"}</span>
                  <span className="col-span-2">📍 <strong className="text-gray-300">HQ:</strong> {enrichResult.headquarters}</span>
                </div>
                {enrichResult.description && (
                  <p className="text-[10px] text-gray-500 leading-relaxed border-t border-white/5 pt-2">{enrichResult.description}</p>
                )}
              </div>
            )}
            {enrichResult?.error && (
              <p className="text-xs text-red-400">{enrichResult.error}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Leads Table */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Identified Target Leads</h3>
            <span className="text-[10px] text-gray-500 font-mono">{leads.length} accounts found</span>
          </div>

          <div className="divide-y divide-white/5">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No active leads found. Complete your website scan in onboarding or use Apollo Search above.
              </div>
            ) : (
              leads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="space-y-1.5 flex-grow pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{lead.name}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase ${getStatusBadgeColor(lead.status)}`}>
                          {lead.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {lead.role} at <span className="text-white font-semibold">{lead.companyName}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {lead.intentSignals.slice(0, 2).map((sig, idx) => (
                          <span key={idx} className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] text-gray-500 font-sans border border-white/5">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Intent Score</span>
                        <span className={`text-sm font-extrabold ${lead.intentScore >= 90 ? "text-secondary" : "text-primary"}`}>
                          {lead.intentScore}%
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Outreach Composer */}
        {selectedLead && (
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-6">
            
            {/* Header Profiler */}
            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white">{selectedLead.name}</h3>
              <p className="text-xs text-gray-400">{selectedLead.role} • {selectedLead.companyName}</p>
              <div className="pt-2 flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                <span>Domain: <span className="text-primary">{selectedLead.domain}</span></span>
                <span>•</span>
                <span>Score: <span className="text-secondary font-bold">{selectedLead.intentScore}%</span></span>
              </div>
            </div>

            {/* Buying triggers */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Identified Buying Intents</span>
              <div className="space-y-1.5">
                {selectedLead.intentSignals.map((sig, idx) => (
                  <div key={idx} className="rounded bg-black/30 border border-white/5 p-2 text-[10px] text-gray-300 leading-relaxed font-sans">
                    {sig}
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach Composer */}
            <div className="space-y-4 pt-2 border-t border-white/5 font-sans">
              <div className="rounded border border-white/5 bg-black/40 p-3.5 space-y-3 font-mono text-[10px] leading-relaxed text-gray-400">
                <p><span className="text-primary font-bold">Subject:</span> {selectedLead.outreachDrafts.email.subject}</p>
                <div className="border-t border-white/5 pt-2 whitespace-pre-line text-[9px] font-sans leading-relaxed text-gray-300">
                  {selectedLead.outreachDrafts.email.body}
                </div>
              </div>

              {selectedLead.status !== "sent" ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleSend("email")}
                    disabled={isSending}
                    className="w-full inline-flex h-9 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-lg bg-primary hover:bg-primary-hover shadow-primary/20 transition-colors gap-1.5"
                  >
                    {isSending ? (
                      <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Pacing delivery...</>
                    ) : (
                      <><Send className="h-3.5 w-3.5" />Send Outreach (Email)</>
                    )}
                  </button>
                  <button
                    onClick={() => syncToCrm(selectedLead.id)}
                    className="w-full inline-flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Sync Opportunity to CRM
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-3 text-center text-xs text-secondary font-semibold flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> Message Sent Successfully
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
