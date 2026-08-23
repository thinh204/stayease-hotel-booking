"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  BedDouble,
  User,
  Users,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";
import { useCustomerAuth } from "@/lib/customer-auth-context";

interface BookingModalProps {
  hotel: any;
  preselectedRoomId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({
  hotel,
  preselectedRoomId,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const { isAuthenticated, user } = useCustomerAuth();

  const rooms = hotel.rooms || [];
  const [selectedRoomId, setSelectedRoomId] = useState(
    preselectedRoomId || (rooms.length > 0 ? rooms[0].id : "")
  );

  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 7);
  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 10);

  const [checkIn, setCheckIn] = useState(defaultCheckIn.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().split("T")[0]);
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Price calculations
  const selectedRoom = rooms.find((r: any) => r.id === selectedRoomId);
  const pricePerNight = selectedRoom ? selectedRoom.price : hotel.pricePerNight;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(1, checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/${currentLocale}/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.createBooking({
        hotelId: hotel.id,
        roomId: selectedRoomId || undefined,
        checkIn,
        checkOut,
        guests,
        specialRequests,
      });

      if (res.success && res.data) {
        setBookingSuccess(res.data);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm reservation. Please check your dates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Reserve Your Stay at {hotel.name}
              </h2>
              <span className="text-xs text-slate-500">{hotel.city}, {hotel.country}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Confirmation State */}
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                Reservation Confirmed!
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you, <strong>{user?.fullName}</strong>. Your luxury stay has been secured under reference code:
              </p>
              <div className="inline-block p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                {bookingSuccess.reference}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Hotel:</span>
                <span className="font-bold text-slate-900 dark:text-white">{hotel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span>{new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()} ({nights} nights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/${currentLocale}/account`);
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25"
              >
                View in My Account
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-500/30 text-red-700 dark:text-red-300 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300 font-semibold">
                  You are browsing as Guest. Sign in to collect StayEase VIP Rewards!
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/${currentLocale}/sign-in`)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Room Suite Selection */}
            {rooms.length > 0 && (
              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Select Suite / Villa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rooms.map((r: any) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                        selectedRoomId === r.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{r.type}</span>
                        <span className="text-xs text-slate-400">Max {r.capacity} Guests · Available</span>
                      </div>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-2">
                        ${r.price} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dates & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Check In Date
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Check Out Date
                </label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Special Requests / VIP Concierge Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. High floor, airport limousine transfer, honeymoon champagne package..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>${pricePerNight} × {nights} Nights</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Luxury Service & City Tax (10%)</span>
                <span>${taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-blue-600 dark:text-blue-400 text-base font-black">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition"
              >
                {loading ? "Securing Reservation..." : "Confirm & Instant Book"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
