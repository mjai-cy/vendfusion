"use client";

import React, { useEffect, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Users, Mail, Calendar, BarChart3, 
  ArrowUpRight, CheckCircle2, Cpu
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const { 
    leads, plan, campaigns, scanReport,
    uploadedFiles, leadSearchesThisMonth, 
    aiMessagesThisMonth, mode 
  } = useAppState();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLeadsCount = leads.length;
  const meetingsBookedCount = leads.filter(l => l.status === "meeting_booked").length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">
            {mode === "pro-ai" ? "AUTONOMOUS SELLING ACTIVE" : "MANUAL REVIEW MODE"}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Leads */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Leads</span>
            <p className="text-2xl font-extrabold text-white">{activeLeadsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Outreach Messages */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">AI Messages Sent</span>
            <p className="text-2xl font-extrabold text-white">{aiMessagesThisMonth}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Meetings Booked */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Meetings Booked</span>
            <p className="text-2xl font-extrabold text-white">{meetingsBookedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Limit Meter */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex flex-col justify-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Starter Limits Used</span>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Searches: {leadSearchesThisMonth}/{plan === "starter" ? "500" : "∞"}</span>
              <span>Messages: {aiMessagesThisMonth}/{plan === "starter" ? "1,000" : "∞"}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all" 
                style={{ width: `${(leadSearchesThisMonth / (plan === "starter" ? 500 : 10000)) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Outbound Line Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Outreach Campaign Engagement
          </h3>
          <div className="h-64 w-full flex flex-col items-center justify-center gap-3 text-center">
            <BarChart3 className="h-10 w-10 text-white/10" />
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Campaign engagement metrics will appear here once your first outreach emails are sent.
            </p>
            <span className="text-[10px] font-mono text-gray-600">Create a Campaign → Send outreach → Data populates</span>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">AI Sales Funnel</h3>
          <div className="h-64 w-full flex flex-col items-center justify-center gap-3 text-center">
            <Users className="h-10 w-10 text-white/10" />
            <p className="text-xs text-gray-500 max-w-[180px] leading-relaxed">
              Your funnel will build as leads move through stages.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom checklist and logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Status */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Engine Status</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Core data pipelines are centrally managed to ensure maximum lead coverage and uptime.
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Website Crawl</span>
              {scanReport ? (
                <span className="text-secondary font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Active</span>
              ) : (
                <span className="text-gray-500">Pending website scan</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Lead Database</span>
              <span className="text-secondary font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> System Managed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">CRM Pipeline</span>
              <span className="text-secondary font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> System Managed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uploaded collateral</span>
              <span className="font-mono text-gray-300">{uploadedFiles.length} files</span>
            </div>
          </div>
        </div>

        {/* System Ready Logs */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-primary animate-pulse" /> AI Sales Agent Status
          </h3>
          
          <div className="rounded border border-white/5 bg-black/40 p-3.5 font-mono text-[10px] text-gray-400 h-40 overflow-y-auto space-y-2">
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((f, idx) => (
                <p key={idx} className="text-primary">[System] Vector space updated: {f.name} ingested successfully ({f.chunks} chunks).</p>
              ))
            ) : (
              <p className="text-gray-600">[System] AI engine standing by. Upload your company materials in Knowledge Center to begin.</p>
            )}
            {leads.length > 0 ? (
              <p className="text-secondary">[System] {leads.length} qualified lead(s) discovered and ready for outreach.</p>
            ) : (
              <p className="text-gray-600">[System] No leads yet. Launch an AI Agent to begin discovering prospects.</p>
            )}
            {campaigns.length > 0 ? (
              <p className="text-primary">[System] {campaigns.length} active campaign(s) in the outreach pipeline.</p>
            ) : (
              <p className="text-gray-600">[System] No campaigns yet. Create your first campaign in Campaign Builder.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
