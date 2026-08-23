"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Star } from "lucide-react";

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
}

export default function HotelCard({ hotel, onBookNow }: HotelCardProps) {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

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
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={images[0]}
          alt={hotel.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
              per night
            </span>
          </div>
        </div>

        {/* 3. Action Button */}
        <button
          type="button"
          onClick={() => (onBookNow ? onBookNow(hotel) : null)}
          className="w-full py-2.5 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
