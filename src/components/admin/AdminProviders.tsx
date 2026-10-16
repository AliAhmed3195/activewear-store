"use client";

import { SessionProvider } from "next-auth/react";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </SessionProvider>
  );
}
