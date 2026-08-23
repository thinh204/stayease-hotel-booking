"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  CalendarCheck,
  Building2,
  Clock,
  Printer,
  X,
  Check,
  AlertTriangle,
  LogOut,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Crown,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";
import { useCustomerAuth } from "@/lib/customer-auth-context";

export default function CustomerAccountView() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const { user, logout, isAuthenticated, refreshProfile } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    bio: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("stayease_customer_token")) {
      router.push(`/${currentLocale}/sign-in`);
      return;
    }

    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }

    fetchBookings();
  }, [isAuthenticated, user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (e) {
      console.error("Failed to load customer bookings", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    try {
      const res = await customerApi.cancelBooking(cancellingBooking.id);
      if (res.success) {
        setMessage({ type: "success", text: "Your reservation has been cancelled and a full refund was processed." });
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to cancel reservation." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await customerApi.updateProfile(profileForm);
      if (res.success) {
        setMessage({ type: "success", text: "Your VIP profile has been updated." });
        refreshProfile();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(`/${currentLocale}/sign-in`);
  };

  if (!user && loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Loading your account...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 dark:bg-slate-950/50 min-h-screen py-10 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast */}
        {message && (
          <div
            className={`flex items-center justify-between p-4 rounded-2xl text-xs font-semibold shadow-md ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                : "bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
            <button type="button" onClick={() => setMessage(null)}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* User Top Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  user?.fullName || "Guest"
                )}`
              }
              alt=""
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading">
                  {user?.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-amber-500/30">
                  <Crown size={11} /> StayEase VIP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
              {user?.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === "bookings"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarCheck size={16} />
            <span>My Reservations ({bookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User size={16} />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* TAB 1: MY BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                Loading reservations...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4">
                <Building2 size={40} className="mx-auto text-slate-400" />
                <h3 className="text-base font-bold">You have no active reservations yet.</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Explore our curated portfolio of luxury five-star villas and suites to reserve your next escape.
                </p>
                <Link
                  href={`/${currentLocale}/hotels`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
                >
                  <span>Explore Hotels</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="h-20 w-28 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&auto=format&fit=crop&q=80"
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                            {b.reference}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : b.status === "completed"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                                : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {b.hotel?.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} ({b.nights} nights) · {b.guests} Guests
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-slate-400 block">Total Price</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                          ${b.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      {b.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(b)}
                          className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        >
                          Cancel Stay
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6 text-xs sm:text-sm">
            <h3 className="text-base font-bold">Personal Guest Information</h3>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Contact Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                VIP Bio & Travel Preferences
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share your luxury travel preferences (e.g. Feather pillow preference, high floor ocean suites)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition"
              >
                {savingProfile ? "Saving..." : "Save VIP Profile"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CANCELLATION CONFIRMATION DIALOG */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cancel Reservation: {cancellingBooking.reference}
            </h3>
            <p className="text-slate-500">
              Are you sure you want to cancel your stay at <strong>{cancellingBooking.hotel?.name}</strong>? A 100% full refund of <strong>${cancellingBooking.totalPrice.toLocaleString()}</strong> will be automatically refunded to your original payment method.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Yes, Cancel & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
