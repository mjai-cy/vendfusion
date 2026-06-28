"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  Settings, Key, Check, ToggleLeft, ToggleRight, 
  RefreshCw, AlertTriangle, ShieldCheck, Database 
} from "lucide-react";

export default function IntegrationsDashboard() {
  const { 
    apolloConnected, zohoConnected, connectApollo, 
    connectZoho, apolloApiKey, zohoAuthToken 
  } = useAppState();

  const [apolloKeyInput, setApolloKeyInput] = useState(apolloApiKey || "");
  const [zohoTokenInput, setZohoTokenInput] = useState(zohoAuthToken || "");

  const [contactSyncEnabled, setContactSyncEnabled] = useState(true);
  const [dealSyncEnabled, setDealSyncEnabled] = useState(false);
  const [enrichmentEnabled, setEnrichmentEnabled] = useState(true);

  const [syncingApollo, setSyncingApollo] = useState(false);
  const [syncingZoho, setSyncingZoho] = useState(false);

  const handleConnectApollo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apolloKeyInput) return;
    setSyncingApollo(true);
    setTimeout(() => {
      connectApollo(apolloKeyInput);
      setSyncingApollo(false);
    }, 1500);
  };

  const handleConnectZoho = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zohoTokenInput) return;
    setSyncingZoho(true);
    setTimeout(() => {
      connectZoho(zohoTokenInput);
      setSyncingZoho(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Integrations & Data CRM</h1>
        <p className="text-[11px] text-gray-400">
          Connect third-party lead lists and synchronize sales opportunities directly into Zoho CRM pipelines.
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-8 space-y-6 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Managed Data Engine Active</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-md mx-auto">
            Your XYZ.AI Workspace is pre-configured and linked directly to our central system data engine. 
            Lead prospecting queries and CRM synchronization loops are managed globally by your administrator. No manual tokens or personal credentials are required.
          </p>
        </div>
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/15 px-3.5 py-1.5 rounded-full border border-secondary/20 tracking-wider">
            Active Connection Online
          </span>
        </div>
      </div>

    </div>
  );
}
