"use client";

import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import type { AdminTheme } from "@/lib/admin-theme";

type Variant = "compact" | "sidebar";

export default function AdminThemeToggle({ variant = "compact" }: { variant?: Variant }) {
  const { theme, setTheme } = useAdminTheme();

  const set = (next: AdminTheme) => () => setTheme(next);

  return (
    <div
      className={`admin-theme-toggle admin-theme-toggle--${variant}`}
      role="group"
      aria-label="Panel theme"
    >
      {variant === "sidebar" && (
        <span className="admin-theme-toggle-label font-ui">Theme</span>
      )}
      <div className="admin-theme-toggle-track">
        <button
          type="button"
          className={theme === "dark" ? "is-active" : ""}
          aria-pressed={theme === "dark"}
          onClick={set("dark")}
        >
          Dark
        </button>
        <button
          type="button"
          className={theme === "light" ? "is-active" : ""}
          aria-pressed={theme === "light"}
          onClick={set("light")}
        >
          Light
        </button>
      </div>
    </div>
  );
}
