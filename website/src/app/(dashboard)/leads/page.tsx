"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Target, Search, Filter, RefreshCw, Mail, Linkedin, 
  CheckCircle2, User, Building2, Globe, Sparkles, Zap,
  Plus, X, MessageSquare, Send, Layers, Inbox, List,
  Trash2, Edit3, Users
} from "lucide-react";

type LeadsTab = "inbox" | "lists";

export default function LeadsPage() {
  const { leads, enrichLead, sendOutreachAction, updateLeadStatus, scanReport, leadLists, createLeadList, deleteLeadList, generateAIMessage } = useAppState();
  const [tab, setTab] = useState<LeadsTab>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const [contactNowLead, setContactNowLead] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, { linkedin?: string; emailBody?: string; emailSubject?: string }>>({});
  const [generatingMessages, setGeneratingMessages] = useState<Set<string>>(new Set());
  const [showAddToList, setShowAddToList] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [activeList, setActiveList] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeList) {
      return matchesSearch;
    }
    return matchesSearch;
  });

  const handleEnrich = (leadId: string) => {
    setEnrichingIds(prev => new Set(prev).add(leadId));
    setTimeout(() => {
      enrichLead(leadId);
      setEnrichingIds(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }, 1500);
  };

  const handleSend = (leadId: string, type: "email" | "linkedin") => {
    sendOutreachAction(leadId, type);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createLeadList({
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      description: "",
      createdAt: new Date().toISOString(),
      leadCount: 0,
    });
    setNewListName("");
  };

  const contactLead = leads.find(l => l.id === contactNowLead);

  const handleOpenContactNow = async (leadId: string) => {
    setContactNowLead(leadId);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const genId = `gen-${leadId}`;
    if (generatedMessages[genId]) return;
    setGeneratingMessages(prev => new Set(prev).add(leadId));
    const [emailResult, linkedinResult] = await Promise.all([
      generateAIMessage("email", lead),
      generateAIMessage("linkedin", lead),
    ]);
    setGeneratedMessages(prev => ({
      ...prev,
      [genId]: {
        emailSubject: emailResult.subject || "",
        emailBody: emailResult.body || `Hi ${lead.name.split(" ")[0]},\n\nI noticed you're the ${lead.role} at ${lead.companyName}. We help companies automate outbound and book more meetings.\n\nWorth a 15-min chat?\n\nBest,\n[Your Name]`,
        linkedin: linkedinResult.message || `Hi ${lead.name.split(" ")[0]}, I saw your work at ${lead.companyName} — would love to connect!`,
      },
    }));
    setGeneratingMessages(prev => {
      const next = new Set(prev);
      next.delete(leadId);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Lead Intelligence</h1>
          <p className="text-[11px] text-gray-400">
            Automatically detected prospects with buying signals and intent scores.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5 pb-0">
        <button
          onClick={() => setTab("inbox")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "inbox" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          Inbox
          {leads.length > 0 && (
            <span className="ml-1 bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded-full">{leads.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab("lists")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "lists" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <List className="h-3.5 w-3.5" />
          Lists
          {leadLists.length > 0 && (
            <span className="ml-1 bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded-full">{leadLists.length}</span>
          )}
        </button>
      </div>

      {tab === "inbox" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{leads.length} leads</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveList(null)}
                className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                  !activeList ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                All
              </button>
              {leadLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list.id)}
                  className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                    activeList === list.id ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>
          </div>

          {scanReport && (
            <div className="flex flex-wrap gap-1.5">
              {scanReport.estimatedICP.targetRoles.slice(0, 5).map((role, i) => (
                <span key={i} className="text-[9px] bg-primary/5 border border-primary/15 px-2 py-0.5 rounded text-primary font-medium">ICP: {role}</span>
              ))}
              {scanReport.estimatedICP.industries.slice(0, 3).map((ind, i) => (
                <span key={i} className="text-[9px] bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded text-secondary font-medium">{ind}</span>
              ))}
            </div>
          )}

          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Target className="h-10 w-10 text-white/10" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No leads yet</p>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Your agent will automatically find and score leads based on your website analysis and intent signals.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel space-y-3 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                        <div className="h-full w-full rounded-full bg-dark-bg flex items-center justify-center text-xs font-bold text-white">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            lead.intentScore >= 80 ? "bg-secondary/15 text-secondary border border-secondary/20" :
                            lead.intentScore >= 60 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                            "bg-white/5 text-gray-500 border border-white/10"
                          }`}>
                            {lead.intentScore}% Intent
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{lead.role} @ {lead.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenContactNow(lead.id)}
                        className="px-2 py-1.5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-colors text-[9px] font-bold flex items-center gap-1"
                        title="Contact Now"
                      >
                        <MessageSquare className="h-3 w-3" /> Contact
                      </button>
                      <button
                        onClick={() => setShowAddToList(lead.id)}
                        className="p-1.5 rounded bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent transition-colors"
                        title="Add to list"
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleEnrich(lead.id)}
                        disabled={enrichingIds.has(lead.id) || lead.enrichmentStatus === "enriched"}
                        className="p-1.5 rounded bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 text-secondary transition-colors disabled:opacity-40"
                        title={lead.enrichmentStatus === "enriched" ? "Enriched" : "Enrich lead"}
                      >
                        {enrichingIds.has(lead.id) ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                      lead.outreachStatus === "meeting_booked" ? "bg-green-500/10 text-green-400" :
                      lead.outreachStatus === "replied" ? "bg-accent/10 text-accent" :
                      lead.outreachStatus === "contacted" ? "bg-secondary/10 text-secondary" :
                      "bg-white/5 text-gray-500"
                    }`}>
                      {lead.outreachStatus.replace("_", " ")}
                    </span>
                    {lead.enrichmentStatus === "enriched" && (
                      <span className="text-secondary flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Enriched
                      </span>
                    )}
                    {lead.email && lead.enrichmentStatus === "enriched" && (
                      <span className="text-gray-500">{lead.email}</span>
                    )}
                  </div>

                  {lead.intentSignals.length > 0 && (
                    <div className="flex flex-wrap gap-1 border-t border-white/5 pt-2">
                      {lead.intentSignals.slice(0, 5).map((sig, idx) => (
                        <span key={idx} className="text-[8px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-gray-400">
                          {sig}
                        </span>
                      ))}
                      {lead.intentSignals.length > 5 && (
                        <span className="text-[8px] text-gray-600">+{lead.intentSignals.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Create new list..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-grow max-w-xs h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Create List
            </button>
          </div>

          {leadLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <List className="h-10 w-10 text-white/10" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No lists yet</p>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Create a list to organize your leads. You can add leads from the Inbox tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leadLists.map(list => (
                <div key={list.id} className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel hover:border-white/10 transition-colors space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{list.name}</h4>
                        <p className="text-[9px] text-gray-500">{list.leadCount} lead{list.leadCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteLeadList(list.id)}
                      className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-[9px] text-gray-600">
                    Created {new Date(list.createdAt).toLocaleDateString()}
                  </div>
                  {list.description && (
                    <p className="text-[10px] text-gray-500">{list.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Now Modal */}
      {contactNowLead && contactLead && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setContactNowLead(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-white">Contact Now</h2>
              </div>
              <button onClick={() => setContactNowLead(null)} className="p-1 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/30">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {contactLead.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{contactLead.name}</p>
                  <p className="text-[10px] text-gray-400">{contactLead.role} @ {contactLead.companyName}</p>
                </div>
              </div>

              {generatingMessages.has(contactLead.id) ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                  <span className="ml-2 text-xs text-gray-400">Generating AI messages...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Linkedin className="h-4 w-4 text-blue-400" />
                      <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">LinkedIn Message</h3>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed bg-black/30 rounded p-2 border border-white/5">
                      {generatedMessages[`gen-${contactLead.id}`]?.linkedin || `Hi ${contactLead.name.split(" ")[0]}, I saw your work at ${contactLead.companyName} — would love to connect!`}
                    </p>
                    <button
                      onClick={() => { handleSend(contactLead.id, "linkedin"); setContactNowLead(null); }}
                      disabled={contactLead.outreachStatus !== "new"}
                      className="w-full h-8 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-[10px] font-bold text-blue-400 transition-colors flex items-center justify-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Send LinkedIn Message
                    </button>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider">Email Draft</h3>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed bg-black/30 rounded p-2 border border-white/5 whitespace-pre-line">
                      {generatedMessages[`gen-${contactLead.id}`]?.emailBody || `Hi ${contactLead.name.split(" ")[0]},\n\nI noticed you're the ${contactLead.role} at ${contactLead.companyName}. We help companies automate outbound and book more meetings.\n\nWorth a 15-min chat?\n\nBest,\n[Your Name]`}
                    </p>
                    <button
                      onClick={() => { handleSend(contactLead.id, "email"); setContactNowLead(null); }}
                      disabled={contactLead.outreachStatus !== "new"}
                      className="w-full h-8 rounded bg-primary/20 hover:bg-primary/30 border border-primary/30 text-[10px] font-bold text-primary transition-colors flex items-center justify-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Send Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add to List Modal */}
      {showAddToList && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddToList(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white">Add to List</h2>
              <button onClick={() => setShowAddToList(null)} className="p-1 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {leadLists.map(list => (
                <button
                  key={list.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:border-white/20 text-left transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{list.name}</p>
                    <p className="text-[9px] text-gray-500">{list.leadCount} leads</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-gray-400" />
                </button>
              ))}
              <div className="border-t border-white/5 pt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="New list name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-grow h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
