"use client";

import React from "react";
import { Star, Quote, Sparkles } from "lucide-react";

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "Victoria Sterling",
      role: "Luxury Travel Journalist, London",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      hotel: "Grand Bay Da Nang Ocean Villa",
      quote: "StayEase delivered an unforgettable escape. From the private helicopter arrival to the cliffside private pool, every detail was immaculate.",
      rating: 5,
    },
    {
      name: "Marcus Vance",
      role: "Private Equity Executive, Singapore",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      hotel: "Gangnam Sky Tower Seoul Penthouse",
      quote: "The seamless instant booking and personalized concierge service saved me immense time. Truly the gold standard of luxury hotel platforms.",
      rating: 5,
    },
    {
      name: "Camille Laurent",
      role: "Architectural Designer, Geneva",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      hotel: "Kyoto Zen Garden Ryokan",
      quote: "The serene Japanese onsen pavilion and tranquil gardens provided the ultimate peaceful sanctuary. I cannot wait to return.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Sparkles size={15} />
            <span>Guest Impressions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Endorsed by World Travelers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="h-10 w-10 text-blue-500/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{r.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="h-11 w-11 rounded-full object-cover shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{r.name}</h4>
                  <p className="text-[11px] text-slate-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
