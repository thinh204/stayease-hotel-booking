"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAdminAuth();

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";

  const navItems = [
    {
      id: "dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      href: `/${currentLocale}/admin`,
      exact: true,
    },
    {
      id: "users",
      label: t("users"),
      icon: Users,
      href: `/${currentLocale}/admin/users`,
    },
    {
      id: "hotels",
      label: t("hotels"),
      icon: Building2,
      href: `/${currentLocale}/admin/hotels`,
    },
    {
      id: "bookings",
      label: t("bookings"),
      icon: CalendarCheck2,
      href: `/${currentLocale}/admin/bookings`,
    },
    {
      id: "analytics",
      label: t("analytics"),
      icon: BarChart3,
      href: `/${currentLocale}/admin/analytics`,
    },
    {
      id: "audit",
      label: t("audit"),
      icon: ShieldCheck,
      href: `/${currentLocale}/admin/audit`,
      adminOnly: true,
    },
    {
      id: "settings",
      label: t("settings"),
      icon: Settings,
      href: `/${currentLocale}/admin/settings`,
      adminOnly: true,
    },
  ];

  const isLinkActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-950 text-slate-100 border-r border-slate-800/80 select-none shadow-2xl">
      {/* Brand Header */}
      <div>
        <div className="flex h-20 items-center justify-between px-5 border-b border-slate-800/80">
          <Link
            href={`/${currentLocale}/admin`}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-lg text-white font-heading">
                  STAY<span className="text-blue-400">EASE</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                  Executive Suite
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {filteredItems.map((item) => {
            const active = isLinkActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md shadow-blue-600/20 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* View Storefront Link */}
        <Link
          href={`/${currentLocale}`}
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-blue-400 hover:bg-slate-800/40 transition-colors"
        >
          <ExternalLink size={16} className="flex-shrink-0" />
          {!collapsed && <span>{t("viewStorefront")}</span>}
        </Link>

        {/* User Card */}
        {user && (
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${collapsed ? "justify-center" : ""}`}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`}
              alt={user.fullName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/40 flex-shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {user.role}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                title={t("logout")}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 z-30 flex-shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="fixed top-0 bottom-0 left-0 w-[inherit] z-30">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
