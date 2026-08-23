"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Globe, UserRound, ShieldCheck, Sun, Moon } from "lucide-react";
import { navLinks } from "./NavbarLinks";
import { useTheme } from "@/lib/theme-context";

type MobileMenuProps = {
  onClose: () => void;
};

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/";

  const getLocaleHref = (locale: string) =>
    `/${locale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;

  const getNavigationHref = (href: string) =>
    `/${currentLocale}${href === "/" ? "" : href}`;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 lg:hidden">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex flex-col">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={getNavigationHref(link.href)}
              onClick={onClose}
              className={`rounded-lg px-4 py-3 text-sm transition ${
                index === 0
                  ? "bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-600 dark:text-blue-400"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="my-3 h-px bg-slate-200 dark:bg-slate-800" />

        {/* Theme & Language row */}
        <div className="flex items-center gap-2">
          {/* Dark Mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>

          {/* Languages */}
          <div className="flex flex-1 gap-1">
            {[
              { locale: "en", label: "English" },
              { locale: "vi", label: "Tiếng Việt" },
              { locale: "ko", label: "한국어" },
            ].map((language) => (
              <Link
                key={language.locale}
                href={getLocaleHref(language.locale)}
                onClick={onClose}
                className={`flex flex-1 items-center justify-center rounded-xl px-2 py-2.5 text-xs transition ${
                  currentLocale === language.locale
                    ? "bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400"
                    : "font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>{language.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Link
            href={getNavigationHref("/admin")}
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{t("admin")}</span>
          </Link>

          <Link
            href={getNavigationHref("/account")}
            onClick={onClose}
            className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <UserRound className="h-4 w-4" />
            <span>{t("account")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
