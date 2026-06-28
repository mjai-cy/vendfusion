"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Check, X, RefreshCw, BarChart2, ShieldAlert, 
  Settings, Play, HelpCircle, ArrowUpRight, CheckCircle2 
} from "lucide-react";

export default function WeeklyLearningDashboard() {
  const { weeklyReports, handleWeeklyOptimization } = useAppState();
  const [activeReportIdx] = useState(0);

  const report = weeklyReports[activeReportIdx];

  const handleAction = (optId: string, action: "approved" | "rejected") => {
    handleWeeklyOptimization(activeReportIdx, optId, action);
  };

  const getStatusStyle = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved": return "text-secondary bg-secondary/15 border-secondary/20";
      case "rejected": return "text-red-400 bg-red-500/15 border-red-500/20";
      default: return "text-gray-400 bg-white/5 border-white/10 animate-pulse";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Weekly AI Optimization Loop</h1>
        <p className="text-[11px] text-gray-400">
          The AI engine collects campaign performance metrics every Sunday. Review suggestions and approve updates below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Learnings & Improvements summary */}
        {report && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Reply Rate Shift</span>
                  <p className="text-2xl font-extrabold text-secondary">{report.replyRateImprovement}</p>
                </div>
                <div className="h-9 w-9 rounded bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Meetings Rate Shift</span>
                  <p className="text-2xl font-extrabold text-secondary">{report.meetingRateImprovement}</p>
                </div>
                <div className="h-9 w-9 rounded bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* In-app key learnings */}
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sunday Ingestion Insights</h3>
              <div className="space-y-3">
                {report.learnings.map((learn, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                    <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                    <p className="leading-relaxed font-sans">{learn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox safety */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-gray-400 leading-relaxed font-sans">
              <strong>Data Isolation Sandbox:</strong> Model improvement reports are generated locally using isolated prompt weighting schemas. Recommended revisions never modify core codebase components or leak parameters across tenant workspaces.
            </div>

          </div>
        )}

        {/* Right: Optimizations Approve/Reject Actions Board */}
        {report && (
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-6">
            <div className="space-y-1 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Proposed Agent Revisions</h3>
              <p className="text-[10px] text-gray-400">
                AI changes will not apply until you manually approve.
              </p>
            </div>

            <div className="space-y-4">
              {report.proposedOptimizations.map((opt) => (
                <div key={opt.id} className="border border-white/5 bg-black/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">{opt.impact}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusStyle(opt.status)}`}>
                      {opt.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans font-medium">
                    {opt.description}
                  </p>
                  
                  {opt.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleAction(opt.id, "approved")}
                        className="flex-1 inline-flex h-7 items-center justify-center rounded bg-secondary/15 hover:bg-secondary/20 border border-secondary/20 text-[10px] font-bold text-secondary transition-colors gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(opt.id, "rejected")}
                        className="flex-1 inline-flex h-7 items-center justify-center rounded bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-[10px] font-bold text-red-400 transition-colors gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Testing -> Production indicator */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Agent Deployment Status</span>
              <div className="rounded bg-black/30 border border-white/5 p-3 space-y-2 text-[10px] font-mono text-gray-500">
                <div className="flex justify-between items-center text-secondary">
                  <span>[Testing sandbox]</span>
                  <span>Active</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>[Production pipeline]</span>
                  <span>Standing by</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
