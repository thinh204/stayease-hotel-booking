"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  DollarSign,
  Grid,
  List,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";
import HotelCard from "@/components/hotels/HotelCard";
import BookingModal from "@/components/hotels/BookingModal";

export default function HotelsExplorer() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "ALL";

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [bookingHotel, setBookingHotel] = useState<any | null>(null);

  const cities = ["ALL", "Da Nang", "Hanoi", "Seoul", "Kyoto", "Paris", "Bangkok"];

  useEffect(() => {
    fetchHotels();
  }, [search, selectedCity, maxPrice, minRating, sort]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getHotels({
        search,
        city: selectedCity,
        maxPrice,
        rating: minRating,
        sort,
      });

      if (res.success) {
        setHotels(res.data);
      }
    } catch (e) {
      console.error("Failed to load hotels", e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCity("ALL");
    setMaxPrice(1500);
    setMinRating(0);
    setSort("popular");
  };

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/40 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles size={14} />
              <span>Worldwide Portfolio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
              Luxury Hotels & Sanctuaries
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing {hotels.length} verified five-star properties
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Layout Grid (Filters + Hotel List) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter size={16} className="text-blue-500" />
                  <span>Filter Stays</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Keyword Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Search by Keyword
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Hotel name, country..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Destination Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Destination
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedCity === city
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {city === "ALL" ? "All Cities" : city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Max Nightly Rate</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$200</span>
                  <span>$2,000+</span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Minimum Rating
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 4.8, 4.9].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMinRating(rate)}
                      className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                        minRating === rate
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <Star size={12} className={rate > 0 ? "fill-amber-400 text-amber-400" : ""} />
                      <span>{rate === 0 ? "Any" : `${rate}+`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sort Order
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newly Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hotels Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="py-24 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  No luxury properties found matching your criteria.
                </p>
                <p className="text-xs text-slate-500">
                  Try adjusting your price range or clearing destination filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onBookNow={(h) => setBookingHotel(h)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Filter Stays</h3>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold">Destination</label>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      selectedCity === city ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {city === "ALL" ? "All Cities" : city}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold">Max Nightly Rate</span>
                <span className="font-bold text-blue-600 font-mono">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={200}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-lg"
            >
              Show {hotels.length} Properties
            </button>
          </div>
        </div>
      )}

      {/* Booking Checkout Dialog */}
      {bookingHotel && (
        <BookingModal
          hotel={bookingHotel}
          onClose={() => setBookingHotel(null)}
        />
      )}
    </div>
  );
}
