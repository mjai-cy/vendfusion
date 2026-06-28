import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-dark-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Vision */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
                <Shield className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                XYZ<span className="text-primary">.AI</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Build high-converting outbound pipelines with autonomous AI agents. Prospect companies, discover target roles, write customized copy, and sync deals to CRM.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              © 2026 XYZ.AI Inc. All rights reserved.
            </p>
          </div>

          {/* Links: Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Platform</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/scan" className="hover:text-primary transition-colors">Free Website Scanner</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Campaign Engine</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Knowledge Base RAG</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing Tiers</Link></li>
            </ul>
          </div>

          {/* Links: Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Company</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/about" className="hover:text-primary transition-colors">About XYZ.AI</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Email: <a href="mailto:support@xyz.ai" className="hover:text-primary transition-colors">support@xyz.ai</a></li>
              <li>Hours: Mon-Fri 9AM-6PM IST</li>
              <li>Location: Bengaluru, KA, India</li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Online Support Form</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright/security clause */}
        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            Standard Fair Usage Policy applies. Data isolation sandbox guarantees your data is never used for training other customers' models.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">Security Inquiries</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
