"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, LogIn, UserPlus, UserRound } from "lucide-react";

export default function NavbarActions() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
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

  return (
    <div ref={actionsRef} className="relative hidden items-center gap-3 lg:flex">
      <div className="relative z-50">
        <button
          type="button"
          aria-label={t("selectLanguage")}
          aria-expanded={languageMenuOpen}
          onClick={() => {
            setLanguageMenuOpen((open) => !open);
            setAccountMenuOpen(false);
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
        >
          <Globe className="h-4 w-4 text-slate-500" />
          <span>{currentLocale.toUpperCase()}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        {languageMenuOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {[
              { locale: "en", label: "English" },
              { locale: "vi", label: "Tiếng Việt" },
              { locale: "ko", label: "한국어" },
            ].map((language) => (
              <Link
                key={language.locale}
                href={getLocaleHref(language.locale)}
                onClick={() => setLanguageMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm transition hover:bg-blue-50 hover:text-blue-600 ${
                  currentLocale === language.locale
                    ? "font-semibold text-blue-600"
                    : "text-slate-700"
                }`}
              >
                {language.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-slate-200" />

      <div className="relative z-50">
        <button
          type="button"
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          onClick={() => {
            setAccountMenuOpen((open) => !open);
            setLanguageMenuOpen(false);
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-600 hover:shadow"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserRound className="h-3.5 w-3.5" />
          </span>
          <span>{t("account")}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              accountMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {accountMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            <Link
              href={`/${currentLocale}/sign-in`}
              role="menuitem"
              onClick={() => setAccountMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <LogIn className="h-4 w-4" />
              <span>{t("signIn")}</span>
            </Link>
            <Link
              href={`/${currentLocale}/sign-up`}
              role="menuitem"
              onClick={() => setAccountMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t("signUp")}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
