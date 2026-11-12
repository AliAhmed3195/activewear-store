import AdminShell from "@/components/admin/AdminShell";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { auth } from "@/lib/auth";
import { ensureSiteSettings } from "@/lib/site-settings";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const settings = await ensureSiteSettings();
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.ORDER_NOTIFY_WHATSAPP || "—";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.RESEND_FROM || "—";

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Settings</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Configure sale banner, shipping thresholds, and storefront UX from the portal — no env
        restart needed for these.
      </p>

      <SiteSettingsForm
        initial={settings}
        integrations={{
          whatsapp,
          supportEmail,
          resendConfigured: Boolean(process.env.RESEND_API_KEY),
          stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
          signedInAs: `${session.user.name} · ${session.user.email}`,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
        <div className="luxury-card p-5">
          <h2 className="font-display text-lg text-pearl">Sale prices on products</h2>
          <p className="font-ui text-sm text-pearl-muted mt-2">
            Set Compare-at PKR/USD higher than the selling price on a product to show Save / Sale on
            the storefront.
          </p>
          <Link href="/admin/products" className="btn-outline text-[10px] py-2 px-3 mt-4 inline-flex">
            Edit products
          </Link>
        </div>
        <div className="luxury-card p-5">
          <h2 className="font-display text-lg text-pearl">Catalog shortcuts</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/admin/inventory" className="btn-outline text-[10px] py-2 px-3">
              Inventory
            </Link>
            <Link href="/admin/reviews" className="btn-outline text-[10px] py-2 px-3">
              Reviews
            </Link>
            <Link href="/admin/orders" className="btn-outline text-[10px] py-2 px-3">
              Orders
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
