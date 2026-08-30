"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Star } from "lucide-react";

export interface HotelCardProps {
  hotel: {
    id: string;
    slug?: string;
    name: string;
    city: string;
    country?: string;
    pricePerNight: number;
    formattedPrice?: string;
    rating: number;
    reviewsCount?: number;
    images?: string[];
  };
  onBookNow?: (hotel: any) => void;
  compact?: boolean;
}

export default function HotelCard({ hotel, onBookNow, compact = false }: HotelCardProps) {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const [isFavorite, setIsFavorite] = useState(false);

  const labels = {
    en: { perNight: "per night", book: "Book now", details: "View details", save: "Save hotel", saved: "Saved" },
    vi: { perNight: "/ đêm", book: "Đặt ngay", details: "Xem chi tiết", save: "Lưu khách sạn", saved: "Đã lưu" },
    ko: { perNight: "/ 1박", book: "지금 예약", details: "상세 보기", save: "호텔 저장", saved: "저장됨" },
  }[currentLocale as "en" | "vi" | "ko"];

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("stayease-favorites") || "[]") as string[];
    setIsFavorite(favorites.includes(hotel.id));
  }, [hotel.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("stayease-favorites") || "[]") as string[];
    const next = favorites.includes(hotel.id)
      ? favorites.filter((id) => id !== hotel.id)
      : [...favorites, hotel.id];
    localStorage.setItem("stayease-favorites", JSON.stringify(next));
    setIsFavorite(next.includes(hotel.id));
    window.dispatchEvent(new CustomEvent("stayease-favorites-updated", { detail: next }));
  };

  const images = hotel.images && hotel.images.length > 0
    ? hotel.images
    : ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80"];

  const fullStars = Math.floor(hotel.rating || 5);
  const reviewCount = hotel.reviewsCount || Math.floor(hotel.rating * 200 + 150);

  // Price formatting
  const priceDisplay = hotel.formattedPrice
    ? hotel.formattedPrice
    : `${(hotel.pricePerNight * 24000).toLocaleString("vi-VN")} VND`;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group select-none">
      {/* 1. Image Container */}
      <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${compact ? "h-40" : "h-48"}`}>
        <Image
          src={images[0]}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? labels.saved : labels.save}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:scale-105 dark:bg-slate-900/90 dark:text-white"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* 2. Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Hotel Name */}
          <Link href={`/${currentLocale}/hotels/${hotel.slug || hotel.id}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
              {hotel.name}
            </h3>
          </Link>

          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < fullStars
                      ? "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400"
                      : "text-slate-300 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="line-clamp-1">{hotel.city}, {hotel.country || "Vietnam"}</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
              {priceDisplay}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {labels.perNight}
            </span>
          </div>
        </div>

        {/* 3. Action Button */}
        <div className={compact ? "block" : "grid grid-cols-2 gap-2"}>
          <Link
            href={`/${currentLocale}/hotels/${hotel.slug || hotel.id}`}
            className={`${compact ? "hidden" : "flex"} items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200`}
          >
            {labels.details}
          </Link>
          <button
            type="button"
            onClick={() => (onBookNow ? onBookNow(hotel) : null)}
            className="rounded-xl bg-[#0066FF] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            {labels.book}
          </button>
        </div>
      </div>
    </div>
  );
}
