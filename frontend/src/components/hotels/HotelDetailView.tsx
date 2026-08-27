"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BedDouble,
  Users,
  Utensils,
  Waves,
  Wifi,
  Car,
  Tv,
  Coffee,
  Heart,
  Share2,
  Calendar,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";
import BookingModal from "@/components/hotels/BookingModal";
import { useCustomerAuth } from "@/lib/customer-auth-context";

interface HotelDetailViewProps {
  slug: string;
}

export default function HotelDetailView({ slug }: HotelDetailViewProps) {
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const { isAuthenticated } = useCustomerAuth();

  const [hotel, setHotel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | undefined>(undefined);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadHotel = async () => {
    const res = await customerApi.getHotelBySlug(slug);
    if (res.success && res.data) setHotel(res.data);
  };

  useEffect(() => {
    customerApi
      .getHotelBySlug(slug)
      .then((res) => { if (res.success && res.data) setHotel(res.data); })
      .catch((e) => console.error("Error loading hotel details", e))
      .finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setReviewStatus({ type: "error", text: "Vui lòng đăng nhập để gửi đánh giá." });
      return;
    }
    setSubmittingReview(true);
    setReviewStatus(null);
    try {
      const response = await customerApi.createReview(hotel.id, { rating: reviewRating, comment: reviewComment });
      setReviewStatus({ type: "success", text: response.message });
      setReviewComment("");
      await loadHotel();
    } catch (error: any) {
      setReviewStatus({ type: "error", text: error.message || "Không thể gửi đánh giá." });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Preparing luxury showcase...</span>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Hotel Property Not Found</h2>
        <Link
          href={`/${currentLocale}/hotels`}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold"
        >
          <ChevronLeft size={16} />
          <span>Back to All Properties</span>
        </Link>
      </div>
    );
  }

  const images = hotel.images && hotel.images.length > 0
    ? hotel.images
    : [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
      ];

  const amenities = hotel.amenities || [
    "Private Infinity Pool",
    "Michelin-Starred Dining",
    "Helicopter Transfer Pad",
    "24/7 Personal Butler",
    "Hydrotherapy Spa Pavilion",
    "High-Speed Fiber Wi-Fi",
  ];

  const rooms = hotel.rooms || [];
  const reviews = hotel.reviews || [];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 text-slate-900 dark:text-white">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <Link
            href={`/${currentLocale}/hotels`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
          >
            <ChevronLeft size={15} />
            <span>Hotels Collection</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-red-500 font-semibold"
            >
              <Heart size={14} className={favorite ? "fill-red-500 text-red-500" : ""} />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) navigator.share({ title: hotel.name, url: window.location.href });
              }}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-500 font-semibold"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                Five-Star Luxury
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                <Star size={14} className="fill-amber-400" />
                <span>{hotel.rating.toFixed(2)}</span>
                <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading">
              {hotel.name}
            </h1>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <MapPin size={15} className="text-blue-500 flex-shrink-0" />
              <span>{hotel.address || `${hotel.city}, ${hotel.country}`}</span>
            </div>
          </div>

          <div className="text-left sm:text-right p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 block font-semibold">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
                ${hotel.pricePerNight}
              </span>
              <span className="text-xs text-slate-500">/ night</span>
            </div>
          </div>
        </div>

        {/* High-Res Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden max-h-[500px]">
          <div className="md:col-span-2 relative h-72 md:h-[500px] overflow-hidden group">
            <img
              src={images[0]}
              alt={hotel.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="hidden md:grid grid-cols-1 gap-3 h-[500px]">
            <div className="h-[244px] overflow-hidden group rounded-2xl">
              <img
                src={images[1] || images[0]}
                alt=""
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="h-[244px] overflow-hidden group rounded-2xl">
              <img
                src={images[2] || images[0]}
                alt=""
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
          <div className="hidden md:grid grid-cols-1 gap-3 h-[500px]">
            <div className="h-[244px] overflow-hidden group rounded-2xl">
              <img
                src={images[3] || images[0]}
                alt=""
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="h-[244px] overflow-hidden group rounded-2xl relative bg-slate-900 flex items-center justify-center">
              <img
                src={images[0]}
                alt=""
                className="h-full w-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute text-white font-bold text-sm tracking-wide">
                + View Gallery
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Content & Reservation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Columns: Overview, Amenities, Suites, Reviews */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-heading">
                About the Sanctuary
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Signature Amenities */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold font-heading">
                Exclusive Amenities & Privileges
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {amenities.map((am: string, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center gap-3"
                  >
                    <Sparkles size={18} className="text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suites & Villas List */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold font-heading">
                  Available Suites & Private Villas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  All accommodations include breakfast, private butler, and evening champagne turn-down.
                </p>
              </div>

              <div className="space-y-4">
                {rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-blue-500/50 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {room.type}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Instant Confirmation
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} /> Max {room.capacity} Guests
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble size={14} /> King Bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Waves size={14} /> Ocean/Garden View
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
                          ${room.price}
                        </span>
                        <span className="text-[11px] text-slate-400 block">/ night</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSuiteId(room.id);
                          setBookingOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
                      >
                        Reserve Suite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Reviews */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold font-heading">
                Guest Reviews ({reviews.length})
              </h2>

              <form onSubmit={submitReview} className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Chia sẻ trải nghiệm của bạn</h3>
                    <p className="mt-1 text-xs text-slate-500">Chỉ khách có đơn đã xác nhận mới có thể đăng đánh giá.</p>
                  </div>
                  <div className="flex gap-1" aria-label={`${reviewRating} trên 5 sao`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} sao`}>
                        <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Dịch vụ, phòng nghỉ và trải nghiệm của bạn như thế nào?"
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  rows={4}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{reviewComment.length}/1000 ký tự</span>
                  <button disabled={submittingReview || reviewComment.trim().length < 10} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {submittingReview ? "Đang gửi..." : "Đăng đánh giá"}
                  </button>
                </div>
                {reviewStatus && (
                  <p role="status" className={`mt-3 text-xs font-semibold ${reviewStatus.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                    {reviewStatus.text}
                  </p>
                )}
              </form>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet for this hotel.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              rev.user?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                rev.user?.fullName || "Guest"
                              )}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className="font-bold text-xs">{rev.user?.fullName || "Verified Traveler"}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, idx) => (
                            <Star key={idx} size={13} className="fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl sticky top-24 space-y-6">
              <div className="flex items-baseline justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Rates from</span>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
                    ${hotel.pricePerNight} <span className="text-xs font-normal text-slate-500">/ night</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star size={13} className="fill-amber-400" />
                  <span>{hotel.rating.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={15} />
                    <span>Free cancellation up to 48 hours prior</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Sparkles size={15} className="text-blue-500" />
                    <span>VIP Welcome Champagne included</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Book This Sanctuary</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Instant confirmation · No booking fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingOpen && (
        <BookingModal
          hotel={hotel}
          preselectedRoomId={selectedSuiteId}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
