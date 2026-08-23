"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Search,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Shield,
  X,
  Code2,
} from "lucide-react";
import { adminAuditApi } from "@/lib/admin-api";

export default function AuditLogManagement() {
  const t = useTranslations("Admin.audit");
  const tc = useTranslations("Admin.common");

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAuditApi.getLogs({
        page: currentPage,
        limit: 15,
        action: actionFilter,
        entity: entityFilter,
      });

      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open(adminAuditApi.getExportUrl(), "_blank");
  };

  const uniqueActions = [
    "CREATE_HOTEL",
    "EDIT_HOTEL",
    "DELETE_HOTEL",
    "CREATE_USER",
    "EDIT_USER",
    "LOCK_USER",
    "UNLOCK_USER",
    "CHANGE_USER_ROLE",
    "UPDATE_BOOKING_STATUS",
    "PROCESS_REFUND",
    "UPDATE_PLATFORM_SETTINGS",
  ];

  const uniqueEntities = ["Hotel", "User", "Booking", "AdminSettings", "Room", "Auth"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck size={28} className="text-blue-500" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchLogs}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 shadow-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition"
          >
            <FileSpreadsheet size={15} />
            <span>{t("exportLogs")}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("filterAction")}</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("filterEntity")}</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold">{tc("loading")}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">{t("noLogs")}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">{t("timestamp")}</th>
                    <th className="py-3.5 px-4">{t("performedBy")}</th>
                    <th className="py-3.5 px-4">{t("action")}</th>
                    <th className="py-3.5 px-4">{t("entity")}</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              log.user?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                log.user?.name || "Admin"
                              )}`
                            }
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {log.user?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.entity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {(log.oldValues || log.newValues) && (
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Code2 size={13} />
                            <span>View Diff</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* JSON DIFF VIEWER MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {selectedLog.action}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLog.entity} · Performed by {selectedLog.user.name} ({selectedLog.ipAddress})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Old Values */}
              <div className="space-y-1">
                <span className="font-bold text-red-500 uppercase text-[10px]">{t("oldValues")}</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-red-300 font-mono text-[11px] h-48 overflow-auto border border-red-900/30">
                  {selectedLog.oldValues ? JSON.stringify(selectedLog.oldValues, null, 2) : "None"}
                </pre>
              </div>

              {/* New Values */}
              <div className="space-y-1">
                <span className="font-bold text-emerald-500 uppercase text-[10px]">{t("newValues")}</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] h-48 overflow-auto border border-emerald-900/30">
                  {selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2) : "None"}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {tc("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
