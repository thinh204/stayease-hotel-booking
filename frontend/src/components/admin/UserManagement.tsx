"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  X,
  Check,
  AlertTriangle,
  History,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { adminUsersApi } from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function UserManagement() {
  const t = useTranslations("Admin.users");
  const tc = useTranslations("Admin.common");
  const { isAdmin } = useAdminAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Action States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [lockModalUser, setLockModalUser] = useState<any | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [resetPassUser, setResetPassUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteModalUser, setDeleteModalUser] = useState<any | null>(null);
  const [detailsUser, setDetailsUser] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
    bio: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUsersApi.getAll({
        page: currentPage,
        limit: 10,
        search,
        role: roleFilter,
        isActive: statusFilter === "LOCKED" ? undefined : statusFilter,
      });

      if (res.success) {
        let list = res.data;
        if (statusFilter === "LOCKED") {
          list = list.filter((u) => u.isLocked);
        }
        setUsers(list);
        setTotalPages(res.pagination.pages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminUsersApi.create(formData);
      if (res.success) {
        setMessage({ type: "success", text: "User account created successfully!" });
        setCreateModalOpen(false);
        setFormData({ fullName: "", email: "", password: "", phone: "", role: "USER", bio: "" });
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create user" });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await adminUsersApi.update(editUser.id, {
        fullName: editUser.fullName,
        phone: editUser.phone,
        role: editUser.role,
        isActive: editUser.isActive,
        bio: editUser.bio,
      });
      if (res.success) {
        setMessage({ type: "success", text: "User profile updated successfully!" });
        setEditUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update user" });
    }
  };

  const handleToggleLock = async () => {
    if (!lockModalUser) return;
    try {
      const res = await adminUsersApi.lockUnlock(lockModalUser.id, !lockModalUser.isLocked, lockReason);
      if (res.success) {
        setMessage({
          type: "success",
          text: `Account for ${lockModalUser.fullName} has been ${lockModalUser.isLocked ? "unlocked" : "locked"}.`,
        });
        setLockModalUser(null);
        setLockReason("");
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Action failed" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser) return;
    try {
      const res = await adminUsersApi.resetPassword(resetPassUser.id, newPassword);
      if (res.success) {
        setMessage({ type: "success", text: `Password has been reset for ${resetPassUser.fullName}.` });
        setResetPassUser(null);
        setNewPassword("");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset password" });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      const res = await adminUsersApi.delete(deleteModalUser.id);
      if (res.success) {
        setMessage({ type: "success", text: `User ${deleteModalUser.fullName} deleted permanently.` });
        setDeleteModalUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete user" });
    }
  };

  const openUserDetails = async (user: any) => {
    setDetailsLoading(true);
    setDetailsUser(user);
    try {
      const res = await adminUsersApi.getById(user.id);
      if (res.success) {
        setDetailsUser(res.data);
      }
    } catch (err) {
      console.error("Failed to load user details", err);
    } finally {
      setDetailsLoading(false);
    }
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

        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>{t("addUser")}</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("allRoles")}</option>
            <option value="USER">{t("userRole")}</option>
            <option value="MANAGER">{t("managerRole")}</option>
            <option value="ADMIN">{t("adminRole")}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="ALL">{t("allStatus")}</option>
            <option value="true">{t("activeStatus")}</option>
            <option value="false">{t("inactiveStatus")}</option>
            <option value="LOCKED">{t("lockedStatus")}</option>
          </select>
        </div>
      </div>

      {/* Users Table / Mobile Cards */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold">{tc("loading")}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No users found matching your search criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">{t("name")}</th>
                    <th className="py-3.5 px-4">{t("email")}</th>
                    <th className="py-3.5 px-4">{t("role")}</th>
                    <th className="py-3.5 px-4">{t("status")}</th>
                    <th className="py-3.5 px-4">{t("bookings")}</th>
                    <th className="py-3.5 px-4">{t("spent")}</th>
                    <th className="py-3.5 px-4">{t("lastLogin")}</th>
                    <th className="py-3.5 px-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                u.fullName
                              )}`
                            }
                            alt={u.fullName}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{u.fullName}</p>
                            {u.phone && <p className="text-[11px] text-slate-400">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-500/20"
                              : u.role === "MANAGER"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            <Lock size={10} /> {t("lockedStatus")}
                          </span>
                        ) : u.isActive ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {t("activeStatus")}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {t("inactiveStatus")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {u.totalBookings || 0}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        ${(u.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : t("never")}
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openUserDetails(u)}
                            title={t("viewDetails")}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye size={15} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditUser(u)}
                                title={t("editUser")}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setLockModalUser(u)}
                                title={u.isLocked ? t("unlockAccount") : t("lockAccount")}
                                className={`p-1.5 rounded-lg transition ${
                                  u.isLocked
                                    ? "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                                    : "text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {u.isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setResetPassUser(u)}
                                title={t("resetPassword")}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModalUser(u)}
                                title={t("deleteUser")}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              >
                                <Trash2 size={15} />
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

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            u.fullName
                          )}`
                        }
                        alt={u.fullName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : u.role === "MANAGER"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="text-slate-400">Total Bookings:</span>{" "}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{u.totalBookings || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Spent:</span>{" "}
                      <span className="font-bold text-slate-900 dark:text-white">${(u.totalSpent || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openUserDetails(u)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <Eye size={13} /> {t("viewDetails")}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setEditUser(u)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <Edit2 size={13} /> {t("editUser")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>
                {tc("page")} {currentPage} {tc("of")} {totalPages} ({totalCount} users)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("createUserTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("email")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555 0192"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("password")} *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("role")}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="USER">User (Customer)</option>
                    <option value="MANAGER">Manager (Hotel Staff)</option>
                    <option value="ADMIN">Admin (Super Administrator)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("bio")}
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Optional internal notes about guest VIP preferences..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  {t("saveUser")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("editUserTitle")}: {editUser.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("role")}
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="USER">User (Customer)</option>
                    <option value="MANAGER">Manager (Hotel Staff)</option>
                    <option value="ADMIN">Admin (Super Administrator)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={editUser.isActive}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account is Active (Allow normal login and bookings)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  {tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCK / UNLOCK MODAL */}
      {lockModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              {lockModalUser.isLocked ? <Unlock size={24} /> : <Lock size={24} />}
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lockModalUser.isLocked ? t("unlockAccount") : t("lockModalTitle")}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {lockModalUser.isLocked
                ? `Unlock account for ${lockModalUser.fullName} (${lockModalUser.email}) and restore normal login access?`
                : `Locking the account for ${lockModalUser.fullName} will prevent them from signing in or modifying bookings until unlocked.`}
            </p>

            {!lockModalUser.isLocked && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("lockReasonLabel")}
                </label>
                <input
                  type="text"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder={t("lockReasonPlaceholder")}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLockModalUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {tc("cancel")}
              </button>
              <button
                type="button"
                onClick={handleToggleLock}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
              >
                {lockModalUser.isLocked ? t("confirmUnlock") : t("confirmLock")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <KeyRound size={24} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("resetPasswordTitle")}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Set a temporary password for <strong>{resetPassUser.fullName}</strong>. They can use this to sign in immediately.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("newPasswordLabel")} *
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. TempPass@2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20"
                >
                  {t("confirmReset")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("deleteConfirmTitle")}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t("deleteConfirmMsg")}
            </p>
            <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
              {deleteModalUser.fullName} ({deleteModalUser.email})
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {tc("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-500/20"
              >
                {tc("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS DRAWER */}
      {detailsUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    detailsUser.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      detailsUser.fullName
                    )}`
                  }
                  alt={detailsUser.fullName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {detailsUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{detailsUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Total Bookings</span>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {detailsUser.statistics?.totalBookings || detailsUser.bookings?.length || 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Total Spent</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${(detailsUser.statistics?.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-slate-400">Avg Value</span>
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  ${detailsUser.statistics?.averageSpending || 0}
                </p>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Profile Metadata
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">User Role:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{detailsUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="font-bold">{detailsUser.isLocked ? "Locked" : detailsUser.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span>{detailsUser.phone || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Member Since:</span>
                  <span>{new Date(detailsUser.createdAt).toLocaleDateString()}</span>
                </div>
                {detailsUser.bio && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Bio / Notes:</span>
                    <p className="text-slate-700 dark:text-slate-300 italic">{detailsUser.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reservation History */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                {t("recentBookings")}
              </h4>
              {detailsUser.bookings && detailsUser.bookings.length > 0 ? (
                <div className="space-y-2">
                  {detailsUser.bookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{b.hotel?.name || "Luxury Resort"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Ref: {b.reference || b.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">${b.totalPrice}</span>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic py-4 text-center">{t("noBookings")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
