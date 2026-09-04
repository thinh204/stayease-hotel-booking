"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPin, ArrowRight, Building2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DestinationsPage() {
  const t = useTranslations("Public");
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const destinations = [
    {
      city: "Da Nang",
      country: "Vietnam",
      tag: t("tag1"),
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80",
      description: t("desc1"),
    },
    {
      city: "Hanoi",
      country: "Vietnam",
      tag: t("tag2"),
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
      description: t("desc2"),
    },
    {
      city: "Seoul",
      country: "South Korea",
      tag: t("tag3"),
      image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80",
      description: t("desc3"),
    },
    {
      city: "Kyoto",
      country: "Japan",
      tag: t("tag4"),
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
      description: t("desc4"),
    },
    {
      city: "Paris",
      country: "France",
      tag: t("tag5"),
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      description: t("desc5"),
    },
    {
      city: "Bangkok",
      country: "Thailand",
      tag: t("tag6"),
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80",
      description: t("desc6"),
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-16 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Compass size={15} />
            <span>{t("destinationsEyebrow")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
            {t("destinationsHeading")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            {t("destinationsDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((d, idx) => (
            <Link
              key={idx}
              href={`/${currentLocale}/hotels?city=${encodeURIComponent(d.city)}`}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={d.image}
                  alt={d.city}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                    {d.tag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-heading group-hover:text-blue-600 transition-colors">
                    {d.city}, {d.country}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>{t("explore")}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
