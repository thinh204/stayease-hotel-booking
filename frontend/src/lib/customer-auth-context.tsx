"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { customerApi } from "./customer-api";

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("stayease_customer_token");
    const savedUser = localStorage.getItem("stayease_customer_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify in background
      customerApi.getMe().then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem("stayease_customer_user", JSON.stringify(res.user));
        }
      }).catch(() => {
        localStorage.removeItem("stayease_customer_token");
        localStorage.removeItem("stayease_customer_user");
        setToken(null);
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await customerApi.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem("stayease_customer_token", res.token);
        localStorage.setItem("stayease_customer_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      } else {
        throw new Error(res.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { fullName: string; email: string; password: string; phone?: string }) => {
    setLoading(true);
    try {
      const res = await customerApi.register(data);
      if (res.success && res.token) {
        localStorage.setItem("stayease_customer_token", res.token);
        localStorage.setItem("stayease_customer_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      } else {
        throw new Error(res.message || "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("stayease_customer_token");
    localStorage.removeItem("stayease_customer_user");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await customerApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem("stayease_customer_user", JSON.stringify(res.user));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
