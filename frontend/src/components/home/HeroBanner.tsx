"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  BadgeCheck,
  Headphones,
  ShieldCheck,
} from "lucide-react";

export default function HeroBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Home");
  const currentLocale = (pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en") as
    | "en"
    | "vi"
    | "ko";

  const [destination, setDestination] = useState("ALL");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 Adults · 0 Children");
  const [dateError, setDateError] = useState("");

  const copy = {
    en: {
      destination: "Destination",
      destinationPlaceholder: "Where are you going?",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guests: "Guests",
      search: "Search hotels",
      dateError: "Check-out must be after check-in.",
      benefits: ["Best-price promise", "Secure booking", "24/7 support"],
    },
    vi: {
      destination: "Điểm đến",
      destinationPlaceholder: "Bạn muốn đi đâu?",
      checkIn: "Nhận phòng",
      checkOut: "Trả phòng",
      guests: "Số khách",
      search: "Tìm khách sạn",
      dateError: "Ngày trả phòng phải sau ngày nhận phòng.",
      benefits: ["Cam kết giá tốt", "Đặt phòng an toàn", "Hỗ trợ 24/7"],
    },
    ko: {
      destination: "여행지",
      destinationPlaceholder: "어디로 떠나시나요?",
      checkIn: "체크인",
      checkOut: "체크아웃",
      guests: "투숙객",
      search: "호텔 검색",
      dateError: "체크아웃은 체크인 이후여야 합니다.",
      benefits: ["최저가 보장", "안전한 예약", "24시간 고객 지원"],
    },
  }[currentLocale];

  const today = new Date().toISOString().split("T")[0];

  const destinations = [
    { value: "ALL", label: copy.destinationPlaceholder },
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
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError(copy.dateError);
      return;
    }
    setDateError("");
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
        <Image
          src="/images/hero-bg.jpg"
          alt="Khu nghỉ dưỡng ven biển của StayEase"
          fill
          priority
          sizes="100vw"
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
            {t("title")}
          </h1>
          <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal space-y-1 transition-colors">
            <p>{t("description")}</p>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-lg shadow-slate-100 dark:shadow-black/50 max-w-5xl transition-colors">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 items-center">
            {/* 1. Destination (col-span-3) */}
            <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>{copy.destination}</span>
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
                <span>{copy.checkIn}</span>
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut("");
                  setDateError("");
                }}
                placeholder="Select date"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* 3. Check-out (col-span-2) */}
            <div className="lg:col-span-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>{copy.checkOut}</span>
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setDateError("");
                }}
                placeholder="Select date"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* 4. Guests (col-span-3) */}
            <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Users className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>{copy.guests}</span>
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
                <span>{copy.search}</span>
              </button>
            </div>
          </form>
          {dateError && (
            <p role="alert" className="px-3 pt-2 text-xs font-medium text-red-600 dark:text-red-400">
              {dateError}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {[BadgeCheck, ShieldCheck, Headphones].map((Icon, index) => (
            <div key={copy.benefits[index]} className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{copy.benefits[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
