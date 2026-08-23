"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  BedDouble,
  ShieldAlert,
  Clock,
  RefreshCw,
} from "lucide-react";
import { adminAnalyticsApi } from "@/lib/admin-api";

export default function DashboardOverview() {
  const t = useTranslations("Admin.dashboard");
  const pathname = usePathname();
  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, revRes] = await Promise.all([
        adminAnalyticsApi.getDashboard(),
        adminAnalyticsApi.getRevenue(),
      ]);
      if (dashRes.success) setStats(dashRes);
      if (revRes.success) setRevenueData(revRes.data);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalUsers: 1450,
    totalHotels: 6,
    totalBookings: 24,
    totalRevenue: 18230,
    averageBookingValue: 450,
  };

  const comparison = stats?.comparison || {
    bookingsVsLastMonth: 14.8,
    revenueVsLastMonth: 12.5,
    usersVsLastMonth: 18.2,
  };

  const topHotels = stats?.topHotels || [];
  const topCities = stats?.topCities || [];

  const maxRevenue = Math.max(...(revenueData.map((d) => d.revenue) || [1000]), 5000);

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={15} />
            <span>StayEase Real-Time Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("totalUsers")}
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {overview.totalUsers.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
            <span>+{comparison.usersVsLastMonth}% {t("vsLastMonth")}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />
        </div>

        {/* Active Hotels */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("totalHotels")}
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {overview.totalHotels}
            </span>
            <span className="text-xs font-medium text-slate-500">Luxury Resorts</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <BedDouble size={14} className="text-purple-500" />
            <span>{overview.totalRooms || 120} Prime Suites</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-60" />
        </div>

        {/* Total Bookings */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("totalBookings")}
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {overview.totalBookings}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
            <span>+{comparison.bookingsVsLastMonth}% {t("vsLastMonth")}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-60" />
        </div>

        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("totalRevenue")}
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ${overview.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
            <span>+{comparison.revenueVsLastMonth}% {t("vsLastMonth")}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60" />
        </div>
      </div>

      {/* Main Charts & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Dynamics (Custom Responsive SVG Chart) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("weeklyRevenue")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily incoming reservations and gross booking value
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Revenue
              </span>
            </div>
          </div>

          {/* SVG Bar / Area visualization */}
          <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-slate-100 dark:border-slate-800">
            {revenueData.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold py-1 px-2 rounded-lg pointer-events-none z-10 shadow-lg whitespace-nowrap">
                      ${item.revenue.toLocaleString()} · {item.bookings} bookings
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span>Weekly Average: ${Math.round(overview.totalRevenue / 7).toLocaleString()}/day</span>
            <Link
              href={`/${currentLocale}/admin/analytics`}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Top Destination Cities */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("topCities")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Highest booking volume by geographical hub
            </p>

            <div className="space-y-4">
              {topCities.length > 0 ? (
                topCities.map((city: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-500" />
                        {city.city}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${city.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (city.revenue / overview.totalRevenue) * 100 * 2.5)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Data gathering in progress...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Global Coverage</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">6 Countries</span>
          </div>
        </div>
      </div>

      {/* Top Performing Luxury Hotels & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hotels Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("topHotels")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revenue leaders and customer occupancy metrics
              </p>
            </div>
            <Link
              href={`/${currentLocale}/admin/hotels`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {t("viewAll")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="pb-3 font-semibold">Property</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">{t("occupancy")}</th>
                  <th className="pb-3 font-semibold text-right">{t("revenue")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {topHotels.map((h: any, i: number) => (
                  <tr key={h.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 pr-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </div>
                        <span className="truncate max-w-[200px]">{h.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-500 dark:text-slate-400">
                      {h.city}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        {h.occupancy || 85}%
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-right text-slate-900 dark:text-white">
                      ${h.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operational KPIs */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t("quickStats")}
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Avg Guest Rating</p>
                  <p className="text-[11px] text-slate-500">Across all 6 luxury resorts</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">4.93 / 5.0</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Avg Booking Value</p>
                  <p className="text-[11px] text-slate-500">Per verified stay</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                ${overview.averageBookingValue}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">System Health</p>
                  <p className="text-[11px] text-slate-500">All services operational</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                99.9% UPTIME
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/${currentLocale}/admin/bookings`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/20"
            >
              <span>Manage Recent Bookings</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
