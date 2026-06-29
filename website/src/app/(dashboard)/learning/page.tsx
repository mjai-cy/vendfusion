"use client";

import React, { useState } from "react";
import { 
  Check, X, RefreshCw, BarChart2, ArrowUpRight, Sparkles
} from "lucide-react";

interface Optimization {
  id: string;
  description: string;
  impact: string;
  status: "pending" | "approved" | "rejected";
}

export default function LearningPage() {
  const [optimizations] = useState<Optimization[]>([
    { id: "opt-1", description: "Adjust LinkedIn message tone to be more consultative — data shows educational intros get 34% higher acceptance.", impact: "High", status: "pending" },
    { id: "opt-2", description: "Shift email follow-up timing from 3 days to 2 days — faster follow-ups increased reply rate by 18% in similar segments.", impact: "Medium", status: "pending" },
    { id: "opt-3", description: "Prioritize VP-level titles over Director-level — VP roles converted at 2.3x rate this week.", impact: "High", status: "pending" },
  ]);

  const [statusMap, setStatusMap] = useState<Record<string, "pending" | "approved" | "rejected">>({});

  const handleAction = (optId: string, action: "approved" | "rejected") => {
    setStatusMap(prev => ({ ...prev, [optId]: action }));
  };

  const getStatusStyle = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved": return "text-secondary bg-secondary/15 border-secondary/20";
      case "rejected": return "text-red-400 bg-red-500/15 border-red-500/20";
      default: return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Weekly Learning &amp; Optimization</h1>
        <p className="text-[11px] text-gray-400">
          Your agent gets better every week. Review AI-suggested improvements to keep optimizing your outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Reply Rate</span>
                <p className="text-2xl font-extrabold text-secondary">+24%</p>
              </div>
              <div className="h-9 w-9 rounded bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Meeting Rate</span>
                <p className="text-2xl font-extrabold text-secondary">+12%</p>
              </div>
              <div className="h-9 w-9 rounded bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> This Week's Learnings
            </h3>
            <div className="space-y-3">
              {[
                "LinkedIn connection acceptance is 40% higher when the message references a specific post or achievement.",
                "Tuesday and Wednesday mornings show the highest email open rates for your industry.",
                "Leads with 3+ intent signals convert at 5x the rate of single-signal leads.",
                "Adding social proof (e.g., 'we work with similar companies') increases reply rate by 28%.",
              ].map((learn, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                  <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                  <p className="leading-relaxed">{learn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-6">
          <div className="space-y-1 border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Proposed Optimizations</h3>
            <p className="text-[10px] text-gray-400">
              AI-suggested changes to improve your agent's performance.
            </p>
          </div>

          <div className="space-y-4">
            {optimizations.map((opt) => {
              const currentStatus = statusMap[opt.id] || opt.status;
              return (
                <div key={opt.id} className="border border-white/5 bg-black/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">{opt.impact}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusStyle(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                    {opt.description}
                  </p>
                  
                  {currentStatus === "pending" && (
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
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
