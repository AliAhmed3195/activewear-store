"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AdminTheme,
  DEFAULT_ADMIN_THEME,
  ADMIN_THEME_STORAGE_KEY,
  applyAdminThemeToDocument,
  clearAdminThemeFromDocument,
  readAdminThemeFromStorage,
} from "@/lib/admin-theme";

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(DEFAULT_ADMIN_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readAdminThemeFromStorage();
    setThemeState(initial);
    applyAdminThemeToDocument(initial);
    setReady(true);
    return () => clearAdminThemeFromDocument();
  }, []);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
    applyAdminThemeToDocument(next);
    try {
      localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        className="admin-theme-root"
        data-admin-theme-ready={ready ? "true" : "false"}
        suppressHydrationWarning
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}
