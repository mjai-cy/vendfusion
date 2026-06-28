"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Users, CreditCard, Mail, Phone, Save, 
  Check, RefreshCw, MessageSquare, ShieldAlert, TrendingUp, 
  ArrowUpRight, AlertCircle, Key, HelpCircle, UserCheck, Shield, Smartphone, Settings
} from "lucide-react";

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "open" | "resolved";
  replyText: string;
}

export default function SuperAdminPage() {
  // XYZ.AI Owner Platform Settings State
  const [bankAccount, setBankAccount] = useState({
    holderName: "XYZ AI Technologies Private Limited",
    accountNumber: "50200084729103",
    ifscCode: "HDFC0000012",
    bankName: "HDFC Bank Ltd",
    upiId: "pay.xyz@upi",
  });

  const [checkoutPrefs, setCheckoutPrefs] = useState({
    upiId: "pay.xyz@upi",
    upiEnabled: true,
    bankEnabled: true,
    cardEnabled: true,
  });

  const [supportContact, setSupportContact] = useState({
    supportEmail: "support@xyz.ai",
    supportWhatsapp: "+91 98765 43210",
  });

  // Load config on mount
  useEffect(() => {
    fetch("http://localhost:3002/payment/config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBankAccount({
            holderName: data.holderName || "XYZ AI Technologies Private Limited",
            accountNumber: data.accountNumber || "50200084729103",
            ifscCode: data.ifscCode || "HDFC0000012",
            bankName: data.bankName || "HDFC Bank Ltd",
            upiId: data.upiId || "pay.xyz@upi",
          });
          setCheckoutPrefs({
            upiId: data.upiId || "pay.xyz@upi",
            upiEnabled: data.upiEnabled !== false,
            bankEnabled: data.bankEnabled !== false,
            cardEnabled: data.cardEnabled !== false,
          });
        }
      })
      .catch(err => console.log("Failed to fetch payment config:", err));
  }, []);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "t-1",
      userEmail: "anuj@fintechflow.co",
      userName: "Anuj Sharma",
      subject: "Apollo credit limits exhausted",
      message: "Hi, I launched a target search agent yesterday but the lead list shows 0 results because of Apollo's restricted matches. Can you verify if our Pro AI subscription got registered correctly?",
      timestamp: "2 hours ago",
      status: "open",
      replyText: ""
    },
    {
      id: "t-2",
      userEmail: "helen@medsafe.io",
      userName: "Helen Miller",
      subject: "Zoho CRM deals sync lag",
      message: "We closed a deal on FintechFlow but the Zoho deal timeline is lagging. Can you push the logs manually from the backend?",
      timestamp: "Yesterday",
      status: "resolved",
      replyText: "Hi Helen, I have cleared the cache and run a manual sync. The deals should reflect on your dashboard now."
    }
  ]);

  // Action states
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isSavingGateway, setIsSavingGateway] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "settings" | "support">("metrics");
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);

  // Platform Metrics Mock Data
  const metrics = {
    totalUsers: 148,
    activeSubscribers: 84,
    churnRate: "2.1%",
    totalRevenue: "₹2,51,916",
    mrr: "₹1,84,000",
    leadsFoundThisMonth: 14205,
    outreachSentThisMonth: 8240,
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    fetch("http://localhost:3002/payment/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankAccount)
    })
      .then(res => res.json())
      .then(() => {
        setIsSavingBank(false);
        alert("Platform bank details updated successfully!");
      })
      .catch(err => {
        setIsSavingBank(false);
        alert("Error saving: " + err.message);
      });
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGateway(true); // Re-use loading state for save
    fetch("http://localhost:3002/payment/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPrefs)
    })
      .then(res => res.json())
      .then(() => {
        setIsSavingGateway(false);
        alert("Direct checkout preferences updated and active on platform!");
      })
      .catch(err => {
        setIsSavingGateway(false);
        alert("Failed to save credentials: " + err.message);
      });
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    setTimeout(() => {
      setIsSavingContact(false);
      alert("Platform contact coordinates updated!");
    }, 1200);
  };

  const handleSendReply = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "resolved" as const,
        };
      }
      return t;
    }));
    setReplyingTicketId(null);
    alert("Reply dispatched to customer email!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute inset-0 radial-glow opacity-5" />
        <div className="space-y-1 relative z-10">
          <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-bold uppercase tracking-wider">Super Admin Console</span>
          <h1 className="text-xl font-extrabold text-white tracking-tight">XYZ.AI Platform Management</h1>
          <p className="text-xs text-gray-400">Monitor platform metrics, incoming payments bank settings, and resolve user support inquiries.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === "metrics" 
                ? "bg-primary border-primary text-white" 
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === "settings" 
                ? "bg-primary border-primary text-white" 
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Payments & Contact
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === "support" 
                ? "bg-primary border-primary text-white" 
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Support Tickets
            {tickets.filter(t => t.status === "open").length > 0 && (
              <span className="ml-1.5 px-1 py-0.5 rounded bg-red-500 text-white text-[8px] font-bold">
                {tickets.filter(t => t.status === "open").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* METRICS VIEW */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-4 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Users</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{metrics.totalUsers}</span>
                <span className="text-[10px] text-green-400 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-4 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Monthly Recurring (MRR)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{metrics.mrr}</span>
                <span className="text-[10px] text-green-400 flex items-center"><ArrowUpRight className="h-3 w-3" /> +8%</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-4 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Income (Direct UPI / Bank)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{metrics.totalRevenue}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-4 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Active Subscribers</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{metrics.activeSubscribers} / {metrics.totalUsers}</span>
              </div>
            </div>

          </div>

          {/* Revenue Logs Chart area */}
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" /> Subscription Signups Timeline
            </h3>
            
            <div className="h-48 flex items-end gap-3 pt-6 border-b border-white/5 px-2">
              {[40, 55, 48, 70, 95, 120, 148].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-full rounded bg-primary/20 group-hover:bg-primary transition-all duration-300 relative" style={{ height: `${(val/150)*100}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val} users
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">Month {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS VIEW (PAYMENTS & CONTACT) */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bank Account Settings */}
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-6 space-y-5">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Building2 className="h-4 w-4 text-primary" /> Bank Account to Receive Income
            </h3>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Account Holder Name</label>
                <input
                  value={bankAccount.holderName}
                  onChange={(e) => setBankAccount({ ...bankAccount, holderName: e.target.value })}
                  className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Account Number</label>
                  <input
                    value={bankAccount.accountNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">IFSC Code</label>
                  <input
                    value={bankAccount.ifscCode}
                    onChange={(e) => setBankAccount({ ...bankAccount, ifscCode: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Bank Name</label>
                  <input
                    value={bankAccount.bankName}
                    onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">UPI ID / Virtual Address</label>
                  <input
                    value={bankAccount.upiId}
                    onChange={(e) => setBankAccount({ ...bankAccount, upiId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingBank}
                className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-lg transition-colors gap-1.5"
              >
                {isSavingBank ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Bank Configurations
              </button>
            </form>
          </div>

          <div className="space-y-6">
            
            {/* Direct Checkout preferences & switches */}
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Settings className="h-4 w-4 text-primary" /> Direct Checkout Preferences
              </h3>

              <form onSubmit={handleSavePrefs} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Checkout UPI ID</label>
                  <div className="relative flex items-center">
                    <Smartphone className="absolute left-3 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={checkoutPrefs.upiId}
                      onChange={(e) => setCheckoutPrefs({ ...checkoutPrefs, upiId: e.target.value })}
                      placeholder="pay.xyz@upi"
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Enable Payment Methods</label>
                  
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutPrefs.upiEnabled}
                      onChange={(e) => setCheckoutPrefs({ ...checkoutPrefs, upiEnabled: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-0"
                    />
                    <span>Direct UPI QR Code Scan</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutPrefs.bankEnabled}
                      onChange={(e) => setCheckoutPrefs({ ...checkoutPrefs, bankEnabled: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-0"
                    />
                    <span>Direct Bank IMPS Transfer</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutPrefs.cardEnabled}
                      onChange={(e) => setCheckoutPrefs({ ...checkoutPrefs, cardEnabled: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-0"
                    />
                    <span>Direct Credit/Debit Card Checkout</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingGateway}
                  className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-lg transition-colors gap-1.5"
                >
                  {isSavingGateway ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Checkout Preferences
                </button>
              </form>
            </div>

            {/* Support Coordination settings */}
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Phone className="h-4 w-4 text-primary" /> Platform Support Channels
              </h3>

              <form onSubmit={handleSaveContact} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Support Mailbox</label>
                    <input
                      value={supportContact.supportEmail}
                      onChange={(e) => setSupportContact({ ...supportContact, supportEmail: e.target.value })}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Support WhatsApp Contact</label>
                    <input
                      value={supportContact.supportWhatsapp}
                      onChange={(e) => setSupportContact({ ...supportContact, supportWhatsapp: e.target.value })}
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-lg transition-colors gap-1.5"
                >
                  {isSavingContact ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Update Channels
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* SUPPORT TICKETS VIEW */}
      {activeTab === "support" && (
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-6 space-y-6">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-white/5 pb-3 flex items-center justify-between">
            <span>Customer Support Queue</span>
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-400">
              {tickets.filter(t => t.status === "open").length} OPEN TICKETS
            </span>
          </h3>

          <div className="space-y-4">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`rounded-lg border p-4 space-y-3 transition-colors ${
                  ticket.status === "open" ? "bg-red-500/5 border-red-500/15" : "bg-black/20 border-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-mono">{ticket.timestamp}</span>
                    <h4 className="text-xs font-bold text-white">{ticket.subject}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">From: {ticket.userName} ({ticket.userEmail})</p>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                    ticket.status === "open" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-gray-500 border-white/10"
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed bg-black/35 rounded p-3 font-mono">
                  {ticket.message}
                </p>

                {ticket.status === "open" ? (
                  <div className="space-y-3 pt-2">
                    {replyingTicketId === ticket.id ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Draft support reply to client..."
                          rows={3}
                          value={ticket.replyText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, replyText: val } : t));
                          }}
                          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingTicketId(null)}
                            className="h-8 px-3 rounded border border-white/10 text-[10px] text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(ticket.id)}
                            className="inline-flex h-8 items-center justify-center rounded bg-primary hover:bg-primary-hover px-4 text-[10px] font-bold text-white gap-1.5"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Dispatch Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTicketId(ticket.id)}
                        className="inline-flex h-8 items-center justify-center rounded bg-white/5 border border-white/10 hover:bg-white/10 px-4 text-[10px] font-bold text-white gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Reply to {ticket.userName.split(" ")[0]}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 bg-white/5 rounded p-3 border border-white/5 leading-relaxed font-sans">
                    <span className="font-bold text-gray-400 block mb-1">Owner Reply Logged:</span>
                    {ticket.replyText || "Ticket marked resolved by admin."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
