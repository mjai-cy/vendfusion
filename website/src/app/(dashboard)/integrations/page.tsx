"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import {
  Check, Key, Link2, ExternalLink, Cpu, ArrowDown, Zap,
  Mail, Database, BarChart2, Layers, AlertCircle
} from "lucide-react";

/* ─── Power Stack Step ─────────────────────────────────────── */
function StackStep({
  step, brand, color, accent, icon, tagline, description, bullets, isLast,
}: {
  step: number; brand: string; color: string; accent: string;
  icon: React.ReactNode; tagline: string; description: string;
  bullets: string[]; isLast?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-full rounded-2xl border ${color} bg-black/40 p-6 space-y-4`}>
        {/* Step badge + logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl border ${accent} flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <p className={`text-base font-extrabold ${accent.replace("border-", "text-").replace("/30", "")}`}>
                {brand}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{tagline}</p>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${color} ${accent.replace("border-", "text-").replace("/30", "")} uppercase tracking-wider`}>
            Step {step}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>

        {/* Bullets */}
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[10px] text-gray-500">
              <Check className={`h-3 w-3 shrink-0 mt-0.5 ${accent.replace("border-", "text-").replace("/30", "")}`} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex flex-col items-center my-2">
          <div className="h-5 w-px bg-white/10" />
          <ArrowDown className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}

