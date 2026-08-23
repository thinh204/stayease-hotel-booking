"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();

  const isLoginPage = pathname.includes("/admin/login");

  // If on login page, render bare without sidebar/header
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
            Authenticating StayEase Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AdminHeader onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
