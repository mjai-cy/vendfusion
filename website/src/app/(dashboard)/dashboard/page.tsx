"use client";

import React, { useEffect, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Users, Mail, Calendar, BarChart3, 
  Sparkles, Cpu, Activity, Target, Zap, MessageSquare, CheckCircle2
} from "lucide-react";

export default function AgentDashboard() {
  const { 
    leads, mode, scanReport, aiMessagesThisMonth, workspaceName
  } = useAppState();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLeadsCount = leads.length;
  const meetingsBookedCount = leads.filter(l => l.outreachStatus === "meeting_booked").length;
  const repliedCount = leads.filter(l => l.outreachStatus === "replied").length;
  const contactedCount = leads.filter(l => l.outreachStatus === "contacted").length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Agent Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg">
              <div className="h-full w-full rounded-[10px] bg-dark-bg flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-dark-bg ${mode === "auto" ? "bg-secondary animate-pulse" : "bg-yellow-500"}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Your AI Agent</h1>
            <p className="text-[11px] text-gray-400">
              {mode === "auto" 
                ? "Agent is prospecting 24/7 — finding leads and sending outreach automatically" 
                : "Agent is paused — review drafts before sending"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${mode === "auto" ? "bg-secondary animate-pulse" : "bg-yellow-500"}`} />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">
            {mode === "auto" ? "AUTONOMOUS" : "MANUAL REVIEW"}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Leads Found</span>
            <p className="text-2xl font-extrabold text-white">{activeLeadsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Target className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contacted</span>
            <p className="text-2xl font-extrabold text-white">{contactedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Replies</span>
            <p className="text-2xl font-extrabold text-white">{repliedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Meetings Booked</span>
            <p className="text-2xl font-extrabold text-white">{meetingsBookedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agent Activity Feed */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Agent Activity
          </h3>
          
          <div className="rounded border border-white/5 bg-black/40 p-3.5 font-mono text-[10px] text-gray-400 h-64 overflow-y-auto space-y-2">
            {scanReport ? (
              <>
                <p className="text-primary">[System] Agent initialized — workspace: {workspaceName}</p>
                <p className="text-gray-500">[System] Website scan complete — {scanReport.companyName} analyzed</p>
                <p className="text-primary">[Agent] ICP generated: targeting {scanReport.estimatedICP.targetRoles.slice(0, 3).join(", ")}</p>
                {leads.length > 0 ? (
                  <>
                    <p className="text-secondary">[Agent] {leads.length} high-intent leads discovered</p>
                    {leads.filter(l => l.intentScore > 80).map(l => (
                      <p key={l.id} className="text-secondary">[Agent] High-priority lead: {l.name} @ {l.companyName} ({l.intentScore}% intent)</p>
                    ))}
                    {contactedCount > 0 && (
                      <p className="text-gray-500">[Agent] Outreach sent to {contactedCount} leads</p>
                    )}
                    {repliedCount > 0 && (
                      <p className="text-accent">[Agent] {repliedCount} lead(s) replied — check inbox</p>
                    )}
                    {meetingsBookedCount > 0 && (
                      <p className="text-green-400">[Agent] {meetingsBookedCount} meeting(s) booked!</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">[Agent] Searching for high-intent leads matching your ICP...</p>
                )}
                {mode === "auto" && (
                  <p className="text-gray-500">[System] Autonomous mode: outreach running 24/7</p>
                )}
              </>
            ) : (
              <p className="text-gray-600">[System] Agent standing by. Enter your website to begin.</p>
            )}
          </div>
        </div>

        {/* Signals Overview */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" /> Signals Being Monitored
          </h3>
          
          <div className="space-y-2">
            {[
              "Competitor post interaction",
              "Profile visits (3x in 7 days)",
              "Job change / New role",
              "Following your company",
              "Active in target hashtags",
              "Company hiring spike",
              "Recent funding round",
              "Attended competitor event",
              "Similar tech stack",
              "Shared your content",
            ].map((signal, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span className="text-gray-400">{signal}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">AI Messages this month</span>
              <span className="text-white font-bold">{aiMessagesThisMonth}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Leads */}
      {leads.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Recent High-Intent Leads
          </h3>
          <div className="divide-y divide-white/5">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 text-xs text-primary flex items-center justify-center font-bold">
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{lead.name}</p>
                    <p className="text-[10px] text-gray-500">{lead.role} @ {lead.companyName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-secondary/15 border border-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">
                    {lead.intentScore}% Intent
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    lead.outreachStatus === "meeting_booked" ? "bg-green-500/10 text-green-400" :
                    lead.outreachStatus === "replied" ? "bg-accent/10 text-accent" :
                    lead.outreachStatus === "contacted" ? "bg-secondary/10 text-secondary" :
                    "bg-white/5 text-gray-500"
                  }`}>
                    {lead.outreachStatus === "meeting_booked" ? "Meeting" :
                     lead.outreachStatus === "replied" ? "Replied" :
                     lead.outreachStatus === "contacted" ? "Sent" : "New"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
