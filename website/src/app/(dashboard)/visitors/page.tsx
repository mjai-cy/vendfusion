"use client";

import React, { useState, useEffect } from "react";
import { Globe, Users, Target, BarChart3, RefreshCw, ChevronDown, ChevronRight,
  ExternalLink, Code, Shield, Zap, Eye, Clock, MapPin, Building2 } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

interface Visitor {
  id: string; domain: string; companyName: string; companyIndustry: string;
  companySize: string; pagesVisited: { url: string; title: string; timestamp: string }[];
  visitCount: number; firstSeen: string; lastSeen: string;
  city: string; country: string; source: string;
  email: string; phone: string; enriched: boolean;
  score: number; status: "new" | "identified" | "contacted" | "qualified";
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/visitors`);
      if (res.ok) setVisitors(await res.json());
    } catch { /* use mock below */ }
    setLoading(false);
  };

  useEffect(() => { fetchVisitors(); }, []);

  const stats = {
    total: visitors.length,
    new: visitors.filter(v => v.status === "new").length,
    identified: visitors.filter(v => v.status === "identified").length,
    qualified: visitors.filter(v => v.status === "qualified").length,
    avgScore: visitors.length ? Math.round(visitors.reduce((s, v) => s + v.score, 0) / visitors.length) : 0,
  };

  const handleEnrichAll = async () => {
    setEnriching(true);
    try {
      await fetch(`${BACKEND}/visitors/enrich-all`, { method: "POST" });
      await fetchVisitors();
    } catch {}
    setEnriching(false);
  };

  const handleEnrich = async (id: string) => {
    try {
      await fetch(`${BACKEND}/visitors/${id}/enrich`, { method: "POST" });
      await fetchVisitors();
    } catch {}
  };

  const handleStatus = async (id: string, status: Visitor["status"]) => {
    try {
      await fetch(`${BACKEND}/visitors/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchVisitors();
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Website Visitors</h1>
          <p className="text-[11px] text-gray-400">
            Identify anonymous website visitors, enrich with company data, and convert them into leads.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowWidget(true)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold text-gray-400 hover:text-white hover:border-white/20 transition-colors gap-1.5">
            <Code className="h-4 w-4" /> Tracking Script
          </button>
          <button onClick={handleEnrichAll} disabled={enriching}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-semibold text-white shadow-lg transition-colors gap-1.5">
            {enriching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Enrich All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Globe className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Total</span>
          </div>
          <span className="text-2xl font-bold text-white">{stats.total}</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">New</span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{stats.new}</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Users className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Identified</span>
          </div>
          <span className="text-2xl font-bold text-primary">{stats.identified}</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-4 glass-panel">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Target className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Avg Score</span>
          </div>
          <span className="text-2xl font-bold text-secondary">{stats.avgScore}</span>
        </div>
      </div>

      {/* Visitor List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-white/10 rounded-xl space-y-2">
          <Globe className="h-8 w-8 mx-auto text-gray-600" />
          <p>No visitors tracked yet.</p>
          <p className="text-[10px]">Install the tracking script on your website to start identifying visitors.</p>
          <button onClick={() => setShowWidget(true)}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 px-3 text-[10px] font-semibold text-primary gap-1.5">
            <Code className="h-3.5 w-3.5" /> Get Tracking Code
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {visitors.map((v) => (
            <div key={v.id} className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <button className="text-gray-500 hover:text-white shrink-0">
                    {expandedId === v.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{v.companyName}</span>
                      <span className="text-[9px] text-gray-500 font-mono">{v.domain}</span>
                      {v.enriched && <Shield className="h-3 w-3 text-secondary" aria-label="Enriched" />}
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{v.visitCount} visits</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(v.lastSeen).toLocaleDateString()}</span>
                      {v.country !== "Unknown" && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{v.country}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      v.score >= 70 ? "bg-green-500/20 text-green-400" :
                      v.score >= 40 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>{v.score}</div>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                    v.status === "qualified" ? "bg-green-500/15 text-green-400 border-green-500/20" :
                    v.status === "identified" ? "bg-primary/15 text-primary border-primary/20" :
                    v.status === "contacted" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" :
                    "bg-gray-500/15 text-gray-400 border-gray-500/20"
                  }`}>{v.status}</span>
                </div>
              </div>

              {expandedId === v.id && (
                <div className="border-t border-white/5 px-4 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div><span className="text-gray-500">Industry:</span> <span className="text-gray-300">{v.companyIndustry || "—"}</span></div>
                    <div><span className="text-gray-500">Company Size:</span> <span className="text-gray-300">{v.companySize || "—"}</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="text-gray-300">{v.city}, {v.country}</span></div>
                    <div><span className="text-gray-500">Source:</span> <span className="text-gray-300">{v.source}</span></div>
                    <div><span className="text-gray-500">First Seen:</span> <span className="text-gray-300">{new Date(v.firstSeen).toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Intent Score:</span> <span className="text-gray-300">{v.score}/100</span></div>
                  </div>

                  {/* Pages visited */}
                  {v.pagesVisited.length > 0 && (
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Pages Visited ({v.pagesVisited.length})</span>
                      <div className="mt-1 space-y-1">
                        {v.pagesVisited.slice(-5).map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 rounded p-1.5">
                            <ExternalLink className="h-3 w-3 text-gray-600 shrink-0" />
                            <span className="truncate">{p.title || p.url}</span>
                            <span className="text-gray-600 shrink-0">{new Date(p.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
                    {!v.enriched && (
                      <button onClick={() => handleEnrich(v.id)}
                        className="h-7 rounded border border-primary/20 bg-primary/10 px-2.5 text-[9px] font-semibold text-primary hover:bg-primary/20 transition-colors">
                        Enrich Company
                      </button>
                    )}
                    {v.status !== "qualified" && (
                      <button onClick={() => handleStatus(v.id, "qualified")}
                        className="h-7 rounded border border-green-500/20 bg-green-500/10 px-2.5 text-[9px] font-semibold text-green-400 hover:bg-green-500/20">
                        Mark Qualified
                      </button>
                    )}
                    {v.status !== "contacted" && (
                      <button onClick={() => handleStatus(v.id, "contacted")}
                        className="h-7 rounded border border-yellow-500/20 bg-yellow-500/10 px-2.5 text-[9px] font-semibold text-yellow-400">
                        Mark Contacted
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tracking Script Modal */}
      {showWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-dark-bg/95 p-6 shadow-2xl glass-panel space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary" /> Tracking Script
              </h3>
              <button onClick={() => setShowWidget(false)} className="text-gray-500 hover:text-white">
                <ChevronRight className="h-4 w-4 rotate-45" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Add this script to your website's <code className="text-primary bg-primary/10 px-1 rounded">&lt;head&gt;</code> to start identifying anonymous visitors.
            </p>
            <div className="bg-black/40 rounded-lg border border-white/5 p-3">
              <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap">{`<script>
  (function() {
    var d = window.location;
    fetch("${BACKEND}/visitors/track", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        domain: d.hostname,
        pageUrl: d.href,
        pageTitle: document.title,
        source: document.referrer || "direct"
      })
    });
  })();
</script>`}</pre>
            </div>
            <div className="flex justify-end">
              <button onClick={() => { navigator.clipboard.writeText(`<script>\n  (function() {\n    var d = window.location;\n    fetch("${BACKEND}/visitors/track", {\n      method: "POST",\n      headers: {"Content-Type": "application/json"},\n      body: JSON.stringify({\n        domain: d.hostname,\n        pageUrl: d.href,\n        pageTitle: document.title,\n        source: document.referrer || "direct"\n      })\n    });\n  })();\n</script>`); }}
                className="h-8 rounded bg-primary hover:bg-primary-hover px-3 text-[10px] font-semibold text-white">
                Copy Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
