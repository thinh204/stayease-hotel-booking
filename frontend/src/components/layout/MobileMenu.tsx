import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Globe, UserRound } from "lucide-react";
import { navLinks } from "./NavbarLinks";

type MobileMenuProps = {
  onClose: () => void;
};

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/";

  const getLocaleHref = (locale: string) =>
    `/${locale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;

  const getNavigationHref = (href: string) =>
    `/${currentLocale}${href === "/" ? "" : href}`;

  return (
    <div className="border-t border-slate-200 bg-white lg:hidden">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex flex-col">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={getNavigationHref(link.href)}
              onClick={onClose}
              className={`rounded-lg px-4 py-3 text-sm transition ${
                index === 0
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : "font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="my-3 h-px bg-slate-200" />

        <div className="flex gap-2">
          {[
            { locale: "en", label: "English" },
            { locale: "vi", label: "Tiếng Việt" },
            { locale: "ko", label: "한국어" },
          ].map(
            (language) => (
              <Link
                key={language.locale}
                href={getLocaleHref(language.locale)}
                onClick={onClose}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm transition ${
                  currentLocale === language.locale
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "font-medium text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>{language.label}</span>
              </Link>
            )
          )}
        </div>

        <Link
          href={getNavigationHref("/account")}
          onClick={onClose}
          className="mt-2 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <UserRound className="h-4 w-4" />
          <span>{t("account")}</span>
        </Link>
      </div>
    </div>
  );
}
