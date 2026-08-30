"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Globe2, Play } from "lucide-react";
import NavbarLogo from "./NavbarLogo";

export default function Footer() {
  const pathname = usePathname();
  const locale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  if (pathname.includes("/admin")) return null;

  const columns = [
    { title: "Company", links: [["About Us", `/${locale}/support`], ["Careers", `/${locale}/support`], ["Press", `/${locale}/support`], ["Contact", `/${locale}/support`]] },
    { title: "Help", links: [["Help Center", `/${locale}/support`], ["FAQs", `/${locale}/support`], ["Booking Guide", `/${locale}/support`], ["Contact Support", `/${locale}/support`]] },
    { title: "Legal", links: [["Terms & Conditions", `/${locale}/support`], ["Privacy Policy", `/${locale}/support`], ["Cookie Policy", `/${locale}/support`], ["Security", `/${locale}/support`]] },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-5 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="col-span-2 space-y-3 md:col-span-1"><NavbarLogo /><p className="max-w-xs leading-relaxed">Your trusted partner for hotel bookings in Vietnam and beyond. Book with ease, stay with peace.</p></div>
        {columns.map((column) => <div key={column.title}><h3 className="mb-2 font-bold text-slate-900 dark:text-white">{column.title}</h3><ul className="space-y-1.5">{column.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-blue-600">{label}</Link></li>)}</ul></div>)}
        <div><h3 className="mb-2 font-bold text-slate-900 dark:text-white">Follow Us</h3><ul className="space-y-2"><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Globe2 size={15} /> Facebook</a></li><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Camera size={15} /> Instagram</a></li><li><a href="#" className="flex items-center gap-2 hover:text-blue-600"><Play size={15} /> YouTube</a></li></ul></div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-3 text-[11px] sm:flex-row sm:px-6 lg:px-8"><p>© 2026 StayEase. All rights reserved.</p><p>Vietnam Hotel Booking Made Simple</p></div></div>
    </footer>
  );
}
