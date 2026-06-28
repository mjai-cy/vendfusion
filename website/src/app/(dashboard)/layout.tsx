"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { 
  Shield, LayoutDashboard, Target, Mail, Database, 
  Zap, LogOut, Menu, X,
  RefreshCw, ChevronDown, Globe, Plus, Check, Trash2
} from "lucide-react";

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, isLoggedIn, plan, 
    workspaceName, mode, toggleSellingMode, logout,
    workspaces, activeWorkspaceId, switchWorkspace, resetScan, deleteWorkspace
  } = useAppState();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  // Authentication check - wait for client hydration
  useEffect(() => {
    setHydrated(true);

    if (!isLoggedIn && hydrated) {
      router.push("/login");
      return;
    }
  }, [isLoggedIn, hydrated, router]);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "AI Agents", href: "/agents", icon: <Target className="h-4 w-4" /> },
    { label: "Lead Intelligence", href: "/leads", icon: <Target className="h-4 w-4" /> },
    { label: "Smart Inbox", href: "/inbox", icon: <Mail className="h-4 w-4" /> },
    { label: "Campaign Builder", href: "/campaigns", icon: <Mail className="h-4 w-4" /> },
    { label: "Website Visitors", href: "/visitors", icon: <Globe className="h-4 w-4" /> },
    { label: "Knowledge Center", href: "/knowledge", icon: <Database className="h-4 w-4" /> },
    { label: "Deliverability", href: "/deliverability", icon: <Shield className="h-4 w-4" /> },
    { label: "Weekly Optimization", href: "/learning", icon: <RefreshCw className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleModeChange = () => {
    const nextMode = mode === "manual" ? "pro-ai" : "manual";
    toggleSellingMode(nextMode);
  };

  // Show a blank loading screen while client state is hydrating
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-100 flex font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-white/5 bg-black/30 backdrop-blur-xl z-20">
        
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              XYZ<span className="text-primary">.AI</span>
            </span>
          </Link>
          <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase">
            {plan === "none" ? "Free" : plan}
          </span>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 py-3 border-b border-white/5 relative">
          <button
            onClick={() => setWsDropdownOpen(prev => !prev)}
            className="w-full rounded-lg bg-white/5 border border-white/5 px-3 py-2 flex items-center justify-between hover:border-white/10 transition-colors"
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Active Workspace</span>
              <span className="text-xs font-semibold text-gray-200 truncate max-w-[140px]">
                {workspaceName}
              </span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform shrink-0 ${wsDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Workspace Dropdown */}
          {wsDropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 rounded-lg border border-white/10 bg-dark-bg/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Your Workspaces</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {workspaces.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[10px] text-gray-500">
                    No workspaces yet. Run a scan to create one.
                  </div>
                ) : (
                  workspaces.map(ws => (
                    <div
                      key={ws.id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors ${
                        ws.id === activeWorkspaceId ? "bg-primary/5" : ""
                      }`}
                    >
                      <button
                        onClick={() => { switchWorkspace(ws.id); setWsDropdownOpen(false); }}
                        className="flex items-center gap-2.5 flex-grow min-w-0 text-left"
                      >
                        <Globe className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-semibold text-gray-200 truncate">{ws.name}</p>
                          <p className="text-[9px] text-gray-500">{new Date(ws.createdAt).toLocaleDateString()}</p>
                        </div>
                        {ws.id === activeWorkspaceId && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                      {/* Delete workspace button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Directly delete workspace without confirmation
                          deleteWorkspace(ws.id);
                          setWsDropdownOpen(false);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                        title="Delete workspace"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-white/5 p-2">
                <Link
                  href="/scan"
                  onClick={() => setWsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-xs font-semibold text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Scan
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-grow py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  active 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mode & Profile Footer */}
        <div className="p-4 border-t border-white/5 space-y-4 bg-black/10">
          
          {/* Selling Mode Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Execution Mode</span>
              <span className={mode === "pro-ai" ? "text-secondary" : "text-primary"}>
                {mode === "pro-ai" ? "Autonomous" : "Manual"}
              </span>
            </div>
            <button
              onClick={handleModeChange}
              className={`w-full flex items-center justify-center gap-1.5 h-8 rounded text-xs font-bold border transition-all ${
                mode === "pro-ai"
                  ? "bg-secondary/15 border-secondary/30 text-secondary hover:bg-secondary/20"
                  : "bg-primary/10 border-primary/25 text-primary hover:bg-primary/15"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Switch to {mode === "manual" ? "Autonomous" : "Manual"}
            </button>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "JD"}
              </div>
              <div className="flex flex-col text-[10px] min-w-0">
                <span className="font-bold text-gray-300 truncate">{user?.name || "Jane Doe"}</span>
                <span className="text-gray-500 truncate max-w-[100px]">{user?.email || "jane@company.com"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-dark-bg/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">XYZ<span className="text-primary">.AI</span></span>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase">{plan === "none" ? "Free" : plan}</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside className={`md:hidden fixed inset-y-0 right-0 w-64 bg-dark-bg border-l border-white/5 z-50 transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      } p-6 flex flex-col justify-between`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-sm font-bold text-white">Navigation</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded border border-white/5 bg-white/5 px-3 py-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Workspace</span>
            <span className="text-xs text-white font-semibold">{workspaceName}</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                    active 
                      ? "bg-primary text-white" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <button
            onClick={() => {
              handleModeChange();
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-1.5 h-8 rounded text-xs font-bold border ${
              mode === "pro-ai"
                ? "bg-secondary/15 border-secondary/30 text-secondary"
                : "bg-primary/10 border-primary/25 text-primary"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {mode === "pro-ai" ? "Manual Mode" : "AI Mode"}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded text-xs font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <div className="flex-grow p-6 pt-20 md:pt-6">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
