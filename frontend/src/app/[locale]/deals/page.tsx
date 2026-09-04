"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Tag, ArrowRight, ShieldCheck, Clock, Percent } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DealsPage() {
  const t = useTranslations("Public");
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const offers = [
    {
      title: t("offer1Title"),
      hotel: "Grand Bay Da Nang & Imperial Citadel Hanoi",
      discount: t("save", {percent: 25}),
      code: "SUMMER25",
      validUntil: "Sept 30, 2026",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
      description: t("offer1Description"),
    },
    {
      title: t("offer2Title"),
      hotel: "Le Palais Royal Vendôme Paris",
      discount: t("save", {percent: 30}),
      code: "HONEYMOON30",
      validUntil: "Oct 15, 2026",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      description: t("offer2Description"),
    },
    {
      title: t("offer3Title"),
      hotel: "Kyoto Zen Garden Ryokan",
      discount: t("save", {percent: 20}),
      code: "ZENAUTUMN",
      validUntil: "Nov 30, 2026",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
      description: t("offer3Description"),
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-16 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Percent size={15} />
            <span>{t("dealsEyebrow")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
            {t("dealsHeading")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            {t("dealsDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-lg">
                    {offer.discount}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                    {offer.hotel}
                  </span>
                  <h3 className="text-lg font-bold font-heading line-clamp-1">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">{t("promoCode")}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {offer.code}
                    </span>
                  </div>

                  <Link
                    href={`/${currentLocale}/hotels`}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center block transition shadow-md shadow-blue-500/20"
                  >
                    {t("claim")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
