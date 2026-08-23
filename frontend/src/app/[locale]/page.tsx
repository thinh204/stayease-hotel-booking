import React from "react";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedHotels from "@/components/home/FeaturedHotels";
import CuratedDestinations from "@/components/home/CuratedDestinations";
import VipPerks from "@/components/home/VipPerks";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* 1. Hero & Instant Search */}
      <HeroBanner />

      {/* 2. Featured 5-Star Luxury Hotels */}
      <FeaturedHotels />

      {/* 3. Curated Global Travel Destinations */}
      <CuratedDestinations />

      {/* 4. StayEase VIP Perks & Concierge Services */}
      <VipPerks />

      {/* 5. World Traveler Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
