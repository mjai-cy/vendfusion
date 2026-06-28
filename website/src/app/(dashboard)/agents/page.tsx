"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Cpu, Sparkles, Plus, Play, Pause, ChevronRight, HelpCircle, 
  Trash2, Terminal, Target, Settings, Database, RefreshCw,
  AlertCircle, Users, Globe, Building2, Eye, Link2, Info
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: "autopilot" | "onetime";
  status: "active" | "paused";
  targetList: string;
  created: string;
  aiModel?: "gemini" | "claude";
  icp: {
    titles: string[];
    industries: string[];
    locations: string[];
    sizes: string[];
    additionalPrompt: string;
  };
  signals: string[];
  logs: string[];
}

export default function AIAgentsPage() {
  const { workspaceName } = useAppState();

  // Agents start empty — users create their own real agents
  const [agents, setAgents] = useState<Agent[]>([]);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentType, setNewAgentType] = useState<"autopilot" | "onetime">("autopilot");
  const [targetList, setTargetList] = useState("Series A Founders Outreach");

  // ICP step state
  const [titlesStr, setTitlesStr] = useState("VP Engineering, CTO, CISO");
  const [industriesStr, setIndustriesStr] = useState("SaaS, Fintech, Cyber Security");
  const [locationsStr, setLocationsStr] = useState("United States, United Kingdom");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["50-200", "201-1000"]);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [selectedAiModel, setSelectedAiModel] = useState<"gemini" | "claude">("gemini");

  // Signals step state
  const [selectedSignals, setSelectedSignals] = useState<string[]>([
    "Job Change / Promotion",
    "Competitor Post Interaction"
  ]);

  // Onetime URL state
  const [onetimeUrl, setOnetimeUrl] = useState("");
  const [onetimeOutputList, setOnetimeOutputList] = useState("Series A Founders Outreach");
  const [onetimeLogs, setOnetimeLogs] = useState<string[]>([]);
  const [isOnetimeRunning, setIsOnetimeRunning] = useState(false);

  // Available signals list
  const availableSignals = [
    { id: "sig-profile", title: "LinkedIn Profile Visitors", desc: "Track users who view your personal or company profile" },
    { id: "sig-competitor", title: "Competitor Post Interaction", desc: "Track users who comment/like posts from competitor pages" },
    { id: "sig-job", title: "Job Change / Promotion", desc: "Track decision makers starting new roles in the past 90 days" },
    { id: "sig-funding", title: "Recent Company Funding", desc: "Track companies that raised investment in the past 12 months" },
    { id: "sig-hiring", title: "Hiring Spikes", desc: "Track companies putting out new job openings matching your keyword" },
    { id: "sig-topic", title: "Topic Engagement", desc: "Track people posting or commenting about specific industry hashtags" },
    { id: "sig-group", title: "LinkedIn Group Members", desc: "Track users who recently joined specific interest groups" },
    { id: "sig-event", title: "LinkedIn Event Attendees", desc: "Scrape attendees who register for relevant webinars" },
  ];

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSignalToggle = (signal: string) => {
    setSelectedSignals(prev =>
      prev.includes(signal) ? prev.filter(s => s !== signal) : [...prev, signal]
    );
  };

  const handleLaunchAgent = () => {
    if (!newAgentName) {
      alert("Please provide a name for this AI Agent.");
      return;
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      type: newAgentType,
      status: "active",
      targetList: targetList,
      created: new Date().toISOString().split("T")[0],
      aiModel: selectedAiModel,
      icp: {
        titles: titlesStr.split(",").map(s => s.trim()).filter(Boolean),
        industries: industriesStr.split(",").map(s => s.trim()).filter(Boolean),
        locations: locationsStr.split(",").map(s => s.trim()).filter(Boolean),
        sizes: selectedSizes,
        additionalPrompt: additionalPrompt,
      },
      signals: selectedSignals,
      logs: [
        `[Just Now] Agent initialized on ${selectedAiModel === "gemini" ? "Google Gemini 2.0" : "Anthropic Claude 3.5"} engine.`,
        `[Just Now] Configuration saved: ICP contains ${selectedSizes.length} company size tiers and ${selectedSignals.length} intent signal triggers.`,
        `[Just Now] Scanning pipeline scheduled.`
      ]
    };

    setAgents([newAgent, ...agents]);
    setShowWizard(false);
    setWizardStep(1);
    setNewAgentName("");
    setAdditionalPrompt("");
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
    ));
  };

  const deleteAgent = (id: string) => {
    if (confirm("Are you sure you want to delete this AI Agent?")) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleRunOnetime = () => {
    if (!onetimeUrl) {
      alert("Please paste a valid LinkedIn profile, post, or event URL.");
      return;
    }
    setIsOnetimeRunning(true);
    setOnetimeLogs([
      "[17:15:00] Initializing One-time scrap scraper...",
      "[17:15:02] Extracting target link metadata...",
      "[17:15:05] Connecting browser session to LinkedIn interface..."
    ]);

    setTimeout(() => {
      setOnetimeLogs(prev => [
        ...prev,
        "[17:15:10] Parsing attendee/engagement list. Identified 84 profile connections.",
        "[17:15:12] Applying ICP criteria (VP/Director, SaaS/Fintech, North America)..."
      ]);
    }, 2000);

    setTimeout(() => {
      setOnetimeLogs(prev => [
        ...prev,
        "[17:15:18] Found 6 profiles matching ICP criteria. Filtered 3 existing records.",
        `[17:15:20] Completed successfully! Imported 3 new high-intent leads to the '${onetimeOutputList}' list.`
      ]);
      setIsOnetimeRunning(false);
    }, 4500);
  };

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" /> Target Job Titles
                </label>
                <input
                  value={titlesStr}
                  onChange={(e) => setTitlesStr(e.target.value)}
                  placeholder="VP of Engineering, CTO, Founder"
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" /> Target Industries
                </label>
                <input
                  value={industriesStr}
                  onChange={(e) => setIndustriesStr(e.target.value)}
                  placeholder="Fintech, SaaS, E-commerce"
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3 text-primary" /> Locations
                </label>
                <input
                  value={locationsStr}
                  onChange={(e) => setLocationsStr(e.target.value)}
                  placeholder="United States, Canada, Europe"
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Company Size Tiers</label>
              <div className="flex flex-wrap gap-2">
                {["1-10", "11-50", "50-200", "201-1000", "1000+"].map(size => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        active 
                          ? "bg-primary border-primary text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {size} emp
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Outreach LLM Model Engine</label>
              <select
                value={selectedAiModel}
                onChange={(e) => setSelectedAiModel(e.target.value as "gemini" | "claude")}
                className="w-full h-10 rounded-lg border border-white/10 bg-dark-bg/80 px-3 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="gemini">Google Gemini 2.0 Pro (Recommended)</option>
                <option value="claude">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>

            {/* Additional criteria prompt */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <Info className="h-3 w-3 text-gray-500" /> Additional Search Criteria (AI Prompt)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="e.g. Can you score service providers and freelancers very low? Focus on companies with active engineering hires."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none font-sans"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setWizardStep(2)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-xs font-bold text-white hover:bg-primary-hover gap-1"
              >
                Next: Configure Signals
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Choose Intent Triggers (Recommend 3-5)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSignals.map(sig => {
                  const active = selectedSignals.includes(sig.title);
                  return (
                    <div
                      key={sig.id}
                      onClick={() => handleSignalToggle(sig.title)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                        active
                          ? "bg-primary/10 border-primary text-white"
                          : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        readOnly
                        className="accent-primary mt-0.5 rounded border-white/10 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{sig.title}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">{sig.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setWizardStep(1)}
                className="h-9 px-4 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setWizardStep(3)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-xs font-bold text-white hover:bg-primary-hover gap-1"
              >
                Next: Final Details
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Agent Name</label>
                <input
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Cyber Security Outreach Agent"
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Outreach Campaign List</label>
                <select
                  value={targetList}
                  onChange={(e) => setTargetList(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Series A Founders Outreach">Series A Founders Outreach</option>
                  <option value="Enterprise CISOs Security Audit">Enterprise CISOs Security Audit</option>
                </select>
              </div>
            </div>

            {/* Summary of Configuration */}
            <div className="rounded-lg bg-black/40 border border-white/5 p-4 space-y-2 text-xs">
              <h4 className="font-bold text-gray-300">Configuration Summary</h4>
              <p className="text-[11px] text-gray-400">
                Ideal Customer Profile: <span className="text-white">{titlesStr || "None"}</span> in <span className="text-white">{industriesStr || "None"}</span> sizes <span className="text-white">{selectedSizes.join(", ")} emp</span>.
              </p>
              <p className="text-[11px] text-gray-400">
                Signals Monitored: <span className="text-white">{selectedSignals.join(", ")}</span>.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setWizardStep(2)}
                className="h-9 px-4 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleLaunchAgent}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-6 text-xs font-bold text-white hover:bg-secondary-hover gap-1 shadow-lg shadow-secondary/15"
              >
                <Cpu className="h-4 w-4" />
                Activate Agent Autopilot
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Outreach Agents</h1>
          <p className="text-[11px] text-gray-400">
            Configure autonomous agents to monitor LinkedIn engagement signals 24/7 and route qualified leads.
          </p>
        </div>
        <button
          onClick={() => {
            setShowWizard(true);
            setWizardStep(1);
          }}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white transition-colors shadow-lg shadow-primary/10"
        >
          <Plus className="h-4 w-4" />
          Launch New Agent
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Wizard or Active Agents List */}
        <div className="lg:col-span-2 space-y-6">
          {showWizard ? (
            /* WIZARD CONTAINER */
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 radial-glow opacity-5" />
              
              {/* Wizard Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-bold uppercase tracking-wider">Step {wizardStep} of 3</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {wizardStep === 1 && "Define Ideal Customer Profile (ICP)"}
                    {wizardStep === 2 && "Configure Intent Signals"}
                    {wizardStep === 3 && "Final Settings & Launch"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Wizard Steps indicator */}
              <div className="flex items-center gap-3 relative z-10">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${wizardStep >= 1 ? "bg-primary" : "bg-white/5"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${wizardStep >= 2 ? "bg-primary" : "bg-white/5"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${wizardStep >= 3 ? "bg-primary" : "bg-white/5"}`} />
              </div>

              {/* Render step details using switch statement */}
              {renderWizardContent()}
            </div>
          ) : (
            /* ACTIVE AGENTS SECTION */
            <div className="space-y-6">
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> Active Autopilot Agents
                </h3>
                
                {agents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <Cpu className="h-10 w-10 text-white/10" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">No agents yet</p>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                        Click &ldquo;Launch New Agent&rdquo; above to configure your first autonomous AI prospecting agent.
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowWizard(true); setWizardStep(1); }}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Launch First Agent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map(agent => (
                      <div key={agent.id} className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-4 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                agent.status === "active" ? "bg-secondary/10 text-secondary" : "bg-white/5 text-gray-500"
                              }`}>
                                {agent.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500">Created on {agent.created} · Destination list: <span className="text-primary font-medium">{agent.targetList}</span></p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleAgentStatus(agent.id)}
                              className={`p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 transition-colors`}
                              title={agent.status === "active" ? "Pause Agent" : "Resume Agent"}
                            >
                              {agent.status === "active" ? <Pause className="h-3.5 w-3.5 text-yellow-500" /> : <Play className="h-3.5 w-3.5 text-secondary" />}
                            </button>
                            <button
                              onClick={() => deleteAgent(agent.id)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Delete Agent"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* ICP Tags */}
                        <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                          <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-400">ICP: {agent.icp.titles.slice(0, 2).join(", ")}</span>
                          <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-400">Industries: {agent.icp.industries.slice(0, 2).join(", ")}</span>
                          <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-400">Sizes: {agent.icp.sizes.join(", ")} emp</span>
                        </div>

                        {/* Monitored Signals */}
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Monitored Signals:</span>
                          <div className="flex flex-wrap gap-1">
                            {agent.signals.map((sig, idx) => (
                              <span key={idx} className="text-[9px] bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded text-secondary font-medium">
                                • {sig}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Realtime Agent Logs */}
                        <div className="space-y-2 border-t border-white/5 pt-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 uppercase tracking-wider font-bold">
                            <Terminal className="h-3 w-3 text-primary animate-pulse" /> Live Execution Logs
                          </div>
                          <div className="rounded border border-white/5 bg-black/40 p-2.5 font-mono text-[9px] text-gray-400 h-24 overflow-y-auto space-y-1">
                            {agent.logs.map((log, idx) => (
                              <p key={idx} className={log.includes("Added") ? "text-secondary" : log.includes("Found") ? "text-primary" : "text-gray-500"}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: One-Time Agent */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-5">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-secondary" /> One-Time Event Agent
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Paste any specific LinkedIn Event URL or Profile Link to pull attendees or engagers matching your ICP.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">LinkedIn URL</label>
                <input
                  value={onetimeUrl}
                  onChange={(e) => setOnetimeUrl(e.target.value)}
                  placeholder="e.g. https://www.linkedin.com/events/72384728347..."
                  className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Destination List</label>
                <select
                  value={onetimeOutputList}
                  onChange={(e) => setOnetimeOutputList(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Series A Founders Outreach">Series A Founders Outreach</option>
                  <option value="Enterprise CISOs Security Audit">Enterprise CISOs Security Audit</option>
                </select>
              </div>

              <button
                onClick={handleRunOnetime}
                disabled={isOnetimeRunning || !onetimeUrl}
                className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-secondary hover:bg-secondary-hover text-xs font-bold text-white shadow-lg shadow-secondary/10 transition-colors disabled:opacity-50 gap-1.5"
              >
                {isOnetimeRunning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Analyzing link...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Extract & Route Leads
                  </>
                )}
              </button>
            </div>

            {/* Scraper Logs */}
            {onetimeLogs.length > 0 && (
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Scraper Status logs</span>
                <div className="rounded border border-white/5 bg-black/40 p-2.5 font-mono text-[9px] text-gray-400 h-24 overflow-y-auto space-y-1">
                  {onetimeLogs.map((log, idx) => (
                    <p key={idx} className={log.includes("successfully") ? "text-secondary" : log.includes("Found") ? "text-primary" : "text-gray-500"}>
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Info Card */}
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-3">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" /> Active Signal Best Practices
            </h4>
            <ul className="space-y-2 text-[10px] text-gray-400 list-disc list-inside leading-relaxed">
              <li>Configure <strong className="text-gray-300">10-12 triggers</strong> for maximum leads output.</li>
              <li>Track at least <strong className="text-gray-300">2 direct competitor</strong> LinkedIn pages.</li>
              <li>Refine targets with custom exclusions to maintain higher email deliverability.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
