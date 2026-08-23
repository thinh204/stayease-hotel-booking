"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Building2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { useTheme } from "@/lib/theme-context";

export default function AdminLogin() {
  const t = useTranslations("Admin.auth");
  const th = useTranslations("Admin.header");
  const pathname = usePathname();
  const { login, loading } = useAdminAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const [email, setEmail] = useState("admin@stayease.com");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || t("invalidCreds"));
    }
  };

  const handleQuickFill = (role: "admin" | "manager") => {
    if (role === "admin") {
      setEmail("admin@stayease.com");
      setPassword("Admin@123456");
    } else {
      setEmail("manager@stayease.com");
      setPassword("Manager@123456");
    }
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top utility bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
          {[
            { locale: "en", label: "EN", flag: "🇺🇸" },
            { locale: "vi", label: "VI", flag: "🇻🇳" },
            { locale: "ko", label: "KO", flag: "🇰🇷" },
          ].map((l) => (
            <Link
              key={l.locale}
              href={`/${l.locale}/admin/login`}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                currentLocale === l.locale
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {l.flag} {l.label}
            </Link>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-yellow-400"
        >
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/25">
            <Sparkles size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading">
            STAY<span className="text-blue-400">EASE</span> EXECUTIVE
          </h1>
          <p className="text-xs text-slate-400">
            {t("portalSubtitle")}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs font-semibold animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1.5 text-slate-300">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stayease.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-slate-300">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500" />
              <span>{t("rememberMe")}</span>
            </label>
            <span className="text-slate-500">256-bit Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? t("signingIn") : t("signInButton")}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <p className="text-[11px] font-bold text-center text-slate-400 uppercase tracking-wider">
            {t("quickFill")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white font-semibold transition text-left flex flex-col"
            >
              <span className="text-blue-400 font-bold">{t("fillAdmin")}</span>
              <span className="text-[10px] text-slate-500 font-mono">admin@stayease.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("manager")}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white font-semibold transition text-left flex flex-col"
            >
              <span className="text-purple-400 font-bold">{t("fillManager")}</span>
              <span className="text-[10px] text-slate-500 font-mono">manager@stayease.com</span>
            </button>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center pt-2">
          <Link
            href={`/${currentLocale}`}
            className="text-xs text-slate-500 hover:text-blue-400 transition"
          >
            ← {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
