"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate contact form submission
    setTimeout(() => {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-dark-bg grid-bg">
      <Navbar />

      <header className="relative pt-20 pb-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="absolute inset-0 radial-glow z-0" />
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Contact Us
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Get In Touch With Our Team
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Questions about billing plans, limits, integrations, or security sandboxes? We're here to help.
          </p>
        </div>
      </header>

      {/* Form / Details Grid */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Contact Information</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                For customer support inquiries, API assistance, and enterprise setup, please send us a query using the online portal or email us.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Email Address</p>
                  <a href="mailto:support@xyz.ai" className="text-gray-400 hover:text-primary transition-colors">support@xyz.ai</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Support Response Time</p>
                  <p className="text-gray-400">Within 12-24 hours on business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-white/5 bg-dark-bg/40 p-8 glass-panel shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Message Received!</h3>
                  <p className="text-xs text-gray-400">Thank you. Our support engineers will contact you shortly.</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Email</label>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</label>
                  <textarea
                    placeholder="Describe your inquiry..."
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors font-sans resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-lg transition-colors gap-2"
                >
                  Send Message
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
