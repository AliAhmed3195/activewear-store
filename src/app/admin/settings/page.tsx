import AdminBrandSettings from "@/components/admin/AdminBrandSettings";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeSettings from "@/components/admin/AdminThemeSettings";
import AdminSettingsShortcuts from "@/components/admin/AdminSettingsShortcuts";
import { auth } from "@/lib/auth";
import { getStoreBrandingUncached } from "@/lib/store-branding";
import { formatPrice } from "@/lib/utils";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currency = (process.env.NEXT_PUBLIC_CURRENCY ?? "usd").toUpperCase();
  const shippingCents = Number(process.env.SHIPPING_FLAT_RATE_CENTS ?? "999");
  const freeOver = Number(process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? "7500");
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.ORDER_NOTIFY_WHATSAPP || "—";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.RESEND_FROM || "—";
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  const { logoUrl } = await getStoreBrandingUncached();

  const rows = [
    { label: "Currency", value: currency },
    {
      label: "Standard shipping",
      value: formatPrice(shippingCents, currency),
    },
    {
      label: "Free shipping over",
      value: formatPrice(freeOver, currency),
    },
    { label: "WhatsApp / notify", value: whatsapp },
    { label: "Support email", value: supportEmail },
    { label: "Email (Resend)", value: resendConfigured ? "Configured" : "Not set" },
    { label: "Stripe cards", value: stripeConfigured ? "Configured" : "Not set (COD still works)" },
    { label: "Signed in as", value: `${session.user.name} · ${session.user.email}` },
  ];

  return (
    <AdminShell>
      <header className="admin-page-header">
        <div>
          <p className="admin-page-kicker font-ui">Configuration</p>
          <h1 className="admin-page-title font-display">Settings</h1>
          <p className="admin-page-lead font-ui">
            Store values come from environment variables. Edit{" "}
            <code className="admin-code">.env.local</code> and restart the dev server.
          </p>
        </div>
      </header>

      <div className="admin-settings-layout">
        <section className="admin-settings-card luxury-card admin-settings-env">
          <p className="admin-settings-card-kicker font-ui">Environment</p>
          <h2 className="admin-settings-card-title font-display">Store profile</h2>
          <div className="admin-settings-table-wrap">
            <table className="admin-table admin-table--settings">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td className="font-ui">{r.label}</td>
                    <td className="font-display">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <AdminBrandSettings initialLogoUrl={logoUrl} />

        <AdminThemeSettings />

        <AdminSettingsShortcuts />

        <section className="admin-settings-card luxury-card admin-settings-login">
          <p className="admin-settings-card-kicker font-ui">Access</p>
          <h2 className="admin-settings-card-title font-display">Admin login</h2>
          <p className="admin-settings-card-desc font-ui">
            Credentials are set via <code className="admin-code">SEED_ADMIN_EMAIL</code> and{" "}
            <code className="admin-code">SEED_ADMIN_PASSWORD</code> (applied on{" "}
            <code className="admin-code">prisma db seed</code>). Default:{" "}
            <code className="admin-code">admin@example.com</code>
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
