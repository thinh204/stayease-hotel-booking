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
  ShieldCheck,
  Building2,
  Waves,
  Baby,
  Sparkles,
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

  const quickFilters = [
    { label: currentLocale === "vi" ? "Ven biển" : "Beachfront", icon: Waves, city: "Da Nang" },
    { label: currentLocale === "vi" ? "Nghỉ dưỡng phố" : "City Break", icon: Building2, city: "Ho Chi Minh City" },
    { label: currentLocale === "vi" ? "Kỳ nghỉ sang trọng" : "Luxury Stay", icon: Sparkles, city: "ALL" },
    { label: currentLocale === "vi" ? "Phù hợp gia đình" : "Family Friendly", icon: Baby, city: "Phu Quoc" },
    { label: currentLocale === "vi" ? "Hồ bơi & Spa" : "Pool & Spa", icon: BadgeCheck, city: "ALL" },
    { label: currentLocale === "vi" ? "Hủy miễn phí" : "Free Cancellation", icon: ShieldCheck, city: "ALL" },
  ];

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
    <section className="relative min-h-[430px] overflow-hidden bg-sky-100 py-10 sm:py-12 lg:py-14 select-none">
      {/* Background Watercolor Coastal Image blending seamlessly in Light and Dark Mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/hero-bg.jpg"
          alt="Khu nghỉ dưỡng ven biển của StayEase"
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />
        {/* Soft fading gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-slate-950/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Left Heading & Subtitle */}
        <div className="mx-auto mb-8 max-w-3xl space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tight text-[#081d42] drop-shadow-sm sm:text-5xl lg:text-[52px] lg:leading-tight">
            {t("title")}
          </h1>
          <div className="text-base font-medium text-slate-700 sm:text-lg">
            <p>{t("description")}</p>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-slate-900/20 backdrop-blur-xl sm:p-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 items-center gap-1 sm:grid-cols-2 lg:grid-cols-12">
            {/* 1. Destination (col-span-3) */}
            <div className="px-3 py-2 lg:col-span-3 lg:border-r lg:border-slate-200">
              <label className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="h-5 w-5 text-blue-600" />
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
            <div className="px-3 py-2 lg:col-span-2 lg:border-r lg:border-slate-200">
              <label className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-800">
                <Calendar className="h-5 w-5 text-blue-600" />
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
            <div className="px-3 py-2 lg:col-span-2 lg:border-r lg:border-slate-200">
              <label className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-800">
                <Calendar className="h-5 w-5 text-blue-600" />
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
            <div className="px-3 py-2 lg:col-span-3 lg:border-r lg:border-slate-200">
              <label className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-800">
                <Users className="h-5 w-5 text-blue-600" />
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0876ed] px-5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
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

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {quickFilters.map(({ label, icon: Icon, city }) => (
            <button key={label} type="button" onClick={() => setDestination(city)} className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600">
              <Icon className="h-4 w-4 text-blue-600" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
