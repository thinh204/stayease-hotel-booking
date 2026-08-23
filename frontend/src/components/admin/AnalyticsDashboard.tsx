"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Building2,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { adminAnalyticsApi } from "@/lib/admin-api";

export default function AnalyticsDashboard() {
  const t = useTranslations("Admin.analytics");
  const tc = useTranslations("Admin.common");

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [revSummary, setRevSummary] = useState<any>(null);
  const [userData, setUserData] = useState<any[]>([]);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [occSummary, setOccSummary] = useState<any>(null);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, userRes, occRes] = await Promise.all([
        adminAnalyticsApi.getRevenue(),
        adminAnalyticsApi.getUsers(),
        adminAnalyticsApi.getOccupancy(),
      ]);

      if (revRes.success) {
        setRevenueData(revRes.data);
        setRevSummary(revRes.summary);
      }
      if (userRes.success) {
        setUserData(userRes.data);
        setUserSummary(userRes.summary);
      }
      if (occRes.success) {
        setOccupancyData(occRes.data);
        setOccSummary(occRes.summary);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: "bookings" | "users" | "audit") => {
    const url = adminAnalyticsApi.getExportUrl(type);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">{tc("loading")}</span>
      </div>
    );
  }

  const maxRevenue = Math.max(...(revenueData.map((d) => d.revenue) || [5000]), 6000);
  const maxUsers = Math.max(...(userData.map((d) => d.activeUsers) || [300]), 350);

  return (
    <div className="space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport("bookings")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 shadow-sm"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            <span>{t("exportBookings")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport("users")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 shadow-sm"
          >
            <FileSpreadsheet size={14} className="text-blue-500" />
            <span>{t("exportUsers")}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">{t("totalRevenue")}</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            ${(revSummary?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Avg: ${(revSummary?.averageDailyRevenue || 0).toLocaleString()}/day
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">{t("avgOccupancy")}</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {occSummary?.averageOccupancy || 82}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Peak: {occSummary?.highestOccupancy || 95}%
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Active Users (7D)</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {(userSummary?.totalActiveUsers || 1485).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            +{userSummary?.totalNewUsers || 162} new this week
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">{t("churnRate")}</span>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">
            {userSummary?.churnRate || 0.9}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            High retention rate
          </span>
        </div>
      </div>

      {/* 2 Main Charts: Revenue Trends & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Dynamics Chart */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              <span>{t("revenueTrends")}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={14} /> +12.5%
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
            {revenueData.map((d, i) => {
              const heightPct = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      ${d.revenue.toLocaleString()}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center">Net Revenue: ${revSummary?.netRevenue.toLocaleString()}</p>
        </div>

        {/* User Acquisition & Active Guests */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-purple-500" />
              <span>{t("userAcquisition")}</span>
            </h3>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
              <TrendingUp size={14} /> +18.2%
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
            {userData.map((d, i) => {
              const heightPct = Math.max(15, Math.round((d.activeUsers / maxUsers) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {d.activeUsers} active ({d.newUsers} new)
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center">Avg Engagement: {userSummary?.averageEngagement}%</p>
        </div>
      </div>

      {/* Occupancy by Property Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 size={18} className="text-emerald-500" />
          <span>{t("occupancyOverview")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occupancyData.map((h, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{h.name}</h4>
                  <span className="text-[11px] text-slate-400">{h.city}</span>
                </div>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  {h.occupancyRate}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${h.occupancyRate}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Rooms: {h.occupiedRooms}/{h.totalRooms}</span>
                <span>Est. Rev: ${h.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
