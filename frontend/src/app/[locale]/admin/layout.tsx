import React from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { AdminAuthProvider } from "@/lib/admin-auth-context";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
