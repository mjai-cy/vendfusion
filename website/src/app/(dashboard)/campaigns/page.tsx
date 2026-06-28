"use client";

import React, { useState } from "react";
import { useAppState, Campaign, SequenceStep } from "@/context/AppStateContext";
import { 
  Mail, Play, Pause, Plus, CheckCircle, BarChart3, 
  HelpCircle, Eye, EyeOff, Loader2, Sparkles,
  ChevronDown, ChevronRight, Clock, MessageSquare,
  Linkedin, Phone, Edit3, Settings
} from "lucide-react";

const CHANNEL_ICONS = { email: Mail, linkedin: Linkedin, whatsapp: Phone };

export default function CampaignsBuilder() {
  const { campaigns, createCampaign, toggleCampaignStatus } = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalActive, setModalActive] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<"email" | "linkedin" | "multichannel">("multichannel");
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName || !newSubject || !newTemplate) return;
    setLoading(true);
    setTimeout(() => {
      createCampaign(newCampaignName, newSubject, newTemplate, campaignChannel);
      setLoading(false);
      setModalActive(false);
      setNewCampaignName("");
      setNewSubject("");
      setNewTemplate("");
      setCampaignChannel("multichannel");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Campaign Builder</h1>
          <p className="text-[11px] text-gray-400">
            Multi-step sequences across email, LinkedIn, and WhatsApp with automated scheduling.
          </p>
        </div>
        <button
          onClick={() => setModalActive(true)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-semibold text-white shadow-lg transition-colors gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Magic Campaign
        </button>
      </div>

      {/* Campaigns Listing */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((camp) => (
          <CampaignCard
            key={camp.id}
            campaign={camp}
            expanded={expandedId === camp.id}
            onToggleExpand={() => setExpandedId(expandedId === camp.id ? null : camp.id)}
            onToggleStatus={() => toggleCampaignStatus(camp.id)}
          />
        ))}
        {campaigns.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">
            No campaigns yet. Click "Magic Campaign" to create your first multi-step sequence.
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {modalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-bg/95 p-6 shadow-2xl glass-panel space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Magic Campaign
              </h3>
              <p className="text-xs text-gray-400">AI generates a multi-step sequence across channels.</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campaign Name</label>
                <input type="text" placeholder="e.g. Fintech founders outbound" required value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full h-9 rounded border border-white/10 bg-white/5 px-2 text-xs text-white placeholder-gray-600 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Channel</label>
                <select value={campaignChannel} onChange={(e) => setCampaignChannel(e.target.value as any)}
                  className="w-full h-9 rounded border border-white/10 bg-[#121212] px-2 text-xs text-white focus:outline-none">
                  <option value="multichannel">Multichannel (LinkedIn + Email)</option>
                  <option value="linkedin">LinkedIn Only</option>
                  <option value="email">Email Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject Line</label>
                <input type="text" placeholder="Intro: {{company}} growth" required value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-9 rounded border border-white/10 bg-white/5 px-2 text-xs text-white placeholder-gray-600 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Message Template</span>
                  <span className="text-[8px] text-gray-500">{"{{company}}"}, {"{{first_name}}"}</span>
                </label>
                <textarea placeholder="Hi {{first_name}}, noticed {{company}}..." rows={4} required value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  className="w-full rounded border border-white/10 bg-white/5 p-2 text-xs text-white placeholder-gray-600 focus:outline-none font-sans resize-none" />
              </div>
              <div className="text-[10px] text-gray-500 bg-white/5 rounded-lg p-3 border border-white/5">
                <strong className="text-gray-300">Magic Sequence:</strong> AI will auto-generate a 4-step drip (LinkedIn → Email → Follow-up → Final follow-up) with smart delays.
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalActive(false)}
                  className="h-9 rounded border border-white/10 px-4 text-xs font-semibold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={loading}
                  className="h-9 rounded bg-primary hover:bg-primary-hover px-4 text-xs font-semibold text-white shadow-lg shadow-primary/20 flex items-center gap-1.5">
                  {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</> : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function CampaignCard({ campaign, expanded, onToggleExpand, onToggleStatus }: {
  campaign: Campaign; expanded: boolean; onToggleExpand: () => void; onToggleStatus: () => void;
}) {
  const activeSteps = campaign.steps?.filter(s => s.status !== "completed") || [];
  const completedSteps = campaign.steps?.filter(s => s.status === "completed") || [];

  return (
    <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
      {/* Header row */}
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 min-w-0">
          <button className="text-gray-500 hover:text-white shrink-0">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white">{campaign.name}</h3>
            {campaign.channel === "multichannel" && (
              <span className="text-[8px] font-bold px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20 uppercase">Multi</span>
            )}
            {campaign.channel === "linkedin" && (
              <span className="text-[8px] font-bold px-2 py-0.5 rounded border bg-secondary/15 text-secondary border-secondary/20 uppercase">LinkedIn</span>
            )}
            {campaign.channel === "email" && (
              <span className="text-[8px] font-bold px-2 py-0.5 rounded border bg-blue-500/15 text-blue-400 border-blue-500/20 uppercase">Email</span>
            )}
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
              campaign.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-center">
            <div><span className="text-[8px] text-gray-500 block">Sent</span><span className="text-xs font-bold text-white">{campaign.sentCount}</span></div>
            <div><span className="text-[8px] text-gray-500 block">Opens</span><span className="text-xs font-bold text-primary">{campaign.openRate}%</span></div>
            <div><span className="text-[8px] text-gray-500 block">Replies</span><span className="text-xs font-bold text-secondary">{campaign.replyRate}%</span></div>
            <div><span className="text-[8px] text-gray-500 block">Meet</span><span className="text-xs font-bold text-accent">{campaign.meetingsRate}%</span></div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
            className={`inline-flex h-7 items-center justify-center rounded px-2.5 text-[9px] font-bold border transition-colors gap-1 ${
              campaign.status === "active"
                ? "bg-yellow-500/10 hover:bg-yellow-500/15 border-yellow-500/20 text-yellow-400"
                : "bg-green-500/10 hover:bg-green-500/15 border-green-500/20 text-green-400"
            }`}>
            {campaign.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Start</>}
          </button>
        </div>
      </div>

      {/* Expanded sequence details */}
      {expanded && campaign.steps && (
        <div className="border-t border-white/5 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sequence Steps ({campaign.steps.length})</span>
          </div>
          {campaign.steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step.condition === "wait_for_reply"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-primary/10 border-primary/30 text-primary"
                }`}>
                  {React.createElement(CHANNEL_ICONS[step.channel] || Mail, { className: "h-3 w-3" })}
                </div>
                {idx < campaign.steps.length - 1 && <div className="w-px h-full min-h-[24px] bg-white/10" />}
              </div>
              {/* Step content */}
              <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-white">Step {step.order}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                    step.channel === "email" ? "border-blue-500/20 text-blue-400 bg-blue-500/10" :
                    step.channel === "linkedin" ? "border-secondary/20 text-secondary bg-secondary/10" :
                    "border-green-500/20 text-green-400 bg-green-500/10"
                  }`}>{step.channel}</span>
                  {step.delayDays > 0 && (
                    <span className="text-[8px] text-gray-500 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> D+{step.delayDays}
                    </span>
                  )}
                  {step.condition === "wait_for_reply" && (
                    <span className="text-[8px] text-yellow-400/80 flex items-center gap-0.5">
                      <MessageSquare className="h-2.5 w-2.5" /> Wait for reply
                    </span>
                  )}
                </div>
                {step.channel === "email" && step.subject && (
                  <p className="text-[9px] text-gray-500 mt-0.5 font-mono">Subject: {step.subject}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{step.template}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
