"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
} from "lucide-react";

export default function HeroBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const [destination, setDestination] = useState("ALL");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 Adults · 0 Children");

  const destinations = [
    { value: "ALL", label: "Where are you going?" },
    { value: "Da Nang", label: "Da Nang, Vietnam" },
    { value: "Ho Chi Minh City", label: "Ho Chi Minh City, Vietnam" },
    { value: "Phu Quoc", label: "Phu Quoc, Vietnam" },
    { value: "Hanoi", label: "Hanoi, Vietnam" },
    { value: "Seoul", label: "Seoul, South Korea" },
    { value: "Kyoto", label: "Kyoto, Japan" },
    { value: "Paris", label: "Paris, France" },
    { value: "Bangkok", label: "Bangkok, Thailand" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (destination !== "ALL") query.set("city", destination);
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests.split(" ")[0]);

    router.push(`/${currentLocale}/hotels?${query.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-10 pb-12 lg:pt-14 lg:pb-16 select-none transition-colors">
      {/* Background Watercolor Coastal Image blending seamlessly in Light and Dark Mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt="Coastal background"
          className="h-full w-full object-cover object-right opacity-50 dark:opacity-20 transition-opacity"
        />
        {/* Soft fading gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent transition-colors" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent transition-colors" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white dark:from-slate-950 to-transparent transition-colors" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Left Heading & Subtitle */}
        <div className="max-w-2xl space-y-3 mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f2744] dark:text-white font-serif leading-tight transition-colors">
            Find your perfect stay
          </h1>
          <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal space-y-1 transition-colors">
            <p>Discover amazing hotels at exclusive prices.</p>
            <p>Easy booking, great experiences.</p>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-lg shadow-slate-100 dark:shadow-black/50 max-w-5xl transition-colors">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 items-center">
            {/* 1. Destination (col-span-3) */}
            <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Destination</span>
              </label>
              <div className="relative">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full appearance-none bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-5"
                >
                  {destinations.map((d) => (
                    <option key={d.value} value={d.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 2. Check-in (col-span-2) */}
            <div className="lg:col-span-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Check-in</span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="Select date"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* 3. Check-out (col-span-2) */}
            <div className="lg:col-span-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Check-out</span>
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="Select date"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* 4. Guests (col-span-3) */}
            <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Guests</span>
              </label>
              <div className="relative">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full appearance-none bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-5"
                >
                  <option value="1 Adult · 0 Children" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">1 Adult · 0 Children</option>
                  <option value="2 Adults · 0 Children" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2 Adults · 0 Children</option>
                  <option value="2 Adults · 1 Child" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2 Adults · 1 Child</option>
                  <option value="2 Adults · 2 Children" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2 Adults · 2 Children</option>
                  <option value="3+ Adults · Family" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">3+ Adults · Family</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 5. Search Button (col-span-2) */}
            <div className="lg:col-span-2 p-1">
              <button
                type="submit"
                className="w-full h-11 px-5 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
