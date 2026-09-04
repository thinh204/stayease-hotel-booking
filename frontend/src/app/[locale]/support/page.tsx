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
import { useTranslations } from "next-intl";

export default function SupportPage() {
  const t = useTranslations("Public");
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
      q: t("faq1q"), a: t("faq1a"),
    },
    {
      q: t("faq2q"), a: t("faq2a"),
    },
    {
      q: t("faq3q"), a: t("faq3a"),
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-16 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Headphones size={15} />
            <span>{t("supportEyebrow")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
            {t("supportHeading")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            {t("supportDescription")}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Phone size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">{t("hotline")}</h3>
            <p className="text-xs text-slate-500">{t("hotlineDesc")}</p>
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">+1 (800) 782-9327</p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Mail size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">{t("emailDesk")}</h3>
            <p className="text-xs text-slate-500">{t("emailDesc")}</p>
            <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 font-mono">concierge@stayease.com</p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-base font-bold font-heading">{t("liveChat")}</h3>
            <p className="text-xs text-slate-500">{t("liveChatDesc")}</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              ● {t("online")}
            </span>
          </div>
        </div>

        {/* Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold font-heading">
              {t("requestTitle")}
            </h3>

            {submitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
                <Check size={32} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">{t("sentTitle")}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t("sentDesc")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t("name")}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t("email")}</label>
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
                  <label className="block font-semibold mb-1">{t("subject")}</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={t("subjectPlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t("message")}</label>
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
                  {t("submit")}
                </button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-heading flex items-center gap-2">
              <HelpCircle size={22} className="text-blue-500" />
              <span>{t("faqTitle")}</span>
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
