"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import {
  Megaphone, Plus, Play, Pause, Trash2, Linkedin, Mail,
  MessageSquare, ChevronRight, X, Target, Check, Sparkles
} from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, leadLists, createCampaign, deleteCampaign, updateCampaign, leads } = useAppState();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<"source" | "message" | "followup">("source");
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [inviteMessage, setInviteMessage] = useState("Hi {{first_name}}, I saw you're doing {{something_interesting}} — would love to connect!");
  const [followUp, setFollowUp] = useState("");
  const [channel, setChannel] = useState<"linkedin" | "email" | "multichannel">("linkedin");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const handleCreate = () => {
    createCampaign({
      id: `camp-${Date.now()}`,
      name: `Campaign - ${leadLists.find(l => l.id === selectedList)?.name || newListName || "New List"}`,
      leadListId: selectedList,
      channel,
      inviteMessage,
      followUpMessage: followUp,
      status: "active",
      createdAt: new Date().toISOString(),
      sentCount: 0,
      replyCount: 0,
      meetingCount: 0,
    });
    setShowCreate(false);
    setStep("source");
    setSelectedList("");
    setNewListName("");
    setInviteMessage("Hi {{first_name}}, I saw you're doing {{something_interesting}} — would love to connect!");
    setFollowUp("");
    setChannel("linkedin");
  };

  const campaignLeads = (campId: string) => {
    const camp = campaigns.find(c => c.id === campId);
    if (!camp) return 0;
    return leads.filter(l => l.outreachStatus !== "new").length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-[11px] text-gray-400">
            Create and manage LinkedIn and email outreach campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">No campaigns yet</p>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Create your first outreach campaign. Select a lead list, write your message, and let the AI handle the rest.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(camp => (
            <div key={camp.id} className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    camp.channel === "linkedin" ? "bg-blue-500/10 border border-blue-500/20" :
                    camp.channel === "email" ? "bg-primary/10 border border-primary/20" :
                    "bg-accent/10 border border-accent/20"
                  }`}>
                    {camp.channel === "linkedin" ? <Linkedin className="h-5 w-5 text-blue-400" /> :
                     camp.channel === "email" ? <Mail className="h-5 w-5 text-primary" /> :
                     <MessageSquare className="h-5 w-5 text-accent" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{camp.name}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        camp.channel === "linkedin" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        camp.channel === "email" ? "bg-primary/10 text-primary border border-primary/20" :
                        "bg-accent/10 text-accent border border-accent/20"
                      }`}>
                        {camp.channel}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        camp.status === "active" ? "bg-secondary/15 text-secondary" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">Created {new Date(camp.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateCampaign(camp.id, { status: camp.status === "active" ? "paused" : "active" })}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {camp.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteCampaign(camp.id)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedCampaign(expandedCampaign === camp.id ? null : camp.id)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedCampaign === camp.id ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-white/5 divide-x divide-white/5">
                <div className="py-3 px-5 text-center">
                  <p className="text-lg font-extrabold text-white">{camp.sentCount}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">Sent</p>
                </div>
                <div className="py-3 px-5 text-center">
                  <p className="text-lg font-extrabold text-accent">{camp.replyCount}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">Replies</p>
                </div>
                <div className="py-3 px-5 text-center">
                  <p className="text-lg font-extrabold text-secondary">{camp.meetingCount}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">Meetings</p>
                </div>
              </div>

              {expandedCampaign === camp.id && (
                <div className="border-t border-white/5 bg-black/20 p-5 space-y-3">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Invite Message</h4>
                    <p className="text-[10px] text-gray-300 bg-black/30 rounded p-2 border border-white/5">{camp.inviteMessage}</p>
                  </div>
                  {camp.followUpMessage && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Follow-up</h4>
                      <p className="text-[10px] text-gray-300 bg-black/30 rounded p-2 border border-white/5">{camp.followUpMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-white">Create Campaign</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
              {["source", "message", "followup"].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 ${step === s ? "text-primary" : "text-gray-600"}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      step === s ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-white/10"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-[9px] font-bold uppercase hidden sm:block">
                      {s === "source" ? "Source" : s === "message" ? "Message" : "Follow-up"}
                    </span>
                  </div>
                  {i < 2 && <div className="h-px flex-1 bg-white/5" />}
                </React.Fragment>
              ))}
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[55vh] overflow-y-auto">
              {step === "source" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Lead Source</h3>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Lead List</label>
                    <div className="space-y-2">
                      {leadLists.map(list => (
                        <button
                          key={list.id}
                          onClick={() => setSelectedList(list.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                            selectedList === list.id
                              ? "bg-primary/5 border-primary/30"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold text-white">{list.name}</p>
                            <p className="text-[9px] text-gray-500">{list.leadCount} leads</p>
                          </div>
                          {selectedList === list.id && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                      {leadLists.length === 0 && (
                        <p className="text-[10px] text-gray-500 py-2">No lists yet. Type a name to create one.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Or create new list</label>
                    <input
                      type="text"
                      placeholder="List name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["linkedin", "email", "multichannel"] as const).map(ch => (
                        <button
                          key={ch}
                          onClick={() => setChannel(ch)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            channel === ch
                              ? "bg-primary/5 border-primary/30"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-center mb-1">
                            {ch === "linkedin" ? <Linkedin className="h-4 w-4 text-blue-400" /> :
                             ch === "email" ? <Mail className="h-4 w-4 text-primary" /> :
                             <MessageSquare className="h-4 w-4 text-accent" />}
                          </div>
                          <span className="text-[9px] font-bold text-gray-300 capitalize">{ch}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === "message" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {channel === "linkedin" ? "Invite Note" : channel === "email" ? "Email Draft" : "Initial Message"}
                    </h3>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      {channel === "linkedin" ? "LinkedIn Invite Message" : "Message"}
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none font-sans"
                      placeholder="Write your message..."
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Use {'{{first_name}}'} for personalization. AI will replace placeholders automatically.</p>
                  </div>
                </div>
              )}

              {step === "followup" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Follow-up Message (Optional)</h3>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Follow-up after connection</label>
                    <textarea
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      rows={5}
                      placeholder="e.g. Hey {{first_name}}, thanks for connecting! I noticed {{signal}} — would you be open to a quick chat?"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none font-sans"
                    />
                    <p className="text-[9px] text-gray-600 mt-1">Leave empty if you don't want a follow-up.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => { if (step === "message") setStep("source"); else if (step === "followup") setStep("message"); }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {step === "source" ? "" : "← Back"}
              </button>
              <button
                onClick={() => {
                  if (step === "source") setStep("message");
                  else if (step === "message") setStep("followup");
                  else if (step === "followup") handleCreate();
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all gap-1.5"
              >
                {step === "followup" ? "Create Campaign →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
