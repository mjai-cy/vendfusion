"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import {
  Settings, Linkedin, Globe, Mail, Phone, Shield,
  Zap, MessageSquare, Users, Check, Link2, ExternalLink,
  RefreshCw, Loader2, Clock
} from "lucide-react";

export default function SettingsPage() {
  const {
    linkedInConnected, connectLinkedIn, disconnectLinkedIn,
    updateLinkedInSettings, updateCompanySettings,
    autoEnrichEmails, autoEnrichPhones, autoGenerateMessages, excludeServiceProviders
  } = useAppState();

  const [weeklyLimit, setWeeklyLimit] = useState(100);
  const [activeDays, setActiveDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [connecting, setConnecting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoEnrich, setAutoEnrich] = useState({
    emails: autoEnrichEmails ?? false,
    phones: autoEnrichPhones ?? false,
    messages: autoGenerateMessages ?? false,
    excludeProviders: excludeServiceProviders ?? false,
  });

  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleConnectLinkedIn = () => {
    setConnecting(true);
    setTimeout(() => {
      connectLinkedIn();
      setConnecting(false);
    }, 2000);
  };

  const handleSaveLinkedIn = () => {
    updateLinkedInSettings(weeklyLimit, activeDays);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveCompany = () => {
    updateCompanySettings({
      autoEnrichEmails: autoEnrich.emails,
      autoEnrichPhones: autoEnrich.phones,
      autoGenerateMessages: autoEnrich.messages,
      excludeServiceProviders: autoEnrich.excludeProviders,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[11px] text-gray-400">
          Manage your account settings, LinkedIn connection, and company preferences.
        </p>
      </div>

      {saved && (
        <div className="rounded-lg bg-secondary/15 border border-secondary/20 p-3 text-center text-xs text-secondary font-semibold">
          <Check className="h-4 w-4 inline mr-1" /> Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LinkedIn Connection */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Linkedin className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">LinkedIn Connection</h3>
              <p className="text-[10px] text-gray-400">Connect your LinkedIn account for automated outreach</p>
            </div>
            {linkedInConnected && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-secondary font-bold">
                <Check className="h-3.5 w-3.5" /> Connected
              </span>
            )}
          </div>

          {!linkedInConnected ? (
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Install the Gojiberry Chrome extension and connect your LinkedIn account to enable automated messaging and connection requests.
              </p>
              <button
                onClick={handleConnectLinkedIn}
                disabled={connecting}
                className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting...</>
                ) : (
                  <><Link2 className="h-3.5 w-3.5" /> Connect LinkedIn</>
                )}
              </button>
              <div className="border-t border-white/5 pt-3 text-[9px] text-gray-500 space-y-1">
                <p>• We use official LinkedIn API and browser extension</p>
                <p>• Your account safety is our priority</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  <Clock className="h-3 w-3 inline mr-1" /> Weekly Sending Limit
                </label>
                <input
                  type="range"
                  min={20}
                  max={200}
                  value={weeklyLimit}
                  onChange={(e) => setWeeklyLimit(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>20/week</span>
                  <span className="text-white font-bold text-xs">{weeklyLimit}/week</span>
                  <span>200/week</span>
                </div>
                <p className="text-[9px] text-gray-600 mt-1">Recommended: 100 invitations + messages per week for account safety.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Active Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`text-[9px] px-2.5 py-1 rounded border transition-colors ${
                        activeDays.includes(day)
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => disconnectLinkedIn()}
                  className="h-8 px-4 rounded-lg border border-red-500/20 bg-red-500/10 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Disconnect
                </button>
                <button
                  onClick={handleSaveLinkedIn}
                  className="h-8 px-4 rounded-lg bg-primary hover:bg-primary-hover text-[10px] font-bold text-white transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company Information */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Company Information</h3>
              <p className="text-[10px] text-gray-400">Configure auto-enrichment and lead filtering</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/30">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Auto-enrich Email Addresses</p>
                  <p className="text-[9px] text-gray-500">Automatically find emails for new leads</p>
                </div>
              </div>
              <button
                onClick={() => setAutoEnrich(p => ({ ...p, emails: !p.emails }))}
                className={`h-6 w-11 rounded-full transition-colors ${
                  autoEnrich.emails ? "bg-secondary" : "bg-white/10"
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform ${
                  autoEnrich.emails ? "translate-x-5.5" : "translate-x-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/30">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Auto-enrich Phone Numbers</p>
                  <p className="text-[9px] text-gray-500">Find phone numbers for high-intent leads</p>
                </div>
              </div>
              <button
                onClick={() => setAutoEnrich(p => ({ ...p, phones: !p.phones }))}
                className={`h-6 w-11 rounded-full transition-colors ${
                  autoEnrich.phones ? "bg-secondary" : "bg-white/10"
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform ${
                  autoEnrich.phones ? "translate-x-5.5" : "translate-x-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/30">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Auto-generate AI Messages</p>
                  <p className="text-[9px] text-gray-500">Pre-generate personalized messages for each lead</p>
                </div>
              </div>
              <button
                onClick={() => setAutoEnrich(p => ({ ...p, messages: !p.messages }))}
                className={`h-6 w-11 rounded-full transition-colors ${
                  autoEnrich.messages ? "bg-secondary" : "bg-white/10"
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform ${
                  autoEnrich.messages ? "translate-x-5.5" : "translate-x-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/30">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Exclude Service Providers</p>
                  <p className="text-[9px] text-gray-500">Filter out agencies, freelancers, and consultants</p>
                </div>
              </div>
              <button
                onClick={() => setAutoEnrich(p => ({ ...p, excludeProviders: !p.excludeProviders }))}
                className={`h-6 w-11 rounded-full transition-colors ${
                  autoEnrich.excludeProviders ? "bg-secondary" : "bg-white/10"
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform ${
                  autoEnrich.excludeProviders ? "translate-x-5.5" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveCompany}
            className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-white transition-colors"
          >
            Save Company Settings
          </button>
        </div>

        {/* Account Info */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 p-5 glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Account</h3>
              <p className="text-[10px] text-gray-400">Manage your account settings and data</p>
            </div>
          </div>

          <div className="space-y-3 text-[10px] text-gray-500">
            <div className="flex items-center justify-between p-2.5 rounded border border-white/5 bg-black/30">
              <span>Data Export</span>
              <button className="text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Export CSV
              </button>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-white/5 bg-black/30">
              <span>API Access</span>
              <button className="text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> View API Keys
              </button>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-white/5 bg-black/30">
              <span>Notification Preferences</span>
              <button className="text-primary hover:text-primary-hover font-semibold">Configure</button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Danger Zone</h3>
              <p className="text-[10px] text-gray-400">Irreversible actions</p>
            </div>
          </div>

          <button
            className="w-full h-9 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Delete Workspace & All Data
          </button>
        </div>

      </div>
    </div>
  );
}
