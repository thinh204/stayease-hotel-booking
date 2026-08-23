"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Hotels", href: "/hotels" },
  { label: "Deals", href: "/deals" },
  { label: "Destinations", href: "/destinations" },
  { label: "Support", href: "/support" },
];

export default function NavbarLinks() {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi|ko)(?=\/|$)/, "") || "/";

  const getLocaleHref = (href: string) =>
    `/${currentLocale}${href === "/" ? "" : href}`;

  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {navLinks.map((link) => {
        const isActive =
          link.href === "/"
            ? pathnameWithoutLocale === "/"
            : pathnameWithoutLocale.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={getLocaleHref(link.href)}
            className={`relative py-2 text-sm font-medium transition-colors ${
              isActive
                ? "font-semibold text-blue-400"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <span>{link.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
