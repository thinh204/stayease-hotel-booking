"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth-context";

export default function CustomerSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const redirectUrl = searchParams.get("redirect") || `/${currentLocale}/account`;

  const { login, loading } = useCustomerAuth();
  const [email, setEmail] = useState("user@stayease.com");
  const [password, setPassword] = useState("User@123456");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  const handleQuickFill = () => {
    setEmail("user@stayease.com");
    setPassword("User@123456");
    setError(null);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading">
            Welcome to StayEase
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage your luxury hotel reservations and VIP privileges.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? "Signing In..." : "Sign In to My Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Quick Fill */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-500 transition text-center"
          >
            Quick Fill Demo Guest: <span className="text-blue-600 dark:text-blue-400 font-bold">user@stayease.com</span>
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{" "}
          <Link
            href={`/${currentLocale}/sign-up`}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Create VIP Account
          </Link>
        </div>
      </div>
    </div>
  );
}
