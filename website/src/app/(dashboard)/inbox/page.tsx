"use client";

import React, { useState } from "react";
import { useAppState, Lead } from "@/context/AppStateContext";
import { 
  Inbox, MessageSquare, Send, Check, RefreshCw, 
  ChevronRight, Calendar, User, Search, Sparkles
} from "lucide-react";

interface MessageThread {
  leadId: string;
  leadName: string;
  role: string;
  companyName: string;
  unread: boolean;
  status: "replied" | "interested" | "ignored" | "meeting_booked";
  timestamp: string;
  history: {
    sender: "lead" | "agent" | "user";
    text: string;
    time: string;
  }[];
  aiDraft: string;
}

export default function SmartInboxPage() {
  const { leads, updateLeadStatus } = useAppState();

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("lead-1");
  const [draftReplyText, setDraftReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);

  const selectedThread = threads.find(t => t.leadId === selectedThreadId) || threads[0];

  React.useEffect(() => {
    if (selectedThread) {
      setDraftReplyText(selectedThread.aiDraft);
    }
  }, [selectedThreadId]);

  const handleSendReply = () => {
    if (!draftReplyText) return;
    setIsSending(true);

    setTimeout(() => {
      setThreads(prev => prev.map(t => {
        if (t.leadId === selectedThreadId) {
          return {
            ...t,
            unread: false,
            history: [
              ...t.history,
              {
                sender: "user",
                text: draftReplyText,
                time: "Just Now"
              }
            ],
            aiDraft: ""
          };
        }
        return t;
      }));
      setDraftReplyText("");
      setIsSending(false);
    }, 1000);
  };

  const handleStatusChange = (status: "interested" | "replied" | "ignored" | "meeting_booked") => {
    setThreads(prev => prev.map(t => 
      t.leadId === selectedThreadId ? { ...t, status } : t
    ));

    let contextStatus: Lead["outreachStatus"] = "replied";
    if (status === "meeting_booked") contextStatus = "meeting_booked";
    if (status === "ignored") contextStatus = "ignored";
    
    updateLeadStatus(selectedThreadId, contextStatus);
    
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Smart Inbox &amp; Replies</h1>
        <p className="text-[11px] text-gray-400">
          Respond to interested prospects with AI-assisted draft replies and manage meeting bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Prospect Inbox</h3>
            <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/25 px-2 py-0.5 rounded font-mono font-bold">
              {threads.filter(t => t.unread).length} UNREAD
            </span>
          </div>

          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
              <Inbox className="h-10 w-10 text-white/10" />
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                No replies yet. When prospects respond to your outreach, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {threads.map((thread) => {
                const isSelected = thread.leadId === selectedThreadId;
                const lastMessage = thread.history[thread.history.length - 1];
                return (
                  <div
                    key={thread.leadId}
                    onClick={() => {
                      setSelectedThreadId(thread.leadId);
                      setThreads(prev => prev.map(t => t.leadId === thread.leadId ? { ...t, unread: false } : t));
                    }}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300 uppercase shrink-0">
                      {thread.leadName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="space-y-1 flex-grow overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {thread.leadName}
                          {thread.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </h4>
                        <span className="text-[9px] text-gray-500 font-mono">{thread.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{thread.role} @ {thread.companyName}</p>
                      <p className="text-[10px] text-gray-500 truncate leading-relaxed pt-1">
                        {lastMessage ? lastMessage.text : ""}
                      </p>
                      <div className="pt-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          thread.status === "interested" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          thread.status === "meeting_booked" ? "bg-secondary/15 text-secondary border-secondary/20" :
                          "bg-white/5 text-gray-500 border-white/10"
                        }`}>
                          {thread.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedThread && (
          <div className="lg:col-span-2 space-y-6">
            
            <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">{selectedThread.leadName}</h3>
                  <p className="text-xs text-gray-400">{selectedThread.role} · {selectedThread.companyName}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange("meeting_booked")}
                    className={`h-8 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                      selectedThread.status === "meeting_booked"
                        ? "bg-secondary border-secondary text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    Calendar Booked
                  </button>
                  <button
                    onClick={() => handleStatusChange("interested")}
                    className={`h-8 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                      selectedThread.status === "interested"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    Mark Interested
                  </button>
                  <button
                    onClick={() => handleStatusChange("ignored")}
                    className="h-8 px-3 rounded-lg text-[10px] font-bold border border-white/10 bg-white/5 text-gray-500 hover:border-white/20"
                  >
                    Ignore
                  </button>
                </div>
              </div>

              {showStatusSuccess && (
                <div className="rounded-lg bg-secondary/15 border border-secondary/20 p-2 text-center text-xs text-secondary font-semibold">
                  Lead status updated successfully!
                </div>
              )}

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {selectedThread.history.map((msg, idx) => {
                  const isAgent = msg.sender === "agent";
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[80%] ${
                        isUser ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold mb-1">
                        {isUser ? "You" : isAgent ? "AI Agent" : selectedThread.leadName} · {msg.time}
                      </span>
                      <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                        isUser 
                          ? "bg-primary text-white" 
                          : isAgent 
                          ? "bg-black/30 border border-white/5 text-gray-300 font-mono whitespace-pre-line" 
                          : "bg-white/5 text-white"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {draftReplyText !== undefined && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot Reply Draft</h3>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">Suggested reply</span>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={draftReplyText}
                    onChange={(e) => setDraftReplyText(e.target.value)}
                    rows={4}
                    placeholder="Describe your reply..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none font-sans"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDraftReplyText(selectedThread.aiDraft)}
                      className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                      title="Reset to AI suggestion"
                    >
                      Reset Draft
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !draftReplyText}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 gap-1.5 shadow-lg shadow-primary/10 transition-colors disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
