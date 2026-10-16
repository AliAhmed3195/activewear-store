export type AdminTheme = "dark" | "light";

export const ADMIN_THEME_STORAGE_KEY = "peak-admin-theme";

export const DEFAULT_ADMIN_THEME: AdminTheme = "dark";

export function isAdminTheme(value: string | null | undefined): value is AdminTheme {
  return value === "dark" || value === "light";
}

export function readAdminThemeFromStorage(): AdminTheme {
  if (typeof window === "undefined") return DEFAULT_ADMIN_THEME;
  try {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    return isAdminTheme(stored) ? stored : DEFAULT_ADMIN_THEME;
  } catch {
    return DEFAULT_ADMIN_THEME;
  }
}

export function applyAdminThemeToDocument(theme: AdminTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-admin-theme", theme);
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
}

export function clearAdminThemeFromDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute("data-admin-theme");
  document.documentElement.style.colorScheme = "";
}
