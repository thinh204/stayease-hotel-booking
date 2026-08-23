"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, User, LogIn, UserPlus, LogOut, ShieldCheck, Sun, Moon } from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { useTheme } from "@/lib/theme-context";

export default function NavbarActions() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useCustomerAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/";

  const getLocaleHref = (locale: string) =>
    `/${locale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;

  useEffect(() => {
    const closeMenusOnOutsideClick = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("click", closeMenusOnOutsideClick);
    return () => document.removeEventListener("click", closeMenusOnOutsideClick);
  }, []);

  const languages = [
    { locale: "en", label: "EN", full: "English", flag: "🇺🇸" },
    { locale: "vi", label: "VI", full: "Tiếng Việt", flag: "🇻🇳" },
    { locale: "ko", label: "KO", full: "한국어", flag: "🇰🇷" },
  ];

  const currentLang = languages.find((l) => l.locale === currentLocale) || languages[0];

  return (
    <div ref={actionsRef} className="relative hidden items-center gap-3 lg:flex select-none">
      {/* 1. Dark Mode / Light Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        title="Toggle Theme"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 shadow-sm transition hover:text-amber-400 hover:border-slate-700"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-slate-300 transition-transform rotate-0 hover:-rotate-12" />
        )}
      </button>

      {/* 2. Language Dropdown Pill */}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => {
            setLanguageMenuOpen((open) => !open);
            setAccountMenuOpen(false);
          }}
          className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-slate-700"
        >
          <Globe className="h-4 w-4 text-slate-400" />
          <span>{currentLang.label}</span>
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${languageMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {languageMenuOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl">
            {languages.map((language) => (
              <Link
                key={language.locale}
                href={getLocaleHref(language.locale)}
                onClick={() => setLanguageMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition ${
                  currentLocale === language.locale
                    ? "font-bold bg-blue-950/80 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.full}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. User Account Dropdown Pill */}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => {
            setAccountMenuOpen((open) => !open);
            setLanguageMenuOpen(false);
          }}
          className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-left text-xs font-medium text-slate-200 shadow-sm transition hover:border-slate-700"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300">
            <User className="h-4 w-4" />
          </div>

          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-semibold text-white">
              {isAuthenticated && user ? `Hi, ${user.fullName.split(" ")[0]}` : "Hi, Guest"}
            </span>
            <span className="text-[10px] text-slate-400">My Account</span>
          </div>

          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {accountMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-2 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl space-y-1"
          >
            {isAuthenticated ? (
              <>
                <Link
                  href={`/${currentLocale}/account`}
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-blue-950/60 hover:text-blue-400 transition"
                >
                  <User className="h-4 w-4" />
                  <span>My Reservations & Profile</span>
                </Link>
                <Link
                  href={`/${currentLocale}/admin`}
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-950/60 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <div className="my-1 h-px bg-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${currentLocale}/sign-in`}
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-950/60 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href={`/${currentLocale}/sign-up`}
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Link>
                <div className="my-1 h-px bg-slate-800" />
                <Link
                  href={`/${currentLocale}/admin/login`}
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>Admin Portal</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
