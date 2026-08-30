"use client";

import { BadgeCheck, CalendarDays, Headphones, ShieldCheck } from "lucide-react";

const perks = [
  { icon: BadgeCheck, title: "Best Price Guarantee", desc: "We match and beat competitor prices so you always get the best deal." },
  { icon: CalendarDays, title: "Free Cancellation", desc: "Flexible plans on thousands of hotels. Change or cancel with ease." },
  { icon: Headphones, title: "24/7 Support", desc: "Our travel experts are always here to help, anytime, anywhere." },
  { icon: ShieldCheck, title: "Verified Reviews", desc: "Real guest reviews from verified stays help you book with confidence." },
];

export default function VipPerks() {
  return (
    <section className="bg-white pb-4 pt-1 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[#0b1f44] dark:text-white">Why StayEase</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex min-h-24 items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60"><Icon size={25} strokeWidth={1.8} /></div>
              <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
