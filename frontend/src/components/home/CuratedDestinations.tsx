"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, ArrowRight, Compass } from "lucide-react";

export default function CuratedDestinations() {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const destinations = [
    {
      city: "Da Nang",
      country: "Vietnam",
      tag: "Coastal Luxury",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "12 Exclusive Resorts",
    },
    {
      city: "Hanoi",
      country: "Vietnam",
      tag: "Heritage & Culture",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "8 French Colonial Mansions",
    },
    {
      city: "Seoul",
      country: "South Korea",
      tag: "Futuristic Skyline",
      image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "15 High-Rise Penthouses",
    },
    {
      city: "Kyoto",
      country: "Japan",
      tag: "Zen Gardens & Onsen",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "6 Ryokan Sanctuaries",
    },
    {
      city: "Paris",
      country: "France",
      tag: "Haute Couture & Romance",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "10 Royal Palaces",
    },
    {
      city: "Bangkok",
      country: "Thailand",
      tag: "Riverfront Royalty",
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80",
      hotelsCount: "9 Riverside Sanctuaries",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Compass size={15} />
            <span>World-Class Destinations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Iconic Global Sanctuaries
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            From tropical beaches in Da Nang to private ryokans in Kyoto and palace penthouses overlooking the Seine in Paris.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d, i) => (
            <Link
              key={i}
              href={`/${currentLocale}/hotels?city=${encodeURIComponent(d.city)}`}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={d.image}
                alt={d.city}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                  {d.tag}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-heading">
                    {d.city}
                  </h3>
                  <span className="text-xs text-slate-300 font-medium">
                    {d.country} · {d.hotelsCount}
                  </span>
                </div>

                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
