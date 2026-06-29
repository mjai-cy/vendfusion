"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Check, Key, Link2, ExternalLink, Cpu
} from "lucide-react";

export default function IntegrationsPage() {
  const { 
    hubspotConnected, pipedriveConnected, connectHubspot, connectPipedrive
  } = useAppState();

  const [hubspotKey, setHubspotKey] = useState("");
  const [pipedriveToken, setPipedriveToken] = useState("");
  const [hubspotSyncing, setHubspotSyncing] = useState(false);
  const [pipedriveSyncing, setPipedriveSyncing] = useState(false);

  const handleConnectHubspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubspotKey) return;
    setHubspotSyncing(true);
    setTimeout(() => {
      connectHubspot(hubspotKey);
      setHubspotSyncing(false);
    }, 1500);
  };

  const handleConnectPipedrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipedriveToken) return;
    setPipedriveSyncing(true);
    setTimeout(() => {
      connectPipedrive(pipedriveToken);
      setPipedriveSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-[11px] text-gray-400">
          Connect your CRM, API tools, and Claude MCP for extended capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HubSpot */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">HubSpot</h3>
              <p className="text-[10px] text-gray-400">Sync leads, deals, and contacts</p>
            </div>
            {hubspotConnected && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-secondary font-bold">
                <Check className="h-3.5 w-3.5" /> Connected
              </span>
            )}
          </div>

          {!hubspotConnected && (
            <form onSubmit={handleConnectHubspot} className="space-y-3">
              <input
                type="text"
                placeholder="HubSpot API Key"
                value={hubspotKey}
                onChange={(e) => setHubspotKey(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={hubspotSyncing || !hubspotKey}
                className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors disabled:opacity-40"
              >
                {hubspotSyncing ? "Connecting..." : "Connect HubSpot"}
              </button>
            </form>
          )}

          <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
            <p>• Automatically sync leads to HubSpot CRM</p>
            <p>• Push deals and meeting logs</p>
          </div>
        </div>

        {/* Pipedrive */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pipedrive</h3>
              <p className="text-[10px] text-gray-400">Sync leads and pipeline stages</p>
            </div>
            {pipedriveConnected && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-secondary font-bold">
                <Check className="h-3.5 w-3.5" /> Connected
              </span>
            )}
          </div>

          {!pipedriveConnected && (
            <form onSubmit={handleConnectPipedrive} className="space-y-3">
              <input
                type="text"
                placeholder="Pipedrive API Token"
                value={pipedriveToken}
                onChange={(e) => setPipedriveToken(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={pipedriveSyncing || !pipedriveToken}
                className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors disabled:opacity-40"
              >
                {pipedriveSyncing ? "Connecting..." : "Connect Pipedrive"}
              </button>
            </form>
          )}

          <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
            <p>• Two-way deal and lead sync</p>
            <p>• Update pipeline stages automatically</p>
          </div>
        </div>

        {/* MCP Support */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MCP Support (Claude)</h3>
              <p className="text-[10px] text-gray-400">Connect via Model Context Protocol</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Gojiberry supports the Model Context Protocol, allowing Claude and other AI tools to interact with your leads, outreach, and pipeline data programmatically.
          </p>
          <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
            <p>• Query leads and intent signals via MCP</p>
            <p>• Trigger outreach campaigns programmatically</p>
            <p>• Access your agent's data from Claude Desktop</p>
          </div>
          <a 
            href="#" 
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-semibold"
          >
            <ExternalLink className="h-3 w-3" /> Learn about MCP setup
          </a>
        </div>

        {/* API Access */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">REST API</h3>
              <p className="text-[10px] text-gray-400">Full programmatic access</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Integrate Gojiberry with your internal tools via our REST API. Access leads, signals, outreach data, and agent configuration.
          </p>
          <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500 space-y-1">
            <p>• Full CRUD on leads, workspaces, and campaigns</p>
            <p>• Webhook support for real-time events</p>
          </div>
          <a 
            href="#" 
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-semibold"
          >
            <ExternalLink className="h-3 w-3" /> API Documentation
          </a>
        </div>

      </div>
    </div>
  );
}
