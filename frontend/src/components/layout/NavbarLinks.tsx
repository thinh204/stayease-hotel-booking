"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export const navLinks = [
  { key: "hotels", href: "/" },
  { key: "deals", href: "/deals" },
  { key: "destinations", href: "/destinations" },
  { key: "support", href: "/support" },
];

export default function NavbarLinks() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/";

  const getLocaleHref = (href: string) =>
    `/${currentLocale}${href === "/" ? "" : href}`;

  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {navLinks.map((link) => {
        const isActive =
          pathnameWithoutLocale === link.href ||
          (link.href !== "/" && pathnameWithoutLocale.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={getLocaleHref(link.href)}
            className={`relative py-2 text-sm transition-colors ${
              isActive
                ? "font-semibold text-blue-600"
                : "font-medium text-slate-600 hover:text-blue-600"
            }`}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
