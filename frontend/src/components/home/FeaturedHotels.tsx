"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BadgeCheck, CircleDollarSign, Headphones, ShieldCheck } from "lucide-react";
import HotelCard from "@/components/hotels/HotelCard";
import BookingModal from "@/components/hotels/BookingModal";

export default function FeaturedHotels() {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const [bookingHotel, setBookingHotel] = useState<any | null>(null);

  // Exact 4 hotels from the reference design
  const featuredHotels = [
    {
      id: "oceanview-resort-da-nang",
      slug: "oceanview-resort-da-nang",
      name: "The Oceanview Resort",
      city: "Da Nang",
      country: "Vietnam",
      rating: 5,
      reviewsCount: 1248,
      pricePerNight: 77,
      formattedPrice: "1,850,000 VND",
      images: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
      ],
      description: "Infinity pool overlooking the East Sea with luxury beachfront villas and private sunbeds.",
    },
    {
      id: "grand-city-hotel-hcm",
      slug: "grand-city-hotel-hcm",
      name: "Grand City Hotel",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      rating: 5,
      reviewsCount: 982,
      pricePerNight: 63,
      formattedPrice: "1,520,000 VND",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
      ],
      description: "Modern five-star landmark hotel in the vibrant heart of the city with rooftop infinity pool.",
    },
    {
      id: "sunset-paradise-resort-phu-quoc",
      slug: "sunset-paradise-resort-phu-quoc",
      name: "Sunset Paradise Resort",
      city: "Phu Quoc",
      country: "Vietnam",
      rating: 5,
      reviewsCount: 756,
      pricePerNight: 98,
      formattedPrice: "2,350,000 VND",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
      ],
      description: "Picturesque cliffside white luxury villas with direct turquoise sea views and sunset dining.",
    },
    {
      id: "hanoi-heritage-hotel",
      slug: "hanoi-heritage-hotel",
      name: "Hanoi Heritage Hotel",
      city: "Hanoi",
      country: "Vietnam",
      rating: 4,
      reviewsCount: 614,
      pricePerNight: 53,
      formattedPrice: "1,280,000 VND",
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
      ],
      description: "Serene lakeside colonial mansion surrounded by lush mountains and tranquil heritage suites.",
    },
  ];

  return (
    <section className="bg-[#f7f9fc] py-8 dark:bg-slate-950 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
              Featured Hotels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Handpicked properties with excellent reviews and great locations.
            </p>
          </div>

          <Link
            href={`/${currentLocale}/hotels`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View all hotels</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onBookNow={(h) => setBookingHotel(h)}
              compact
            />
          ))}
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingHotel && (
        <BookingModal
          hotel={bookingHotel}
          onClose={() => setBookingHotel(null)}
        />
      )}

      <div className="mt-8 border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-4 py-4 dark:divide-slate-800 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Trusted Booking", text: "Secure & reliable" },
            { icon: CircleDollarSign, title: "Best Price Guarantee", text: "We match & beat prices" },
            { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
            { icon: BadgeCheck, title: "Verified Reviews", text: "Real guests, real feedback" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-3 py-2 sm:px-6">
              <Icon className="h-8 w-8 flex-none text-blue-600" strokeWidth={1.7} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">{title}</p>
                <p className="text-[10px] text-slate-500 sm:text-xs">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