/* ─── Integration Card ──────────────────────────────────────── */
function IntegrationCard({
  name, tagline, colorClass, borderClass, icon, connected,
  onConnect, children, badge,
}: {
  name: string; tagline: string; colorClass: string; borderClass: string;
  icon: React.ReactNode; connected?: boolean; badge?: string;
  onConnect?: () => void; children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${borderClass} bg-dark-bg/40 p-5 space-y-4 relative`}>
      {badge && (
        <span className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">{name}</h3>
          <p className="text-[10px] text-gray-400">{tagline}</p>
        </div>
        {connected && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-secondary font-bold shrink-0">
            <Check className="h-3.5 w-3.5" /> Connected
          </span>
        )}
      </div>
      {children}
      {onConnect && !connected && (
        <button
          onClick={onConnect}
          className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors"
        >
          Connect {name}
        </button>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function IntegrationsPage() {
  const {
    hubspotConnected, pipedriveConnected, connectHubspot, connectPipedrive,
  } = useAppState();

  const [hubspotKey, setHubspotKey] = useState("");
  const [pipedriveToken, setPipedriveToken] = useState("");
  const [hubspotSyncing, setHubspotSyncing] = useState(false);
  const [pipedriveSyncing, setPipedriveSyncing] = useState(false);
  const [clayKey, setClayKey] = useState("");
  const [instantlyKey, setInstantlyKey] = useState("");
  const [clayConnected, setClayConnected] = useState(false);
  const [instantlyConnected, setInstantlyConnected] = useState(false);
  const [claySyncing, setClaySyncing] = useState(false);
  const [instantlySyncing, setInstantlySyncing] = useState(false);

  const handleConnectHubspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubspotKey) return;
    setHubspotSyncing(true);
    setTimeout(() => { connectHubspot(hubspotKey); setHubspotSyncing(false); }, 1500);
  };

  const handleConnectPipedrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipedriveToken) return;
    setPipedriveSyncing(true);
    setTimeout(() => { connectPipedrive(pipedriveToken); setPipedriveSyncing(false); }, 1500);
  };

  const handleConnectClay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clayKey) return;
    setClaySyncing(true);
    setTimeout(() => { setClayConnected(true); setClaySyncing(false); }, 1500);
  };

  const handleConnectInstantly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instantlyKey) return;
    setInstantlySyncing(true);
    setTimeout(() => { setInstantlyConnected(true); setInstantlySyncing(false); }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Connect your full outbound stack. xyz.ai finds who to contact — your integrations handle the rest.
        </p>
      </div>

      {/* ─── Power Stack ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-black/20 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">The Recommended Power Stack</h2>
            <p className="text-[10px] text-gray-500">xyz.ai fills the &quot;who to contact &amp; when&quot; gap. Pair it with these tools for a complete outbound engine.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
          {/* Step 1 — xyz.ai */}
          <div className="flex flex-col items-center">
            <div className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-primary">xyz.ai</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Signal Intelligence</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider">Step 1</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Detects real-time intent signals — funding rounds, job changes, LinkedIn engagement, competitor follows — and scores prospects against your ICP. Finds <em>warm</em> leads, not cold lists.
              </p>
              <ul className="space-y-1.5">
                {["Intent signal detection (LinkedIn, funding, jobs)", "ICP scoring & lead qualification", "Automated personalised outreach drafts", "Fills the 'who to contact & when' gap"].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-gray-500">
                    <Check className="h-3 w-3 shrink-0 mt-0.5 text-primary" />{b}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-[10px] text-secondary font-bold">Active — currently running</span>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <div className="h-4 w-px bg-white/10 mt-1" />
            </div>
          </div>

          {/* Step 2 — Clay */}
          <div className="flex flex-col items-center">
            <div className={`w-full rounded-2xl border ${clayConnected ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-black/40"} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl border ${clayConnected ? "border-yellow-500/30 bg-yellow-500/10" : "border-white/10 bg-white/5"} flex items-center justify-center`}>
                    <Database className={`h-5 w-5 ${clayConnected ? "text-yellow-400" : "text-gray-500"}`} />
                  </div>
                  <div>
                    <p className={`text-base font-extrabold ${clayConnected ? "text-yellow-400" : "text-gray-300"}`}>Clay</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Data Enrichment</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${clayConnected ? "border-yellow-500/30 text-yellow-400" : "border-white/10 text-gray-500"} uppercase tracking-wider`}>Step 2</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Takes xyz.ai's warm leads and enriches them with verified email addresses, phone numbers, company data, LinkedIn URLs, and technographic data from 150+ sources.
              </p>
              <ul className="space-y-1.5">
                {["Waterfall enrichment (150+ data sources)", "Verified email & phone numbers", "AI research agent (Claygent) for personalisation", "Custom lead scoring & filtering"].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-gray-500">
                    <Check className={`h-3 w-3 shrink-0 mt-0.5 ${clayConnected ? "text-yellow-400" : "text-gray-600"}`} />{b}
                  </li>
                ))}
              </ul>
              {!clayConnected ? (
                <form onSubmit={handleConnectClay} className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Clay API Key"
                    value={clayKey}
                    onChange={(e) => setClayKey(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    disabled={claySyncing || !clayKey}
                    className="w-full h-9 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-xs font-bold text-black transition-colors disabled:opacity-40"
                  >
                    {claySyncing ? "Connecting..." : "Connect Clay"}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <Check className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-[10px] text-yellow-400 font-bold">Connected — enriching leads</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 — Instantly */}
          <div className="flex flex-col items-center">
            <div className={`w-full rounded-2xl border ${instantlyConnected ? "border-blue-500/30 bg-blue-500/5" : "border-white/10 bg-black/40"} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl border ${instantlyConnected ? "border-blue-500/30 bg-blue-500/10" : "border-white/10 bg-white/5"} flex items-center justify-center`}>
                    <Mail className={`h-5 w-5 ${instantlyConnected ? "text-blue-400" : "text-gray-500"}`} />
                  </div>
                  <div>
                    <p className={`text-base font-extrabold ${instantlyConnected ? "text-blue-400" : "text-gray-300"}`}>Instantly.ai</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Email Scale & Deliverability</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${instantlyConnected ? "border-blue-500/30 text-blue-400" : "border-white/10 text-gray-500"} uppercase tracking-wider`}>Step 3</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sends xyz.ai's enriched, warm leads at scale with inbox-protecting deliverability. Manages email warmup, spam protection, and unified analytics across unlimited sending accounts.
              </p>
              <ul className="space-y-1.5">
                {["Unlimited email account connections", "Native warmup & spam protection", "Inbox-first deliverability at scale", "Unified analytics across all campaigns"].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-gray-500">
                    <Check className={`h-3 w-3 shrink-0 mt-0.5 ${instantlyConnected ? "text-blue-400" : "text-gray-600"}`} />{b}
                  </li>
                ))}
              </ul>
              {!instantlyConnected ? (
                <form onSubmit={handleConnectInstantly} className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Instantly API Key"
                    value={instantlyKey}
                    onChange={(e) => setInstantlyKey(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={instantlySyncing || !instantlyKey}
                    className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors disabled:opacity-40"
                  >
                    {instantlySyncing ? "Connecting..." : "Connect Instantly"}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] text-blue-400 font-bold">Connected — sending at scale</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Positioning note */}
        <div className="rounded-xl border border-white/5 bg-white/3 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-white">Why xyz.ai + Clay + Instantly?</p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              xyz.ai is <strong className="text-white">not</strong> trying to replace Apollo or lemlist — it fills the <strong className="text-primary">"who to contact and when"</strong> gap that volume-based tools miss.
              Its biggest strength is <strong className="text-secondary">signal intelligence</strong> — finding warm, in-market prospects before your competitors do.
              Its biggest gap is email scale and database size — which is exactly what Clay + Instantly solve.
              Together, this stack gives you both <em className="text-white">intent precision</em> and <em className="text-white">delivery scale</em>.
            </p>
          </div>
        </div>
      </div>

      {/* ─── CRM Integrations ───────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">CRM & Pipeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <IntegrationCard
            name="HubSpot"
            tagline="Sync leads, deals, and contacts"
            colorClass="bg-orange-500/10 border border-orange-500/20"
            borderClass="border-white/5"
            icon={<Link2 className="h-5 w-5 text-orange-400" />}
            connected={hubspotConnected}
          >
            {!hubspotConnected && (
              <form onSubmit={handleConnectHubspot} className="space-y-3">
                <input
                  type="text"
                  placeholder="HubSpot API Key"
                  value={hubspotKey}
                  onChange={(e) => setHubspotKey(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-400"
                />
                <button
                  type="submit"
                  disabled={hubspotSyncing || !hubspotKey}
                  className="w-full h-9 rounded-lg bg-orange-500 hover:bg-orange-400 text-xs font-bold text-black transition-colors disabled:opacity-40"
                >
                  {hubspotSyncing ? "Connecting..." : "Connect HubSpot"}
                </button>
              </form>
            )}
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Automatically sync warm leads to HubSpot CRM</p>
              <p>• Push deals and meeting logs on conversion</p>
              <p>• Two-way contact enrichment sync</p>
            </div>
          </IntegrationCard>

          <IntegrationCard
            name="Pipedrive"
            tagline="Sync leads and pipeline stages"
            colorClass="bg-green-500/10 border border-green-500/20"
            borderClass="border-white/5"
            icon={<Link2 className="h-5 w-5 text-green-400" />}
            connected={pipedriveConnected}
          >
            {!pipedriveConnected && (
              <form onSubmit={handleConnectPipedrive} className="space-y-3">
                <input
                  type="text"
                  placeholder="Pipedrive API Token"
                  value={pipedriveToken}
                  onChange={(e) => setPipedriveToken(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-400"
                />
                <button
                  type="submit"
                  disabled={pipedriveSyncing || !pipedriveToken}
                  className="w-full h-9 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-colors disabled:opacity-40"
                >
                  {pipedriveSyncing ? "Connecting..." : "Connect Pipedrive"}
                </button>
              </form>
            )}
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Two-way deal and lead sync</p>
              <p>• Update pipeline stages automatically on reply/meeting</p>
            </div>
          </IntegrationCard>
        </div>
      </div>

      {/* ─── AI / API Integrations ──────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">AI & Developer</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <IntegrationCard
            name="MCP Support (Claude)"
            tagline="Connect via Model Context Protocol"
            colorClass="bg-purple-500/10 border border-purple-500/20"
            borderClass="border-white/5"
            icon={<Cpu className="h-5 w-5 text-purple-400" />}
            badge="AI Native"
          >
            <p className="text-[10px] text-gray-500 leading-relaxed">
              xyz.ai supports the Model Context Protocol, letting Claude and other AI tools interact with your leads, outreach, and pipeline data programmatically.
            </p>
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Query leads and intent signals via MCP</p>
              <p>• Trigger outreach campaigns programmatically</p>
              <p>• Access your agent&apos;s data from Claude Desktop</p>
            </div>
            <a href="#" className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold">
              <ExternalLink className="h-3 w-3" /> Learn about MCP setup
            </a>
          </IntegrationCard>

          <IntegrationCard
            name="REST API"
            tagline="Full programmatic access"
            colorClass="bg-primary/10 border border-primary/20"
            borderClass="border-white/5"
            icon={<Key className="h-5 w-5 text-primary" />}
          >
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Integrate xyz.ai with your internal tools. Access leads, signals, outreach data, and agent configuration via REST.
            </p>
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Full CRUD on leads, workspaces, and campaigns</p>
              <p>• Webhook support for real-time events</p>
            </div>
            <a href="#" className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-semibold">
              <ExternalLink className="h-3 w-3" /> API Documentation
            </a>
          </IntegrationCard>

          <IntegrationCard
            name="Apollo.io"
            tagline="Supplement with 270M+ contacts"
            colorClass="bg-indigo-500/10 border border-indigo-500/20"
            borderClass="border-white/5"
            icon={<BarChart2 className="h-5 w-5 text-indigo-400" />}
            badge="Coming Soon"
          >
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Push xyz.ai's warm intent leads into Apollo for additional enrichment and access to their 270M+ contact database for gap-filling.
            </p>
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Auto-export warm leads to Apollo sequences</p>
              <p>• Use Apollo's database to fill enrichment gaps</p>
            </div>
          </IntegrationCard>

          <IntegrationCard
            name="lemlist"
            tagline="Multi-channel outreach sequences"
            colorClass="bg-red-500/10 border border-red-500/20"
            borderClass="border-white/5"
            icon={<Mail className="h-5 w-5 text-red-400" />}
            badge="Coming Soon"
          >
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Send xyz.ai's warm leads into lemlist for LinkedIn + email + WhatsApp multi-touch sequences with AI-personalised icebreakers.
            </p>
            <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
              <p>• Auto-import warm leads into lemlist campaigns</p>
              <p>• Sync reply data back to xyz.ai for scoring</p>
            </div>
          </IntegrationCard>
        </div>
      </div>

    </div>
  );
}
