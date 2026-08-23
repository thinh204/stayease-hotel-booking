"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  // Hide footer on admin routes
  if (pathname.includes("/admin")) return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-heading">
                STAY<span className="text-blue-600">EASE</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed max-w-sm">
              StayEase is the world's premier digital luxury hospitality platform, connecting discerning travelers with handcrafted five-star sanctuaries, heritage mansions, and private island villas.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-blue-500" />
              <span>Certified Member of Global Luxury Hospitality Guild</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white text-xs">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/hotels`} className="hover:text-blue-600 transition">
                  Luxury Hotels & Villas
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/destinations`} className="hover:text-blue-600 transition">
                  Global Destinations
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/deals`} className="hover:text-blue-600 transition">
                  VIP Seasonal Offers
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/admin`} className="hover:text-blue-600 text-blue-600 dark:text-blue-400 font-bold transition">
                  Executive Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white text-xs">
              Sanctuaries
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/hotels?city=Da%20Nang`} className="hover:text-blue-600 transition">
                  Da Nang, Vietnam
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/hotels?city=Hanoi`} className="hover:text-blue-600 transition">
                  Hanoi, Vietnam
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/hotels?city=Seoul`} className="hover:text-blue-600 transition">
                  Seoul, South Korea
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/hotels?city=Kyoto`} className="hover:text-blue-600 transition">
                  Kyoto, Japan
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/hotels?city=Paris`} className="hover:text-blue-600 transition">
                  Paris, France
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Hotline */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white text-xs">
              24/7 Concierge
            </h4>
            <p className="text-[11px] leading-relaxed">
              Direct luxury reservation desk:
            </p>
            <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
              +1 (800) 782-9327
            </p>
            <p className="font-mono text-slate-500 text-[11px]">
              concierge@stayease.com
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 StayEase Luxury Hospitality Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>English · Tiếng Việt · 한국어</span>
            <span>256-Bit Encrypted Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
