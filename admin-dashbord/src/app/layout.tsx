"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppStateProvider, useAppState } from "@/context/AppStateContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { 
  Shield, LayoutDashboard, LogOut, Menu, X, ArrowLeft
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, isLoggedIn, logout 
  } = useAppState();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Standalone dashboard security check
  useEffect(() => {
    // Synchronize state from query parameters if redirected from landing website
    const searchParams = new URLSearchParams(window.location.search);
    const qLoggedIn = searchParams.get("isLoggedIn");
    
    if (qLoggedIn === "true") {
      localStorage.setItem("xyz_isLoggedIn", "true");
      
      const qUser = searchParams.get("user");
      const qPlan = searchParams.get("plan");
      const qWorkspace = searchParams.get("workspaceName");
      const qScan = searchParams.get("scanReport");
      
      if (qUser) localStorage.setItem("xyz_user", qUser);
      if (qPlan) localStorage.setItem("xyz_plan", qPlan);
      if (qWorkspace) localStorage.setItem("xyz_workspaceName", qWorkspace);
      if (qScan) localStorage.setItem("xyz_scanReport", qScan);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
      return;
    }

    setHydrated(true);
  }, [isLoggedIn]);

  const navItems = [
    { label: "Platform Overview", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> }
  ];

  const handleLogout = () => {
    logout();
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
    window.location.href = `${websiteUrl}/login`;
  };

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
            Admin
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-grow py-6 px-3 space-y-1">
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

        {/* User profile / Logout */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-black/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                AD
              </div>
              <div className="flex flex-col text-[10px]">
                <span className="font-bold text-gray-300">XYZ Owner</span>
                <span className="text-gray-500 truncate max-w-[100px]">{user?.email || "owner@xyz.ai"}</span>
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
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase">Admin</span>
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
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span className="truncate max-w-[120px]">{user?.email || "owner@xyz.ai"}</span>
            <button onClick={handleLogout} className="text-red-400 hover:underline font-bold font-sans">Log Out</button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <main className="flex-1 md:pl-64 min-h-screen pt-16 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-bg text-gray-100 min-h-screen`}
      >
        <AppStateProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </AppStateProvider>
      </body>
    </html>
  );
}
