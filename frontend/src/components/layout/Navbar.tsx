"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import NavbarActions from "./NavbarActions";
import NavbarLinks from "./NavbarLinks";
import NavbarLogo from "./NavbarLogo";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 mx-auto max-w-7xl bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex h-20 items-center justify-between border-b border-slate-200">

        <NavbarLogo onClick={() => setMobileMenuOpen(false)} />
        <NavbarLinks />
        <NavbarActions />

        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? t("closeMenu")
              : t("openMenu")
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <MobileMenu onClose={() => setMobileMenuOpen(false)} />
      )}
    </header>
  );
}
