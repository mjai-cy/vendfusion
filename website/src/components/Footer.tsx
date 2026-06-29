import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-dark-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                xyz<span className="text-primary">.ai</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Turn your website into an AI sales agent that finds high-intent leads and contacts them for you.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              &copy; 2026 xyz.ai. All rights reserved.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Platform</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/signup" className="hover:text-primary transition-colors">Start Free Trial</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Company</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Email: <a href="mailto:support@xyz.ai" className="hover:text-primary transition-colors">support@xyz.ai</a></li>
              <li>Live chat support</li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Online Support Form</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            Your next 10 customers are already out there. Let your agent find them.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">System Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
