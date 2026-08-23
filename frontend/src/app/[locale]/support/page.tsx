"use client";

import React, { useState } from "react";
import {
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Check,
  HelpCircle,
} from "lucide-react";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bookingRef: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "What is the StayEase luxury booking guarantee?",
      a: "Every reservation through StayEase includes guaranteed best available rates, complimentary daily breakfast, free high-speed fiber Wi-Fi, and priority consideration for complimentary suite upgrades.",
    },
    {
      q: "How does the flexible cancellation policy work?",
      a: "Most luxury properties on StayEase allow 100% full refund cancellations up to 48 hours prior to your scheduled check-in time, processed directly through your online account.",
    },
    {
      q: "How do I arrange private helicopter or limousine airport transfers?",
      a: "You can specify your airport transfer requests directly during the booking checkout in the VIP Special Requests field, or contact our 24/7 concierge anytime.",
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-16 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Headphones size={15} />
            <span>24/7 VIP Concierge</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
            How May We Assist You?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Our private concierge team is available around the clock to ensure your stay is flawless.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Phone size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">Direct VIP Hotline</h3>
            <p className="text-xs text-slate-500">Toll-free worldwide luxury assistance</p>
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">+1 (800) 782-9327</p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Mail size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">Concierge Desk Email</h3>
            <p className="text-xs text-slate-500">Average response time: Under 15 minutes</p>
            <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 font-mono">concierge@stayease.com</p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">Live Concierge Chat</h3>
            <p className="text-xs text-slate-500">Instant assistance in English, Vietnamese, Korean</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              ● Online Now
            </span>
          </div>
        </div>

        {/* Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold font-heading">
              Send a Concierge Request
            </h3>

            {submitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
                <Check size={32} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Request Dispatched</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Our private concierge manager will reach out via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Special dietary requirement, Airport transfer..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25"
                >
                  Submit Concierge Inquiry
                </button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-heading flex items-center gap-2">
              <HelpCircle size={22} className="text-blue-500" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
