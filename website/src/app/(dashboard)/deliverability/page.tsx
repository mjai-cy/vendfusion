"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, AlertTriangle, XCircle, BarChart3, RefreshCw, Send, Eye, Activity, Shield } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

interface Stats { totalSent: number; delivered: number; opened: number; bounced: number; spam: number; failed: number; deliveryRate: number; openRate: number; bounceRate: number; }
interface Sender { id: string; email: string; dailyLimit: number; sentToday: number; warmupStage: string; reputation: string; status: string; }
interface Log { id: string; to: string; subject: string; sentAt: string; status: string; error?: string; }

export default function DeliverabilityPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, snd, l] = await Promise.all([
        fetch(`${BACKEND}/deliverability/stats`).then(r => r.ok ? r.json() : null),
        fetch(`${BACKEND}/deliverability/senders`).then(r => r.ok ? r.json() : []),
        fetch(`${BACKEND}/deliverability/logs`).then(r => r.ok ? r.json() : []),
      ]);
      if (s) setStats(s);
      setSenders(snd);
      setLogs(l);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSenderAction = async (id: string, action: string) => {
    await fetch(`${BACKEND}/deliverability/senders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Deliverability</h1>
          <p className="text-[11px] text-gray-400">Monitor email delivery health, sender reputation, and bounce rates.</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold text-gray-400 hover:text-white gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Send className="h-3.5 w-3.5" /><span className="text-[9px] font-bold uppercase">Sent</span></div>
            <span className="text-2xl font-bold text-white">{stats.totalSent}</span>
            <span className="text-[9px] text-gray-500 ml-2">{stats.deliveryRate}% delivered</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><CheckCircle className="h-3.5 w-3.5" /><span className="text-[9px] font-bold uppercase">Delivered</span></div>
            <span className="text-2xl font-bold text-green-400">{stats.delivered}</span>
            <span className="text-[9px] text-gray-500 ml-2">{stats.openRate}% open rate</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><AlertTriangle className="h-3.5 w-3.5" /><span className="text-[9px] font-bold uppercase">Bounced</span></div>
            <span className="text-2xl font-bold text-yellow-400">{stats.bounced}</span>
            <span className="text-[9px] text-gray-500 ml-2">{stats.bounceRate}% bounce rate</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><XCircle className="h-3.5 w-3.5" /><span className="text-[9px] font-bold uppercase">Spam</span></div>
            <span className="text-2xl font-bold text-red-400">{stats.spam}</span>
            <span className="text-[9px] text-gray-500 ml-2">{stats.failed} failed</span>
          </div>
        </div>
      )}

      {/* Senders */}
      <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Sender Mailboxes</h3>
        <div className="space-y-3">
          {senders.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white">{s.email}</span>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                    <span>{s.sentToday}/{s.dailyLimit} today</span>
                    <span className={`px-1 rounded ${
                      s.reputation === "good" ? "bg-green-500/20 text-green-400" :
                      s.reputation === "neutral" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                    }`}>{s.reputation}</span>
                    <span className="text-gray-600">{s.warmupStage === "warm" ? "Warm" : "Warming up"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleSenderAction(s.id, s.status === "active" ? "paused" : "active")}
                className={`h-7 rounded px-2.5 text-[9px] font-semibold border ${
                  s.status === "active"
                    ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                    : "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                }`}>
                {s.status === "active" ? "Pause" : "Resume"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Logs */}
      <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Recent Delivery Logs</h3>
        {logs.length === 0 ? (
          <p className="text-[10px] text-gray-500 text-center py-6">No delivery logs yet. Send a campaign to see logs.</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-3 text-[10px] py-1.5 border-b border-white/5 last:border-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${
                  l.status === "delivered" || l.status === "opened" ? "bg-green-500" :
                  l.status === "bounced" ? "bg-yellow-500" :
                  l.status === "spam" || l.status === "failed" ? "bg-red-500" : "bg-gray-500"
                }`} />
                <span className="text-gray-400 w-28 truncate">{l.to}</span>
                <span className="text-gray-500 flex-1 truncate">{l.subject}</span>
                <span className={`font-semibold uppercase ${
                  l.status === "delivered" || l.status === "opened" ? "text-green-400" :
                  l.status === "bounced" ? "text-yellow-400" :
                  l.status === "spam" || l.status === "failed" ? "text-red-400" : "text-gray-400"
                }`}>{l.status}</span>
                <span className="text-gray-600 shrink-0">{new Date(l.sentAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
