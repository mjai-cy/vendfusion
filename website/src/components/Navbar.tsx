"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const { isLoggedIn, user } = useAppState();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Persona Tool", href: "/persona" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-dark-bg/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 group-hover:border-primary transition-all">
                <Sparkles className="h-5 w-5 text-primary group-hover:text-accent transition-colors" />
                <div className="absolute inset-0 rounded-lg bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                xyz<span className="text-primary">.ai</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive(link.href) ? "text-primary font-semibold" : "text-gray-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  Welcome, <span className="font-semibold text-gray-200">{user?.name}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all gap-1 group"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-4 text-sm font-medium text-white border border-white/10 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/5 bg-dark-bg px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                isActive(link.href) ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/5 space-y-2">
            {isLoggedIn ? (
              <div className="space-y-2 px-3">
                <p className="text-xs text-gray-400">Signed in as {user?.email}</p>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-center text-sm font-medium text-white shadow-lg hover:bg-primary-hover"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/10 py-2 text-center text-sm font-medium text-gray-400 hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-white/10 py-2 text-center text-sm font-medium text-white hover:bg-white/15"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
