"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminAuthApi } from "./admin-api";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: "ADMIN" | "MANAGER" | "USER";
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManagerOrAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.match(/^\/(en|vi|ko)(?=\/|$)/)?.[1] ?? "en";
  const isLoginPage = pathname.includes("/admin/login");

  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem("stayease_admin_token");
      const savedUser = localStorage.getItem("stayease_admin_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Background profile refresh to ensure validity
        try {
          const res = await adminAuthApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("stayease_admin_user", JSON.stringify(res.user));
          }
        } catch {
          // If token expired, clear
          localStorage.removeItem("stayease_admin_token");
          localStorage.removeItem("stayease_admin_user");
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && !isLoginPage && pathname.includes("/admin")) {
        router.replace(`/${currentLocale}/admin/login`);
      } else if (user && isLoginPage) {
        router.replace(`/${currentLocale}/admin`);
      }
    }
  }, [user, loading, pathname, isLoginPage, currentLocale, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await adminAuthApi.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem("stayease_admin_token", res.token);
        localStorage.setItem("stayease_admin_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        router.replace(`/${currentLocale}/admin`);
      } else {
        throw new Error(res.message || "Failed to authenticate.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("stayease_admin_token");
      localStorage.removeItem("stayease_admin_user");
      setToken(null);
      setUser(null);
      router.replace(`/${currentLocale}/admin/login`);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await adminAuthApi.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem("stayease_admin_user", JSON.stringify(res.user));
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "ADMIN";
  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshProfile,
        isAuthenticated,
        isAdmin,
        isManagerOrAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
