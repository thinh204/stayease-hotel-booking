"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

const destinations = [
  { city: "Da Nang", count: 128, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&auto=format&fit=crop&q=85" },
  { city: "Hanoi", count: 96, image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=700&auto=format&fit=crop&q=85" },
  { city: "Ho Chi Minh City", count: 154, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&auto=format&fit=crop&q=85" },
  { city: "Phu Quoc", count: 87, image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=700&auto=format&fit=crop&q=85" },
  { city: "Hoi An", count: 68, image: "https://images.unsplash.com/photo-1540872927746-3afded7f70c5?w=700&auto=format&fit=crop&q=85" },
  { city: "Nha Trang", count: 73, image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=700&auto=format&fit=crop&q=85" },
];

export default function CuratedDestinations() {
  const pathname = usePathname();
  const locale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  return (
    <section className="bg-white py-9 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0b1f44] dark:text-white">Popular Destinations in Vietnam</h2>
          <Link href={`/${locale}/destinations`} className="hidden items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 sm:flex">View all destinations <ArrowRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {destinations.map((destination) => (
            <Link key={destination.city} href={`/${locale}/hotels?city=${encodeURIComponent(destination.city)}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
              <div className="relative h-32 overflow-hidden sm:h-36">
                <Image src={destination.image} alt={destination.city} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="px-3 py-2.5"><h3 className="font-bold text-slate-900 dark:text-white">{destination.city}</h3><p className="text-xs text-slate-500">{destination.count} hotels</p></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
