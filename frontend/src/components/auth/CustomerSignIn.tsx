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
import { customerApi } from "@/lib/customer-api";
import OtpCodeInput from "@/components/auth/OtpCodeInput";

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
  const [otpChallenge, setOtpChallenge] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await login(email, password);
      if (result?.requiresSecondFactor) {
        setOtpChallenge(result.challengeToken); setOtpDestination(result.destination); setDevOtp(result.devOtp || ""); return;
      }
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

  const verifyPhoneOtp = async () => {
    setVerifyingOtp(true); setError(null);
    try {
      const response = await customerApi.verifyLoginOtp({ challengeToken: otpChallenge, code: otp });
      localStorage.setItem("stayease_customer_token", response.token);
      localStorage.setItem("stayease_customer_user", JSON.stringify(response.user));
      localStorage.setItem("stayease_trusted_device", response.trustedDeviceToken);
      window.location.replace(redirectUrl);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "OTP verification failed."); }
    finally { setVerifyingOtp(false); }
  };

  if (otpChallenge) return <div className="relative grid min-h-[85vh] place-items-center bg-slate-50 p-4 dark:bg-slate-950"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950"><ShieldCheck className="h-8 w-8" /></div><h1 className="mt-5 text-2xl font-extrabold">Phát hiện đăng nhập bất thường</h1><p className="mt-2 text-sm text-slate-500">Đây có thể là thiết bị mới. Nhập OTP gửi đến <strong>{otpDestination}</strong> để bảo vệ tài khoản.</p>{devOtp && <p className="mt-4 rounded-lg bg-amber-50 py-2 text-sm font-bold text-amber-700">Mã thử nghiệm local: {devOtp}</p>}{error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}<div className="mt-6"><OtpCodeInput value={otp} onChange={setOtp} disabled={verifyingOtp} /></div><button type="button" onClick={verifyPhoneOtp} disabled={otp.length !== 6 || verifyingOtp} className="mt-6 h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-50">{verifyingOtp ? "Đang xác thực..." : "Xác nhận thiết bị an toàn"}</button><button type="button" onClick={() => { setOtpChallenge(""); setOtp(""); }} className="mt-5 text-sm font-semibold text-blue-600 underline">Quay lại đăng nhập</button></div></div>;

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
