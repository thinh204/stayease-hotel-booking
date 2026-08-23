"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useAdminAuth } from "@/lib/admin-auth-context";

interface AdminHeaderProps {
  onOpenMobile: () => void;
}

export default function AdminHeader({ onOpenMobile }: AdminHeaderProps) {
  const t = useTranslations("Admin.header");
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAdminAuth();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/admin";

  const getLocaleHref = (locale: string) =>
    `/${locale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const notifications = [
    {
      id: "1",
      title: "New VIP Booking (Grand Bay Resort)",
      desc: "$3,250 · Oceanfront Presidential Suite",
      time: "10 mins ago",
      type: "booking",
    },
    {
      id: "2",
      title: "System Audit Alert",
      desc: "Platform settings updated by Alexander Wright",
      time: "1 hour ago",
      type: "audit",
    },
    {
      id: "3",
      title: "High Occupancy Forecast",
      desc: "Le Palais Royal Vendôme reached 92% occupancy",
      time: "3 hours ago",
      type: "alert",
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 md:px-8 backdrop-blur-md transition-colors">
      {/* Left side: Hamburger & Global Search */}
      <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-10 w-10 md:hidden items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 pl-10 pr-12 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Language, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3.5">
        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 transition shadow-sm"
          >
            <Globe size={15} className="text-blue-500" />
            <span className="uppercase">{currentLocale}</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                langMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              {[
                { locale: "en", label: "English", flag: "🇺🇸" },
                { locale: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
                { locale: "ko", label: "한국어", flag: "🇰🇷" },
              ].map((lang) => (
                <Link
                  key={lang.locale}
                  href={getLocaleHref(lang.locale)}
                  onClick={() => setLangMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    currentLocale === lang.locale
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          title={resolvedTheme === "dark" ? t("lightMode") : t("darkMode")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-yellow-400 hover:border-amber-400 dark:hover:border-yellow-500/40 transition shadow-sm"
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-indigo-600" />
          )}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-blue-500 hover:border-blue-500/40 transition shadow-sm"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("notifications")}
                  </h4>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    3 new
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifMenuOpen(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                      {item.type === "booking" ? (
                        <Sparkles size={16} />
                      ) : item.type === "audit" ? (
                        <Shield size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        {user && (
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-1.5 pr-3 hover:border-blue-500/50 transition shadow-sm"
            >
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    user.fullName
                  )}`
                }
                alt={user.fullName}
                className="h-8 w-8 rounded-xl object-cover ring-2 ring-blue-500/30"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {user.role === "ADMIN" ? t("roleAdmin") : t("roleManager")}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {user.role}
                  </span>
                </div>

                <Link
                  href={`/${currentLocale}`}
                  target="_blank"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ExternalLink size={15} className="text-slate-400" />
                  <span>View Customer Website</span>
                </Link>

                {isAdmin && (
                  <Link
                    href={`/${currentLocale}/admin/settings`}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Shield size={15} className="text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition mt-1 border-t border-slate-100 dark:border-slate-800/80"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
