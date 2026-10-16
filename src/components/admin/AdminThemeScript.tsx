import { ADMIN_THEME_STORAGE_KEY, DEFAULT_ADMIN_THEME } from "@/lib/admin-theme";

/**
 * Inline bootstrap for admin theme (server-only). Avoids next/script children,
 * which React 19 does not execute when rendered as component children.
 */
export default function AdminThemeScript() {
  const script = `(function () {
  var key = ${JSON.stringify(ADMIN_THEME_STORAGE_KEY)};
  var fallback = ${JSON.stringify(DEFAULT_ADMIN_THEME)};
  try {
    var t = localStorage.getItem(key);
    var theme = t === "light" || t === "dark" ? t : fallback;
    document.documentElement.setAttribute("data-admin-theme", theme);
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
  } catch (e) {
    document.documentElement.setAttribute("data-admin-theme", fallback);
    document.documentElement.style.colorScheme = "dark";
  }
})();`;

  return (
    <script
      id="admin-theme-init"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
