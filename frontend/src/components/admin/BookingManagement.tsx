"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  CalendarCheck,
  CreditCard,
  Send,
  Printer,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles,
  DollarSign,
  User,
  Building2,
  Calendar,
} from "lucide-react";
import { adminBookingsApi } from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function BookingManagement() {
  const t = useTranslations("Admin.bookings");
  const tc = useTranslations("Admin.common");
  const { isManagerOrAdmin } = useAdminAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [statusModalBooking, setStatusModalBooking] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("confirmed");
  const [statusReason, setStatusReason] = useState("");

  const [refundModalBooking, setRefundModalBooking] = useState<any | null>(null);
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  const [notifyModalBooking, setNotifyModalBooking] = useState<any | null>(null);
  const [notifyType, setNotifyType] = useState<"email" | "sms">("email");
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");

  const [invoiceBooking, setInvoiceBooking] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, search, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminBookingsApi.getAll({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
      });

      if (res.success) {
        setBookings(res.data);
        setStatistics(res.statistics);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load bookings" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalBooking) return;
    try {
      const res = await adminBookingsApi.updateStatus(
        statusModalBooking.id,
        newStatus,
        statusReason
      );
      if (res.success) {
        setMessage({ type: "success", text: `Booking ${statusModalBooking.reference} status updated to ${newStatus}.` });
        setStatusModalBooking(null);
        setStatusReason("");
        fetchBookings();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update status" });
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalBooking) return;
    try {
      const res = await adminBookingsApi.refund(refundModalBooking.id, {
        amount: refundType === "full" ? refundModalBooking.totalPrice : refundAmount,
        reason: refundReason,
        refundType,
      });
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setRefundModalBooking(null);
        setRefundReason("");
        fetchBookings();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to process refund" });
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyModalBooking) return;
    try {
      const res = await adminBookingsApi.notify(notifyModalBooking.id, {
        type: notifyType,
        subject: notifySubject,
        message: notifyMessage,
      });
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setNotifyModalBooking(null);
        setNotifySubject("");
        setNotifyMessage("");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send notification" });
    }
  };

  const openRefundModal = (b: any) => {
    setRefundModalBooking(b);
    setRefundType("full");
    setRefundAmount(b.totalPrice);
    setRefundReason("");
  };

  const openNotifyModal = (b: any) => {
    setNotifyModalBooking(b);
    setNotifyType("email");
    setNotifySubject(`StayEase Update: Booking Confirmation for ${b.hotel.name}`);
    setNotifyMessage(`Dear ${b.guest.name},\n\nYour luxury reservation (${b.reference}) at ${b.hotel.name} is confirmed. We look forward to welcoming you on ${new Date(b.checkIn).toLocaleDateString()}.\n\nWarm regards,\nStayEase VIP Concierge Team`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-semibold shadow-md animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
              : "bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-slate-400 text-xs font-semibold uppercase">Total Bookings</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {statistics.totalBookings}
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-slate-400 text-xs font-semibold uppercase">Confirmed Stays</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {statistics.confirmedBookings}
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-slate-400 text-xs font-semibold uppercase">Cancelled / Refunded</span>
            <p className="text-2xl font-extrabold text-red-500 mt-1">
              {statistics.cancelledBookings}
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-slate-400 text-xs font-semibold uppercase">Net Revenue</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              ${statistics.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("allStatuses")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="confirmed">{t("confirmed")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </select>
        </div>
      </div>

      {/* Table & Mobile Cards */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold">{tc("loading")}</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No bookings found matching current filters.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">{t("reference")}</th>
                    <th className="py-3.5 px-4">{t("guest")}</th>
                    <th className="py-3.5 px-4">{t("hotel")}</th>
                    <th className="py-3.5 px-4">{t("dates")}</th>
                    <th className="py-3.5 px-4">{t("total")}</th>
                    <th className="py-3.5 px-4">{tc("status")}</th>
                    <th className="py-3.5 px-4 text-right">{tc("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {b.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              b.guest?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                b.guest?.name || "Guest"
                              )}`
                            }
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{b.guest?.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{b.guest?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{b.hotel?.name}</p>
                        <p className="text-[11px] text-slate-400">{b.room?.type}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span>{new Date(b.checkIn).toLocaleDateString()}</span>
                          <span className="text-slate-400">→</span>
                          <span>{new Date(b.checkOut).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{b.nights} {t("nights")} · {b.guests} {t("guests")}</span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        ${b.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                              : b.status === "completed"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              : b.status === "cancelled"
                              ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-500/20"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInvoiceBooking(b)}
                            title={t("viewInvoice")}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye size={15} />
                          </button>
                          {isManagerOrAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusModalBooking(b);
                                  setNewStatus(b.status);
                                }}
                                title={t("updateStatus")}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <CalendarCheck size={15} />
                              </button>
                              {b.status !== "cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => openRefundModal(b)}
                                  title={t("processRefund")}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                >
                                  <CreditCard size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openNotifyModal(b)}
                                title={t("sendNotification")}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <Send size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {b.reference}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{b.hotel?.name}</p>
                    <p className="text-xs text-slate-500">{b.guest?.name} · ${b.totalPrice.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">
                      {new Date(b.checkIn).toLocaleDateString()} ({b.nights}n)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInvoiceBooking(b)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                      >
                        Receipt
                      </button>
                      {isManagerOrAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalBooking(b);
                            setNewStatus(b.status);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
                        >
                          Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>{tc("page")} {currentPage} {tc("of")} {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* UPDATE STATUS MODAL */}
      {statusModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("updateStatus")}: {statusModalBooking.reference}
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="pending">{t("pending")}</option>
                  <option value="confirmed">{t("confirmed")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Reason for change (optional)
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Confirmed over VIP phone line"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS REFUND MODAL */}
      {refundModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <CreditCard size={22} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("refundTitle")}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Booking Ref: <strong className="font-mono">{refundModalBooking.reference}</strong> ({refundModalBooking.guest.name})
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefundType("full");
                    setRefundAmount(refundModalBooking.totalPrice);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    refundType === "full"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  {t("fullRefund")} (${refundModalBooking.totalPrice})
                </button>
                <button
                  type="button"
                  onClick={() => setRefundType("partial")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    refundType === "partial"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  {t("partialRefund")}
                </button>
              </div>

              {refundType === "partial" && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("refundAmount")}
                  </label>
                  <input
                    type="number"
                    max={refundModalBooking.totalPrice}
                    min={1}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("refundReason")} *
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Flight delay / Customer request"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRefundModalBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20"
                >
                  {t("confirmRefund")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND GUEST NOTIFICATION MODAL */}
      {notifyModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <Send size={20} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("notifyTitle")}
              </h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyType"
                    checked={notifyType === "email"}
                    onChange={() => setNotifyType("email")}
                  />
                  <span>{t("emailNotification")} ({notifyModalBooking.guest.email})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyType"
                    checked={notifyType === "sms"}
                    onChange={() => setNotifyType("sms")}
                  />
                  <span>{t("smsNotification")}</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("subject")}
                </label>
                <input
                  type="text"
                  required
                  value={notifySubject}
                  onChange={(e) => setNotifySubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("message")}
                </label>
                <textarea
                  rows={4}
                  required
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNotifyModalBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  {t("send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE / RECEIPT MODAL */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("invoiceTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking Ref</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {invoiceBooking.reference}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Created</span>
                  <span className="font-semibold">{new Date(invoiceBooking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Guest:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{invoiceBooking.guest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hotel:</span>
                  <span className="font-semibold">{invoiceBooking.hotel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suite Type:</span>
                  <span>{invoiceBooking.room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dates:</span>
                  <span>{new Date(invoiceBooking.checkIn).toLocaleDateString()} – {new Date(invoiceBooking.checkOut).toLocaleDateString()} ({invoiceBooking.nights} nights)</span>
                </div>
              </div>

              {invoiceBooking.specialRequests && (
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-600 font-bold block mb-0.5">{t("specialRequests")}:</span>
                  <p>{invoiceBooking.specialRequests}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Paid</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${invoiceBooking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>{t("printReceipt")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
