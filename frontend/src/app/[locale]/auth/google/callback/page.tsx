"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    try {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const token = hash.get("token");
      const encodedUser = hash.get("user");
      if (!token || !encodedUser) throw new Error("Missing Google session.");

      const normalizedUser = encodedUser.replace(/-/g, "+").replace(/_/g, "/");
      const paddedUser = normalizedUser.padEnd(Math.ceil(normalizedUser.length / 4) * 4, "=");
      const userJson = decodeURIComponent(escape(window.atob(paddedUser)));
      localStorage.setItem("stayease_customer_token", token);
      localStorage.setItem("stayease_customer_user", userJson);
      window.history.replaceState(null, "", window.location.pathname);
      window.location.replace(`/${params.locale || "vi"}/account`);
    } catch {
      router.replace(`/${params.locale || "vi"}/sign-up?error=google_oauth_failed`);
    }
  }, [params.locale, router]);

  return <main className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-slate-950"><div className="text-center"><LoaderCircle className="mx-auto h-9 w-9 animate-spin text-blue-600" /><p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Đang hoàn tất đăng nhập Google...</p></div></main>;
}
