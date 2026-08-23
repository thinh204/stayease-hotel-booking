"use client";

import React from "react";
import {
  UtensilsCrossed,
  Sparkles,
  Plane,
  ShieldCheck,
  Headphones,
  Crown,
} from "lucide-react";

export default function VipPerks() {
  const perks = [
    {
      icon: UtensilsCrossed,
      title: "Michelin-Starred Dining",
      desc: "Priority reservations and private chef table experiences at world-renowned gastronomy restaurants.",
    },
    {
      icon: Plane,
      title: "Chauffeured VIP Transfers",
      desc: "Complimentary luxury airport limousine or private helicopter transfers directly to your villa doorstep.",
    },
    {
      icon: Crown,
      title: "Personal Dedicated Butler",
      desc: "Unobtrusive, bespoke 24/7 concierge catering to every preference, from private yacht rentals to opera bookings.",
    },
    {
      icon: Sparkles,
      title: "Thermal Spas & Wellness",
      desc: "Unlimited access to hydrotherapy pools, onsen baths, and holistic rejuvenating treatment pavilions.",
    },
    {
      icon: ShieldCheck,
      title: "Guaranteed Best Rate & Upgrades",
      desc: "Automatic complimentary room upgrades upon arrival and best rate guarantee across all five-star properties.",
    },
    {
      icon: Headphones,
      title: "Global 24/7 Concierge",
      desc: "Round-the-clock direct hotline for seamless itinerary changes, cancellations, and personalized requests.",
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-white select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-400">
            <Crown size={15} className="text-amber-400" />
            <span>StayEase Privileges</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            The Art of Flawless Hospitality
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every booking through StayEase includes our signature collection of bespoke luxury amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 transition-all duration-300 space-y-4 group"
              >
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
