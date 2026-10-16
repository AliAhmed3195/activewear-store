"use client";

import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { IconCheck } from "@/components/ui/icons";
import type { AdminTheme } from "@/lib/admin-theme";

const OPTIONS: { id: AdminTheme; label: string; description: string }[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Low-light console — easier on the eyes at night.",
  },
  {
    id: "light",
    label: "Light",
    description: "Bright panels with dark text for daytime work.",
  },
];

export default function AdminThemeSettings() {
  const { theme, setTheme } = useAdminTheme();

  return (
    <section
      className="admin-settings-card luxury-card admin-settings-appearance"
      aria-labelledby="admin-appearance-title"
    >
      <div className="admin-settings-card-head admin-settings-card-head--flat">
        <div>
          <p className="admin-settings-card-kicker font-ui">Workspace</p>
          <h2 id="admin-appearance-title" className="admin-settings-card-title font-display">
            Appearance
          </h2>
          <p className="admin-settings-card-desc font-ui">
            Panel theme for this browser only — no account sync.
          </p>
        </div>
        <p className="admin-appearance-current font-ui" aria-live="polite">
          Current: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
        </p>
      </div>

      <ul className="admin-theme-list" role="radiogroup" aria-label="Admin panel theme">
        {OPTIONS.map((opt) => {
          const active = theme === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                className={`admin-theme-row${active ? " is-active" : ""}`}
                onClick={() => setTheme(opt.id)}
              >
                <span className="admin-theme-row-radio" aria-hidden="true" />
                <span
                  className="admin-theme-row-swatch"
                  data-theme-swatch={opt.id}
                  aria-hidden="true"
                />
                <span className="admin-theme-row-copy">
                  <strong className="font-display">{opt.label}</strong>
                  <span className="font-ui">{opt.description}</span>
                </span>
                {active && (
                  <span className="admin-theme-row-check" aria-hidden="true">
                    <IconCheck size={16} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
