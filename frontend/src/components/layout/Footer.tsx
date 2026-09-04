"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Globe2, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import NavbarLogo from "./NavbarLogo";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Public");
  const locale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  if (pathname.includes("/admin")) return null;
  const columns = [
    { title: t("company"), links: [t("about"), t("careers"), t("press"), t("contact")] },
    { title: t("help"), links: [t("helpCenter"), t("faqs"), t("bookingGuide"), t("contactSupport")] },
    { title: t("legal"), links: [t("terms"), t("privacy"), t("cookies"), t("security")] },
  ];
  return <footer className="border-t border-slate-200 bg-white text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-5 sm:px-6 md:grid-cols-5 lg:px-8">
      <div className="col-span-2 space-y-3 md:col-span-1"><NavbarLogo /><p className="max-w-xs leading-relaxed">{t("footerTagline")}</p></div>
      {columns.map((column) => <div key={column.title}><h3 className="mb-2 font-bold text-slate-900 dark:text-white">{column.title}</h3><ul className="space-y-1.5">{column.links.map((label) => <li key={label}><Link href={`/${locale}/support`} className="hover:text-blue-600">{label}</Link></li>)}</ul></div>)}
      <div><h3 className="mb-2 font-bold text-slate-900 dark:text-white">{t("follow")}</h3><ul className="space-y-2"><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Globe2 size={15} /> Facebook</a></li><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Camera size={15} /> Instagram</a></li><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Play size={15} /> YouTube</a></li></ul></div>
    </div>
    <div className="border-t border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-3 text-[11px] sm:flex-row sm:px-6 lg:px-8"><p>© 2026 StayEase. {t("rights")}</p><p>{t("slogan")}</p></div></div>
  </footer>;
}
