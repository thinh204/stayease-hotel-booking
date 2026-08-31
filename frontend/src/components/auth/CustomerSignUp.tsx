"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUSTOMER_API_BASE, customerApi } from "@/lib/customer-api";
import OtpCodeInput from "@/components/auth/OtpCodeInput";

const authImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=90";

export default function CustomerSignUp() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "vi";
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpChannel, setOtpChannel] = useState<"email" | "phone">("email");
  const [otpChallenge, setOtpChallenge] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startGoogleSignIn = () => {
    window.location.assign(`${CUSTOMER_API_BASE}/auth/google?locale=${locale}`);
  };
  const startFacebookSignIn = () => {
    window.location.assign(`${CUSTOMER_API_BASE}/auth/facebook?locale=${locale}`);
  };

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const requestOtp = async () => {
    const response = await customerApi.requestRegistrationOtp({ fullName: fullName.trim(), email: email.trim(), password, phone: phone.trim() || undefined, channel: otpChannel });
    setOtpChallenge(response.challengeToken); setOtpDestination(response.destination); setDevOtp(response.devOtp || ""); setOtp(""); setResendIn(45);
  };

  const isVietnamese = locale === "vi";
  const copy = isVietnamese
    ? {
        title: "Tạo tài khoản của bạn",
        subtitle: "Tham gia StayEase và bắt đầu đặt phòng",
        name: "Họ và tên",
        email: "Địa chỉ email",
        password: "Mật khẩu",
        confirm: "Xác nhận mật khẩu",
        agree: "Tôi đồng ý với",
        terms: "Điều khoản & Chính sách bảo mật",
        create: "Tạo tài khoản",
        creating: "Đang tạo tài khoản...",
        social: "HOẶC ĐĂNG KÝ VỚI",
        existing: "Đã có tài khoản?",
        signIn: "Đăng nhập",
        passwordError: "Mật khẩu xác nhận không khớp.",
        termsError: "Bạn cần đồng ý với điều khoản để tiếp tục.",
        facebookUnavailable: "Đăng nhập Facebook chưa được cấu hình. Hãy thêm Facebook App ID và App Secret vào backend trước.",
        googleUnavailable: "Đăng nhập Google chưa được cấu hình. Hãy thêm Google Client ID và Client Secret vào backend trước.",
      }
    : {
        title: "Create your account",
        subtitle: "Join StayEase and start booking",
        name: "Full name",
        email: "Email address",
        password: "Password",
        confirm: "Confirm password",
        agree: "I agree to",
        terms: "Terms & Privacy Policy",
        create: "Create Account",
        creating: "Creating account...",
        social: "OR SIGN UP WITH",
        existing: "Already have an account?",
        signIn: "Sign in",
        passwordError: "The password confirmation does not match.",
        termsError: "Please accept the terms to continue.",
        facebookUnavailable: "Facebook sign-in is not configured yet. Add the Facebook App ID and App Secret to the backend first.",
        googleUnavailable: "Google sign-in is not configured yet. Add the Google Client ID and Client Secret to the backend first.",
      };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(copy.passwordError);
      return;
    }
    if (!acceptedTerms) {
      setError(copy.termsError);
      return;
    }

    try {
      if (otpChannel === "phone" && !phone.trim()) throw new Error("Vui lòng nhập số điện thoại để nhận OTP.");
      setLoading(true);
      await requestOtp();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true); setError(null);
    try {
      const response = await customerApi.verifyRegistrationOtp({ challengeToken: otpChallenge, code: otp });
      localStorage.setItem("stayease_customer_token", response.token);
      localStorage.setItem("stayease_customer_user", JSON.stringify(response.user));
      window.location.replace(`/${locale}/account`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "OTP verification failed."); }
    finally { setLoading(false); }
  };

  if (otpChallenge) return <section className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#eef8ff,white_55%,#edf6ff)] px-4 py-10 text-slate-900">
    <div className="w-full max-w-xl text-center">
      <Link href={`/${locale}`} className="inline-flex"><Image src="/icons/logo.svg" alt="StayEase" width={250} height={60} priority /></Link>
      <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,.14)] sm:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-blue-600"><ShieldCheck className="h-10 w-10" /></div>
        <h1 className="mt-5 text-3xl font-extrabold text-[#0b2a55] sm:text-4xl">{otpChannel === "email" ? "Xác thực email" : "Xác thực số điện thoại"}</h1>
        <p className="mt-2 text-slate-500">Chúng tôi đã gửi mã gồm 6 chữ số đến <strong>{otpDestination}</strong></p>
        {devOtp && <p className="mt-3 rounded-lg bg-amber-50 py-2 text-sm font-bold text-amber-700">Mã thử nghiệm local: {devOtp}</p>}
        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-7"><OtpCodeInput value={otp} onChange={setOtp} disabled={loading} /></div>
        <button type="button" onClick={verifyOtp} disabled={loading || otp.length !== 6} className="mt-7 h-14 w-full rounded-xl bg-gradient-to-r from-[#1688f5] to-[#0875df] text-lg font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50">{loading ? "Đang xác thực..." : "Xác thực"}</button>
      </div>
      <p className="mt-7 text-sm text-slate-500">Chưa nhận được mã? <button type="button" disabled={resendIn > 0 || loading} onClick={async () => { setLoading(true); try { await requestOtp(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể gửi lại mã."); } finally { setLoading(false); } }} className="font-bold text-blue-600 disabled:text-slate-400">{resendIn > 0 ? `Gửi lại sau 00:${String(resendIn).padStart(2, "0")}` : "Gửi lại"}</button></p>
      <button type="button" onClick={() => { setOtpChallenge(""); setOtp(""); setError(null); }} className="mt-6 font-semibold text-blue-600 underline">Thay đổi thông tin</button>
    </div>
  </section>;

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#eef7ff] text-slate-900 dark:bg-slate-950 dark:text-white">
      <Image src={authImage} alt="Luxury StayEase resort beside a tropical pool" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/70 to-white/95 dark:from-slate-950/50 dark:via-slate-950/75 dark:to-slate-950/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#eaf5ff]/45 via-transparent to-white/15" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] items-center gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-14 xl:gap-20 xl:px-20">
        <div className="hidden self-stretch lg:flex lg:flex-col lg:justify-between lg:py-12">
          <Link href={`/${locale}`} className="w-fit rounded-2xl bg-white/65 p-4 shadow-sm backdrop-blur-md">
            <Image src="/icons/logo.svg" alt="StayEase" width={260} height={56} priority />
            <span className="mt-1 block text-center text-[11px] font-bold tracking-[.42em] text-slate-700">HOTEL BOOKINGS</span>
          </Link>
          <div className="max-w-sm rounded-2xl border border-white/50 bg-white/50 p-5 text-sm text-slate-700 shadow-lg backdrop-blur-md">
            <p className="font-extrabold text-slate-900">Stay beautifully. Book effortlessly.</p>
            <p className="mt-1 text-xs leading-5">Exclusive hotels, secure payments and dedicated support for every journey.</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[590px] rounded-[28px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_70px_rgba(15,23,42,.22)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:p-9 lg:p-11">
          <Link href={`/${locale}`} className="mb-6 inline-flex lg:hidden"><Image src="/icons/logo.svg" alt="StayEase" width={190} height={42} priority /></Link>
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#09204a] dark:text-white sm:text-[40px] sm:leading-tight">{copy.title}</h1>
            <p className="mt-1.5 text-base text-slate-500 sm:text-lg">{copy.subtitle}</p>
          </header>

          {error && (
            <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="relative block">
              <span className="sr-only">{copy.name}</span><User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input type="text" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={copy.name} className="h-13 w-full rounded-lg border border-slate-300 bg-white/80 pl-13 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" />
            </label>
            <label className="relative block">
              <span className="sr-only">{copy.email}</span><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} className="h-13 w-full rounded-lg border border-slate-300 bg-white/80 pl-13 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" />
            </label>
            <label className="relative block">
              <span className="sr-only">{copy.password}</span><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.password} className="h-13 w-full rounded-lg border border-slate-300 bg-white/80 pl-13 pr-12 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            </label>
            <label className="relative block">
              <span className="sr-only">{copy.confirm}</span><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={copy.confirm} className="h-13 w-full rounded-lg border border-slate-300 bg-white/80 pl-13 pr-12 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950" />
              <button type="button" aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            </label>

            <label className="relative block">
              <span className="sr-only">Số điện thoại</span><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại (để nhận OTP SMS)" className="h-13 w-full rounded-lg border border-slate-300 bg-white/80 pl-13 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950" />
            </label>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button type="button" onClick={() => setOtpChannel("email")} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${otpChannel === "email" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-950" : "text-slate-500"}`}><Mail className="h-4 w-4" />OTP email</button>
              <button type="button" onClick={() => setOtpChannel("phone")} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${otpChannel === "phone" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-950" : "text-slate-500"}`}><Phone className="h-4 w-4" />OTP điện thoại</button>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 py-1 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="sr-only" />
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${acceptedTerms ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950"}`}>{acceptedTerms && <Check className="h-3.5 w-3.5" />}</span>
              <span>{copy.agree} <Link href={`/${locale}/support`} className="font-semibold text-blue-600 underline underline-offset-2">{copy.terms}</Link></span>
            </label>

            <Button type="submit" disabled={loading} className="h-13 w-full rounded-lg bg-gradient-to-r from-[#177ee8] to-[#1689ef] text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-600">
              {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}{loading ? copy.creating : copy.create}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" /><span className="text-[11px] font-semibold tracking-[.28em] text-slate-500">{copy.social}</span><span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" /></div>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={startGoogleSignIn} className="flex h-13 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><span className="text-xl font-extrabold text-blue-600">G</span>Google</button>
            <button type="button" onClick={startFacebookSignIn} className="flex h-13 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#1877f2] text-lg font-extrabold text-white">f</span>Facebook</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">{copy.existing} <Link href={`/${locale}/sign-in`} className="font-semibold text-blue-600 underline underline-offset-2">{copy.signIn}</Link></p>
        </div>
      </div>
    </section>
  );
}
