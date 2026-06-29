"use client";

import React, { useState } from "react";
import { useAppState, AIAgent } from "@/context/AppStateContext";
import {
  Bot, Plus, Cpu, Play, Pause, Trash2, Sparkles,
  ChevronRight, X, Globe, Linkedin, Users, Building2, MapPin,
  Hash, User, Zap, Target, Layers, AlarmClock, Eye, MessageSquare
} from "lucide-react";

type WizardStep = "type" | "icp" | "signals" | "leads" | "review";

export default function AgentsPage() {
  const { agents, createAgent, deleteAgent, updateAgent, scanReport } = useAppState();
  const [showWizard, setShowWizard] = useState(false);
  const [agentType, setAgentType] = useState<"autopilot" | "onetime" | null>(null);
  const [step, setStep] = useState<WizardStep>("type");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const [icpForm, setIcpForm] = useState({
    jobTitles: "",
    industries: "",
    companySizes: [] as string[],
    locations: "",
    companyTypes: [] as string[],
    additionalCriteria: "",
  });

  const [signalForm, setSignalForm] = useState({
    companyLinkedIn: "",
    engagementKeywords: "",
    influencers: "",
    triggerTopIcp: false,
    triggerFunding: false,
    triggerJobChanges: false,
    linkedInGroups: "",
    linkedInEvents: "",
    competitors: "",
    excludedCompanies: "",
  });

  const [listName, setListName] = useState("");
  const [oneTimeLink, setOneTimeLink] = useState("");
  const [oneTimeList, setOneTimeList] = useState("");

  const resetWizard = () => {
    setShowWizard(false);
    setAgentType(null);
    setStep("type");
    setIcpForm({ jobTitles: "", industries: "", companySizes: [], locations: "", companyTypes: [], additionalCriteria: "" });
    setSignalForm({ companyLinkedIn: "", engagementKeywords: "", influencers: "", triggerTopIcp: false, triggerFunding: false, triggerJobChanges: false, linkedInGroups: "", linkedInEvents: "", competitors: "", excludedCompanies: "" });
    setListName("");
    setOneTimeLink("");
    setOneTimeList("");
  };

  const handleCreateAgent = () => {
    if (agentType === "autopilot") {
      const newAgent: AIAgent = {
        id: `agent-${Date.now()}`,
        name: `${scanReport?.companyName || "My"} Agent`,
        type: "autopilot",
        status: "active",
        createdAt: new Date().toISOString(),
        icp: {
          jobTitles: icpForm.jobTitles.split(",").map(s => s.trim()).filter(Boolean),
          industries: icpForm.industries.split(",").map(s => s.trim()).filter(Boolean),
          companySizes: icpForm.companySizes,
          locations: icpForm.locations.split(",").map(s => s.trim()).filter(Boolean),
          companyTypes: icpForm.companyTypes,
          additionalCriteria: icpForm.additionalCriteria,
        },
        signals: {
          companyLinkedIn: signalForm.companyLinkedIn,
          engagementKeywords: signalForm.engagementKeywords.split(",").map(s => s.trim()).filter(Boolean),
          influencers: signalForm.influencers.split(",").map(s => s.trim()).filter(Boolean),
          triggerTopIcp: signalForm.triggerTopIcp,
          triggerFunding: signalForm.triggerFunding,
          triggerJobChanges: signalForm.triggerJobChanges,
          linkedInGroups: signalForm.linkedInGroups.split(",").map(s => s.trim()).filter(Boolean),
          linkedInEvents: signalForm.linkedInEvents.split(",").map(s => s.trim()).filter(Boolean),
          competitors: signalForm.competitors.split(",").map(s => s.trim()).filter(Boolean),
          excludedCompanies: signalForm.excludedCompanies.split(",").map(s => s.trim()).filter(Boolean),
        },
        logs: [
          { message: `Agent initialized — targeting ${icpForm.jobTitles || "target roles"}`, time: "Just now" },
          { message: `Configured with ${signalForm.engagementKeywords.split(",").filter(Boolean).length + (signalForm.triggerTopIcp ? 1 : 0) + (signalForm.triggerFunding ? 1 : 0) + (signalForm.triggerJobChanges ? 1 : 0) + signalForm.influencers.split(",").filter(Boolean).length + signalForm.competitors.split(",").filter(Boolean).length} signals`, time: "Just now" },
        ],
        leadsAnalyzed: 0,
        icpMatchCount: 0,
        leadsSavedCount: 0,
      };
      createAgent(newAgent);
    } else {
      const newAgent: AIAgent = {
        id: `agent-${Date.now()}`,
        name: `One-time: ${oneTimeLink.substring(0, 40)}...`,
        type: "onetime",
        status: "active",
        createdAt: new Date().toISOString(),
        icp: {
          jobTitles: icpForm.jobTitles.split(",").map(s => s.trim()).filter(Boolean),
          industries: [],
          companySizes: [],
          locations: [],
          companyTypes: [],
          additionalCriteria: "",
        },
        signals: {
          companyLinkedIn: "",
          engagementKeywords: [],
          influencers: [],
          triggerTopIcp: false,
          triggerFunding: false,
          triggerJobChanges: false,
          linkedInGroups: [],
          linkedInEvents: [],
          competitors: [],
          excludedCompanies: [],
        },
        logs: [
          { message: `One-time agent created for: ${oneTimeLink}`, time: "Just now" },
          { message: `Sending leads to list: ${oneTimeList || "Default"}`, time: "Just now" },
        ],
        leadsAnalyzed: 0,
        icpMatchCount: 0,
        leadsSavedCount: 0,
      };
      createAgent(newAgent);
    }
    resetWizard();
  };

  const sizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  const typeOptions = ["Startup", "Private Company", "Public Company", "Nonprofit", "Agency", "Freelancer"];

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Agents</h1>
          <p className="text-[11px] text-gray-400">
            Create and manage AI agents that find and contact high-intent leads 24/7.
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Launch Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">No agents yet</p>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Launch your first AI agent to start finding warm leads that match your ideal customer profile.
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Launch your first agent
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map(agent => (
            <div key={agent.id} className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5">
                      <div className="h-full w-full rounded-[10px] bg-dark-bg flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-dark-bg ${agent.status === "active" ? "bg-secondary animate-pulse" : "bg-gray-500"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        agent.type === "autopilot"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-accent/10 text-accent border-accent/20"
                      }`}>
                        {agent.type === "autopilot" ? "Autopilot" : "One-time"}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        agent.status === "active" ? "bg-secondary/15 text-secondary" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateAgent(agent.id, { status: agent.status === "active" ? "paused" : "active" })}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title={agent.status === "active" ? "Pause" : "Activate"}
                  >
                    {agent.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedAgent === agent.id ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              {agent.type === "autopilot" && (
                <div className="grid grid-cols-3 border-t border-white/5 divide-x divide-white/5">
                  <div className="py-3 px-5 text-center">
                    <p className="text-lg font-extrabold text-white">{agent.leadsAnalyzed}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Analyzed</p>
                  </div>
                  <div className="py-3 px-5 text-center">
                    <p className="text-lg font-extrabold text-primary">{agent.icpMatchCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">ICP Match</p>
                  </div>
                  <div className="py-3 px-5 text-center">
                    <p className="text-lg font-extrabold text-secondary">{agent.leadsSavedCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">Saved</p>
                  </div>
                </div>
              )}

              {expandedAgent === agent.id && (
                <div className="border-t border-white/5 bg-black/20 p-5 space-y-4">
                  {agent.type === "autopilot" && (
                    <>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">ICP Configuration</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.icp.jobTitles.map((t, i) => (
                            <span key={i} className="text-[9px] bg-primary/5 border border-primary/15 px-2 py-0.5 rounded text-primary">{t}</span>
                          ))}
                          {agent.icp.industries.map((t, i) => (
                            <span key={i} className="text-[9px] bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded text-secondary">{t}</span>
                          ))}
                          {agent.icp.locations.map((t, i) => (
                            <span key={i} className="text-[9px] bg-accent/5 border border-accent/15 px-2 py-0.5 rounded text-accent">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Signals</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.signals.engagementKeywords.map((t, i) => (
                            <span key={i} className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">{t}</span>
                          ))}
                          {agent.signals.influencers.map((t, i) => (
                            <span key={i} className="text-[8px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-400">{t}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Activity Log</h4>
                    <div className="font-mono text-[10px] text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                      {agent.logs.map((log, i) => (
                        <p key={i}><span className="text-gray-600">[{log.time}]</span> {log.message}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={resetWizard} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-white">Launch New Agent</h2>
              </div>
              <button onClick={resetWizard} className="p-1 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
              {["type", "icp", "signals", "leads", "review"].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 ${step === s ? "text-primary" : "text-gray-600"}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      step === s ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-white/10"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-[9px] font-bold uppercase hidden sm:block">
                      {s === "type" ? "Type" : s === "icp" ? "ICP" : s === "signals" ? "Signals" : s === "leads" ? "Leads" : "Review"}
                    </span>
                  </div>
                  {i < 4 && <div className="h-px flex-1 bg-white/5" />}
                </React.Fragment>
              ))}
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {step === "type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => { setAgentType("autopilot"); setStep("icp"); }}
                    className={`rounded-xl border-2 p-5 text-left space-y-3 transition-all hover:border-primary/50 ${
                      agentType === "autopilot" ? "border-primary bg-primary/5" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <AlarmClock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Autopilot Agent</h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Runs 24/7, scans for signals every day, and sends you matched leads automatically.
                    </p>
                    <span className="text-[9px] text-primary font-semibold">Recommended →</span>
                  </button>
                  <button
                    onClick={() => { setAgentType("onetime"); setStep("icp"); }}
                    className={`rounded-xl border-2 p-5 text-left space-y-3 transition-all hover:border-accent/50 ${
                      agentType === "onetime" ? "border-accent bg-accent/5" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-white">One-Time Agent</h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Run once for a specific event, LinkedIn profile, or influencer to find attendees or followers.
                    </p>
                  </button>
                </div>
              )}

              {step === "icp" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ideal Customer Profile</h3>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Job Titles</label>
                    <input
                      type="text"
                      placeholder="e.g. Founder, CEO, Head of Sales, CMO"
                      value={icpForm.jobTitles}
                      onChange={(e) => setIcpForm(p => ({ ...p, jobTitles: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Comma separated. AI handles variations automatically.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Target Industries</label>
                    <input
                      type="text"
                      placeholder="e.g. Technology, Healthcare, Finance"
                      value={icpForm.industries}
                      onChange={(e) => setIcpForm(p => ({ ...p, industries: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {sizeOptions.map(s => (
                        <button
                          key={s}
                          onClick={() => setIcpForm(p => ({ ...p, companySizes: toggleArrayItem(p.companySizes, s) }))}
                          className={`text-[9px] px-2.5 py-1 rounded border transition-colors ${
                            icpForm.companySizes.includes(s)
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Target Locations</label>
                    <input
                      type="text"
                      placeholder="e.g. United States, Canada, North America"
                      value={icpForm.locations}
                      onChange={(e) => setIcpForm(p => ({ ...p, locations: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {typeOptions.map(t => (
                        <button
                          key={t}
                          onClick={() => setIcpForm(p => ({ ...p, companyTypes: toggleArrayItem(p.companyTypes, t) }))}
                          className={`text-[9px] px-2.5 py-1 rounded border transition-colors ${
                            icpForm.companyTypes.includes(t)
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Additional Criteria (Prompt)</label>
                    <textarea
                      placeholder="e.g. Focus on SaaS companies only. Score low salespeople, service providers, agencies, and freelancers."
                      value={icpForm.additionalCriteria}
                      onChange={(e) => setIcpForm(p => ({ ...p, additionalCriteria: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Use natural language to refine your ICP. You can ask the AI to score certain profiles low.</p>
                  </div>
                </div>
              )}

              {step === "signals" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure Signals</h3>
                    <span className="text-[9px] text-gray-500 ml-auto">10-12 recommended</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Your Company LinkedIn Page
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.linkedin.com/company/yourcompany"
                      value={signalForm.companyLinkedIn}
                      onChange={(e) => setSignalForm(p => ({ ...p, companyLinkedIn: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Hash className="h-3 w-3 inline mr-1" />
                      Engagement & Interest Keywords
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cold email, lead generation, sales automation, CRM"
                      value={signalForm.engagementKeywords}
                      onChange={(e) => setSignalForm(p => ({ ...p, engagementKeywords: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Track people interacting with posts about these topics.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <User className="h-3 w-3 inline mr-1" />
                      Influencers & Creators (LinkedIn Profiles)
                    </label>
                    <input
                      type="text"
                      placeholder="LinkedIn profile URLs, comma separated"
                      value={signalForm.influencers}
                      onChange={(e) => setSignalForm(p => ({ ...p, influencers: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Track people who interact with these profiles' content.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Activity className="h-3 w-3 inline mr-1" />
                      Trigger Events
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={signalForm.triggerTopIcp}
                          onChange={(e) => setSignalForm(p => ({ ...p, triggerTopIcp: e.target.checked }))}
                          className="rounded border-white/20 bg-white/5"
                        />
                        <span className="text-gray-300">Top 5% ICP — Active content creators in your space</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={signalForm.triggerFunding}
                          onChange={(e) => setSignalForm(p => ({ ...p, triggerFunding: e.target.checked }))}
                          className="rounded border-white/20 bg-white/5"
                        />
                        <span className="text-gray-300">Companies that raised funds (past 12 months)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={signalForm.triggerJobChanges}
                          onChange={(e) => setSignalForm(p => ({ ...p, triggerJobChanges: e.target.checked }))}
                          className="rounded border-white/20 bg-white/5"
                        />
                        <span className="text-gray-300">Recent job changes — New decision makers</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Users className="h-3 w-3 inline mr-1" />
                      LinkedIn Groups
                    </label>
                    <input
                      type="text"
                      placeholder="Group names or keywords, comma separated"
                      value={signalForm.linkedInGroups}
                      onChange={(e) => setSignalForm(p => ({ ...p, linkedInGroups: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      LinkedIn Events
                    </label>
                    <input
                      type="text"
                      placeholder="Event names or keywords, comma separated"
                      value={signalForm.linkedInEvents}
                      onChange={(e) => setSignalForm(p => ({ ...p, linkedInEvents: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <Target className="h-3 w-3 inline mr-1" />
                      Competitor Engagement
                    </label>
                    <input
                      type="text"
                      placeholder="LinkedIn company page URLs, comma separated"
                      value={signalForm.competitors}
                      onChange={(e) => setSignalForm(p => ({ ...p, competitors: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Track interactions with these companies. Include both direct competitors and companies serving same customers.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      <X className="h-3 w-3 inline mr-1" />
                      Excluded Companies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon, Google (optional)"
                      value={signalForm.excludedCompanies}
                      onChange={(e) => setSignalForm(p => ({ ...p, excludedCompanies: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">No leads from these companies will appear in your inbox.</p>
                  </div>
                </div>
              )}

              {step === "leads" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lead Management</h3>
                  </div>

                  {agentType === "onetime" ? (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          <Linkedin className="h-3 w-3 inline mr-1" />
                          Event / Profile / Influencer Link
                        </label>
                        <input
                          type="text"
                          placeholder="LinkedIn event, profile, or company page URL"
                          value={oneTimeLink}
                          onChange={(e) => setOneTimeLink(e.target.value)}
                          className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                        />
                        <p className="text-[9px] text-gray-600 mt-1">Add a LinkedIn event, influencer profile, or your own company page to find attendees/interactors.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Send To List</label>
                        <input
                          type="text"
                          placeholder="List name (e.g. Event Leads)"
                          value={oneTimeList}
                          onChange={(e) => setOneTimeList(e.target.value)}
                          className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Lead List Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Warm Leads Q3"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                      />
                      <p className="text-[9px] text-gray-600 mt-1">Leads will be automatically added to this list and trigger your campaigns.</p>
                    </div>
                  )}
                </div>
              )}

              {step === "review" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Review & Launch</h3>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-black/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Type</span>
                      <span className="text-[10px] font-bold text-white capitalize">{agentType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Target Roles</span>
                      <span className="text-[10px] text-white">{icpForm.jobTitles || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Industries</span>
                      <span className="text-[10px] text-white">{icpForm.industries || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Locations</span>
                      <span className="text-[10px] text-white">{icpForm.locations || "Not specified"}</span>
                    </div>
                    {icpForm.additionalCriteria && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Additional Criteria</span>
                        <span className="text-[10px] text-white max-w-[200px] truncate">{icpForm.additionalCriteria}</span>
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[10px] text-gray-400 block mb-1">Signals configured:</span>
                      <div className="flex flex-wrap gap-1">
                        {signalForm.engagementKeywords && <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">Keywords</span>}
                        {signalForm.influencers && <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">Influencers</span>}
                        {signalForm.triggerTopIcp && <span className="text-[8px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">Top 5% ICP</span>}
                        {signalForm.triggerFunding && <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">Funding</span>}
                        {signalForm.triggerJobChanges && <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded">Job Changes</span>}
                        {signalForm.competitors && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">Competitors</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => {
                  if (step === "icp") setStep("type");
                  else if (step === "signals") setStep("icp");
                  else if (step === "leads") setStep("signals");
                  else if (step === "review") setStep("leads");
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {step === "type" ? "" : "← Back"}
              </button>
              <button
                onClick={() => {
                  if (step === "type") setStep("icp");
                  else if (step === "icp") setStep("signals");
                  else if (step === "signals") setStep("leads");
                  else if (step === "leads") setStep("review");
                  else if (step === "review") handleCreateAgent();
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
              >
                {step === "review" ? "Launch Agent →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Activity(props: any) { return <Zap className={props.className} />; }
function Calendar(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}